package main

import (
	"log"
	"net/http"
	"os"

	"github.com/Opisek/opistream/services/signaling"
	"github.com/Opisek/opistream/services/website"
)

func main() {
	// authentication
	//authenticationService := authentication.New()

	// website
	websiteService := website.New()
	http.Handle("/css/", website.HandleCss(&websiteService))
	http.Handle("/js/", website.HandleJs(&websiteService))
	http.Handle("/img/", website.HandleImg(&websiteService))
	http.Handle("/", website.HandleHtml(&websiteService))

	// signaling
	signalingService := signaling.New()
	http.Handle("/socket", signaling.HandleSocket(&signalingService))

	// start the server
	log.Printf("Listening on port %s\n", os.Getenv("PORT"))
	http.ListenAndServe(":"+os.Getenv("PORT"), nil)
}
