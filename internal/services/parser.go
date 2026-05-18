package services

import (
	"encoding/json"
	"fmt"
	"log"
	"os/exec"
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

func NewParserService() *ParserService {
	return &ParserService{}
}

func (s *ParserService) ParseCaption(caption string) (*ExtractedEvent, error) {
	// Rely exclusively on the integrated Python AI
	return s.tryIntegratedParse(caption)
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

