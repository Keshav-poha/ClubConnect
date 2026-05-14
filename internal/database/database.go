package database

import (
	"fmt"
	"log"

	"github.com/clubconnect/clubconnect/internal/config"
	"github.com/clubconnect/clubconnect/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func Connect(cfg *config.Config) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(cfg.DSN()), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	// migration
	err = db.AutoMigrate(
		&models.Club{},
		&models.Event{},
		&models.ScrapeLog{},
	)
	if err != nil {
		return nil, err
	}

	log.Println("db connected")
	return db, nil
}
