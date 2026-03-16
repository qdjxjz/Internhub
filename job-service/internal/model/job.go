package model

import "time"

type Job struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Title     string    `gorm:"size:256;not null" json:"title"`
	Company   string    `gorm:"size:256;not null" json:"company"`
	Link      string    `gorm:"size:512" json:"link"`
	CreatedAt time.Time `json:"created_at"`
}
