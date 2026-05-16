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
	// Use Qwen-2.5-1.5B as the primary free-tier model (confirmed working 2026)
	if apiUrl == "" || strings.Contains(apiUrl, "api-inference.huggingface.co") || strings.Contains(apiUrl, "googleapis.com") {
		apiUrl = "https://router.huggingface.co/hf-inference/models/Qwen/Qwen2.5-1.5B-Instruct"
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

	// Small, reliable models for free tier
	models := []string{
		s.apiUrl,
		"https://router.huggingface.co/hf-inference/models/microsoft/Phi-3-mini-4k-instruct",
		"https://router.huggingface.co/hf-inference/models/google/gemma-2b-it",
	}

	var lastErr error
	for _, modelUrl := range models {
		log.Printf("DEBUG: attempting parse with %s", modelUrl)
		
		for attempt := 0; attempt < 2; attempt++ {
			event, err := s.tryParse(caption, modelUrl)
			if err == nil {
				return event, nil
			}

			lastErr = err
			if strings.Contains(err.Error(), "loading") {
				log.Printf("DEBUG: model loading, waiting 5s...")
				time.Sleep(5 * time.Second)
				continue
			}
			
			if strings.Contains(err.Error(), "429") || strings.Contains(err.Error(), "400") {
				log.Printf("DEBUG: model error (%v), skipping to next...", err)
				break 
			}
		}
	}

	return nil, fmt.Errorf("all models failed: %w", lastErr)
}

func (s *ParserService) tryParse(caption string, url string) (*ExtractedEvent, error) {
	// Optimized prompt for smaller models
	prompt := fmt.Sprintf("<|im_start|>system\nYou are a helpful assistant that extracts event details into JSON format.<|im_end|>\n<|im_start|>user\nExtract the following details from this caption: title, date (ISO 8601), location.\nToday is %s. Year is 2026.\nCaption: %s\n\nReturn ONLY the JSON object.<|im_end|>\n<|im_start|>assistant\n", time.Now().Format("2006-01-02"), caption)

	payload := map[string]interface{}{
		"inputs": prompt,
		"parameters": map[string]interface{}{
			"return_full_text": false,
			"max_new_tokens":   200,
		},
	}

	reqBody, _ := json.Marshal(payload)
	req, _ := http.NewRequest("POST", url, strings.NewReader(string(reqBody)))
	
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
		return nil, fmt.Errorf("no JSON found in output")
	}

	var event ExtractedEvent
	if err := json.Unmarshal([]byte(text[start:end+1]), &event); err != nil {
		return nil, fmt.Errorf("json parse error: %w", err)
	}

	return &event, nil
}
