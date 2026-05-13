package database

import (
	"fmt"
	"log"

	"github.com/clubconnect/clubconnect/internal/config"
	"github.com/clubconnect/clubconnect/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// Connect sets up postgres and runs migrations
func Connect(cfg *config.Config) (*gorm.DB, error) {
	// setup gorm logger
	var logLevel logger.LogLevel
	switch cfg.GinMode {
	case "release":
		logLevel = logger.Warn
	case "test":
		logLevel = logger.Silent
	default:
		logLevel = logger.Info
	}

	db, err := gorm.Open(postgres.Open(cfg.DSN()), &gorm.Config{
		Logger: logger.Default.LogMode(logLevel),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Enable uuid-ossp extension for gen_random_uuid()
	db.Exec("CREATE EXTENSION IF NOT EXISTS \"pgcrypto\"")

	log.Println("connected to db")

	// migrations
	if err := runMigrations(db); err != nil {
		return nil, fmt.Errorf("failed to run migrations: %w", err)
	}

	return db, nil
}

// runMigrations syncs schema
func runMigrations(db *gorm.DB) error {
	log.Println("migrating db...")

	err := db.AutoMigrate(
		&models.Club{},
		&models.Event{},
		&models.ScrapeLog{},
	)
	if err != nil {
		return fmt.Errorf("auto-migration failed: %w", err)
	}

	log.Println("migrations done")
	return nil
}
