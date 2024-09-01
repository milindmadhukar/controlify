package models

import ddp "github.com/milindmadhukar/ddp-go"

type Controller struct {
	DDPConnection *ddp.DDPConnection
	LEDMap        *MatrixMap
	isActive      bool
}
