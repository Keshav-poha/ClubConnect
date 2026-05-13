package router

import (
	"github.com/clubconnect/clubconnect/internal/handlers"
	"github.com/clubconnect/clubconnect/internal/middleware"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// Setup router
func Setup(db *gorm.DB) *gin.Engine {
	r := gin.New()

	// Global middleware
	r.Use(gin.Recovery())
	r.Use(middleware.Logger())
	r.Use(middleware.CORS())

	// Rate limiter: 10 requests/second, burst of 20
	limiter := middleware.NewRateLimiter(10, 20)
	r.Use(limiter.Middleware())

	// Initialize handlers
	eventHandler := handlers.NewEventHandler(db)
	clubHandler := handlers.NewClubHandler(db)
	adminHandler := handlers.NewAdminHandler(db)

	// Public API routes
	api := r.Group("/api")
	{
		api.GET("/health", handlers.HealthCheck())

		api.GET("/events", eventHandler.ListEvents)
		api.GET("/events/:id", eventHandler.GetEvent)

		api.GET("/clubs", clubHandler.ListClubs)
		api.GET("/clubs/:id", clubHandler.GetClub)
	}

	// Admin routes
	admin := r.Group("/api/admin")
	{
		admin.POST("/clubs", adminHandler.AddClub)
		admin.POST("/scrape", adminHandler.TriggerScrape)
	}

	return r
}
