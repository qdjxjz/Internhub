package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"internhub/apply-service/internal/service"
)

const HeaderUserID = "X-User-Id"

func getUserID(c *gin.Context) (uint, bool) {
	s := c.GetHeader(HeaderUserID)
	if s == "" {
		return 0, false
	}
	id, err := strconv.ParseUint(s, 10, 32)
	if err != nil {
		return 0, false
	}
	return uint(id), true
}

func Create(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "missing user context"})
		return
	}
	var req struct {
		JobID uint `json:"job_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	app, err := service.CreateApplication(userID, req.JobID)
	if err != nil {
		if err.Error() == "already applied" {
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, app)
}

func ListMine(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "missing user context"})
		return
	}
	status := c.Query("status") // 可选：pending, viewed, rejected, accepted
	list, err := service.ListMyApplications(userID, status)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"list": list})
}
