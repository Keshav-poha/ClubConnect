package services

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/clubconnect/clubconnect/internal/config"
	"github.com/clubconnect/clubconnect/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// DiscoveryService handles scraping Instagram posts and extracting events.
type DiscoveryService struct {
	db      *gorm.DB
	parser  *ParserService
	cfg     *config.Config
	workers int
}

// PostData represents a single Instagram post fetched from the external API.
type PostData struct {
	PostID       string
	InstagramURL string
	ImageURL     string
	Caption      string
	PostedAt     time.Time
}

func NewDiscoveryService(db *gorm.DB, parser *ParserService, cfg *config.Config, workers int) *DiscoveryService {
	if workers <= 0 {
		workers = 1
	}
	return &DiscoveryService{db, parser, cfg, workers}
}

// RunDiscoveryCycle scrapes all registered clubs concurrently using a worker pool.
func (s *DiscoveryService) RunDiscoveryCycle() {
	var clubs []models.Club
	if err := s.db.Find(&clubs).Error; err != nil {
		log.Printf("db error fetching clubs: %v", err)
		return
	}

	log.Printf("running discovery: %d clubs, %d workers", len(clubs), s.workers)

	jobs := make(chan models.Club, len(clubs))
	var wg sync.WaitGroup

	for w := 0; w < s.workers; w++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for club := range jobs {
				if err := s.ScrapeClub(club.Handle); err != nil {
					log.Printf("scrape failed [%s]: %v", club.Handle, err)
				}
				time.Sleep(10 * time.Second)
			}
		}()
	}

	for _, club := range clubs {
		jobs <- club
	}
	close(jobs)

	wg.Wait()
	log.Println("discovery cycle done")
}

// ScrapeClub fetches Instagram posts for a single club handle, parses each
// caption through the AI, and saves qualifying events to the database.
func (s *DiscoveryService) ScrapeClub(handle string) error {
	var club models.Club
	if err := s.db.First(&club, "handle = ?", handle).Error; err != nil {
		return fmt.Errorf("club not found: %s", handle)
	}

	posts, err := s.fetchInstagramPosts(club.Handle)
	if err != nil {
		s.saveLog(club.ID, "failed", 0, 0, err.Error())
		return err
	}

	saved := 0
	skipped := 0

	for _, p := range posts {
		// Skip posts we've already processed.
		var existing models.Event
		if err := s.db.First(&existing, "post_id = ?", p.PostID).Error; err == nil {
			continue
		}

		// Skip empty captions — nothing to parse.
		if strings.TrimSpace(p.Caption) == "" {
			log.Printf("skipping empty-caption post [%s]", p.PostID)
			continue
		}

		extracted, err := s.parser.ParseCaption(p.Caption)

		// Throttle between AI calls to avoid overloading the model.
		time.Sleep(3 * time.Second)

		if err != nil {
			log.Printf("parser fail [%s]: %v", p.PostID, err)
			continue
		}

		if !extracted.IsEvent {
			log.Printf("skipping non-event post [%s]: %s", p.PostID, truncate(extracted.Title, 40))
			skipped++
			continue
		}

		eventDate := extracted.Date
		if eventDate.IsZero() {
			eventDate = p.PostedAt
		}

		description := extracted.Description
		if description == "" {
			description = p.Caption
		}

		event := models.Event{
			ClubID:       club.ID,
			Title:        extracted.Title,
			Description:  description,
			Date:         &eventDate,
			Location:     extracted.Location,
			Attendance:   extracted.Attendance,
			ImageURL:     p.ImageURL,
			InstagramURL: p.InstagramURL,
			PostID:       p.PostID,
			CreatedAt:    p.PostedAt,
		}

		if err := s.db.Create(&event).Error; err != nil {
			log.Printf("db error saving event: %v", err)
			continue
		}
		saved++
		log.Printf("saved event [%s]: %s", p.PostID, extracted.Title)
	}

	log.Printf("scrape [%s] done: %d posts, %d saved, %d skipped", handle, len(posts), saved, skipped)
	s.saveLog(club.ID, "success", len(posts), saved, "")
	return nil
}

// fetchInstagramPosts calls the RapidAPI Instagram endpoint to retrieve
// recent posts for the given handle.
func (s *DiscoveryService) fetchInstagramPosts(handle string) ([]PostData, error) {
	if s.cfg.RapidAPIKey == "" {
		return nil, fmt.Errorf("RAPIDAPI_KEY not configured")
	}

	url := fmt.Sprintf("https://%s/api/instagram/posts", s.cfg.RapidAPIHost)
	payload := strings.NewReader(fmt.Sprintf(`{"username": "%s", "maxId": ""}`, handle))

	req, err := http.NewRequest("POST", url, payload)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("x-rapidapi-key", s.cfg.RapidAPIKey)
	req.Header.Set("x-rapidapi-host", s.cfg.RapidAPIHost)
	req.Header.Set("Content-Type", "application/json")

	log.Printf("fetching posts for %s", handle)

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("instagram API error: %d - %s", resp.StatusCode, string(body))
	}

	var result struct {
		Result struct {
			Edges []struct {
				Node struct {
					Code             string `json:"code"`
					TakenAtTimestamp int64  `json:"taken_at_timestamp"`
					TakenAt          int64  `json:"taken_at"`
					Caption          struct {
						Text string `json:"text"`
					} `json:"caption"`
					ImageVersions2 struct {
						Candidates []struct {
							URL string `json:"url"`
						} `json:"candidates"`
					} `json:"image_versions2"`
				} `json:"node"`
			} `json:"edges"`
		} `json:"result"`
	}

	if err := json.Unmarshal(body, &result); err != nil {
		return nil, fmt.Errorf("json unmarshal error: %w", err)
	}

	var posts []PostData
	for _, edge := range result.Result.Edges {
		p := edge.Node
		imgURL := ""
		if len(p.ImageVersions2.Candidates) > 0 {
			imgURL = p.ImageVersions2.Candidates[0].URL
		}

		ts := p.TakenAtTimestamp
		if ts == 0 {
			ts = p.TakenAt
		}
		if ts == 0 {
			ts = time.Now().Unix()
		}

		posts = append(posts, PostData{
			PostID:       p.Code,
			Caption:      p.Caption.Text,
			ImageURL:     imgURL,
			InstagramURL: fmt.Sprintf("https://instagram.com/p/%s/", p.Code),
			PostedAt:     time.Unix(ts, 0),
		})
	}

	log.Printf("fetched %d posts for %s", len(posts), handle)
	return posts, nil
}

func (s *DiscoveryService) saveLog(clubID uuid.UUID, status string, found, saved int, msg string) {
	s.db.Create(&models.ScrapeLog{
		ClubID:       clubID,
		Status:       status,
		PostsFound:   found,
		EventsParsed: saved,
		Error:        msg,
	})
}

// GetLastScrapeTime retrieves the timestamp of the most recent scrape log.
func (s *DiscoveryService) GetLastScrapeTime() (time.Time, error) {
	var lastLog models.ScrapeLog
	err := s.db.Order("scraped_at DESC").First(&lastLog).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return time.Time{}, nil
		}
		return time.Time{}, err
	}
	return lastLog.ScrapedAt, nil
}

