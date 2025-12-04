// Participant Manager - Handles 1-to-many group calling logic
// Supports mesh (everyone connects to everyone) and broadcast (host to all) modes

import { EventEmitter } from 'events'
import { WebRTCEngine, ParticipantRole, CallMode } from '../webrtc/engine'
import { ablySignaling } from '../signaling/ablySignaling'

export interface Participant {
  id: string
  username: string
  role: ParticipantRole
  audioMuted: boolean
  videoMuted: boolean
  handRaised: boolean
  joinedAt: number
  stream?: MediaStream
}

export class ParticipantManager extends EventEmitter {
  private participants: Map<string, Participant> = new Map()
  private webrtcEngine: WebRTCEngine
  private mode: CallMode
  private isHost: boolean = false
  private maxParticipants: number
  private localParticipant: Participant | null = null

  constructor(mode: CallMode = 'mesh', maxParticipants = 50) {
    super()
    this.mode = mode
    this.maxParticipants = maxParticipants

    this.webrtcEngine = new WebRTCEngine({
      mode,
      enableDataChannel: true,
    })

    this.setupEngineHandlers()
    this.setupSignalingHandlers()

    console.log(`👥 Participant Manager initialized (mode: ${mode}, max: ${maxParticipants})`)
  }

  // Setup WebRTC engine event handlers
  private setupEngineHandlers(): void {
    this.webrtcEngine.on('remote-track', ({ peerId, stream }) => {
      const participant = this.participants.get(peerId)
      if (participant) {
        participant.stream = stream
        this.participants.set(peerId, participant)
        this.emit('participant-stream-ready', participant)
      }
    })

    this.webrtcEngine.on('peer-connected', ({ peerId }) => {
      console.log(`✅ Peer connected: ${peerId}`)
      this.emit('participant-connected', peerId)
    })

    this.webrtcEngine.on('peer-disconnected', ({ peerId }) => {
      console.log(`❌ Peer disconnected: ${peerId}`)
      this.removeParticipant(peerId)
    })

    this.webrtcEngine.on('ice-candidate', ({ peerId, candidate }) => {
      ablySignaling.sendIceCandidate(peerId, candidate)
    })

    this.webrtcEngine.on('negotiation-needed', async ({ peerId }) => {
      const offer = await this.webrtcEngine.createOffer(peerId)
      ablySignaling.sendOffer(peerId, offer)
    })

    this.webrtcEngine.on('renegotiation-offer', ({ peerId, offer }) => {
      ablySignaling.sendRenegotiationOffer(peerId, offer)
    })
  }

  // Setup signaling event handlers
  private setupSignalingHandlers(): void {
    ablySignaling.on('user-joined', async ({ userId, username, role }) => {
      await this.handleUserJoined(userId, username, role as ParticipantRole)
    })

    ablySignaling.on('user-left', ({ userId }) => {
      this.removeParticipant(userId)
    })

    ablySignaling.on('offer', async ({ from, offer }) => {
      const answer = await this.webrtcEngine.handleOffer(from, offer)
      ablySignaling.sendAnswer(from, answer)
    })

    ablySignaling.on('answer', async ({ from, answer }) => {
      await this.webrtcEngine.handleAnswer(from, answer)
    })

    ablySignaling.on('ice-candidate', async ({ from, candidate }) => {
      await this.webrtcEngine.addIceCandidate(from, candidate)
    })

    ablySignaling.on('renegotiation-offer', async ({ from, offer }) => {
      const answer = await this.webrtcEngine.handleOffer(from, offer)
      ablySignaling.sendAnswer(from, answer)
    })

    ablySignaling.on('role-changed', ({ userId, role }) => {
      this.updateParticipantRole(userId, role as ParticipantRole)
    })

    ablySignaling.on('mute-toggled', ({ userId, audioMuted, videoMuted }) => {
      this.updateParticipantMute(userId, audioMuted, videoMuted)
    })

    ablySignaling.on('hand-raised', ({ userId, username, raised }) => {
      this.updateParticipantHandRaise(userId, raised)
    })
  }

