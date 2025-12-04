// Enhanced Ably Signaling - Production-ready with reconnection and presence sync
// Singleton pattern with advanced features

import Ably from 'ably'
import { EventEmitter } from 'events'

export interface SignalingEvents {
  'user-joined': (data: { userId: string; username: string; role?: string }) => void
  'user-left': (data: { userId: string }) => void
  'user-updated': (data: { userId: string; username: string; data: any }) => void
  'offer': (data: { from: string; offer: RTCSessionDescriptionInit }) => void
  'answer': (data: { from: string; answer: RTCSessionDescriptionInit }) => void
  'ice-candidate': (data: { from: string; candidate: RTCIceCandidateInit }) => void
  'renegotiation-offer': (data: { from: string; offer: RTCSessionDescriptionInit }) => void
  'message:new': (data: Message) => void
  'typing': (data: { userId: string; username: string; isTyping: boolean }) => void
  'emoji': (data: { userId: string; username: string; emoji: string }) => void
  'role-changed': (data: { userId: string; role: string }) => void
  'mute-toggled': (data: { userId: string; audioMuted: boolean; videoMuted: boolean }) => void
  'hand-raised': (data: { userId: string; username: string; raised: boolean }) => void
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

export interface PresenceData {
  username: string
  role?: string
  audioMuted?: boolean
  videoMuted?: boolean
  handRaised?: boolean
  joinedAt?: number
}

class EnhancedAblySignaling extends EventEmitter {
  private client: Ably.Realtime | null = null
  private channel: Ably.RealtimeChannel | null = null
  private roomId: string | null = null
  private clientId: string
  private username: string = ''
  private presenceData: PresenceData = { username: '' }

  // Early message buffering
  private earlyMessages: any[] = []
  private eventHandlers: Map<string, Function[]> = new Map()

  // Reconnection handling
  private reconnectAttempts = 0
  private maxReconnectAttempts = 10
  private reconnectTimeout: NodeJS.Timeout | null = null

  // Presence sync
  private presenceMembers: Map<string, PresenceData> = new Map()

  // Debug mode
  private debugMode = false

  constructor() {
    super()
    this.clientId = `user_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`
    console.log('🎯 Enhanced Ably Signaling initialized:', this.clientId)
  }

  // Enable debug logging
  enableDebug(enabled = true): void {
    this.debugMode = enabled
    console.log(`🐛 Debug mode: ${enabled ? 'ON' : 'OFF'}`)
  }

  // Debug log
  private debug(message: string, ...args: any[]): void {
    if (this.debugMode) {
      console.log(`[DEBUG] ${message}`, ...args)
    }
  }

  // Connect to Ably with token auth
  connect(): void {
    if (typeof window === 'undefined') {
      console.warn('⚠️ Ably client should only run on client')
      return
    }

    if (this.client) {
      console.log('✅ Already connected to Ably')
      return
    }

    console.log('🚀 Connecting to Ably with token auth...')

    try {
      this.client = new Ably.Realtime({
        authUrl: '/api/ably/token',
        authMethod: 'GET',
        clientId: this.clientId,
        disconnectedRetryTimeout: 5000,
        suspendedRetryTimeout: 10000,
        closeOnUnload: true,
        autoConnect: true,
      })

      this.setupConnectionHandlers()
    } catch (error) {
      console.error('❌ Failed to create Ably client:', error)
      this.scheduleReconnect()
    }
  }

  // Setup connection event handlers
  private setupConnectionHandlers(): void {
    if (!this.client) return

    this.client.connection.on('connected', () => {
      console.log('✅ Ably connected:', this.clientId)
      this.reconnectAttempts = 0
      this.emit('connected')
    })

    this.client.connection.on('disconnected', () => {
      console.log('❌ Disconnected from Ably')
      this.emit('disconnected')
      this.scheduleReconnect()
    })

    this.client.connection.on('suspended', () => {
      console.warn('⏸️ Ably connection suspended')
      this.emit('suspended')
      this.scheduleReconnect()
    })

    this.client.connection.on('failed', (error) => {
      console.error('❌ Ably connection failed:', error)
      this.emit('failed', error)
      this.scheduleReconnect()
    })

    this.client.connection.on('closed', () => {
      console.log('🔒 Ably connection closed')
      this.emit('closed')
    })

    this.client.connection.on('update', () => {
      this.debug('Connection update:', this.client!.connection.state)
    })
  }

