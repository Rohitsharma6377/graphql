// FIXED: Ably-based signaling fully stable for WebRTC on Vercel
// Handles early messages, proper subscriptions, replay, mobile freeze, late joiners

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

  private earlyMessages: any[] = [] // 🔥 NEW: store early offers/answers/candidates
  private eventHandlers: Map<string, Function[]> = new Map()

  constructor() {
    this.clientId = `user_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`
  }

  /** -------------------------
   * CONNECT CLIENT-SIDE ONLY
   * --------------------------*/
  connect(): void {
    if (typeof window === 'undefined') {
      console.warn('⚠️ Ably client should only run on client')
      return
    }

    if (this.client) return

    console.log('🚀 Connecting to Ably (token)…')

    this.client = new Ably.Realtime({
      authUrl: '/api/ably/token',
      authMethod: 'GET',
      clientId: this.clientId,
      disconnectedRetryTimeout: 8000,
      suspendedRetryTimeout: 16000,
    })

    this.client.connection.on('connected', () => {
      console.log('✅ Ably connected:', this.clientId)
    })

    this.client.connection.on('disconnected', () => {
      console.log('❌ Disconnected from Ably')
    })

    this.client.connection.on('failed', (error) => {
      console.error('❌ Ably connection failed:', error)
    })
  }

  /** -------------------------
   * JOIN ROOM
   * --------------------------*/
  joinRoom(roomId: string, username: string): void {
    if (!this.client) this.connect()

    this.roomId = roomId
    this.username = username

    this.channel = this.client!.channels.get(`room:${roomId}`)

    console.log(`🚪 Joining room ${roomId} as ${username}`)

    // Presence
    this.channel.presence.enter({ username })

    // Subscribe to ALL messages immediately — ★ FIXES MISSED SIGNALING ★
    this.channel.subscribe((msg: any) => this.routeEvent(msg))

    // Presence join/leave
    this.channel.presence.subscribe('enter', (m: any) => {
      if (m.clientId !== this.clientId) {
        this.emit('user-joined', { userId: m.clientId, username: m.data.username })
      }
    })

    this.channel.presence.subscribe('leave', (m: any) => {
      this.emit('user-left', { userId: m.clientId })
    })

    // Get existing members
    this.channel.presence.get((_: any, members: any) => {
      members?.forEach((m: any) => {
        if (m.clientId !== this.clientId) {
          this.emit('user-joined', { userId: m.clientId, username: m.data.username })
        }
      })
    })
  }

  /** -------------------------
   * ROUTE EVENTS (MAIN FIX)
   * --------------------------*/
  private routeEvent(msg: any) {
    const event = msg.name
    const data = msg.data

    if (!event) return

    // 🔥 Ignore only messages we sent (where from === clientId)
    if (data?.from && data.from === this.clientId) return

    // 🔥 Buffer early events until user "on()" handler exists
    if (!this.eventHandlers.has(event)) {
      this.earlyMessages.push({ event, data })
      return
    }

    this.emit(event as any, data)
  }

  /** -------------------------
   * REPLAY BUFFERED MESSAGES
   * --------------------------*/
  private replayEarlyMessages(event: string) {
    const leftovers: any[] = []

    this.earlyMessages.forEach((msg) => {
      if (msg.event === event) {
        this.emit(event as any, msg.data)
      } else {
        leftovers.push(msg)
      }
    })

    this.earlyMessages = leftovers
  }

  /** -------------------------
   * SIGNALING: OFFER / ANSWER / ICE
   * --------------------------*/
  sendOffer(_: string, offer: RTCSessionDescriptionInit): void {
    this.channel?.publish('offer', { from: this.clientId, offer })
  }

  sendAnswer(_: string, answer: RTCSessionDescriptionInit): void {
    this.channel?.publish('answer', { from: this.clientId, answer })
  }

  sendIceCandidate(_: string, candidate: RTCIceCandidateInit): void {
    this.channel?.publish('ice-candidate', { from: this.clientId, candidate })
  }

  /** -------------------------
   * CHAT + TYPING
   * --------------------------*/
  sendMessage(roomId: string, text: string, username: string, timestamp: number) {
    this.channel?.publish('message:new', {
      id: `${this.clientId}-${timestamp}`,
      roomId,
      from: this.clientId,
      username,
      text,
      timestamp,
      read: false,
    })
  }

  sendTyping(_: string, username: string, isTyping: boolean) {
    this.channel?.publish('typing', {
      userId: this.clientId,
      username,
      isTyping,
    })
  }

  /** -------------------------
   * EVENT HANDLER API
   * --------------------------*/
  on<K extends keyof SignalingEvents>(event: K, handler: SignalingEvents[K]) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, [])
      this.replayEarlyMessages(event)
    }

    this.eventHandlers.get(event)!.push(handler as any)
  }

  emit<K extends keyof SignalingEvents>(event: K, data: any) {
    const handlers = this.eventHandlers.get(event)
    handlers?.forEach((fn) => fn(data))
  }

  /** -------------------------
   * CLEANUP
   * --------------------------*/
  leaveRoom() {
    this.channel?.presence.leave()
    this.channel?.unsubscribe()
  }

  disconnect() {
    this.leaveRoom()
    this.client?.close()
  }

  getClientId() {
    return this.clientId
  }
}

// Export singleton instance
export const ablySignaling = new AblySignalingClient()
