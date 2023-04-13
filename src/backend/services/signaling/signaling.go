package signalingService

import (
	"log"
	"time"

	sio "github.com/njones/socketio"
	eio "github.com/njones/socketio/engineio"
	eiot "github.com/njones/socketio/engineio/transport"
)

type signalingService struct {
	Server *sio.ServerV4
}

func New() signalingService {
	return signalingService{startServer()}
}

func startServer() *sio.ServerV4 {
	server := sio.NewServer(
		eio.WithPingInterval(300*1*time.Millisecond),
		eio.WithPingTimeout(200*1*time.Millisecond),
		eio.WithMaxPayload(1000000),
		eio.WithTransportOption(eiot.WithGovernor(1500*time.Microsecond, 500*time.Microsecond)),
	)

	// use a OnConnect handler for incoming "connection" messages
	server.OnConnect(func(socket *sio.SocketV4) error {
		log.Printf("Socket connected!")
		return nil
	})

	server.OnDisconnect(func(reason string) {
		log.Printf("Socket disconnected: %s", reason)
	})

	return server
}
