package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/clubconnect/clubconnect/internal/models"
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

// EventResponse is the JSON shape returned for each event in the API.
type EventResponse struct {
	ID           uuid.UUID  `json:"id"`
	ClubID       uuid.UUID  `json:"club_id"`
	Title        string     `json:"title"`
	Description  string     `json:"description"`
	Date         *time.Time `json:"date"`
	Location     string     `json:"location"`
	ImageURL     string     `json:"image_url"`
	InstagramURL string     `json:"instagram_url"`
	PostID       string     `json:"post_id"`
	IsFeatured   bool       `json:"is_featured"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`

	ClubName   string `json:"club_name"`
	ClubHandle string `json:"club_handle"`
	ClubAvatar string `json:"club_avatar"`
}

func eventToResponse(e models.Event) EventResponse {
	return EventResponse{
		ID:           e.ID,
		ClubID:       e.ClubID,
		Title:        e.Title,
		Description:  e.Description,
		Date:         e.Date,
		Location:     e.Location,
		ImageURL:     e.ImageURL,
		InstagramURL: e.InstagramURL,
		PostID:       e.PostID,
		IsFeatured:   e.IsFeatured,
		CreatedAt:    e.CreatedAt,
		UpdatedAt:    e.UpdatedAt,
		ClubName:     e.Club.Name,
		ClubHandle:   e.Club.Handle,
		ClubAvatar:   e.Club.AvatarURL,
	}
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

	// Use Model-based queries so GORM handles soft-delete and scanning properly.
	query := h.db.Model(&models.Event{}).Order("date ASC")

	if cid := c.Query("club_id"); cid != "" {
		if _, err := uuid.Parse(cid); err == nil {
			query = query.Where("club_id = ?", cid)
		}
	}

	if c.Query("featured") == "true" {
		query = query.Where("is_featured = ?", true)
	}

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

	// Default: show upcoming events only (unless an explicit date range is given).
	if c.Query("from") == "" && c.Query("to") == "" {
		query = query.Where("date >= ? OR date IS NULL", time.Now())
	}

	// Count total matching rows (on a separate query instance).
	var total int64
	query.Count(&total)

	// Fetch the events with their associated Club preloaded.
	var events []models.Event
	if err := query.Preload("Club").Offset(offset).Limit(limit).Find(&events).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "db error"})
		return
	}

	// Build a flat response with club fields at the top level.
	results := make([]EventResponse, 0, len(events))
	for _, e := range events {
		results = append(results, eventToResponse(e))
	}

	c.JSON(http.StatusOK, gin.H{
		"events": results,
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

	var event models.Event
	err := h.db.Preload("Club").First(&event, "id = ?", id).Error
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}

	c.JSON(http.StatusOK, eventToResponse(event))
}
