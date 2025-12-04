// Socket.IO client wrapper for signaling

import { io, Socket } from 'socket.io-client'

export interface SignalingEvents {
  'user-joined': (data: { userId: string; username: string }) => void
  'user-left': (data: { userId: string }) => void
  'offer': (data: { from: string; offer: RTCSessionDescriptionInit }) => void
  'answer': (data: { from: string; answer: RTCSessionDescriptionInit }) => void
  'ice-candidate': (data: { from: string; candidate: RTCIceCandidateInit }) => void
  'message:new': (data: Message) => void
  'message:read': (data: { messageId: string; userId: string }) => void
  'typing': (data: { userId: string; username: string; isTyping: boolean }) => void
  'presence:update': (data: { users: RoomUser[] }) => void
}

export interface Message {
  id: string
  roomId: string
  from: string
  username: string
  text: string
  timestamp: number
  read: boolean
}

export interface RoomUser {
  userId: string
  username: string
  joined: number
}

class SignalingClient {
  private socket: Socket | null = null
  private roomId: string | null = null

  connect(): Socket {
    if (!this.socket) {
      // Connect to Socket.IO server on Next.js API route
      this.socket = io({
        path: '/api/socket',
      })

      this.socket.on('connect', () => {
        console.log('Connected to signaling server:', this.socket?.id)
      })

      this.socket.on('disconnect', () => {
        console.log('Disconnected from signaling server')
      })

      this.socket.on('error', (error) => {
        console.error('Socket error:', error)
      })
    }

    return this.socket
  }

  joinRoom(roomId: string, username: string): void {
    if (!this.socket) {
      throw new Error('Socket not connected')
    }

    this.roomId = roomId
    this.socket.emit('join-room', { roomId, username })
    console.log('Joining room:', roomId, 'as', username)
  }

  leaveRoom(): void {
    if (this.socket && this.roomId) {
      this.socket.emit('leave-room', { roomId: this.roomId })
      this.roomId = null
    }
  }

  sendMessage(roomId: string, text: string, username: string): void {
    if (!this.socket) return

    this.socket.emit('message:send', {
      roomId,
      text,
      username,
      timestamp: Date.now(),
    })
  }

  markMessageRead(messageId: string, roomId: string): void {
    if (!this.socket) return

    this.socket.emit('message:mark-read', { messageId, roomId })
  }

  sendTypingIndicator(roomId: string, username: string, isTyping: boolean): void {
    if (!this.socket) return

    this.socket.emit('typing', { roomId, username, isTyping })
  }

  on<K extends keyof SignalingEvents>(event: K, handler: SignalingEvents[K]): void {
    if (!this.socket) return
    this.socket.on(event, handler as any)
  }

  off<K extends keyof SignalingEvents>(event: K, handler?: SignalingEvents[K]): void {
    if (!this.socket) return
    this.socket.off(event, handler as any)
  }

  disconnect(): void {
    if (this.socket) {
      this.leaveRoom()
      this.socket.disconnect()
      this.socket = null
    }
  }

  getSocket(): Socket | null {
    return this.socket
  }
}

export const signalingClient = new SignalingClient()
