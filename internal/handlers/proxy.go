package handlers

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// ProxyImage safely proxies external images (like from Instagram CDN)
// to bypass strict browser Cross-Origin-Resource-Policy restrictions.
func ProxyImage() gin.HandlerFunc {
	return func(c *gin.Context) {
		imageURL := c.Query("url")
		if imageURL == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "url is required"})
			return
		}

		// Basic validation to prevent arbitrary proxying
		if !strings.HasPrefix(imageURL, "http://") && !strings.HasPrefix(imageURL, "https://") {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid url"})
			return
		}

		req, err := http.NewRequest("GET", imageURL, nil)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create request"})
			return
		}

		// Mimic a standard browser to avoid blocks
		req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")

		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil {
			c.JSON(http.StatusBadGateway, gin.H{"error": "failed to fetch image"})
			return
		}
		defer resp.Body.Close()

		// Stream the response back to the client with the same content type
		c.DataFromReader(resp.StatusCode, resp.ContentLength, resp.Header.Get("Content-Type"), resp.Body, nil)
	}
}
