package main

import (
	"log"
	"os"
	"time"

	"github.com/clubconnect/clubconnect/internal/config"
	"github.com/clubconnect/clubconnect/internal/database"
	"github.com/clubconnect/clubconnect/internal/router"
	"github.com/clubconnect/clubconnect/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// load .env
	if err := godotenv.Load(); err != nil {
		log.Println("no .env file found, falling back to system env")
	}

	// load config
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	// Set Gin mode
	gin.SetMode(cfg.GinMode)

	// connect db
	db, err := database.Connect(cfg)
	if err != nil {
		log.Fatalf("failed to connect to db: %v", err)
	}

	// init services
	parser := services.NewParserService(cfg.ParserAPIKey, cfg.ParserURL)
	discovery := services.NewDiscoveryService(db, parser, cfg.ScrapeWorkers)
	clubService := services.NewClubService(db)

	// seed defaults
	if err := clubService.SeedDefaults(); err != nil {
		log.Printf("failed to seed defaults: %v", err)
	} else {
		log.Println("default clubs seeded")
	}

	// Run discovery cycle periodically
	go func() {
		// Initial wait to let server start
		time.Sleep(5 * time.Second)
		for {
			discovery.RunDiscoveryCycle()
			time.Sleep(cfg.ScrapeInterval)
		}
	}()

	// Setup router
	r := router.Setup(db, discovery)

	// start server
	port := cfg.Port
	if port == "" {
		port = "8080"
	}

	log.Printf("server starting on :%s", port)

	if err := r.Run(":" + port); err != nil {
		log.Fatalf("server died: %v", err)
		os.Exit(1)
	}
}
