package middleware

import "github.com/gin-gonic/gin"

func CORS() gin.HandlerFunc {
	allowedOrigins := map[string]bool{
		"http://localhost:8081":                true,
		"https://aquawit-clubconnect.hf.space": true,
	}

	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		if allowedOrigins[origin] {
			c.Header("Access-Control-Allow-Origin", origin)
		}

		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization, X-Admin-Key")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
