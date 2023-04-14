package signalingService

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{} // use default options

type signalingService struct {
	upgrader websocket.Upgrader
}

func New() signalingService {
	return signalingService{websocket.Upgrader{}}
}

func HandleSocket(s *signalingService) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Printf("Error upgrading websocket connection: %s\n", err)
			return
		}

		defer conn.Close()

		err = conn.WriteMessage(websocket.TextMessage, []byte("Hello client, this is server."))
		if err != nil {
			log.Printf("Error writing to websocket: %s\n", err)
			return
		}

		for {
			_, message, err := conn.ReadMessage()
			if err != nil {
				log.Printf("Error reading websocket: %s\n", err)
				return
			}
			log.Printf("Received message from websocket: %s", message)
		}
	})
}
