package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Club struct {
	ID         uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name       string         `gorm:"type:varchar(255);not null" json:"name"`
	Handle     string         `gorm:"type:varchar(100);uniqueIndex;not null" json:"handle"`
	Bio        string         `gorm:"type:text" json:"bio"`
	AvatarURL  string         `gorm:"type:text" json:"avatar_url"`
	IsVerified bool           `gorm:"default:false" json:"is_verified"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`

	Events     []Event     `gorm:"foreignKey:ClubID" json:"events,omitempty"`
	ScrapeLogs []ScrapeLog `gorm:"foreignKey:ClubID" json:"-"`
}

func (c *Club) BeforeCreate(tx *gorm.DB) error {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	return nil
}
