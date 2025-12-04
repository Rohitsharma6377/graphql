import { Server as NetServer } from 'http'
import { NextApiRequest } from 'next'
import { Server as SocketIOServer } from 'socket.io'
import { NextApiResponseServerIO } from '@/types/socket'

// In-memory storage for demo (use Redis for production)
const rooms = new Map<string, Map<string, { username: string; socketId: string }>>()
const messages = new Map<string, any[]>()

export const config = {
  api: {
    bodyParser: false,
  },
}

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    console.log('*First use, starting socket.io')

    const httpServer: NetServer = res.socket.server as any
    const io = new SocketIOServer(httpServer, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    })

    res.socket.server.io = io
    // Make io globally available for admin routes
    global.io = io

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id)

      // Join room
      socket.on('join-room', ({ roomId, username }) => {
        socket.join(roomId)

        // Initialize room if it doesn't exist
        if (!rooms.has(roomId)) {
          rooms.set(roomId, new Map())
          messages.set(roomId, [])
        }

        const room = rooms.get(roomId)!
        
        // Get existing users BEFORE adding the new user
        const existingUsers = Array.from(room.entries()).map(([userId, data]) => ({
          userId,
          username: data.username,
        }))

        // Add the new user to the room
        room.set(socket.id, { username, socketId: socket.id })

        console.log(`${username} joined room ${roomId}`)

        // Notify others in the room about the new user
        socket.to(roomId).emit('user-joined', {
          userId: socket.id,
          username,
        })

        // Send existing users to the new user (for presence list)
        const users = Array.from(room.entries()).map(([userId, data]) => ({
          userId,
          username: data.username,
          joined: Date.now(),
        }))

        socket.emit('presence:update', { users })

        // CRITICAL FIX: Notify the new user about each existing user
        // so they can set up WebRTC peer connections
        existingUsers.forEach(({ userId, username: existingUsername }) => {
          socket.emit('user-joined', {
            userId,
            username: existingUsername,
          })
        })

        // Send existing messages
        const roomMessages = messages.get(roomId) || []
        roomMessages.forEach((msg) => {
          socket.emit('message:new', msg)
        })

        // Emit admin room update
        io.emit('admin-room-update', { roomId, action: 'join' })
      })

      // Leave room
      socket.on('leave-room', ({ roomId }) => {
        const room = rooms.get(roomId)
        if (room) {
          const user = room.get(socket.id)
          room.delete(socket.id)

          socket.to(roomId).emit('user-left', {
            userId: socket.id,
          })

          console.log(`${user?.username} left room ${roomId}`)

          // Emit admin room update
          io.emit('admin-room-update', { roomId, action: 'leave' })

          // Clean up empty rooms
          if (room.size === 0) {
            rooms.delete(roomId)
            messages.delete(roomId)
          }
        }

        socket.leave(roomId)
      })

      // WebRTC signaling: Offer
      socket.on('offer', ({ roomId, offer }) => {
        console.log(`📤 Relaying offer from ${socket.id} to room:`, roomId)
        socket.to(roomId).emit('offer', {
          from: socket.id,
          offer,
        })
      })

      // WebRTC signaling: Answer
      socket.on('answer', ({ roomId, answer }) => {
        console.log(`📤 Relaying answer from ${socket.id} to room:`, roomId)
        socket.to(roomId).emit('answer', {
          from: socket.id,
          answer,
        })
      })

      // WebRTC signaling: ICE candidate
      socket.on('ice-candidate', ({ roomId, candidate }) => {
        socket.to(roomId).emit('ice-candidate', {
          from: socket.id,
          candidate,
        })
      })

      // Chat: Send message
      socket.on('message:send', ({ roomId, text, username, timestamp }) => {
        const message = {
          id: `${socket.id}-${timestamp}`,
          roomId,
          from: socket.id,
          username,
          text,
          timestamp,
          read: false,
        }

        // Store message
        const roomMessages = messages.get(roomId) || []
        roomMessages.push(message)
        messages.set(roomId, roomMessages)

        // Broadcast to room
        io.to(roomId).emit('message:new', message)

        console.log(`Message in ${roomId} from ${username}: ${text}`)
      })

      // Chat: Mark message as read
      socket.on('message:mark-read', ({ messageId, roomId }) => {
        const roomMessages = messages.get(roomId) || []
        const message = roomMessages.find((m) => m.id === messageId)

        if (message) {
          message.read = true
          io.to(roomId).emit('message:read', {
            messageId,
            userId: socket.id,
          })
        }
      })

      // Typing indicator
      socket.on('typing', ({ roomId, username, isTyping }) => {
        socket.to(roomId).emit('typing', {
          userId: socket.id,
          username,
          isTyping,
        })
      })

      // Emoji reaction
      socket.on('emoji:send', ({ roomId, emoji, username, timestamp }) => {
        const emojiData = {
          id: `${socket.id}-${timestamp}`,
          emoji,
          from: socket.id,
          username,
        }

        // Broadcast to room (including sender)
        io.to(roomId).emit('emoji:receive', emojiData)

        console.log(`Emoji in ${roomId} from ${username}: ${emoji}`)
      })

      // Disconnect
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)

        // Remove from all rooms
        rooms.forEach((room, roomId) => {
          if (room.has(socket.id)) {
            const user = room.get(socket.id)
            room.delete(socket.id)

            io.to(roomId).emit('user-left', {
              userId: socket.id,
            })

            console.log(`${user?.username} disconnected from room ${roomId}`)

            // Clean up empty rooms
            if (room.size === 0) {
              rooms.delete(roomId)
              messages.delete(roomId)
            }
          }
        })
      })
    })
  }

  res.end()
}

export default ioHandler
