package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// ExtractedEvent represents the structured data from a caption
type ExtractedEvent struct {
	Title    string    `json:"title"`
	Date     time.Time `json:"date"`
	Location string    `json:"location"`
}

// ParserService handles text extraction using an external service
type ParserService struct {
	apiKey string
	apiUrl string
	client *http.Client
}

// NewParserService init
func NewParserService(apiKey, apiUrl string) *ParserService {
	return &ParserService{
		apiKey: apiKey,
		apiUrl: apiUrl,
		client: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// ParseCaption converts raw text into an event struct
func (s *ParserService) ParseCaption(caption string) (*ExtractedEvent, error) {
	if s.apiKey == "" || s.apiUrl == "" {
		return nil, fmt.Errorf("parser configuration incomplete")
	}

	prompt := fmt.Sprintf(`
		Extract event details from this Instagram caption. 
		Return ONLY a JSON object with: "title", "date" (ISO8601), and "location".
		If a field is missing, use an empty string. 
		Current year is 2026.

		Caption: %s
	`, caption)

	reqBody := map[string]interface{}{
		"contents": []map[string]interface{}{
			{
				"parts": []map[string]interface{}{
					{"text": prompt},
				},
			},
		},
		"generationConfig": map[string]interface{}{
			"responseMimeType": "application/json",
		},
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return nil, err
	}

	url := fmt.Sprintf("%s?key=%s", s.apiUrl, s.apiKey)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("extraction error (%d): %s", resp.StatusCode, string(body))
	}

	// Internal response structure
	var apiResp struct {
		Candidates []struct {
			Content struct {
				Parts []struct {
					Text string `json:"text"`
				} `json:"parts"`
			} `json:"content"`
		} `json:"candidates"`
	}

	if err := json.Unmarshal(body, &apiResp); err != nil {
		return nil, err
	}

	if len(apiResp.Candidates) == 0 || len(apiResp.Candidates[0].Content.Parts) == 0 {
		return nil, fmt.Errorf("no results found")
	}

	rawResult := apiResp.Candidates[0].Content.Parts[0].Text
	
	var event ExtractedEvent
	if err := json.Unmarshal([]byte(rawResult), &event); err != nil {
		return nil, fmt.Errorf("failed to process result: %w", err)
	}

	return &event, nil
}
