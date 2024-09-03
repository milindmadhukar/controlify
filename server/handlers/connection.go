package handlers

import (
	"fmt"
	"image"
	"net/http"

	"github.com/gorilla/websocket"
	"github.com/milindmadhukar/controlify/models"
	"github.com/milindmadhukar/controlify/utils"
	"github.com/rs/zerolog/log"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type ClientMessage struct {
	X      int `json:"x,omitempty"`
	Y      int `json:"y,omitempty"`
	Width  int `json:"width,omitempty"`
	Height int `json:"height,omitempty"`
}

// TODO: This will get the state of the pixels
func WSConenction() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Error().Err(err).Msg("Could not upgrade connection")
			return
		}
		defer conn.Close()

		var clientMessage ClientMessage

		for {
			err := conn.ReadJSON(&clientMessage)
			if err != nil {
				log.Error().Err(err).Msg("Could not read JSON")
			}

			fmt.Printf("Client message: %+v\n", clientMessage)

			// NOTE: Replace with good data

			serverMessage := models.ServerMessage{
				PixelInfo: []models.PixelInfo{
					{
						MapName:     "plusledmap.json",
						LEDCount:    720,
						PixelColour: utils.PixelDataToHex([]byte{100, 0, 0}),
					},
					{
						MapName:     "crossledmap.json",
						LEDCount:    720,
						PixelColour: utils.PixelDataToHex([]byte{0, 100, 0}),
					},
				},
				CurrentFrame: image.NewRGBA(image.Rect(0, 0, 100, 100)),
			}

			err = conn.WriteJSON(serverMessage)
			if err != nil {
				log.Error().Err(err).Msg("Could not write JSON")
			}
		}
	}
}
