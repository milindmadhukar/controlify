package models

import ddp "github.com/milindmadhukar/ddp-go"

type Controller struct {
	DDPConnection *ddp.DDPConnection `json:"-"`
	LEDMap        *MatrixMap         `json:"ledMap"`
	LedCount      int                `json:"ledCount"`
	IsActive      bool               `json:"isActive"`
}
