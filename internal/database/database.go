package database

import (
	"log"

	"github.com/clubconnect/clubconnect/internal/config"
	"github.com/clubconnect/clubconnect/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func Connect(cfg *config.Config) (*gorm.DB, error) {
	var db *gorm.DB
	var err error

	// Use SQLite if DBHost is localhost or empty (default fallback for HF Spaces)
	if cfg.DBHost == "localhost" || cfg.DBHost == "" {
		db, err = gorm.Open(sqlite.Open("data.db"), &gorm.Config{})
		log.Println("Using SQLite database (data.db)")
	} else {
		db, err = gorm.Open(postgres.Open(cfg.DSN()), &gorm.Config{})
		log.Printf("Using Postgres db connected: %s@%s:%d", cfg.DBName, cfg.DBHost, cfg.DBPort)
	}

	if err != nil {
		return nil, err
	}

	// migration
	err = db.AutoMigrate(
		&models.Club{},
		&models.Event{},
		&models.ScrapeLog{},
		&models.Form{},
		&models.FormField{},
		&models.FormResponse{},
		&models.FormResponseAnswer{},
	)
	if err != nil {
		return nil, err
	}

	return db, nil
}
