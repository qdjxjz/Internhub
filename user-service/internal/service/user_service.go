package service

import (
	"errors"

	"golang.org/x/crypto/bcrypt"
	"internhub/user-service/internal/model"
	"internhub/user-service/internal/repository"
)

func Register(username, email, password string) error {
	// 检查 username/email 是否已存在
	if u, _ := repository.GetUserByUsername(username); u != nil && u.ID != 0 {
		return errors.New("username already exists")
	}
	if u, _ := repository.GetUserByEmail(email); u != nil && u.ID != 0 {
		return errors.New("email already exists")
	}

	// 加密密码
	hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	user := model.User{
		Username: username,
		Email:    email,
		Password: string(hashed),
	}

	return repository.CreateUser(&user)
}
