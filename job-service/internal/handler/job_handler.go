package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"internhub/job-service/config"
	"internhub/job-service/internal/model"
)

func List(c *gin.Context) {
	var jobs []model.Job
	if err := config.DB.Order("created_at DESC").Find(&jobs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"list": jobs})
}

func GetByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	var job model.Job
	if err := config.DB.First(&job, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "job not found"})
		return
	}
	c.JSON(http.StatusOK, job)
}

type CreateRequest struct {
	Title   string `json:"title" binding:"required"`
	Company string `json:"company" binding:"required"`
	Link    string `json:"link"`
}

func Create(c *gin.Context) {
	var req CreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	job := model.Job{
		Title:   req.Title,
		Company: req.Company,
		Link:    req.Link,
	}
	if err := config.DB.Create(&job).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, job)
}
