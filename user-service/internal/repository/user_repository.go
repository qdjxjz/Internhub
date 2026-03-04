package repository

import (
	"internhub/user-service/config"
	"internhub/user-service/internal/model"
)

func CreateUser(user *model.User) error {
	return config.DB.Create(user).Error
}

func GetUserByUsername(username string) (*model.User, error) {
	var user model.User
	err := config.DB.Where("username = ?", username).First(&user).Error
	return &user, err
}

func GetUserByEmail(email string) (*model.User, error) {
	var user model.User
	err := config.DB.Where("email = ?", email).First(&user).Error
	return &user, err
}
