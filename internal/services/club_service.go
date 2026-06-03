package services

import (
	"log"
	"strings"

	"github.com/clubconnect/clubconnect/internal/models"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
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
	defaultPassword := "password123"
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(defaultPassword), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("Failed to hash default password: %v", err)
	}
	hashStr := string(hashedPassword)

	defaults := []models.Club{
		{Name: "The Debugging Society", Handle: "thedebuggingsocietynsut", AvatarURL: "https://ui-avatars.com/api/?name=Debugging+Society&background=0D8ABC&color=fff&size=200", AdminUsername: "debug", AdminPasswordHash: hashStr},
		{Name: "IEEE NSUT", Handle: "ieee_nsut", AvatarURL: "https://ui-avatars.com/api/?name=IEEE+NSUT&background=0D8ABC&color=fff&size=200", AdminUsername: "ieee", AdminPasswordHash: hashStr},
		{Name: "Junoon", Handle: "junoon.nsut", AvatarURL: "https://ui-avatars.com/api/?name=Junoon&background=0D8ABC&color=fff&size=200", AdminUsername: "junoon", AdminPasswordHash: hashStr},
		{Name: "Ares Robotics", Handle: "aresrobotics.nsut", AvatarURL: "https://ui-avatars.com/api/?name=Ares+Robotics&background=0D8ABC&color=fff&size=200", AdminUsername: "ares", AdminPasswordHash: hashStr},
	}

	handles := []string{"thedebuggingsocietynsut", "ieee_nsut", "junoon.nsut", "aresrobotics.nsut"}
	s.db.Unscoped().Where("handle NOT IN ?", handles).Delete(&models.Club{})

	for _, d := range defaults {
		var existing models.Club
		if err := s.db.First(&existing, "handle = ?", d.Handle).Error; err != nil {
			s.db.Create(&d)
		} else {
			updates := map[string]interface{}{
				"name": d.Name,
			}
			if existing.AvatarURL == "" || strings.Contains(existing.AvatarURL, "unavatar.io") {
				updates["avatar_url"] = d.AvatarURL
			}
			if existing.AdminUsername == "" {
				updates["admin_username"] = d.AdminUsername
				updates["admin_password_hash"] = d.AdminPasswordHash
			}
			s.db.Model(&existing).Updates(updates)
		}
	}
	return nil
}
