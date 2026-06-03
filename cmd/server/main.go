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

	parser := services.NewParserService(cfg)
	discovery := services.NewDiscoveryService(db, parser, cfg, cfg.ScrapeWorkers)
	clubSvc := services.NewClubService(db)

	clubSvc.SeedDefaults()

	// background scraper
	go func() {
		// Small startup delay to let the HTTP server bind first
		time.Sleep(10 * time.Second)
		for {
			lastScraped, err := discovery.GetLastScrapeTime()
			if err == nil && !lastScraped.IsZero() {
				nextScrape := lastScraped.Add(cfg.ScrapeInterval)
				if time.Now().Before(nextScrape) {
					sleepDuration := time.Until(nextScrape)
					log.Printf("Last scrape was at %v. Next scrape scheduled in %v", lastScraped, sleepDuration)
					time.Sleep(sleepDuration)
					continue
				}
			}
			discovery.RunDiscoveryCycle()
			time.Sleep(cfg.ScrapeInterval)
		}
	}()
	r := router.Setup(db, discovery, cfg)

	port := cfg.Port
	if port == "" {
		port = "8080"
	}

	log.Println("starting on :" + port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal(err)
	}
}
