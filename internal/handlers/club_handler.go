package handlers

import (
	"github.com/clubconnect/clubconnect/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ClubHandler struct {
	db *gorm.DB
}

func NewClubHandler(db *gorm.DB) *ClubHandler {
	return &ClubHandler{db}
}

func (h *ClubHandler) ListClubs(c *gin.Context) {
	var clubs []models.Club
	if err := h.db.Order("name ASC").Find(&clubs).Error; err != nil {
		c.JSON(500, gin.H{"error": "internal error"})
		return
	}
	c.JSON(200, gin.H{"clubs": clubs, "total": len(clubs)})
}

func (h *ClubHandler) GetClub(c *gin.Context) {
	id := c.Param("id")
	if _, err := uuid.Parse(id); err != nil {
		c.JSON(400, gin.H{"error": "invalid id"})
		return
	}

	var club models.Club
	err := h.db.Preload("Events", func(db *gorm.DB) *gorm.DB {
		return db.Order("date ASC")
	}).First(&club, "id = ?", id).Error

	if err != nil {
		c.JSON(404, gin.H{"error": "not found"})
		return
	}
	c.JSON(200, club)
}
