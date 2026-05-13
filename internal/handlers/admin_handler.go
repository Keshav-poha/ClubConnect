package handlers

import (
	"net/http"

	"github.com/clubconnect/clubconnect/internal/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// AdminHandler for admin endpoints
type AdminHandler struct {
	DB *gorm.DB
}

// NewAdminHandler init
func NewAdminHandler(db *gorm.DB) *AdminHandler {
	return &AdminHandler{DB: db}
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
	// TODO: Wire up to DiscoveryService in Phase 1 completion
	c.JSON(http.StatusAccepted, gin.H{
		"message": "scrape job queued",
		"status":  "not_implemented",
	})
}
