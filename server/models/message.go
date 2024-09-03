package models

import "image"

type ServerMessage struct {
	PixelInfo    []PixelInfo   `json:"pixelInfo"`
	CurrentFrame image.Image `json:"currentFrame,omitempty"`
}

type PixelInfo struct {
	MapName     string   `json:"mapName"`
	LEDCount    int      `json:"ledCount"`
	PixelColour []string `json:"pixelData"`
}
