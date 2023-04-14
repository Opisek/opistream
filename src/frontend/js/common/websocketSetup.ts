const url = window.location;
const socketUrl = `ws${url.protocol.substring(4)}//${url.hostname || "localhost"}:${url.port || "80"}/socket`;

function connectSocket() {
    console.log("Socket connecting.");
    const socket = new WebSocket(socketUrl);
    
    socket.onopen = function() {
        console.log("Socket connection established.");
        socket.send("Hello server, this is client.");
    };
    
    socket.onmessage = function(event) {
        console.log(`Socket received message:\n${JSON.stringify(event.data, null, 2)}`);
    };
    
    socket.onclose = function() {
        console.log("Socket connection closed.");
        setTimeout(connectSocket, 100); // TODO: add max attempts or at least increasing time
    };
    
    socket.onerror = function() {
        console.log("Socket connection failed.");
    };
}

connectSocket();