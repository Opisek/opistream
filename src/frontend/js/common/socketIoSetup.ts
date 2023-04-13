import { Socket } from "socket.io-client";

// We import socket.io via <script> and not
// through a node module, therefore we must
// ignore inexistent io() in the following line.
// @ts-ignore
const socket: Socket = io();
socket.on("connect", () => {
    console.log("socket io connected");
});