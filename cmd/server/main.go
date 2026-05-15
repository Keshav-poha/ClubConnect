package main

import (
	"log"
	"time"

	"github.com/clubconnect/clubconnect/internal/config"
	"github.com/clubconnect/clubconnect/internal/database"
	"github.com/clubconnect/clubconnect/internal/router"
	"github.com/clubconnect/clubconnect/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()

	cfg, err := config.Load()
	if err != nil {
		log.Fatal("config error:", err)
	}

	gin.SetMode(cfg.GinMode)

	db, err := database.Connect(cfg)
	if err != nil {
		log.Fatal("db error:", err)
	}

	parser := services.NewParserService(cfg.ParserAPIKey, cfg.ParserURL)
	discovery := services.NewDiscoveryService(db, parser, cfg, cfg.ScrapeWorkers)
	clubSvc := services.NewClubService(db)

	clubSvc.SeedDefaults()

	// background scraper
	go func() {
		time.Sleep(10 * time.Second)
		for {
			discovery.RunDiscoveryCycle()
			time.Sleep(cfg.ScrapeInterval)
		}
	}()

	r := router.Setup(db, discovery)

	port := cfg.Port
	if port == "" {
		port = "8080"
	}

	log.Println("starting on :" + port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal(err)
	}
}
