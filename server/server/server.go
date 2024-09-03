package server

import (
	"fmt"
	"net/http"

	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"github.com/rs/zerolog/log"
)

type Server struct {
	Router *chi.Mux
	// Add other important server states like connected clients, etc.
}

func New() *Server {
	s := &Server{}
	s.PrepareRouter()

	return s
}

func (s *Server) PrepareRouter() {

	r := chi.NewRouter()

	r.Use(middleware.Heartbeat("/ping"))

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"https://*", "http://*"},
		AllowedMethods:   []string{"GET", "OPTIONS", "POST", "PUT", "PATCH"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token", "token"},
		AllowCredentials: true,
		MaxAge:           300,
	}))
	//Store Router in Struct
	s.Router = r
}

func (s *Server) RunServer() (err error) {

	apiRouter := chi.NewRouter()
	s.HandleRoutes(apiRouter)
	s.Router.Mount("/", apiRouter)
	log.Info().Msg(fmt.Sprintf("Starting Server at %s:%s", "localhost", "8069"))
	fmt.Println("Server is running.")
	err = http.ListenAndServe(fmt.Sprintf("%s:%s", "localhost", "8069"), s.Router)
	if err != nil {
		log.Fatal().Msg(err.Error())
	}

	return
}
