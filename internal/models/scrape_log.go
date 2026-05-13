package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ScrapeLog records the result of each scraping run for a club.
type ScrapeLog struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ClubID       uuid.UUID `gorm:"type:uuid;not null;index" json:"club_id"`
	Status       string    `gorm:"type:varchar(20);not null" json:"status"` // "success", "failed", "partial"
	PostsFound   int       `gorm:"default:0" json:"posts_found"`
	EventsParsed int       `gorm:"default:0" json:"events_parsed"`
	Error        string    `gorm:"type:text" json:"error,omitempty"`
	ScrapedAt    time.Time `gorm:"autoCreateTime" json:"scraped_at"`

	// Relationships
	Club Club `gorm:"foreignKey:ClubID" json:"club,omitempty"`
}

// BeforeCreate generates a UUID if one isn't already set.
func (s *ScrapeLog) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}
