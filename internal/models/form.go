package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Form struct {
	ID          uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ClubID      uuid.UUID      `gorm:"type:uuid;not null;index" json:"club_id"`
	Title       string         `gorm:"type:varchar(255);not null" json:"title"`
	Description string         `gorm:"type:text" json:"description"`
	Deadline    *time.Time     `json:"deadline"`
	Status      string         `gorm:"type:varchar(50);default:'open'" json:"status"` // "open", "closed"
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`

	Fields    []FormField    `gorm:"foreignKey:FormID;constraint:OnDelete:CASCADE;" json:"fields"`
	Responses []FormResponse `gorm:"foreignKey:FormID;constraint:OnDelete:CASCADE;" json:"-"` // Omit in public responses
}

func (f *Form) BeforeCreate(tx *gorm.DB) error {
	if f.ID == uuid.Nil {
		f.ID = uuid.New()
	}
	return nil
}

type FormField struct {
	ID       uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	FormID   uuid.UUID `gorm:"type:uuid;not null;index" json:"form_id"`
	Type     string    `gorm:"type:varchar(50);not null" json:"type"` // "text", "dropdown", "checkbox", "file"
	Label    string    `gorm:"type:varchar(255);not null" json:"label"`
	Required bool      `gorm:"default:false" json:"required"`
	Options  string    `gorm:"type:text" json:"options,omitempty"` // JSON array of options if dropdown
}

func (f *FormField) BeforeCreate(tx *gorm.DB) error {
	if f.ID == uuid.Nil {
		f.ID = uuid.New()
	}
	return nil
}

type FormResponse struct {
	ID          uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	FormID      uuid.UUID      `gorm:"type:uuid;not null;index" json:"form_id"`
	StudentID   string         `gorm:"type:varchar(100);not null" json:"student_id"`
	StudentName string         `gorm:"type:varchar(255);not null" json:"student_name"`
	Score       *int           `gorm:"default:null" json:"score"`
	SubmittedAt time.Time      `json:"submitted_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`

	Answers []FormResponseAnswer `gorm:"foreignKey:FormResponseID;constraint:OnDelete:CASCADE;" json:"answers"`
}

func (f *FormResponse) BeforeCreate(tx *gorm.DB) error {
	if f.ID == uuid.Nil {
		f.ID = uuid.New()
	}
	f.SubmittedAt = time.Now()
	return nil
}

type FormResponseAnswer struct {
	ID             uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	FormResponseID uuid.UUID `gorm:"type:uuid;not null;index" json:"form_response_id"`
	FieldID        uuid.UUID `gorm:"type:uuid;not null;index" json:"field_id"`
	Value          string    `gorm:"type:text" json:"value"` // Stored as text (or json array if multiple selections)
}

func (f *FormResponseAnswer) BeforeCreate(tx *gorm.DB) error {
	if f.ID == uuid.Nil {
		f.ID = uuid.New()
	}
	return nil
}
