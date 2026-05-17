package services

import (
	"encoding/json"
	"fmt"
	"log"
	"os/exec"
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
	// No longer needs an API URL or Key for the local integrated workflow
}

func NewParserService(apiKey, apiUrl string) *ParserService {
	return &ParserService{}
}

func (s *ParserService) ParseCaption(caption string) (*ExtractedEvent, error) {
	// Try the integrated Python AI first
	event, err := s.tryIntegratedParse(caption)
	if err == nil {
		return event, nil
	}
	
	log.Printf("DEBUG: integrated AI parse failed (%v), falling back to heuristic", err)
	return s.heuristicParse(caption), nil
}

type rawExtractedEvent struct {
	Title    string `json:"title"`
	Date     string `json:"date"`
	Location string `json:"location"`
	IsEvent  bool   `json:"is_event"`
}

func (s *ParserService) tryIntegratedParse(caption string) (*ExtractedEvent, error) {
	// Call our integrated Python script
	cmd := exec.Command("python3", "internal/services/extract.py", caption)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return nil, fmt.Errorf("python script failed: %v - %s", err, string(output))
	}

	// Find JSON in the output
	outStr := string(output)
	start := strings.Index(outStr, "{")
	end := strings.LastIndex(outStr, "}")
	if start == -1 || end == -1 {
		return nil, fmt.Errorf("no json in python output: %s", outStr)
	}

	var raw rawExtractedEvent
	if err := json.Unmarshal([]byte(outStr[start:end+1]), &raw); err != nil {
		return nil, fmt.Errorf("json parse error: %w", err)
	}

	// Parse date with robust fallbacks
	parsedDate := time.Now().AddDate(0, 0, 7) // Default fallback
	dateStr := strings.TrimSpace(raw.Date)
	if dateStr != "" {
		if t, err := time.Parse(time.RFC3339, dateStr); err == nil {
			parsedDate = t
		} else if t, err := time.Parse("2006-01-02", dateStr); err == nil {
			parsedDate = t
		} else if t, err := time.Parse("2006-01-02 15:04:05", dateStr); err == nil {
			parsedDate = t
		} else {
			log.Printf("DEBUG: could not parse date string %q, using default fallback", dateStr)
		}
	}

	event := ExtractedEvent{
		Title:    raw.Title,
		Date:     parsedDate,
		Location: raw.Location,
		IsEvent:  raw.IsEvent,
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
