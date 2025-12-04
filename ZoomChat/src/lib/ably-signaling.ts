// Ably-based signaling for Vercel deployment
// Works with serverless environments (no Socket.IO server needed)

import Ably from 'ably'

export interface SignalingEvents {
  'user-joined': (data: { userId: string; username: string }) => void
  'user-left': (data: { userId: string }) => void
  'offer': (data: { from: string; offer: RTCSessionDescriptionInit }) => void
  'answer': (data: { from: string; answer: RTCSessionDescriptionInit }) => void
  'ice-candidate': (data: { from: string; candidate: RTCIceCandidateInit }) => void
  'message:new': (data: Message) => void
  'typing': (data: { userId: string; username: string; isTyping: boolean }) => void
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

class AblySignalingClient {
  private client: Ably.Realtime | null = null
  private channel: any = null
  private roomId: string | null = null
  private clientId: string
  private username: string = ''

  constructor() {
    // Generate unique client ID
    this.clientId = `user_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`
  }

  connect(): void {
    if (this.client) {
      console.log('⚠️ Already connected to Ably')
      return
    }

    // Initialize Ably client
    // Get API key from environment variable
    const apiKey = process.env.NEXT_PUBLIC_ABLY_KEY

    if (!apiKey) {
      console.error('❌ NEXT_PUBLIC_ABLY_KEY not found in environment variables')
      console.log('👉 Add your Ably API key to .env.local:')
      console.log('   NEXT_PUBLIC_ABLY_KEY=your-api-key-here')
      console.log('👉 Get free API key: https://ably.com/signup')
      throw new Error('Ably API key required')
    }

    this.client = new Ably.Realtime({
      key: apiKey,
      clientId: this.clientId,
    })

    this.client.connection.on('connected', () => {
      console.log('✅ Connected to Ably:', this.clientId)
    })

    this.client.connection.on('disconnected', () => {
      console.log('❌ Disconnected from Ably')
    })

    this.client.connection.on('failed', (error) => {
      console.error('❌ Ably connection failed:', error)
    })
  }

  joinRoom(roomId: string, username: string): void {
    if (!this.client) {
      this.connect()
    }

    this.roomId = roomId
    this.username = username

    // Get or create channel for this room
    this.channel = this.client!.channels.get(`room:${roomId}`)

    console.log(`🚪 Joining room: ${roomId} as ${username}`)

    // Subscribe to presence (who's in the room)
    this.channel.presence.enter({ username })

    this.channel.presence.subscribe('enter', (member: any) => {
      if (member.clientId !== this.clientId) {
        console.log('👋 User joined:', member.data.username)
        this.emit('user-joined', {
          userId: member.clientId,
          username: member.data.username,
        })
      }
    })

    this.channel.presence.subscribe('leave', (member: any) => {
      console.log('👋 User left:', member.data.username)
      this.emit('user-left', {
        userId: member.clientId,
      })
    })

    // Get existing members
    this.channel.presence.get((err: any, members: any) => {
      if (!err && members) {
        members.forEach((member: any) => {
          if (member.clientId !== this.clientId) {
            console.log('👤 Existing user:', member.data.username)
            this.emit('user-joined', {
              userId: member.clientId,
              username: member.data.username,
            })
          }
        })
      }
    })
  }

  leaveRoom(): void {
    if (this.channel) {
      this.channel.presence.leave()
      this.channel.unsubscribe()
      this.channel = null
    }
    this.roomId = null
  }

  // WebRTC Signaling
  sendOffer(roomId: string, offer: RTCSessionDescriptionInit): void {
    if (!this.channel) {
      console.error('❌ Not in a room')
      return
    }

    console.log('📤 Sending offer to room:', roomId)
    this.channel.publish('offer', {
      from: this.clientId,
      offer,
    })
  }

  sendAnswer(roomId: string, answer: RTCSessionDescriptionInit): void {
    if (!this.channel) {
      console.error('❌ Not in a room')
      return
    }

    console.log('📤 Sending answer to room:', roomId)
    this.channel.publish('answer', {
      from: this.clientId,
      answer,
    })
  }

  sendIceCandidate(roomId: string, candidate: RTCIceCandidateInit): void {
    if (!this.channel) return

    this.channel.publish('ice-candidate', {
      from: this.clientId,
      candidate,
    })
  }

  // Chat
  sendMessage(roomId: string, text: string, username: string, timestamp: number): void {
    if (!this.channel) return

    const message = {
      id: `${this.clientId}-${timestamp}`,
      roomId,
      from: this.clientId,
      username,
      text,
      timestamp,
      read: false,
    }

    this.channel.publish('message:new', message)
  }

  sendTyping(roomId: string, username: string, isTyping: boolean): void {
    if (!this.channel) return

    this.channel.publish('typing', {
      userId: this.clientId,
      username,
      isTyping,
    })
  }

  // Event listeners
  private eventHandlers: Map<string, Function[]> = new Map()

  on<K extends keyof SignalingEvents>(
    event: K,
    handler: SignalingEvents[K]
  ): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, [])

      // Subscribe to Ably channel for this event
      if (this.channel && event !== 'user-joined' && event !== 'user-left') {
        this.channel.subscribe(event, (message: any) => {
          // Don't emit own messages back to self
          if (message.data.from !== this.clientId) {
            this.emit(event, message.data)
          }
        })
      }
    }

    this.eventHandlers.get(event)!.push(handler as Function)
  }

  off<K extends keyof SignalingEvents>(
    event: K,
    handler: SignalingEvents[K]
  ): void {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      const index = handlers.indexOf(handler as Function)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  private emit<K extends keyof SignalingEvents>(
    event: K,
    data: Parameters<SignalingEvents[K]>[0]
  ): void {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      handlers.forEach((handler) => handler(data))
    }
  }

  getClientId(): string {
    return this.clientId
  }

  disconnect(): void {
    if (this.channel) {
      this.channel.presence.leave()
      this.channel.unsubscribe()
    }

    if (this.client) {
      this.client.close()
      this.client = null
    }

    this.eventHandlers.clear()
  }
}

// Export singleton instance
export const ablySignaling = new AblySignalingClient()
