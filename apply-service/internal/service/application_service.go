package service

import (
	"errors"

	"internhub/apply-service/internal/model"
	"internhub/apply-service/internal/repository"
)

func CreateApplication(userID, jobID uint) (*model.Application, error) {
	exists, err := repository.Exists(userID, jobID)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, errors.New("already applied")
	}
	app := &model.Application{
		UserID: userID,
		JobID:  jobID,
		Status: "pending",
	}
	if err := repository.Create(app); err != nil {
		return nil, err
	}
	return app, nil
}

func ListMyApplications(userID uint, status string) ([]model.Application, error) {
	return repository.ListByUserID(userID, status)
}
