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
	IsEvent  bool      `json:"is_event"`
}

type ParserService struct {
	apiKey string
	apiUrl string
	client *http.Client
}

func NewParserService(apiKey, apiUrl string) *ParserService {
	// Standard Legacy Serverless URL (the most reliable free tier path)
	if apiUrl == "" || strings.Contains(apiUrl, "router.huggingface.co") || strings.Contains(apiUrl, "googleapis.com") {
		apiUrl = "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta"
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

	// Try the legacy serverless model (Zephyr is very stable)
	event, err := s.tryParse(caption, s.apiUrl)
	if err == nil {
		return event, nil
	}
	
	log.Printf("DEBUG: AI parse failed (%v), falling back to heuristic", err)
	return s.heuristicParse(caption), nil
}

func (s *ParserService) tryParse(caption string, url string) (*ExtractedEvent, error) {
	prompt := fmt.Sprintf("<|system|>\nYou are an event extractor. Extract details into JSON.<|endoftext|>\n<|user|>\nExtract from this caption: title, date (ISO 8601), location, and is_event (bool). Today is %s. Year 2026.\n\nCaption: %s\n\nJSON:<|endoftext|>\n<|assistant|>\n", time.Now().Format("2006-01-02"), caption)

	// Legacy "inputs" format
	payload := map[string]interface{}{
		"inputs": prompt,
		"parameters": map[string]interface{}{
			"return_full_text": false,
			"max_new_tokens":   250,
		},
		"options": map[string]interface{}{
			"wait_for_model": true,
		},
	}

	reqBody, _ := json.Marshal(payload)
	req, _ := http.NewRequest("POST", url, strings.NewReader(string(reqBody)))
	
	req.Header.Set("Authorization", "Bearer "+strings.TrimSpace(s.apiKey))
	req.Header.Set("Content-Type", "application/json")

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
	lower := strings.ToLower(caption)
	
	eventKeywords := []string{
		"hackathon", "session", "recruitment", "release", "magazine", 
		"book", "workshop", "webinar", "seminar", "competition", 
		"apply now", "register", "deadline", "bootcamp", "audition",
	}

	isEvent := false
	for _, kw := range eventKeywords {
		if strings.Contains(lower, kw) {
			isEvent = true
			break
		}
	}

	if !isEvent {
		return &ExtractedEvent{IsEvent: false}
	}

	lines := strings.Split(caption, "\n")
	title := "New Event"
	if len(lines) > 0 && len(lines[0]) > 5 {
		title = strings.TrimSpace(lines[0])
		if len(title) > 50 {
			title = title[:47] + "..."
		}
	}

	date := time.Now().AddDate(0, 0, 7)
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
		IsEvent:  true,
	}
}
