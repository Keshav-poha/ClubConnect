package handlers

import (
	"net/http"

	"github.com/clubconnect/clubconnect/internal/models"
	"github.com/clubconnect/clubconnect/internal/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// AdminHandler for admin endpoints
type AdminHandler struct {
	DB        *gorm.DB
	Discovery *services.DiscoveryService
}

// NewAdminHandler init
func NewAdminHandler(db *gorm.DB, discovery *services.DiscoveryService) *AdminHandler {
	return &AdminHandler{
		DB:        db,
		Discovery: discovery,
	}
}

// AddClubRequest json body
type AddClubRequest struct {
	Name   string `json:"name" binding:"required"`
	Handle string `json:"handle" binding:"required"`
	Bio    string `json:"bio"`
}

// AddClub handler
func (h *AdminHandler) AddClub(c *gin.Context) {
	var req AddClubRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	club := models.Club{
		Name:   req.Name,
		Handle: req.Handle,
		Bio:    req.Bio,
	}

	if result := h.DB.Create(&club); result.Error != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "club with this handle may already exist"})
		return
	}

	c.JSON(http.StatusCreated, club)
}

// TriggerScrape handler
func (h *AdminHandler) TriggerScrape(c *gin.Context) {
	handle := c.Query("handle")
	if handle == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "handle required"})
		return
	}

	if err := h.Discovery.ScrapeClub(handle); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to trigger scrape"})
		return
	}

	c.JSON(http.StatusAccepted, gin.H{
		"message": "scrape job triggered for " + handle,
	})
}
