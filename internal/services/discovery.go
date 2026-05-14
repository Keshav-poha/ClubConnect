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

type DiscoveryService struct {
	db      *gorm.DB
	parser  *ParserService
	workers int
}

type PostData struct {
	PostID       string
	InstagramURL string
	ImageURL     string
	Caption      string
}

func NewDiscoveryService(db *gorm.DB, parser *ParserService, workers int) *DiscoveryService {
	if workers <= 0 {
		workers = 1
	}
	return &DiscoveryService{db, parser, workers}
}

var userAgents = []string{
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
	"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
	"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
}

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
				time.Sleep(2 * time.Second)
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

	parsed := 0
	for _, p := range posts {
		var existing models.Event
		if err := s.db.First(&existing, "post_id = ?", p.PostID).Error; err == nil {
			continue
		}

		extracted, err := s.parser.ParseCaption(p.Caption)
		if err != nil {
			log.Printf("parser fail [%s]: %v", p.PostID, err)
			continue
		}

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
			log.Printf("db error saving event: %v", err)
			continue
		}
		parsed++
	}

	s.saveLog(club.ID, "success", len(posts), parsed, "")
	return nil
}

func (s *DiscoveryService) fetchInstagramPosts(handle string) ([]PostData, error) {
	ua := userAgents[rand.Intn(len(userAgents))]
	
	opts := append(chromedp.DefaultExecAllocatorOptions[:],
		chromedp.UserAgent(ua),
		chromedp.NoSandbox,
		chromedp.DisableGPU,
	)

	allocCtx, cancel := chromedp.NewExecAllocator(context.Background(), opts...)
	defer cancel()

	ctx, cancel := chromedp.NewContext(allocCtx)
	defer cancel()

	ctx, cancel = context.WithTimeout(ctx, 90*time.Second)
	defer cancel()

	url := fmt.Sprintf("https://www.instagram.com/%s/", handle)
	var posts []PostData
	
	err := chromedp.Run(ctx,
		chromedp.Navigate(url),
		chromedp.WaitVisible(`article`, chromedp.ByQuery),
		chromedp.ActionFunc(func(ctx context.Context) error {
			return chromedp.Evaluate(`window.scrollTo(0, 800)`, nil).Do(ctx)
		}),
		chromedp.Sleep(3*time.Second), 
		chromedp.Evaluate(`
			Array.from(document.querySelectorAll('article a')).slice(0, 12).map(a => {
				const img = a.querySelector('img');
				const href = a.getAttribute('href');
				return {
					PostID: href ? href.split('/')[2] : '',
					InstagramURL: 'https://www.instagram.com' + href,
					ImageURL: img ? img.src : '',
					Caption: img ? img.alt : ''
				};
			})
		`, &posts),
	)

	if err != nil {
		if strings.Contains(err.Error(), "deadline") {
			return nil, fmt.Errorf("timeout reaching %s", handle)
		}
		return nil, err
	}

	return posts, nil
}

func (s *DiscoveryService) saveLog(clubID uuid.UUID, status string, found, parsed int, msg string) {
	s.db.Create(&models.ScrapeLog{
		ClubID:       clubID,
		Status:       status,
		PostsFound:   found,
		EventsParsed: parsed,
		Error:        msg,
	})
}