  // Schedule reconnection attempt
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnect attempts reached')
      this.emit('reconnect-failed')
      return
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
    this.reconnectAttempts++

    console.log(`⏳ Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

    this.reconnectTimeout = setTimeout(() => {
      if (!this.client || this.client.connection.state === 'failed') {
        console.log('🔄 Attempting reconnection...')
        this.client?.connect()
      }
    }, delay)
  }

  // Join room with presence
  joinRoom(roomId: string, username: string, presenceData?: Partial<PresenceData>): void {
    if (!this.client) {
      console.warn('⚠️ Not connected, connecting now...')
      this.connect()
    }

    this.roomId = roomId
    this.username = username
    this.presenceData = {
      username,
      role: 'viewer',
      audioMuted: false,
      videoMuted: false,
      handRaised: false,
      joinedAt: Date.now(),
      ...presenceData,
    }

    this.channel = this.client!.channels.get(`room:${roomId}`)

    console.log(`🚪 Joining room ${roomId} as ${username}`)

    // Subscribe to ALL messages IMMEDIATELY (before presence)
    this.channel.subscribe((msg: any) => this.routeEvent(msg))

    // Enter presence
    this.channel.presence.enter(this.presenceData, (err) => {
      if (err) {
        console.error('❌ Failed to enter presence:', err)
      } else {
        console.log('✅ Entered presence')
      }
    })

    // Setup presence event handlers
    this.setupPresenceHandlers()

    // Get existing members
    this.syncPresence()
  }

  // Setup presence event handlers
  private setupPresenceHandlers(): void {
    if (!this.channel) return

    // User joined
    this.channel.presence.subscribe('enter', (msg: Ably.PresenceMessage) => {
      if (msg.clientId === this.clientId) return

      const data = msg.data as PresenceData
      this.presenceMembers.set(msg.clientId!, data)

      console.log(`👋 User joined: ${data.username} (${msg.clientId})`)
      this.emit('user-joined', {
        userId: msg.clientId!,
        username: data.username,
        role: data.role,
      })
    })

    // User left
    this.channel.presence.subscribe('leave', (msg: Ably.PresenceMessage) => {
      this.presenceMembers.delete(msg.clientId!)

      console.log(`👋 User left: ${msg.clientId}`)
      this.emit('user-left', { userId: msg.clientId! })
    })

    // User updated
    this.channel.presence.subscribe('update', (msg: Ably.PresenceMessage) => {
      if (msg.clientId === this.clientId) return

      const data = msg.data as PresenceData
      this.presenceMembers.set(msg.clientId!, data)

      console.log(`🔄 User updated: ${data.username}`)
      this.emit('user-updated', {
        userId: msg.clientId!,
        username: data.username,
        data,
      })
    })
  }

  // Sync presence with existing members
  private syncPresence(): void {
    if (!this.channel) return

    this.channel.presence.get((err, members) => {
      if (err) {
        console.error('❌ Failed to get presence:', err)
        return
      }

      console.log(`📋 Syncing ${members?.length || 0} existing members`)

      members?.forEach((member) => {
        if (member.clientId === this.clientId) return

        const data = member.data as PresenceData
        this.presenceMembers.set(member.clientId!, data)

        this.emit('user-joined', {
          userId: member.clientId!,
          username: data.username,
          role: data.role,
        })
      })
    })
  }

  // Update presence data
  updatePresence(data: Partial<PresenceData>): void {
    if (!this.channel) return

    this.presenceData = { ...this.presenceData, ...data }

    this.channel.presence.update(this.presenceData, (err) => {
      if (err) {
        console.error('❌ Failed to update presence:', err)
      } else {
        this.debug('Updated presence:', this.presenceData)
      }
    })
  }

  // Route events to handlers (with buffering)
  private routeEvent(msg: any): void {
    const event = msg.name
    const data = msg.data

    if (!event) return

    this.debug(`📨 Received event: ${event}`, data)

    // Ignore only messages we sent
    if (data?.from && data.from === this.clientId) {
      this.debug('⏭️ Ignoring own message')
      return
    }

    // Buffer early events until handler exists
    if (!this.eventHandlers.has(event)) {
      this.debug(`📦 Buffering early event: ${event}`)
      this.earlyMessages.push({ event, data })
      return
    }

    this.emit(event as any, data)
  }

  // Replay buffered messages for specific event
  private replayEarlyMessages(event: string): void {
    const leftovers: any[] = []

    this.earlyMessages.forEach((msg) => {
      if (msg.event === event) {
        this.debug(`🔄 Replaying buffered event: ${event}`)
        this.emit(event as any, msg.data)
      } else {
        leftovers.push(msg)
      }
    })

    this.earlyMessages = leftovers
    this.debug(`📦 ${leftovers.length} buffered messages remaining`)
  }

  // Register event handler (with replay)
  on<K extends keyof SignalingEvents>(event: K, handler: SignalingEvents[K]): this {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, [])
      this.replayEarlyMessages(event)
    }

    this.eventHandlers.get(event)!.push(handler as any)
    super.on(event, handler as any)
    return this
  }

  // Publish message to channel
  private publish(event: string, data: any): void {
    if (!this.channel) {
      console.error('❌ Not in a room')
      return
    }

    this.channel.publish(event, data, (err) => {
      if (err) {
        console.error(`❌ Failed to publish ${event}:`, err)
      } else {
        this.debug(`📤 Published ${event}`)
      }
    })
  }

  // Signaling methods
  sendOffer(targetUserId: string, offer: RTCSessionDescriptionInit): void {
    this.publish('offer', { from: this.clientId, to: targetUserId, offer })
  }

  sendAnswer(targetUserId: string, answer: RTCSessionDescriptionInit): void {
    this.publish('answer', { from: this.clientId, to: targetUserId, answer })
  }

  sendIceCandidate(targetUserId: string, candidate: RTCIceCandidateInit): void {
    this.publish('ice-candidate', { from: this.clientId, to: targetUserId, candidate })
  }

  sendRenegotiationOffer(targetUserId: string, offer: RTCSessionDescriptionInit): void {
    this.publish('renegotiation-offer', { from: this.clientId, to: targetUserId, offer })
  }

  // Chat methods
  sendMessage(roomId: string, text: string, username: string, timestamp: number): void {
    const message: Message = {
      id: `${this.clientId}-${timestamp}`,
      roomId,
      from: this.clientId,
      username,
      text,
      timestamp,
      read: false,
    }

    this.publish('message:new', message)
  }

  sendTyping(roomId: string, username: string, isTyping: boolean): void {
    this.publish('typing', {
      userId: this.clientId,
      username,
      isTyping,
    })
  }

  sendEmoji(roomId: string, username: string, emoji: string): void {
    this.publish('emoji', {
      userId: this.clientId,
      username,
      emoji,
    })
  }

  // Room control methods
  setRole(role: string): void {
    this.updatePresence({ role })
    this.publish('role-changed', { userId: this.clientId, role })
  }

  toggleMute(audioMuted: boolean, videoMuted: boolean): void {
    this.updatePresence({ audioMuted, videoMuted })
    this.publish('mute-toggled', { userId: this.clientId, audioMuted, videoMuted })
  }

  raiseHand(raised: boolean): void {
    this.updatePresence({ handRaised: raised })
    this.publish('hand-raised', { userId: this.clientId, username: this.username, raised })
  }

  // Get presence members
  getPresenceMembers(): Map<string, PresenceData> {
    return new Map(this.presenceMembers)
  }

  // Leave room
  leaveRoom(): void {
    if (!this.channel) return

    console.log('👋 Leaving room...')

    this.channel.presence.leave((err) => {
      if (err) {
        console.error('❌ Failed to leave presence:', err)
      }
    })

    this.channel.unsubscribe()
    this.channel = null
    this.roomId = null
    this.presenceMembers.clear()
    this.earlyMessages = []
  }

  // Disconnect completely
  disconnect(): void {
    this.leaveRoom()

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    if (this.client) {
      this.client.close()
      this.client = null
    }

    this.removeAllListeners()
    console.log('🔌 Disconnected from Ably')
  }

  // Get client ID
  getClientId(): string {
    return this.clientId
  }

  // Get connection state
  getConnectionState(): string {
    return this.client?.connection.state || 'disconnected'
  }

  // Check if connected
  isConnected(): boolean {
    return this.client?.connection.state === 'connected'
  }
}

// Export singleton instance
export const ablySignaling = new EnhancedAblySignaling()
