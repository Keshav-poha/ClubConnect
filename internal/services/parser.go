package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/clubconnect/clubconnect/internal/config"
)

// ExtractedEvent holds the structured data parsed from an Instagram caption.
type ExtractedEvent struct {
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Date        time.Time `json:"date"`
	Location    string    `json:"location"`
	Attendance  string    `json:"attendance"`
	IsEvent     bool      `json:"is_event"`
}

type ParserService struct {
	apiKey string
	model  string
}

func NewParserService(cfg *config.Config) *ParserService {
	return &ParserService{
		apiKey: cfg.GroqAPIKey,
		model:  cfg.GroqModel,
	}
}

// ParseCaption runs the integrated Groq AI to extract event info from a
// raw Instagram caption. A two-layer Go-side filter catches misclassifications.
func (s *ParserService) ParseCaption(caption string) (*ExtractedEvent, error) {
	event, err := s.runGroqParser(caption)
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

type rawExtractedEvent struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Date        string `json:"date"`
	Location    string `json:"location"`
	Attendance  string `json:"attendance"`
	IsEvent     bool   `json:"is_event"`
}

type groqMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type groqResponseFormat struct {
	Type string `json:"type"`
}

type groqRequest struct {
	Model          string             `json:"model"`
	Messages       []groqMessage      `json:"messages"`
	ResponseFormat groqResponseFormat `json:"response_format"`
	Temperature    float64            `json:"temperature"`
}

type groqResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
}

// runGroqParser invokes the Groq Chat Completion API and parses its JSON output.
func (s *ParserService) runGroqParser(caption string) (*ExtractedEvent, error) {
	if s.apiKey == "" {
		return nil, fmt.Errorf("GROQ_API_KEY is not configured")
	}

	today := time.Now().Format("2006-01-02")
	prompt := fmt.Sprintf(`You are a strict event classifier and information extractor for a college club aggregator app.

TASK: Analyze the Instagram caption below. Determine if it is an ACTIONABLE UPCOMING EVENT that a student would want to attend or participate in.

VALID event types: hackathon, workshop, seminar, recruitment drive, audition, competition, coding contest, book launch, magazine release, open mic, guest lecture, webinar, info session, orientation, tryout, fest registration, club recruitment, internship drive.
INVALID post types: festival greeting, holiday wish, team announcement, president reveal, VP appointment, election result, throwback post, recap, RIP/condolence, birthday wish, congratulations post, meme, quote of the day, general club promotion.

RULES:
- set "is_event" to true only if the post invites students to do something on a specific or upcoming date.
- set "is_event" to false for greetings, announcements, memes, recaps of past events, or people updates.
- If the post is introducing a person, team, or board members, set "is_event" to false.
- Today's date is %s. If a date is mentioned but already passed, set "is_event" to false.
- If NO EXPLICIT EVENT DATE is mentioned in the caption, set "date" to "". Do NOT use today's date.
- Generate a concise, catchy, and professional title for the event (e.g. "AI Hackathon", "Dance Auditions", etc.).
- Extract the location/venue (physical or online). If not mentioned, set "location" to "".
- Generate a clean, well-formatted, and catchy description summarizing the event details (e.g. rules, eligibility, registration deadlines, prizes) from the raw caption.
- Determine the attendance/registration requirements (e.g. "Registration required", "Open to all", "Paid registration", "Free entry"). Keep it under 100 characters.

Output ONLY valid JSON matching this exact structure:
{
  "is_event": bool,
  "title": "string",
  "date": "YYYY-MM-DD or empty",
  "location": "string",
  "description": "string",
  "attendance": "string"
}

Caption: %s`, today, caption)

	reqBody := groqRequest{
		Model: s.model,
		Messages: []groqMessage{
			{Role: "system", Content: "You are a JSON event extractor. Output only valid JSON matching the schema."},
			{Role: "user", Content: prompt},
		},
		ResponseFormat: groqResponseFormat{Type: "json_object"},
		Temperature:    0.1,
	}

	bodyBytes, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal groq request: %w", err)
	}

	req, err := http.NewRequest("POST", "https://api.groq.com/openai/v1/chat/completions", bytes.NewBuffer(bodyBytes))
	if err != nil {
		return nil, fmt.Errorf("failed to create groq request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+s.apiKey)

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("groq API call failed: %w", err)
	}
	defer resp.Body.Close()

	respBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read groq response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("groq API returned status %d: %s", resp.StatusCode, string(respBytes))
	}

	var groqResp groqResponse
	if err := json.Unmarshal(respBytes, &groqResp); err != nil {
		return nil, fmt.Errorf("failed to unmarshal groq response: %w", err)
	}

	if len(groqResp.Choices) == 0 {
		return nil, fmt.Errorf("groq response returned no choices")
	}

	content := groqResp.Choices[0].Message.Content

	var raw rawExtractedEvent
	if err := json.Unmarshal([]byte(content), &raw); err != nil {
		return nil, fmt.Errorf("failed to parse extracted json from groq: %w - content: %s", err, content)
	}

	// Parse the date string with multiple format fallbacks.
	var parsedDate time.Time
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
		Title:       raw.Title,
		Description: raw.Description,
		Date:        parsedDate,
		Location:    raw.Location,
		Attendance:  raw.Attendance,
		IsEvent:     raw.IsEvent,
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
		"venue:", "location:", "at the auditorium",
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
