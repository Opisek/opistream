package main

import (
	"log"
	"net/http"
	"os"

	signalingService "github.com/Opisek/opistream/services/signaling"
	webpageService "github.com/Opisek/opistream/services/webpage"
)

func interceptHandler(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("socket.io called")
		h.ServeHTTP(w, r)
	})
}

func main() {
	// webpage
	webpageServiceInstance := webpageService.New()
	http.Handle("/css/", webpageService.HandleCss(&webpageServiceInstance))
	http.Handle("/js/", webpageService.HandleJs(&webpageServiceInstance))
	http.Handle("/img/", webpageService.HandleImg(&webpageServiceInstance))
	http.Handle("/", webpageService.HandleHtml(&webpageServiceInstance))

	// signaling
	signalingServiceInstance := signalingService.New()
	http.Handle("/socket.io/", interceptHandler(signalingServiceInstance.Server))

	// start the server
	log.Printf("Listening on port %s\n", os.Getenv("PORT"))
	http.ListenAndServe(":"+os.Getenv("PORT"), nil)
}
