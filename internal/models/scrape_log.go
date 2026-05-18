package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ScrapeLog struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ClubID       uuid.UUID `gorm:"type:uuid;not null;index" json:"club_id"`
	Status       string    `gorm:"type:varchar(20)" json:"status"`
	PostsFound   int       `json:"posts_found"`
	EventsParsed int       `json:"events_parsed"`
	Error        string    `gorm:"type:text" json:"error"`
	ScrapedAt    time.Time `gorm:"autoCreateTime" json:"scraped_at"`
}

// BeforeCreate is a GORM hook that auto-generates a UUID if not set.
// The correct signature is (tx *gorm.DB) error — without it, GORM
// silently ignores the hook entirely.
func (l *ScrapeLog) BeforeCreate(tx *gorm.DB) error {
	if l.ID == uuid.Nil {
		l.ID = uuid.New()
	}
	return nil
}
