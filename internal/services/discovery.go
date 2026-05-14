package services

import (
	"context"
	"fmt"
	"log"
	"math/rand"
	"strings"
	"sync"
	"time"

	"github.com/clubconnect/clubconnect/internal/models"
	"github.com/chromedp/chromedp"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// DiscoveryService handles fetching social media posts
type DiscoveryService struct {
	db      *gorm.DB
	parser  *ParserService
	workers int
}

// PostData represents a raw post found during discovery
type PostData struct {
	PostID       string
	InstagramURL string
	ImageURL     string
	Caption      string
}

// NewDiscoveryService init
func NewDiscoveryService(db *gorm.DB, parser *ParserService, workers int) *DiscoveryService {
	if workers <= 0 {
		workers = 1
	}
	return &DiscoveryService{
		db:      db,
		parser:  parser,
		workers: workers,
	}
}

// User agents for rotation
var userAgents = []string{
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
	"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
	"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
}

func getRandomUserAgent() string {
	return userAgents[rand.Intn(len(userAgents))]
}

// RunDiscoveryCycle iterates through all clubs using a worker pool
func (s *DiscoveryService) RunDiscoveryCycle() {
	var clubs []models.Club
	if err := s.db.Find(&clubs).Error; err != nil {
		log.Printf("failed to fetch clubs for discovery cycle: %v", err)
		return
	}

	log.Printf("starting discovery cycle for %d clubs with %d workers", len(clubs), s.workers)

	jobs := make(chan models.Club, len(clubs))
	var wg sync.WaitGroup

	// Start workers
	for w := 1; w <= s.workers; w++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()
			for club := range jobs {
				log.Printf("[worker %d] processing %s", id, club.Handle)
				if err := s.ScrapeClub(club.Handle); err != nil {
					log.Printf("[worker %d] error scraping %s: %v", id, club.Handle, err)
				}
				// Small delay to prevent aggressive blocking
				time.Sleep(2 * time.Second)
			}
		}(w)
	}

	// Send jobs
	for _, club := range clubs {
		jobs <- club
	}
	close(jobs)

	wg.Wait()
	log.Println("discovery cycle completed")
}

// ScrapeClub triggers the extraction logic for a specific club
func (s *DiscoveryService) ScrapeClub(handle string) error {
	var club models.Club
	if err := s.db.First(&club, "handle = ?", handle).Error; err != nil {
		return fmt.Errorf("club not found: %w", err)
	}

	log.Printf("starting discovery for: %s", club.Handle)

	posts, err := s.fetchInstagramPosts(club.Handle)
	if err != nil {
		s.logScrape(club.ID, "failed", 0, 0, err.Error())
		return err
	}

	eventsParsed := 0
	for _, p := range posts {
		// Dedup check
		var existing models.Event
		if err := s.db.First(&existing, "post_id = ?", p.PostID).Error; err == nil {
			continue // Skip already processed posts
		}

		// Extract structured data
		extracted, err := s.parser.ParseCaption(p.Caption)
		if err != nil {
			log.Printf("skipping post %s: parsing failed: %v", p.PostID, err)
			continue
		}

		// Save new event
		event := models.Event{
			ClubID:       club.ID,
			Title:        extracted.Title,
			Description:  p.Caption,
			Date:         &extracted.Date,
			Location:     extracted.Location,
			ImageURL:     p.ImageURL,
			InstagramURL: p.InstagramURL,
			PostID:       p.PostID,
		}

		if err := s.db.Create(&event).Error; err != nil {
			log.Printf("failed to save event %s: %v", p.PostID, err)
			continue
		}
		eventsParsed++
	}

	s.logScrape(club.ID, "success", len(posts), eventsParsed, "")
	log.Printf("discovery finished for %s: %d found, %d new events", club.Handle, len(posts), eventsParsed)
	
	return nil
}

// fetchInstagramPosts uses headless chrome to pull recent post data
func (s *DiscoveryService) fetchInstagramPosts(handle string) ([]PostData, error) {
	// Setup chromedp
	opts := append(chromedp.DefaultExecAllocatorOptions[:],
		chromedp.UserAgent(getRandomUserAgent()),
		chromedp.NoSandbox,
		chromedp.DisableGPU,
	)

	allocCtx, cancel := chromedp.NewExecAllocator(context.Background(), opts...)
	defer cancel()

	ctx, cancel := chromedp.NewContext(allocCtx)
	defer cancel()

	// Timeout for the entire operation
	ctx, cancel = context.WithTimeout(ctx, 90*time.Second)
	defer cancel()

	url := fmt.Sprintf("https://www.instagram.com/%s/", handle)
	
	var posts []PostData
	
	err := chromedp.Run(ctx,
		chromedp.Navigate(url),
		chromedp.WaitVisible(`article`, chromedp.ByQuery),
		chromedp.Sleep(3*time.Second), 
		chromedp.Evaluate(`
			Array.from(document.querySelectorAll('article a')).slice(0, 5).map(a => {
				const img = a.querySelector('img');
				const href = a.getAttribute('href');
				const postID = href ? href.split('/')[2] : '';
				return {
					PostID: postID,
					InstagramURL: 'https://www.instagram.com' + href,
					ImageURL: img ? img.src : '',
					Caption: img ? img.alt : ''
				};
			})
		`, &posts),
	)

	if err != nil {
		if strings.Contains(err.Error(), "context deadline exceeded") {
			return nil, fmt.Errorf("discovery timed out (likely blocked or slow connection)")
		}
		return nil, fmt.Errorf("headless error: %w", err)
	}

	return posts, nil
}

func (s *DiscoveryService) logScrape(clubID uuid.UUID, status string, found, parsed int, errMsg string) {
	logEntry := models.ScrapeLog{
		ClubID:       clubID,
		Status:       status,
		PostsFound:   found,
		EventsParsed: parsed,
		Error:        errMsg,
	}
	s.db.Create(&logEntry)
}
