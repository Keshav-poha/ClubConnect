package config

import (
	"fmt"
	"os"
	"strconv"
	"time"
)

// Config for the app
type Config struct {
	// Database
	DBHost     string
	DBPort     int
	DBUser     string
	DBPassword string
	DBName     string
	DBSSLMode  string

	// Server
	Port    string
	GinMode string



	// External Scraper (RapidAPI)
	RapidAPIKey  string
	RapidAPIHost string

	// Scraper
	ScrapeInterval time.Duration
	ScrapeWorkers  int
}

// Load env vars with defaults
func Load() (*Config, error) {
	dbPort, err := strconv.Atoi(getEnv("DB_PORT", "5432"))
	if err != nil {
		return nil, fmt.Errorf("invalid DB_PORT: %w", err)
	}

	scrapeInterval, err := time.ParseDuration(getEnv("SCRAPE_INTERVAL", "8h"))
	if err != nil {
		return nil, fmt.Errorf("invalid SCRAPE_INTERVAL: %w", err)
	}

	scrapeWorkers, err := strconv.Atoi(getEnv("SCRAPE_WORKERS", "1"))
	if err != nil {
		return nil, fmt.Errorf("invalid SCRAPE_WORKERS: %w", err)
	}

	cfg := &Config{
		DBHost:         getEnv("DB_HOST", "localhost"),
		DBPort:         dbPort,
		DBUser:         getEnv("DB_USER", "clubconnect"),
		DBPassword:     getEnv("DB_PASSWORD", ""),
		DBName:         getEnv("DB_NAME", "clubconnect"),
		DBSSLMode:      getEnv("DB_SSLMODE", "disable"),
		Port:           getEnv("PORT", "7860"),
		GinMode:        getEnv("GIN_MODE", "debug"),

		RapidAPIKey:    getEnv("RAPIDAPI_KEY", ""),
		RapidAPIHost:   getEnv("RAPIDAPI_HOST", ""),
		ScrapeInterval: scrapeInterval,
		ScrapeWorkers:  scrapeWorkers,
	}

	return cfg, nil
}

// DSN builder for postgres
func (c *Config) DSN() string {
	return fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=%s TimeZone=Asia/Kolkata",
		c.DBHost, c.DBPort, c.DBUser, c.DBPassword, c.DBName, c.DBSSLMode,
	)
}

// getEnv with fallback
func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
