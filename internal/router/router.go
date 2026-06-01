package router

import (
	"net/http"
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
	fs := http.Dir("./public")
	r.NoRoute(func(c *gin.Context) {
		path := c.Request.URL.Path
		if len(path) >= 4 && path[:4] == "/api" {
			c.JSON(404, gin.H{"error": "api route not found"})
			return
		}

		f, err := fs.Open(path)
		if err == nil && path != "/" {
			f.Close()
			c.FileFromFS(path, fs)
			return
		}
		c.FileFromFS("/index.html", fs)
	})

	return r
}
