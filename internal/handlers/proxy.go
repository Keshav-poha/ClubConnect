package handlers

import (
	"net/http"
	"net/url"
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
		parsed, err := url.Parse(imageURL)
		if err != nil || (!strings.HasPrefix(imageURL, "http://") && !strings.HasPrefix(imageURL, "https://")) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid url"})
			return
		}

		allowedDomains := []string{"instagram.com", "scontent.cdninstagram.com", "googleusercontent.com"}
		isAllowed := false
		for _, domain := range allowedDomains {
			if strings.HasSuffix(parsed.Host, domain) {
				isAllowed = true
				break
			}
		}

		if !isAllowed {
			c.JSON(http.StatusForbidden, gin.H{"error": "domain not allowed for proxy"})
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
