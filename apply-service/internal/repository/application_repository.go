package repository

import (
	"internhub/apply-service/config"
	"internhub/apply-service/internal/model"
)

func Create(app *model.Application) error {
	return config.DB.Create(app).Error
}

func ListByUserID(userID uint, status string) ([]model.Application, error) {
	var list []model.Application
	q := config.DB.Where("user_id = ?", userID).Order("created_at DESC")
	if status != "" {
		q = q.Where("status = ?", status)
	}
	err := q.Find(&list).Error
	return list, err
}

func Exists(userID, jobID uint) (bool, error) {
	var n int64
	err := config.DB.Model(&model.Application{}).Where("user_id = ? AND job_id = ?", userID, jobID).Count(&n).Error
	return n > 0, err
}
