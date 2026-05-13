package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// EventHandler for events
type EventHandler struct {
	DB *gorm.DB
}

// NewEventHandler init
func NewEventHandler(db *gorm.DB) *EventHandler {
	return &EventHandler{DB: db}
}

// ListEvents handler
func (h *EventHandler) ListEvents(c *gin.Context) {
	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}
	offset := (page - 1) * limit

	query := h.DB.Preload("Club").Order("date ASC")

	// Filter: club_id
	if clubID := c.Query("club_id"); clubID != "" {
		if _, err := uuid.Parse(clubID); err == nil {
			query = query.Where("club_id = ?", clubID)
		}
	}

	// Filter: featured only
	if featured := c.Query("featured"); featured == "true" {
		query = query.Where("is_featured = ?", true)
	}

	// Filter: date range
	if from := c.Query("from"); from != "" {
		if t, err := time.Parse("2006-01-02", from); err == nil {
			query = query.Where("date >= ?", t)
		}
	}
	if to := c.Query("to"); to != "" {
		if t, err := time.Parse("2006-01-02", to); err == nil {
			query = query.Where("date <= ?", t)
		}
	}

	// Default: only future events
	if c.Query("from") == "" && c.Query("to") == "" {
		query = query.Where("date >= ? OR date IS NULL", time.Now())
	}

	// Count total matching records
	var total int64
	query.Model(&struct{}{}).Count(&total)

	// Fetch page
	var events []map[string]interface{}
	result := query.Table("events").
		Select("events.*, clubs.name as club_name, clubs.handle as club_handle, clubs.avatar_url as club_avatar").
		Joins("LEFT JOIN clubs ON clubs.id = events.club_id").
		Where("events.deleted_at IS NULL").
		Offset(offset).Limit(limit).
		Find(&events)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch events"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"events": events,
		"pagination": gin.H{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}

// GetEvent handler
func (h *EventHandler) GetEvent(c *gin.Context) {
	id := c.Param("id")
	if _, err := uuid.Parse(id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid event ID"})
		return
	}

	var event map[string]interface{}
	result := h.DB.Table("events").
		Select("events.*, clubs.name as club_name, clubs.handle as club_handle, clubs.avatar_url as club_avatar").
		Joins("LEFT JOIN clubs ON clubs.id = events.club_id").
		Where("events.id = ? AND events.deleted_at IS NULL", id).
		First(&event)

	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "event not found"})
		return
	}

	c.JSON(http.StatusOK, event)
}
