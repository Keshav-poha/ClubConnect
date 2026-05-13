package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Event for a campus event
type Event struct {
	ID           uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ClubID       uuid.UUID      `gorm:"type:uuid;not null;index" json:"club_id"`
	Title        string         `gorm:"type:varchar(500);not null" json:"title"`
	Description  string         `gorm:"type:text" json:"description"`
	Date         *time.Time     `gorm:"type:timestamptz" json:"date"`
	Location     string         `gorm:"type:varchar(500)" json:"location"`
	ImageURL     string         `gorm:"type:text" json:"image_url"`
	InstagramURL string         `gorm:"type:text" json:"instagram_url"`
	PostID       string         `gorm:"type:varchar(100);uniqueIndex;not null" json:"post_id"`
	IsFeatured   bool           `gorm:"default:false" json:"is_featured"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Club Club `gorm:"foreignKey:ClubID" json:"club,omitempty"`
}

// BeforeCreate generates a UUID
func (e *Event) BeforeCreate(tx *gorm.DB) error {
	if e.ID == uuid.Nil {
		e.ID = uuid.New()
	}
	return nil
}
