package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"internhub/apply-service/config"
	"internhub/apply-service/internal/handler"
	"internhub/apply-service/internal/model"
)

func main() {
	config.InitDB()

	if err := config.DB.AutoMigrate(&model.Application{}); err != nil {
		log.Fatalf("AutoMigrate fail: %v", err)
	}

	r := gin.Default()
	api := r.Group("/api/v1")
	{
		api.POST("/applications", handler.Create)
		api.GET("/applications/me", handler.ListMine)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8084"
	}
	r.Run(":" + port)
}
