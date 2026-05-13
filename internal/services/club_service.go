package services

import (
	"github.com/clubconnect/clubconnect/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ClubService handles clubs
type ClubService struct {
	DB *gorm.DB
}

// NewClubService init
func NewClubService(db *gorm.DB) *ClubService {
	return &ClubService{DB: db}
}

// GetAll clubs
func (s *ClubService) GetAll() ([]models.Club, error) {
	var clubs []models.Club
	result := s.DB.Order("name ASC").Find(&clubs)
	return clubs, result.Error
}

// GetByID gets club
func (s *ClubService) GetByID(id uuid.UUID) (*models.Club, error) {
	var club models.Club
	result := s.DB.Preload("Events").First(&club, "id = ?", id)
	if result.Error != nil {
		return nil, result.Error
	}
	return &club, nil
}

// GetByHandle gets club
func (s *ClubService) GetByHandle(handle string) (*models.Club, error) {
	var club models.Club
	result := s.DB.First(&club, "handle = ?", handle)
	if result.Error != nil {
		return nil, result.Error
	}
	return &club, nil
}

// Create club
func (s *ClubService) Create(club *models.Club) error {
	return s.DB.Create(club).Error
}

// SeedDefaults seeds clubs
func (s *ClubService) SeedDefaults() error {
	defaults := []models.Club{
		{Name: "Tech Development Society", Handle: "tds_nsut"},
		{Name: "E-Cell NSUT", Handle: "ecell_nsut"},
		{Name: "IEEE NSUT", Handle: "ieee_nsut"},
		{Name: "Rotaract Club NSUT", Handle: "rotaract_nsut"},
		{Name: "GDSC NSUT", Handle: "gdsc_nsut"},
		{Name: "CodeChef NSUT", Handle: "codechef_nsut"},
		{Name: "Enactus NSUT", Handle: "enactus_nsut"},
		{Name: "NSS NSUT", Handle: "nss_nsut"},
		{Name: "Sports Society NSUT", Handle: "sports_nsut"},
		{Name: "Literati NSUT", Handle: "literati_nsut"},
	}

	for _, club := range defaults {
		// Only insert if handle doesn't already exist
		var count int64
		s.DB.Model(&models.Club{}).Where("handle = ?", club.Handle).Count(&count)
		if count == 0 {
			if err := s.DB.Create(&club).Error; err != nil {
				return err
			}
		}
	}

	return nil
}
