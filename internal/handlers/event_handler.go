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

// applyEventFilters builds the WHERE conditions from query params.
// Returns a func that can be applied to any fresh query, so Count and Find
// each get their own unmodified query instance.
func (h *EventHandler) applyEventFilters(c *gin.Context) func(*gorm.DB) *gorm.DB {
	return func(q *gorm.DB) *gorm.DB {
		if cid := c.Query("club_id"); cid != "" {
			if _, err := uuid.Parse(cid); err == nil {
				q = q.Where("club_id = ?", cid)
			}
		}

		if c.Query("featured") == "true" {
			q = q.Where("is_featured = ?", true)
		}

		if from := c.Query("from"); from != "" {
			if t, err := time.Parse("2006-01-02", from); err == nil {
				q = q.Where("date >= ?", t)
			}
		}

		if to := c.Query("to"); to != "" {
			if t, err := time.Parse("2006-01-02", to); err == nil {
				q = q.Where("date <= ?", t)
			}
		}

		// Only apply the "upcoming only" filter when explicitly requested via
		// ?upcoming=true. By default, show ALL events (newest first) so the
		// frontend can decide how to display them. Previously this defaulted
		// to filtering out past events, which hid all existing DB records.
		if c.Query("upcoming") == "true" {
			q = q.Where("date >= ? OR date IS NULL", time.Now())
		}

		return q
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

	filters := h.applyEventFilters(c)

	// Count and Find MUST use separate query instances. In GORM, Count()
	// mutates the SELECT clause in place (replaces it with COUNT(*)).
	// If you call Count then Find on the same query object, Find gets
	// a corrupted SELECT and returns zero rows.
	var total int64
	h.db.Model(&models.Event{}).Scopes(filters).Count(&total)

	var events []models.Event
	err := h.db.Model(&models.Event{}).
		Scopes(filters).
		Preload("Club").
		Order("date DESC").
		Offset(offset).
		Limit(limit).
		Find(&events).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "db error"})
		return
	}

	// Build flat response; guarantee JSON [] not null for empty results.
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
