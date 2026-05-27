package router

import (
	"os"

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

	// Serve the React Native Web SPA
	r.NoRoute(func(c *gin.Context) {
		path := c.Request.URL.Path
		if len(path) >= 4 && path[:4] == "/api" {
			c.JSON(404, gin.H{"error": "api route not found"})
			return
		}

		filePath := "./public" + path
		if _, err := os.Stat(filePath); err == nil && path != "/" {
			c.File(filePath)
			return
		}
		c.File("./public/index.html")
	})

	return r
}
