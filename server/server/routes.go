package server

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/milindmadhukar/controlify/handlers"
)

// Function to handle routes
func (s *Server) HandleRoutes(mainRouter *chi.Mux) {

	controlifyRouter := chi.NewRouter()
	controlifyRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Controlify API!"))
	})

	mainRouter.Get("/ws", handlers.WSConenction())

	mainRouter.Mount("/plusxplay", controlifyRouter)
}

