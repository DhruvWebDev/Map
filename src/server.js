import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'

const app = express()
app.use(cors())

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
})

io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  socket.on('location update', (location) => {
    // Broadcast the location update to all connected clients
    io.emit('location update', location)
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

const PORT = 3001
httpServer.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`)
})