  // Join room as participant
  async joinRoom(
    roomId: string,
    username: string,
    role: ParticipantRole = 'viewer',
    isHost = false
  ): Promise<void> {
    this.isHost = isHost

    // Get local media
    const stream = await this.webrtcEngine.getLocalMedia(false)

    // Set role
    this.webrtcEngine.setRole(role)

    // Create local participant
    this.localParticipant = {
      id: ablySignaling.getClientId(),
      username,
      role,
      audioMuted: false,
      videoMuted: false,
      handRaised: false,
      joinedAt: Date.now(),
      stream,
    }

    // Join signaling room
    ablySignaling.joinRoom(roomId, username, {
      username,
      role,
      audioMuted: false,
      videoMuted: false,
      handRaised: false,
      joinedAt: Date.now(),
    })

    console.log(`🚪 Joined room ${roomId} as ${role}`)
    this.emit('room-joined', { roomId, role })
  }

  // Handle user joined
  private async handleUserJoined(userId: string, username: string, role: ParticipantRole = 'viewer'): Promise<void> {
    if (this.participants.has(userId)) {
      console.warn(`⚠️ User ${userId} already exists`)
      return
    }

    if (this.participants.size >= this.maxParticipants) {
      console.warn(`⚠️ Max participants reached (${this.maxParticipants})`)
      this.emit('max-participants-reached')
      return
    }

    const participant: Participant = {
      id: userId,
      username,
      role,
      audioMuted: false,
      videoMuted: false,
      handRaised: false,
      joinedAt: Date.now(),
    }

    this.participants.set(userId, participant)
    console.log(`👤 Participant added: ${username} (${userId})`)

    this.emit('participant-added', participant)

    // Determine if we should initiate connection based on mode
    const shouldInitiate = this.shouldInitiateConnection(role)

    if (shouldInitiate) {
      console.log(`🤝 Initiating connection with ${userId}`)
      this.webrtcEngine.createPeerConnection(userId, role)

      // Send offer
      const offer = await this.webrtcEngine.createOffer(userId)
      ablySignaling.sendOffer(userId, offer)
    }
  }

  // Determine if we should initiate connection based on mode and roles
  private shouldInitiateConnection(theirRole: ParticipantRole): boolean {
    const myRole = this.webrtcEngine.getRole()

    switch (this.mode) {
      case '1-to-1':
        // In 1-to-1, first person initiates
        return this.participants.size === 0

      case 'mesh':
        // In mesh mode, everyone connects to everyone
        // Initiate if we joined earlier (to avoid duplicate connections)
        return true

      case 'broadcast':
        // In broadcast mode:
        // - Host sends to everyone
        // - Viewers don't send
        // - Speakers send bidirectionally
        if (myRole === 'host') {
          return true
        }
        if (myRole === 'speaker' && (theirRole === 'host' || theirRole === 'speaker')) {
          return true
        }
        return false

      default:
        return false
    }
  }

  // Remove participant
  private removeParticipant(userId: string): void {
    const participant = this.participants.get(userId)
    if (!participant) return

    // Stop their stream
    if (participant.stream) {
      participant.stream.getTracks().forEach((track) => track.stop())
    }

    // Close peer connection
    this.webrtcEngine.closePeerConnection(userId)

    this.participants.delete(userId)
    console.log(`👋 Participant removed: ${userId}`)

    this.emit('participant-removed', participant)
  }

  // Update participant role
  updateParticipantRole(userId: string, role: ParticipantRole): void {
    const participant = this.participants.get(userId)
    if (!participant) return

    const oldRole = participant.role
    participant.role = role
    this.participants.set(userId, participant)

    console.log(`🔄 Role changed for ${userId}: ${oldRole} → ${role}`)
    this.emit('participant-role-changed', { userId, oldRole, newRole: role })

    // In broadcast mode, role change may require renegotiation
    if (this.mode === 'broadcast') {
      this.handleRoleChangeInBroadcast(userId, oldRole, role)
    }
  }

  // Handle role changes in broadcast mode
  private async handleRoleChangeInBroadcast(
    userId: string,
    oldRole: ParticipantRole,
    newRole: ParticipantRole
  ): Promise<void> {
    // Viewer → Speaker: Need to start sending media
    if (oldRole === 'viewer' && newRole === 'speaker') {
      const offer = await this.webrtcEngine.createOffer(userId)
      ablySignaling.sendOffer(userId, offer)
    }

    // Speaker → Viewer: Need to stop sending media
    if (oldRole === 'speaker' && newRole === 'viewer') {
      // Close and recreate connection as one-way
      this.webrtcEngine.closePeerConnection(userId)
      this.webrtcEngine.createPeerConnection(userId, newRole)
    }
  }

