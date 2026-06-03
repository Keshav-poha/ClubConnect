package main

import (
	"context"
	"log"
	"net/http"
	"os/signal"
	"syscall"
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

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	// background scraper
	go func() {
		// Small startup delay to let the HTTP server bind first
		select {
		case <-time.After(10 * time.Second):
		case <-ctx.Done():
			return
		}

		for {
			lastScraped, err := discovery.GetLastScrapeTime()
			if err == nil && !lastScraped.IsZero() {
				nextScrape := lastScraped.Add(cfg.ScrapeInterval)
				if time.Now().Before(nextScrape) {
					sleepDuration := time.Until(nextScrape)
					log.Printf("Last scrape was at %v. Next scrape scheduled in %v", lastScraped, sleepDuration)
					select {
					case <-time.After(sleepDuration):
					case <-ctx.Done():
						return
					}
					continue
				}
			}
			discovery.RunDiscoveryCycle()
			select {
			case <-time.After(cfg.ScrapeInterval):
			case <-ctx.Done():
				log.Println("Scraper goroutine shutting down")
				return
			}
		}
	}()
	r := router.Setup(db, discovery, cfg)

	port := cfg.Port
	if port == "" {
		port = "8080"
	}

	srv := &http.Server{
		Addr:    ":" + port,
		Handler: r,
	}

	go func() {
		log.Println("starting on :" + port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %s\n", err)
		}
	}()

	<-ctx.Done()
	stop()
	log.Println("shutting down gracefully...")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Fatal("Server forced to shutdown: ", err)
	}
	log.Println("Server exiting")
}
