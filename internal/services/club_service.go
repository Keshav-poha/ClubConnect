package services

import (
	"github.com/clubconnect/clubconnect/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ClubService struct {
	db *gorm.DB
}

func NewClubService(db *gorm.DB) *ClubService {
	return &ClubService{db}
}

func (s *ClubService) GetAll() ([]models.Club, error) {
	var clubs []models.Club
	err := s.db.Order("name ASC").Find(&clubs).Error
	return clubs, err
}

func (s *ClubService) GetByID(id uuid.UUID) (*models.Club, error) {
	var club models.Club
	if err := s.db.Preload("Events").First(&club, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &club, nil
}

func (s *ClubService) GetByHandle(handle string) (*models.Club, error) {
	var club models.Club
	if err := s.db.First(&club, "handle = ?", handle).Error; err != nil {
		return nil, err
	}
	return &club, nil
}

func (s *ClubService) Create(club *models.Club) error {
	return s.db.Create(club).Error
}

func (s *ClubService) SeedDefaults() error {
	defaults := []models.Club{
		{Name: "Tech Development Society", Handle: "thedebuggingsocietynsut"},
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
		var count int64
		s.db.Model(&models.Club{}).Where("handle = ?", club.Handle).Count(&count)
		if count == 0 {
			s.db.Create(&club)
		}
	}

	return nil
}
