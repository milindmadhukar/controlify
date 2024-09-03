package main

import (
	"github.com/milindmadhukar/controlify/server"
	"github.com/rs/zerolog/log"
)

func main() {
	log.Info().Msg("Starting...")
	s := server.New()
	s.RunServer()

}
