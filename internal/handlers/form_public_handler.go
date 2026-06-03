package handlers

import (
	"net/http"

	"github.com/clubconnect/clubconnect/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type FormPublicHandler struct {
	db *gorm.DB
}

func NewFormPublicHandler(db *gorm.DB) *FormPublicHandler {
	return &FormPublicHandler{db: db}
}

func (h *FormPublicHandler) GetClubForms(c *gin.Context) {
	clubID := c.Param("id")
	var forms []models.Form

	// Get active forms with their fields
	if err := h.db.Preload("Fields").Where("club_id = ? AND status = ?", clubID, "open").Find(&forms).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch forms"})
		return
	}

	c.JSON(http.StatusOK, forms)
}

func (h *FormPublicHandler) SubmitForm(c *gin.Context) {
	formID := c.Param("id")

	var response models.FormResponse
	if err := c.ShouldBindJSON(&response); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid response data"})
		return
	}

	// Make sure form exists and is open
	var form models.Form
	if err := h.db.Where("id = ? AND status = ?", formID, "open").First(&form).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Form not found or closed"})
		return
	}

	parsedFormID, err := uuid.Parse(formID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid form ID"})
		return
	}
	response.FormID = parsedFormID

	if err := h.db.Create(&response).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to submit response"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Response submitted successfully"})
}
