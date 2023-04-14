package main

import (
	"log"
	"net/http"
	"os"

	signalingService "github.com/Opisek/opistream/services/signaling"
	webpageService "github.com/Opisek/opistream/services/webpage"
)

func main() {
	// webpage
	webpageServiceInstance := webpageService.New()
	http.Handle("/css/", webpageService.HandleCss(&webpageServiceInstance))
	http.Handle("/js/", webpageService.HandleJs(&webpageServiceInstance))
	http.Handle("/img/", webpageService.HandleImg(&webpageServiceInstance))
	http.Handle("/", webpageService.HandleHtml(&webpageServiceInstance))

	// signaling
	signalingServiceInstance := signalingService.New()
	http.Handle("/socket", signalingService.HandleSocket(&signalingServiceInstance))

	// start the server
	log.Printf("Listening on port %s\n", os.Getenv("PORT"))
	http.ListenAndServe(":"+os.Getenv("PORT"), nil)
}
