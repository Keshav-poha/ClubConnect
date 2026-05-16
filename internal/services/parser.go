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
	// Safety: Force update if URL is empty, old Gemini, old Router, or broken Mistral
	if apiUrl == "" || strings.Contains(apiUrl, "googleapis.com") || 
	   strings.Contains(apiUrl, "router.huggingface.co") || 
	   strings.Contains(apiUrl, "mistralai") {
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

	models := []string{
		s.apiUrl,
		"https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta",
		"https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-1B-Instruct",
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
	prompt := fmt.Sprintf(`[INST] You are an event filter. Determine if this Instagram post is a student-relevant event (hackathon, session, recruitment, book/magazine release, workshop). 
If it IS an event, extract details. If it is NOT an event (just greetings, awards, generic info), set is_event to false.

Today is %s. Year is 2026.
Return JSON ONLY: {"is_event": bool, "title": "string", "date": "ISO8601", "location": "string"}

Text: %s [/INST]`, time.Now().Format("2006-01-02"), caption)

	payload := map[string]interface{}{
		"inputs": prompt,
		"parameters": map[string]interface{}{
			"return_full_text": false,
			"max_new_tokens":   200,
		},
	}

	reqBody, _ := json.Marshal(payload)
	req, _ := http.NewRequest("POST", url, strings.NewReader(string(reqBody)))
	
	req.Header.Set("Authorization", "Bearer "+strings.TrimSpace(s.apiKey))
	req.Header.Set("Content-Type", "application/json")
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
	lower := strings.ToLower(caption)
	
	// Keywords for relevant student events
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
