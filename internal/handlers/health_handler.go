package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// HealthCheck endpoint
func HealthCheck() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "ok",
			"service": "clubconnect",
			"version": "0.1.0",
		})
	}
}