  // Update participant mute state
  updateParticipantMute(userId: string, audioMuted: boolean, videoMuted: boolean): void {
    const participant = this.participants.get(userId)
    if (!participant) return

    participant.audioMuted = audioMuted
    participant.videoMuted = videoMuted
    this.participants.set(userId, participant)

    this.emit('participant-mute-changed', { userId, audioMuted, videoMuted })
  }

  // Update participant hand raise
  updateParticipantHandRaise(userId: string, raised: boolean): void {
    const participant = this.participants.get(userId)
    if (!participant) return

    participant.handRaised = raised
    this.participants.set(userId, participant)

    this.emit('participant-hand-raised', { userId, raised })
  }

  // Promote viewer to speaker (host only)
  async promoteToSpeaker(userId: string): Promise<void> {
    if (!this.isHost) {
      console.error('❌ Only host can promote participants')
      return
    }

    const participant = this.participants.get(userId)
    if (!participant || participant.role !== 'viewer') return

    this.updateParticipantRole(userId, 'speaker')
    ablySignaling.setRole('speaker') // Notify via signaling
  }

  // Demote speaker to viewer (host only)
  async demoteToViewer(userId: string): Promise<void> {
    if (!this.isHost) {
      console.error('❌ Only host can demote participants')
      return
    }

    const participant = this.participants.get(userId)
    if (!participant || participant.role !== 'speaker') return

    this.updateParticipantRole(userId, 'viewer')
    ablySignaling.setRole('viewer')
  }

  // Toggle local mute
  toggleMute(audioMuted?: boolean, videoMuted?: boolean): void {
    if (!this.localParticipant) return

    const newAudioMuted = audioMuted ?? !this.localParticipant.audioMuted
    const newVideoMuted = videoMuted ?? !this.localParticipant.videoMuted

    this.localParticipant.audioMuted = newAudioMuted
    this.localParticipant.videoMuted = newVideoMuted

    // Mute/unmute local tracks
    if (this.localParticipant.stream) {
      this.localParticipant.stream.getAudioTracks().forEach((track) => {
        track.enabled = !newAudioMuted
      })
      this.localParticipant.stream.getVideoTracks().forEach((track) => {
        track.enabled = !newVideoMuted
      })
    }

    // Notify others
    ablySignaling.toggleMute(newAudioMuted, newVideoMuted)

    this.emit('local-mute-changed', { audioMuted: newAudioMuted, videoMuted: newVideoMuted })
  }

  // Raise/lower hand
  raiseHand(raised?: boolean): void {
    if (!this.localParticipant) return

    const newRaised = raised ?? !this.localParticipant.handRaised
    this.localParticipant.handRaised = newRaised

    ablySignaling.raiseHand(newRaised)
    this.emit('local-hand-raised', { raised: newRaised })
  }

  // Start screen share
  async startScreenShare(): Promise<void> {
    await this.webrtcEngine.startScreenShare('standard')
    this.emit('screen-share-started')
  }

  // Stop screen share
  async stopScreenShare(): Promise<void> {
    await this.webrtcEngine.stopScreenShare()
    this.emit('screen-share-stopped')
  }

  // Get all participants
  getParticipants(): Participant[] {
    return Array.from(this.participants.values())
  }

  // Get participant by ID
  getParticipant(userId: string): Participant | undefined {
    return this.participants.get(userId)
  }

  // Get local participant
  getLocalParticipant(): Participant | null {
    return this.localParticipant
  }

  // Get participant count
  getParticipantCount(): number {
    return this.participants.size
  }

  // Leave room
  leaveRoom(): void {
    console.log('👋 Leaving room...')

    // Close all peer connections
    this.participants.forEach((participant) => {
      this.webrtcEngine.closePeerConnection(participant.id)
      if (participant.stream) {
        participant.stream.getTracks().forEach((track) => track.stop())
      }
    })

    this.participants.clear()

    // Stop local stream
    if (this.localParticipant?.stream) {
      this.localParticipant.stream.getTracks().forEach((track) => track.stop())
    }

    this.localParticipant = null

    // Leave signaling
    ablySignaling.leaveRoom()

    this.emit('room-left')
  }

  // Destroy manager
  destroy(): void {
    this.leaveRoom()
    this.webrtcEngine.destroy()
    this.removeAllListeners()
    console.log('🧹 Participant Manager destroyed')
  }
}
