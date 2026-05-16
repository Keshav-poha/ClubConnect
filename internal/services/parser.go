package services

import (
	"bytes"
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
	// Default to local Ollama if no URL is provided
	if apiUrl == "" {
		apiUrl = "http://127.0.0.1:11434/api/generate"
	}
	return &ParserService{
		apiKey: apiKey,
		apiUrl: apiUrl,
		client: &http.Client{Timeout: 60 * time.Second}, // Longer timeout for local inference
	}
}

func (s *ParserService) ParseCaption(caption string) (*ExtractedEvent, error) {
	// Try local AI first
	event, err := s.tryLocalParse(caption)
	if err == nil {
		return event, nil
	}
	
	log.Printf("DEBUG: local AI parse failed (%v), falling back to heuristic", err)
	return s.heuristicParse(caption), nil
}

func (s *ParserService) tryLocalParse(caption string) (*ExtractedEvent, error) {
	prompt := fmt.Sprintf(`Extract event details from this caption into JSON format. 
Today is %s. Year is 2026.
Student-relevant events only (Hackathons, Recruitments, Sessions, Releases).
Return JSON: {"is_event": bool, "title": "string", "date": "ISO8601", "location": "string"}

Caption: %s`, time.Now().Format("2006-01-02"), caption)

	// Ollama API format
	payload := map[string]interface{}{
		"model":  "phi3:mini",
		"prompt": prompt,
		"stream": false,
		"format": "json",
	}

	reqBody, _ := json.Marshal(payload)
	req, _ := http.NewRequest("POST", s.apiUrl, bytes.NewBuffer(reqBody))
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("local ai error %d: %s", resp.StatusCode, string(body))
	}

	var res struct {
		Response string `json:"response"`
	}

	if err := json.Unmarshal(body, &res); err != nil {
		return nil, err
	}

	var event ExtractedEvent
	if err := json.Unmarshal([]byte(res.Response), &event); err != nil {
		return nil, fmt.Errorf("json parse error: %w", err)
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
