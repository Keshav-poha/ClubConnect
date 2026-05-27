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
		{Name: "The Debugging Society", Handle: "thedebuggingsocietynsut"},
		{Name: "IEEE NSUT", Handle: "ieee_nsut"},
		{Name: "Junoon", Handle: "junoon.nsut"},
		{Name: "Ares Robotics", Handle: "aresrobotics.nsut"},
	}

	handles := []string{"thedebuggingsocietynsut", "ieee_nsut", "junoon.nsut", "aresrobotics.nsut"}
	s.db.Unscoped().Where("handle NOT IN ?", handles).Delete(&models.Club{})

	for _, d := range defaults {
		var existing models.Club
		if err := s.db.First(&existing, "handle = ?", d.Handle).Error; err != nil {
			s.db.Create(&d)
		} else {
			s.db.Model(&existing).Update("name", d.Name)
		}
	}
	return nil
}
