package services

import (
	"encoding/json"
	"fmt"
	"log"
	"os/exec"
	"strings"
	"time"
)

// ExtractedEvent holds the structured data parsed from an Instagram caption.
type ExtractedEvent struct {
	Title    string    `json:"title"`
	Date     time.Time `json:"date"`
	Location string    `json:"location"`
	IsEvent  bool      `json:"is_event"`
}

type ParserService struct{}

func NewParserService() *ParserService {
	return &ParserService{}
}

// ParseCaption runs the integrated Python AI to extract event info from a
// raw Instagram caption. It also applies a Go-side keyword safety net to
// reject posts that the AI might incorrectly classify as events.
func (s *ParserService) ParseCaption(caption string) (*ExtractedEvent, error) {
	event, err := s.runPythonParser(caption)
	if err != nil {
		return nil, err
	}

	// Go-side safety net: override is_event=true if the caption clearly
	// matches a non-event pattern. The small AI model sometimes misclassifies
	// festival greetings, team announcements, etc. as events.
	if event.IsEvent && isObviouslyNotAnEvent(caption) {
		log.Printf("safety-net override: rejecting %q as non-event", truncate(event.Title, 60))
		event.IsEvent = false
	}

	return event, nil
}

// rawExtractedEvent is the intermediate JSON shape returned by the Python script.
type rawExtractedEvent struct {
	Title    string `json:"title"`
	Date     string `json:"date"`
	Location string `json:"location"`
	IsEvent  bool   `json:"is_event"`
}

// runPythonParser invokes the local extract.py script and parses its JSON output.
func (s *ParserService) runPythonParser(caption string) (*ExtractedEvent, error) {
	cmd := exec.Command("python3", "internal/services/extract.py", caption)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return nil, fmt.Errorf("python script failed: %v - %s", err, string(output))
	}

	outStr := string(output)
	start := strings.Index(outStr, "{")
	end := strings.LastIndex(outStr, "}")
	if start == -1 || end == -1 || end <= start {
		return nil, fmt.Errorf("no valid json in python output: %s", outStr)
	}

	var raw rawExtractedEvent
	if err := json.Unmarshal([]byte(outStr[start:end+1]), &raw); err != nil {
		return nil, fmt.Errorf("json parse error: %w", err)
	}

	// Parse the date string with multiple format fallbacks.
	parsedDate := time.Now().AddDate(0, 0, 7) // default: 1 week from now
	dateStr := strings.TrimSpace(raw.Date)
	if dateStr != "" {
		formats := []string{
			time.RFC3339,
			"2006-01-02",
			"2006-01-02 15:04:05",
			"2006-01-02T15:04:05",
			"02-01-2006",
			"January 2, 2006",
		}
		parsed := false
		for _, f := range formats {
			if t, err := time.Parse(f, dateStr); err == nil {
				parsedDate = t
				parsed = true
				break
			}
		}
		if !parsed {
			log.Printf("could not parse date %q, using default fallback", dateStr)
		}
	}

	return &ExtractedEvent{
		Title:    raw.Title,
		Date:     parsedDate,
		Location: raw.Location,
		IsEvent:  raw.IsEvent,
	}, nil
}

// isObviouslyNotAnEvent provides a fast keyword-based check to catch posts
// that the AI model might wrongly classify. These are patterns that almost
// never represent actionable student events.
func isObviouslyNotAnEvent(caption string) bool {
	lower := strings.ToLower(caption)

	// Reject: festival/holiday greetings
	greetings := []string{
		"happy diwali", "happy holi", "happy eid", "happy christmas",
		"happy new year", "happy independence day", "happy republic day",
		"happy raksha bandhan", "happy navratri", "happy ganesh chaturthi",
		"merry christmas", "eid mubarak", "festival greetings",
		"wishing you", "warm wishes", "season's greetings",
	}
	for _, g := range greetings {
		if strings.Contains(lower, g) {
			return true
		}
	}

	// Reject: leadership/team announcements
	announcements := []string{
		"new president", "new vice president", "meet our team",
		"introducing our", "elected as", "appointed as",
		"core team", "team reveal", "board members",
		"congratulations to our", "welcome our new",
	}
	for _, a := range announcements {
		if strings.Contains(lower, a) {
			return true
		}
	}

	// Reject: throwback / recap posts (not upcoming)
	recaps := []string{
		"throwback", "recap", "highlights from", "relive the",
		"looking back", "memories from", "#tbt", "thank you for attending",
	}
	for _, r := range recaps {
		if strings.Contains(lower, r) {
			return true
		}
	}

	return false
}

// truncate shortens a string to maxLen characters, appending "..." if truncated.
func truncate(s string, maxLen int) string {
	if len(s) <= maxLen {
		return s
	}
	return s[:maxLen] + "..."
}
