package router

import (
	"github.com/clubconnect/clubconnect/internal/handlers"
	"github.com/clubconnect/clubconnect/internal/middleware"
	"github.com/clubconnect/clubconnect/internal/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Setup(db *gorm.DB, discovery *services.DiscoveryService) *gin.Engine {
	r := gin.New()

	r.Use(gin.Recovery())
	r.Use(middleware.Logger())
	r.Use(middleware.CORS())

	limiter := middleware.NewRateLimiter(10, 20)
	r.Use(limiter.Middleware())

	evH := handlers.NewEventHandler(db)
	clH := handlers.NewClubHandler(db)
	adH := handlers.NewAdminHandler(db, discovery)

	api := r.Group("/api")
	{
		api.GET("/health", handlers.HealthCheck())
		api.GET("/events", evH.ListEvents)
		api.GET("/events/:id", evH.GetEvent)
		api.GET("/clubs", clH.ListClubs)
		api.GET("/clubs/:id", clH.GetClub)
	}

	admin := r.Group("/api/admin")
	{
		admin.POST("/clubs", adH.AddClub)
		admin.POST("/scrape", adH.TriggerScrape)
	}

	return r
}
