package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"internhub/user-service/config"
	"internhub/user-service/internal/handler"
	"internhub/user-service/internal/model"
)

func main() {
	config.InitDB()

	if err := config.DB.AutoMigrate(&model.User{}); err != nil {
		log.Fatalf("AutoMigrate fail: %v", err)
	}

	r := gin.Default()
	api := r.Group("/api/v1")
	{
		api.POST("/users/register", handler.Register)
	}

	r.Run(":8081")
}
