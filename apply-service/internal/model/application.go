package model

import "time"

// Application 投递记录：用户-职位-状态
type Application struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"not null;index" json:"user_id"`
	JobID     uint      `gorm:"not null;index" json:"job_id"`
	Status    string    `gorm:"size:32;default:pending" json:"status"` // pending, viewed, rejected, accepted
	CreatedAt time.Time `json:"created_at"`
}
