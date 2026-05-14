package models

import (
	"time"

	"github.com/google/uuid"
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

func (l *ScrapeLog) BeforeCreate() {
	if l.ID == uuid.Nil {
		l.ID = uuid.New()
	}
}
