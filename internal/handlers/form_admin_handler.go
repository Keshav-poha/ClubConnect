package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/clubconnect/clubconnect/internal/config"
	"github.com/clubconnect/clubconnect/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type FormAdminHandler struct {
	db  *gorm.DB
	cfg *config.Config
}

func NewFormAdminHandler(db *gorm.DB, cfg *config.Config) *FormAdminHandler {
	return &FormAdminHandler{db: db, cfg: cfg}
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func (h *FormAdminHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	var club models.Club
	if err := h.db.Where("admin_username = ?", req.Username).First(&club).Error; err != nil {
		// Dummy compare to prevent timing attacks
		bcrypt.CompareHashAndPassword([]byte("$2a$10$b/2Lw5ZVroQErWr62bq.B.Dw0O2txAJXqgTDXvayMF16w6f1CzRsa"), []byte(req.Password))
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(club.AdminPasswordHash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Generate JWT
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"club_id": club.ID.String(),
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	})

	tokenString, err := token.SignedString([]byte(h.cfg.JWTSecret))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": tokenString,
		"club":  club,
	})
}

func (h *FormAdminHandler) GetForms(c *gin.Context) {
	clubID := c.GetString("club_id")
	var forms []models.Form

	if err := h.db.Preload("Fields").Where("club_id = ?", clubID).Find(&forms).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch forms"})
		return
	}

	c.JSON(http.StatusOK, forms)
}

func (h *FormAdminHandler) CreateForm(c *gin.Context) {
	clubID := c.GetString("club_id")

	var form models.Form
	if err := c.ShouldBindJSON(&form); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid form data"})
		return
	}

	parsedID, err := uuid.Parse(clubID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid club ID"})
		return
	}
	form.ClubID = parsedID

	if err := h.db.Create(&form).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create form"})
		return
	}

	c.JSON(http.StatusCreated, form)
}

func (h *FormAdminHandler) GetFormResponses(c *gin.Context) {
	clubID := c.GetString("club_id")
	formID := c.Param("id")

	// Ensure the form belongs to this club
	var form models.Form
	if err := h.db.Where("id = ? AND club_id = ?", formID, clubID).First(&form).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Form not found"})
		return
	}

	limitStr := c.DefaultQuery("limit", "50")
	offsetStr := c.DefaultQuery("offset", "0")
	limit, _ := strconv.Atoi(limitStr)
	offset, _ := strconv.Atoi(offsetStr)

	var responses []models.FormResponse
	if err := h.db.Preload("Answers").Where("form_id = ?", formID).Limit(limit).Offset(offset).Find(&responses).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch responses"})
		return
	}

	c.JSON(http.StatusOK, responses)
}
