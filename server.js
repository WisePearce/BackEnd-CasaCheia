import dotenv from 'dotenv'
dotenv.config()
import http from 'http'
import { Server } from "socket.io"
import jwt from "jsonwebtoken"
import app from "./app/app.js";
import connectDB from './app/infra/db.js';

const port = process.env.PORT || 3000

// Socket.io — servidor HTTP + websocket para notificações em tempo real no dashboard admin
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

// Autenticação dos sockets: apenas admins autenticados entram na "admin-room"
io.on("connection", (socket) => {
    const token = socket.handshake.auth?.token
    if (!token) {
        return socket.disconnect(true)
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY)
        if (decoded.role !== "admin") {
            return socket.disconnect(true)
        }
        socket.join("admin-room")
        console.log(`Admin conectado ao socket: ${decoded.id}`)
    } catch {
        socket.disconnect(true)
    }
})

// Disponibilizar io para os controllers via app.set (req.app.get("io"))
app.set("io", io)

connectDB()

server.listen(port, () => {
    console.log(`servidor rodando no enderece : http://localhost:${port}`)
})