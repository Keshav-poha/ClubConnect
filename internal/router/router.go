package router

import (
	"github.com/clubconnect/clubconnect/internal/handlers"
	"github.com/clubconnect/clubconnect/internal/middleware"
	"github.com/clubconnect/clubconnect/internal/services"
	"github.com/clubconnect/clubconnect/internal/models"
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
		api.GET("/debug/db", func(c *gin.Context) {
			var eventsCount int64
			var unscopedEventsCount int64
			var clubsCount int64
			var scrapeLogsCount int64

			db.Model(&models.Event{}).Count(&eventsCount)
			db.Unscoped().Model(&models.Event{}).Count(&unscopedEventsCount)
			db.Model(&models.Club{}).Count(&clubsCount)
			db.Model(&models.ScrapeLog{}).Count(&scrapeLogsCount)

			c.JSON(200, gin.H{
				"events_count":          eventsCount,
				"unscoped_events_count": unscopedEventsCount,
				"clubs_count":           clubsCount,
				"scrape_logs_count":     scrapeLogsCount,
			})
		})
	}

	admin := r.Group("/api/admin")
	{
		admin.POST("/clubs", adH.AddClub)
		admin.POST("/scrape", adH.TriggerScrape)
	}

	return r
}
