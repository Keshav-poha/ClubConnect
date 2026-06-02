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
		api.GET("/proxy", handlers.ProxyImage())
		api.GET("/events", evH.ListEvents)
		api.GET("/events/:id", evH.GetEvent)
		api.GET("/clubs", clH.ListClubs)
		api.GET("/clubs/:id", clH.GetClub)
	}

	admin := r.Group("/api/admin")
	admin.Use(func(c *gin.Context) {
		apiKey := c.GetHeader("X-Admin-Key")
		expectedKey := os.Getenv("ADMIN_API_KEY")
		if expectedKey == "" || apiKey != expectedKey {
			c.AbortWithStatusJSON(401, gin.H{"error": "unauthorized"})
			return
		}
		c.Next()
	})
	{
		admin.POST("/clubs", adH.AddClub)
		admin.POST("/scrape", adH.TriggerScrape)
	}

	// Serve the React Native Web SPA securely using http.FileSystem
	r.NoRoute(func(c *gin.Context) {
		path := c.Request.URL.Path
		if len(path) >= 4 && path[:4] == "/api" {
			c.JSON(404, gin.H{"error": "api route not found"})
			return
		}

		fi, err := os.Stat("./public" + path)
		if err == nil && !fi.IsDir() && path != "/" {
			c.File("./public" + path)
			return
		}
		c.File("./public/index.html")
	})

	return r
}
