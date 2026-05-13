package services

import (
	"log"

	"gorm.io/gorm"
)

// DiscoveryService handles fetching social media posts
type DiscoveryService struct {
	db     *gorm.DB
	parser *ParserService
}

// NewDiscoveryService init
func NewDiscoveryService(db *gorm.DB, parser *ParserService) *DiscoveryService {
	return &DiscoveryService{
		db:     db,
		parser: parser,
	}
}

// ScrapeClub triggers the extraction logic for a specific club
// TODO: Implement full Instagram scraping logic with Colly/Chromedp
func (s *DiscoveryService) ScrapeClub(handle string) error {
	log.Printf("scraping club: %s", handle)
	
	// Placeholder for scraping logic:
	// 1. Fetch posts from Instagram
	// 2. For each new post, extract caption and image
	// 3. result, err := s.parser.ParseCaption(caption)
	// 4. Save to DB if unique
	
	return nil
}
