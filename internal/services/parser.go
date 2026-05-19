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
// raw Instagram caption. A two-layer Go-side filter catches misclassifications.
func (s *ParserService) ParseCaption(caption string) (*ExtractedEvent, error) {
	event, err := s.runPythonParser(caption)
	if err != nil {
		return nil, err
	}

	if event.IsEvent {
		// Layer 1: reject if caption matches known non-event patterns.
		if isNonEventPost(caption) {
			log.Printf("filter: rejected by non-event keywords — %q", truncate(event.Title, 50))
			event.IsEvent = false
		}

		// Layer 2: reject if caption has zero positive event signals.
		// A real event post should mention at least one actionable keyword.
		if event.IsEvent && !hasEventSignal(caption) {
			log.Printf("filter: rejected by missing event signals — %q", truncate(event.Title, 50))
			event.IsEvent = false
		}
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

// isNonEventPost checks if the caption matches patterns that are NEVER real events.
func isNonEventPost(caption string) bool {
	lower := strings.ToLower(caption)

	rejectPhrases := []string{
		// Festival / holiday greetings
		"happy diwali", "happy holi", "happy eid", "happy christmas",
		"happy new year", "happy independence day", "happy republic day",
		"happy raksha bandhan", "happy navratri", "happy ganesh chaturthi",
		"happy makar sankranti", "happy pongal", "happy onam", "happy baisakhi",
		"happy lohri", "happy ugadi", "happy guru nanak jayanti",
		"merry christmas", "eid mubarak", "ramadan mubarak",
		"festival greetings", "festive vibes", "festive season",
		"wishing you", "warm wishes", "season's greetings",
		"may this festival", "celebrate the spirit",

		// Leadership / team / org announcements
		"new president", "new vice president", "new secretary", "new treasurer",
		"meet our team", "meet the team", "meet our core",
		"introducing our", "introducing the",
		"elected as", "appointed as", "takes over as",
		"core team", "team reveal", "board members", "council members",
		"executive board", "new board", "office bearers",
		"congratulations to our", "welcome our new", "handing over",
		"tenure", "we are proud to announce",

		// Throwback / recap / past event
		"throwback", "#throwback", "#tbt", "throw back",
		"recap", "highlights from", "glimpses from", "relive the",
		"looking back", "memories from", "a look back",
		"thank you for attending", "thank you all for",
		"it was a pleasure", "successfully conducted",
		"event was a success", "wrapped up",

		// RIP / condolence / tribute
		"rest in peace", "rip", "heartfelt condolences", "we mourn",
		"in loving memory",

		// Birthday / personal congratulations
		"happy birthday", "birthday wishes", "many happy returns",

		// Memes / quotes / generic engagement
		"quote of the day", "meme", "relatable", "tag someone",
		"comment below", "share if you agree", "double tap",
		"follow us for more",

		// Generic promotions without specific event
		"stay tuned", "coming soon", "something exciting", "big reveal",
		"watch this space", "announcement coming",
	}

	for _, phrase := range rejectPhrases {
		if strings.Contains(lower, phrase) {
			return true
		}
	}

	return false
}

// hasEventSignal checks if the caption contains at least one keyword that
// indicates a real, actionable, upcoming event. If a post has NO signal at all,
// it's almost certainly not an event a student would care about.
func hasEventSignal(caption string) bool {
	lower := strings.ToLower(caption)

	signals := []string{
		// Event type keywords
		"hackathon", "workshop", "seminar", "webinar", "bootcamp",
		"competition", "contest", "challenge", "quiz",
		"recruitment", "hiring", "audition", "tryout", "selections",
		"orientation", "induction", "info session", "information session",
		"guest lecture", "talk", "speaker session", "panel discussion",
		"open mic", "jam session", "performance",
		"fest ", "festival registration", "cultural fest",
		"book launch", "magazine release", "publication",
		"internship", "placement drive",
		"meetup", "meet-up", "gathering",
		"exhibition", "expo",
		"marathon", "run ", "walkathon",
		"drive", "blood donation", "donation drive",

		// Action / registration keywords
		"register now", "register here", "registration",
		"sign up", "signup", "apply now", "apply here",
		"register at", "form link", "google form",
		"link in bio", "fill the form", "fill out",
		"join us", "participate", "last date to register",
		"deadline", "hurry up", "limited seats", "limited spots",
		"don't miss", "do not miss", "grab your spot",
		"book your", "reserve your", "enroll",
		"rsvp",

		// Date / time indicators
		"on the", "from the", "starting from",
		"jan ", "feb ", "mar ", "apr ", "may ", "jun ",
		"jul ", "aug ", "sep ", "oct ", "nov ", "dec ",
		"january", "february", "march", "april",
		"june", "july", "august", "september",
		"october", "november", "december",
		"tomorrow", "this weekend", "next week",
		"am ", "pm ", "a.m.", "p.m.",

		// Venue indicators
		"venue:", "location:", "at the auditorium", "at the",
		"seminar hall", "conference room",
	}

	for _, sig := range signals {
		if strings.Contains(lower, sig) {
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
