package handlers

import (
	"net/http"

	"github.com/clubconnect/clubconnect/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ClubHandler for clubs
type ClubHandler struct {
	DB *gorm.DB
}

// NewClubHandler init
func NewClubHandler(db *gorm.DB) *ClubHandler {
	return &ClubHandler{DB: db}
}

// ListClubs handler
func (h *ClubHandler) ListClubs(c *gin.Context) {
	var clubs []models.Club
	result := h.DB.Order("name ASC").Find(&clubs)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch clubs"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"clubs": clubs, "total": len(clubs)})
}

// GetClub handler
func (h *ClubHandler) GetClub(c *gin.Context) {
	id := c.Param("id")
	if _, err := uuid.Parse(id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid club ID"})
		return
	}
	var club models.Club
	result := h.DB.Preload("Events", func(db *gorm.DB) *gorm.DB {
		return db.Order("date ASC")
	}).First(&club, "id = ?", id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "club not found"})
		return
	}
	c.JSON(http.StatusOK, club)
}
