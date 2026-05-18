package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type EventHandler struct {
	db *gorm.DB
}

func NewEventHandler(db *gorm.DB) *EventHandler {
	return &EventHandler{db}
}

func (h *EventHandler) ListEvents(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}
	offset := (page - 1) * limit

	// Build the base query with joins and filters.
	query := h.db.Table("events").
		Select("events.*, clubs.name as club_name, clubs.handle as club_handle, clubs.avatar_url as club_avatar").
		Joins("LEFT JOIN clubs ON clubs.id = events.club_id").
		Where("events.deleted_at IS NULL").
		Order("events.date ASC")

	if cid := c.Query("club_id"); cid != "" {
		if _, err := uuid.Parse(cid); err == nil {
			query = query.Where("events.club_id = ?", cid)
		}
	}

	if c.Query("featured") == "true" {
		query = query.Where("events.is_featured = ?", true)
	}

	if from := c.Query("from"); from != "" {
		if t, err := time.Parse("2006-01-02", from); err == nil {
			query = query.Where("events.date >= ?", t)
		}
	}

	if to := c.Query("to"); to != "" {
		if t, err := time.Parse("2006-01-02", to); err == nil {
			query = query.Where("events.date <= ?", t)
		}
	}

	// Default: only upcoming events (unless explicit date range given).
	if c.Query("from") == "" && c.Query("to") == "" {
		query = query.Where("events.date >= ? OR events.date IS NULL", time.Now())
	}

	// Clone the query before Count to avoid GORM mutating the SELECT clause.
	// Without this, Count() strips the SELECT and subsequent Find() returns
	// rows with missing columns or errors out silently.
	var total int64
	countQuery := query.Session(&gorm.Session{})
	countQuery.Count(&total)

	var events []map[string]interface{}
	if err := query.Offset(offset).Limit(limit).Find(&events).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "db error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"events": events,
		"page":   page,
		"limit":  limit,
		"total":  total,
	})
}

func (h *EventHandler) GetEvent(c *gin.Context) {
	id := c.Param("id")
	if _, err := uuid.Parse(id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "bad id"})
		return
	}

	var event map[string]interface{}
	err := h.db.Table("events").
		Select("events.*, clubs.name as club_name, clubs.handle as club_handle, clubs.avatar_url as club_avatar").
		Joins("LEFT JOIN clubs ON clubs.id = events.club_id").
		Where("events.id = ? AND events.deleted_at IS NULL", id).
		First(&event).Error

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}

	c.JSON(http.StatusOK, event)
}
