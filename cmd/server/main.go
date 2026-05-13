package main

import (
	"log"
	"os"

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

	// seed defaults
	clubService := services.NewClubService(db)
	if err := clubService.SeedDefaults(); err != nil {
		log.Printf("failed to seed defaults: %v", err)
	} else {
		log.Println("default clubs seeded")
	}

	// Setup router
	r := router.Setup(db)

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
