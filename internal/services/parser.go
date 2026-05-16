package services

import (
	"encoding/json"
	"fmt"
	"io"
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
	// Safety: If the old Gemini URL is still in env, force the new HF URL
	if apiUrl == "" || strings.Contains(apiUrl, "googleapis.com") {
		apiUrl = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2"
	}
	return &ParserService{
		apiKey: apiKey,
		apiUrl: apiUrl,
		client: &http.Client{Timeout: 30 * time.Second},
	}
}

func (s *ParserService) ParseCaption(caption string) (*ExtractedEvent, error) {
	if s.apiKey == "" {
		return nil, fmt.Errorf("HF_TOKEN missing in environment")
	}

	// Masked log for debugging
	prefix := s.apiKey
	if len(prefix) > 4 {
		prefix = prefix[:4]
	}
	log.Printf("DEBUG: Using HF token starting with: %s...", prefix)

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
	req, _ := http.NewRequest("POST", s.apiUrl, strings.NewReader(string(reqBody)))
	req.Header.Set("Authorization", "Bearer "+s.apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("hf api error: %d - %s", resp.StatusCode, string(body))
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
		return nil, fmt.Errorf("no JSON found: %s", text)
	}

	var event ExtractedEvent
	if err := json.Unmarshal([]byte(text[start:end+1]), &event); err != nil {
		return nil, fmt.Errorf("json parse error: %w", err)
	}

	return &event, nil
}
