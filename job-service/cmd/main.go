package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"internhub/job-service/config"
	"internhub/job-service/internal/handler"
	"internhub/job-service/internal/model"
)

func main() {
	config.InitDB()

	if err := config.DB.AutoMigrate(&model.Job{}); err != nil {
		log.Fatalf("AutoMigrate fail: %v", err)
	}

	r := gin.Default()
	api := r.Group("/api/v1")
	{
		api.GET("/jobs", handler.List)
		api.GET("/jobs/:id", handler.GetByID)
		api.POST("/jobs", handler.Create)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8083"
	}
	r.Run(":" + port)
}
