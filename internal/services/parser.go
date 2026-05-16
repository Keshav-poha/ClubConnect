package services

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"
)

type ExtractedEvent struct {
	Title    string    `json:"title"`
	Date     time.Time `json:"date"`
	Location string    `json:"location"`
}

type ParserService struct {
	apiKey string
	apiUrl string
	client *http.Client
}

func NewParserService(apiKey, apiUrl string) *ParserService {
	// Use new HF router URL if old URL is present or empty
	if apiUrl == "" || strings.Contains(apiUrl, "api-inference.huggingface.co") || strings.Contains(apiUrl, "googleapis.com") {
		apiUrl = "https://router.huggingface.co/hf-inference/models/google/gemma-2-2b-it"
	}
	return &ParserService{
		apiKey: apiKey,
		apiUrl: apiUrl,
		client: &http.Client{Timeout: 30 * time.Second},
	}
}

func (s *ParserService) ParseCaption(caption string) (*ExtractedEvent, error) {
	if s.apiKey == "" {
		return nil, fmt.Errorf("CRITICAL: HF_TOKEN is empty! check your HF Space Secrets")
	}

	// Try multiple models in case of rate limits
	models := []string{
		s.apiUrl,
		"https://router.huggingface.co/hf-inference/models/HuggingFaceH4/zephyr-7b-beta",
		"https://router.huggingface.co/hf-inference/models/google/gemma-2-9b-it",
	}

	var lastErr error
	for _, modelUrl := range models {
		log.Printf("DEBUG: attempting parse with %s", modelUrl)
		
		for attempt := 0; attempt < 3; attempt++ {
			event, err := s.tryParse(caption, modelUrl)
			if err == nil {
				return event, nil
			}

			lastErr = err
			if strings.Contains(err.Error(), "loading") {
				log.Printf("DEBUG: model loading, waiting 5s... (attempt %d)", attempt+1)
				time.Sleep(5 * time.Second)
				continue
			}
			
			// If it's a 429, try the next model immediately
			if strings.Contains(err.Error(), "429") {
				log.Printf("DEBUG: model rate limited (429), trying next model...")
				break 
			}

			log.Printf("DEBUG: attempt %d failed: %v", attempt+1, err)
		}
	}

	return nil, fmt.Errorf("all models failed: %w", lastErr)
}

func (s *ParserService) tryParse(caption string, url string) (*ExtractedEvent, error) {
	prompt := fmt.Sprintf(`[INST] Extract event details from this caption into JSON format. 
Fields: "title", "date" (ISO 8601), "location". 
Today's date is %s. Year is 2026.
Caption: %s [/INST]`, time.Now().Format("2006-01-02"), caption)

	payload := map[string]interface{}{
		"inputs": prompt,
		"parameters": map[string]interface{}{
			"return_full_text": false,
		},
	}

	reqBody, _ := json.Marshal(payload)
	req, _ := http.NewRequest("POST", url, strings.NewReader(string(reqBody)))
	
	// Ensure token is clean and passed in header
	token := strings.TrimSpace(s.apiKey)
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("api error: %d - %s", resp.StatusCode, string(body))
	}

	var res []struct {
		GeneratedText string `json:"generated_text"`
	}

	if err := json.Unmarshal(body, &res); err != nil {
		return nil, err
	}

	if len(res) == 0 {
		return nil, fmt.Errorf("no response from model")
	}

	text := res[0].GeneratedText
	start := strings.Index(text, "{")
	end := strings.LastIndex(text, "}")
	if start == -1 || end == -1 {
		return nil, fmt.Errorf("no JSON found")
	}

	var event ExtractedEvent
	if err := json.Unmarshal([]byte(text[start:end+1]), &event); err != nil {
		return nil, err
	}

	return &event, nil
}
