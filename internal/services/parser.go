package services

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"regexp"
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
	// Standard Legacy Serverless URL (the only true free tier)
	if apiUrl == "" || strings.Contains(apiUrl, "router.huggingface.co") || strings.Contains(apiUrl, "googleapis.com") {
		apiUrl = "https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-1B-Instruct"
	}
	return &ParserService{
		apiKey: apiKey,
		apiUrl: apiUrl,
		client: &http.Client{Timeout: 30 * time.Second},
	}
}

func (s *ParserService) ParseCaption(caption string) (*ExtractedEvent, error) {
	if s.apiKey == "" {
		return s.heuristicParse(caption), nil
	}

	// Try the legacy serverless models
	models := []string{
		s.apiUrl,
		"https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta",
		"https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3",
	}

	for _, modelUrl := range models {
		log.Printf("DEBUG: attempting parse with %s", modelUrl)
		
		event, err := s.tryParse(caption, modelUrl)
		if err == nil {
			return event, nil
		}
		log.Printf("DEBUG: model %s failed: %v", modelUrl, err)
	}

	log.Printf("DEBUG: all AI models failed, using heuristic fallback")
	return s.heuristicParse(caption), nil
}

func (s *ParserService) tryParse(caption string, url string) (*ExtractedEvent, error) {
	prompt := fmt.Sprintf("Extract event title, date (ISO 8601), and location from this text into a JSON object. today is %s.\n\nText: %s\n\nJSON:", time.Now().Format("2006-01-02"), caption)

	payload := map[string]interface{}{
		"inputs": prompt,
		"parameters": map[string]interface{}{
			"return_full_text": false,
			"max_new_tokens":   150,
		},
	}

	reqBody, _ := json.Marshal(payload)
	req, _ := http.NewRequest("POST", url, strings.NewReader(string(reqBody)))
	
	req.Header.Set("Authorization", "Bearer "+strings.TrimSpace(s.apiKey))
	req.Header.Set("Content-Type", "application/json")
	// Important: Set a browser-like User-Agent
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("api error %d: %s", resp.StatusCode, string(body))
	}

	var res []struct {
		GeneratedText string `json:"generated_text"`
	}

	if err := json.Unmarshal(body, &res); err != nil {
		return nil, err
	}

	if len(res) == 0 {
		return nil, fmt.Errorf("empty response")
	}

	text := res[0].GeneratedText
	start := strings.Index(text, "{")
	end := strings.LastIndex(text, "}")
	if start == -1 || end == -1 {
		return nil, fmt.Errorf("no json in output")
	}

	var event ExtractedEvent
	if err := json.Unmarshal([]byte(text[start:end+1]), &event); err != nil {
		return nil, err
	}

	return &event, nil
}

func (s *ParserService) heuristicParse(caption string) *ExtractedEvent {
	// Simple fallback: first line as title, current time as date
	lines := strings.Split(caption, "\n")
	title := "New Event"
	if len(lines) > 0 && len(lines[0]) > 5 {
		title = strings.TrimSpace(lines[0])
		if len(title) > 50 {
			title = title[:47] + "..."
		}
	}

	// Try to find a date like 25th May or 2026-05-25
	date := time.Now().AddDate(0, 0, 7) // Default to 1 week from now
	dateRegex := regexp.MustCompile(`(\d{1,2})[th|st|nd|rd]*\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)`)
	match := dateRegex.FindStringSubmatch(caption)
	if len(match) >= 3 {
		parsedDate, err := time.Parse("2 Jan 2006", fmt.Sprintf("%s %s 2026", match[1], match[2]))
		if err == nil {
			date = parsedDate
		}
	}

	return &ExtractedEvent{
		Title:    title,
		Date:     date,
		Location: "TBD",
	}
}
