package handlers

import (
	"net/http"

	"github.com/clubconnect/clubconnect/internal/models"
	"github.com/clubconnect/clubconnect/internal/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AdminHandler struct {
	db        *gorm.DB
	discovery *services.DiscoveryService
}

func NewAdminHandler(db *gorm.DB, discovery *services.DiscoveryService) *AdminHandler {
	return &AdminHandler{db, discovery}
}

type AddClubReq struct {
	Name   string `json:"name" binding:"required"`
	Handle string `json:"handle" binding:"required"`
	Bio    string `json:"bio"`
}

func (h *AdminHandler) AddClub(c *gin.Context) {
	var req AddClubReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "bad request"})
		return
	}

	club := models.Club{
		Name:   req.Name,
		Handle: req.Handle,
		Bio:    req.Bio,
	}

	if err := h.db.Create(&club).Error; err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "handle taken"})
		return
	}

	c.JSON(http.StatusCreated, club)
}

func (h *AdminHandler) TriggerScrape(c *gin.Context) {
	handle := c.Query("handle")
	if handle == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "need handle"})
		return
	}

	// run in background
	go func() {
		h.discovery.ScrapeClub(handle)
	}()

	c.JSON(http.StatusAccepted, gin.H{"status": "started"})
}
