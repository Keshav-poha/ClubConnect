package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
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
	return &ParserService{
		apiKey: apiKey,
		apiUrl: apiUrl,
		client: &http.Client{Timeout: 30 * time.Second},
	}
}

func (s *ParserService) ParseCaption(caption string) (*ExtractedEvent, error) {
	if s.apiKey == "" || s.apiUrl == "" {
		return nil, fmt.Errorf("parser config missing")
	}

	prompt := fmt.Sprintf(`
		Extract event info from this caption. 
		Return JSON: {"title": "", "date": "ISO8601", "location": ""}.
		Empty strings if missing. Year 2026.
		Caption: %s
	`, caption)

	reqBody, _ := json.Marshal(map[string]interface{}{
		"contents": []interface{}{
			map[string]interface{}{
				"parts": []interface{}{
					map[string]interface{}{"text": prompt},
				},
			},
		},
		"generationConfig": map[string]interface{}{
			"responseMimeType": "application/json",
		},
	})

	url := fmt.Sprintf("%s?key=%s", s.apiUrl, s.apiKey)
	req, _ := http.NewRequest("POST", url, bytes.NewBuffer(reqBody))
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("api error: %d", resp.StatusCode)
	}

	var res struct {
		Candidates []struct {
			Content struct {
				Parts []struct {
					Text string `json:"text"`
				} `json:"parts"`
			} `json:"content"`
		} `json:"candidates"`
	}

	if err := json.Unmarshal(body, &res); err != nil {
		return nil, err
	}

	if len(res.Candidates) == 0 {
		return nil, fmt.Errorf("no candidates")
	}

	var event ExtractedEvent
	raw := res.Candidates[0].Content.Parts[0].Text
	if err := json.Unmarshal([]byte(raw), &event); err != nil {
		return nil, fmt.Errorf("json parse error: %w", err)
	}

	return &event, nil
}
