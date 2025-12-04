// Advanced WebRTC Engine - Production-ready peer connection management
// Supports 1-to-1, 1-to-many, mesh, and broadcast modes

import { EventEmitter } from 'events'

export type CallMode = '1-to-1' | 'mesh' | 'broadcast'
export type ParticipantRole = 'host' | 'speaker' | 'viewer'
export type ConnectionQuality = 'excellent' | 'good' | 'poor' | 'disconnected'

export interface WebRTCConfig {
  iceServers?: RTCIceServer[]
  enableTURN?: boolean
  enableDataChannel?: boolean
  videoConstraints?: MediaStreamConstraints['video']
  audioConstraints?: MediaStreamConstraints['audio']
  mode?: CallMode
}

export interface PeerConnectionState {
  peerId: string
  role: ParticipantRole
  connectionState: RTCPeerConnectionState
  iceConnectionState: RTCIceConnectionState
  quality: ConnectionQuality
  stats?: RTCStatsReport
}

export interface CallStats {
  bitrate: number
  packetLoss: number
  roundTripTime: number
  jitter: number
}

// Default STUN/TURN servers
const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
]

// Premium video constraints (1080p)
const PREMIUM_VIDEO_CONSTRAINTS = {
  width: { ideal: 1920 },
  height: { ideal: 1080 },
  frameRate: { ideal: 30 },
  facingMode: 'user',
}

// Standard video constraints (720p)
const STANDARD_VIDEO_CONSTRAINTS = {
  width: { ideal: 1280 },
  height: { ideal: 720 },
  frameRate: { ideal: 24 },
  facingMode: 'user',
}

// Screen share quality profiles
export const SCREEN_SHARE_PROFILES = {
  presentation: {
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    frameRate: { ideal: 5 },
  },
  video: {
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    frameRate: { ideal: 30 },
  },
  standard: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 15 },
  },
}

export class WebRTCEngine extends EventEmitter {
  private peers: Map<string, RTCPeerConnection> = new Map()
  private peerStates: Map<string, PeerConnectionState> = new Map()
  private localStream: MediaStream | null = null
  private screenStream: MediaStream | null = null
  private config: WebRTCConfig
  private mode: CallMode
  private myRole: ParticipantRole = 'viewer'
  private candidateBuffers: Map<string, RTCIceCandidateInit[]> = new Map()
  private statsIntervals: Map<string, NodeJS.Timeout> = new Map()

  constructor(config: WebRTCConfig = {}) {
    super()
    this.config = {
      iceServers: config.iceServers || DEFAULT_ICE_SERVERS,
      enableTURN: config.enableTURN ?? false,
      enableDataChannel: config.enableDataChannel ?? true,
      videoConstraints: config.videoConstraints || STANDARD_VIDEO_CONSTRAINTS,
      audioConstraints: config.audioConstraints ?? true,
      mode: config.mode || '1-to-1',
    }
    this.mode = this.config.mode!

    console.log('🚀 WebRTC Engine initialized', { mode: this.mode })
  }

  // Get local media with constraints
  async getLocalMedia(isPremium = false): Promise<MediaStream> {
    try {
      const constraints: MediaStreamConstraints = {
        video: isPremium ? PREMIUM_VIDEO_CONSTRAINTS : this.config.videoConstraints,
        audio: this.config.audioConstraints,
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      this.localStream = stream

      console.log('📹 Local media acquired:', {
        video: stream.getVideoTracks()[0]?.getSettings(),
        audio: stream.getAudioTracks()[0]?.getSettings(),
      })

      this.emit('local-media-ready', stream)
      return stream
    } catch (error) {
      console.error('❌ Failed to get local media:', error)
      throw error
    }
  }

  // Get screen share with quality profile
  async getScreenShare(profile: keyof typeof SCREEN_SHARE_PROFILES = 'standard'): Promise<MediaStream> {
    try {
      const constraints = {
        video: SCREEN_SHARE_PROFILES[profile],
        audio: false,
      }

      // @ts-ignore - getDisplayMedia types
      const stream = await navigator.mediaDevices.getDisplayMedia(constraints)
      this.screenStream = stream

      // Handle user stopping screen share via browser UI
      stream.getVideoTracks()[0].onended = () => {
        this.emit('screen-share-ended')
        this.stopScreenShare()
      }

      console.log('🖥️ Screen share started:', profile)
      this.emit('screen-share-started', stream)
      return stream
    } catch (error) {
      console.error('❌ Failed to get screen share:', error)
      throw error
    }
  }

  // Create peer connection with advanced configuration
  createPeerConnection(peerId: string, role: ParticipantRole = 'viewer'): RTCPeerConnection {
    if (this.peers.has(peerId)) {
      console.warn('⚠️ Peer connection already exists, closing old one')
      this.closePeerConnection(peerId)
    }

    const config: RTCConfiguration = {
      iceServers: this.config.iceServers,
      iceCandidatePoolSize: 10,
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require',
      iceTransportPolicy: this.config.enableTURN ? 'relay' : 'all',
    }

    const pc = new RTCPeerConnection(config)
    this.peers.set(peerId, pc)

    // Initialize peer state
    const state: PeerConnectionState = {
      peerId,
      role,
      connectionState: pc.connectionState,
      iceConnectionState: pc.iceConnectionState,
      quality: 'disconnected',
    }
    this.peerStates.set(peerId, state)

    // Set up event handlers
    this.setupPeerHandlers(pc, peerId)

    // Add local tracks based on mode and role
    this.addLocalTracks(pc, role)

    console.log(`👥 Created peer connection for ${peerId} as ${role}`)
    this.emit('peer-created', { peerId, role })

    return pc
  }

  // Set up all peer connection event handlers
  private setupPeerHandlers(pc: RTCPeerConnection, peerId: string): void {
    // Track received
    pc.ontrack = (event: RTCTrackEvent) => {
      console.log(`🎥 Received track from ${peerId}:`, event.track.kind)

      // Safari/Mobile fallback
      let stream: MediaStream
      if (event.streams && event.streams[0]) {
        stream = event.streams[0]
      } else {
        stream = new MediaStream()
        stream.addTrack(event.track)
      }

      this.emit('remote-track', { peerId, track: event.track, stream })
    }

    // ICE candidate
    pc.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate) {
        console.log(`🧊 ICE candidate for ${peerId}`)
        this.emit('ice-candidate', { peerId, candidate: event.candidate })
      }
    }

    // ICE connection state
    pc.oniceconnectionstatechange = () => {
      const state = this.peerStates.get(peerId)
      if (state) {
        state.iceConnectionState = pc.iceConnectionState
        state.quality = this.calculateQuality(pc)
        this.peerStates.set(peerId, state)
      }

      console.log(`🧊 ICE connection state for ${peerId}:`, pc.iceConnectionState)

      if (pc.iceConnectionState === 'failed') {
        console.warn(`⚠️ ICE failed for ${peerId}, restarting...`)
        pc.restartIce()
        this.emit('ice-restart', { peerId })
      } else if (pc.iceConnectionState === 'disconnected') {
        this.emit('peer-disconnected', { peerId })
      } else if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        this.emit('peer-connected', { peerId })
        this.startStatsMonitoring(peerId)
      }
    }

    // Connection state
    pc.onconnectionstatechange = () => {
      const state = this.peerStates.get(peerId)
      if (state) {
        state.connectionState = pc.connectionState
        this.peerStates.set(peerId, state)
      }

      console.log(`🔌 Connection state for ${peerId}:`, pc.connectionState)

      if (pc.connectionState === 'failed') {
        this.emit('connection-failed', { peerId })
      } else if (pc.connectionState === 'closed') {
        this.stopStatsMonitoring(peerId)
      }
    }

    // Negotiation needed
    pc.onnegotiationneeded = async () => {
      console.log(`🔄 Negotiation needed for ${peerId}`)
      this.emit('negotiation-needed', { peerId })
    }

    // Data channel (if enabled)
    if (this.config.enableDataChannel) {
      pc.ondatachannel = (event) => {
        console.log(`📡 Data channel received from ${peerId}`)
        this.emit('data-channel', { peerId, channel: event.channel })
      }
    }
  }

  // Add local tracks to peer connection based on role
  private addLocalTracks(pc: RTCPeerConnection, role: ParticipantRole): void {
    if (!this.localStream) return

    const tracks = this.localStream.getTracks()

    if (role === 'viewer' && this.mode === 'broadcast') {
      // Viewers don't send tracks in broadcast mode
      return
    }

    tracks.forEach((track) => {
      pc.addTrack(track, this.localStream!)
      console.log(`➕ Added ${track.kind} track`)
    })
  }

  // Calculate connection quality
  private calculateQuality(pc: RTCPeerConnection): ConnectionQuality {
    const ice = pc.iceConnectionState
    const conn = pc.connectionState

    if (conn === 'connected' && (ice === 'connected' || ice === 'completed')) {
      return 'excellent'
    }
    if (conn === 'connecting' || ice === 'checking') {
      return 'good'
    }
    if (conn === 'disconnected' || ice === 'disconnected') {
      return 'poor'
    }
    return 'disconnected'
  }

  // Start monitoring connection stats
  private async startStatsMonitoring(peerId: string): Promise<void> {
    if (this.statsIntervals.has(peerId)) return

    const pc = this.peers.get(peerId)
    if (!pc) return

    const interval = setInterval(async () => {
      try {
        const stats = await pc.getStats()
        const callStats = this.parseStats(stats)

        this.emit('stats-update', { peerId, stats: callStats })

        // Update quality based on stats
        const state = this.peerStates.get(peerId)
        if (state) {
          if (callStats.packetLoss > 10) {
            state.quality = 'poor'
          } else if (callStats.roundTripTime > 300) {
            state.quality = 'good'
          } else {
            state.quality = 'excellent'
          }
          this.peerStates.set(peerId, state)
        }
      } catch (error) {
        console.error(`Error getting stats for ${peerId}:`, error)
      }
    }, 2000)

    this.statsIntervals.set(peerId, interval)
  }

  // Stop monitoring stats
  private stopStatsMonitoring(peerId: string): void {
    const interval = this.statsIntervals.get(peerId)
    if (interval) {
      clearInterval(interval)
      this.statsIntervals.delete(peerId)
    }
  }

  // Parse WebRTC stats
  private parseStats(stats: RTCStatsReport): CallStats {
    let bitrate = 0
    let packetLoss = 0
    let roundTripTime = 0
    let jitter = 0

    stats.forEach((report) => {
      if (report.type === 'inbound-rtp') {
        bitrate = report.bytesReceived || 0
        packetLoss = report.packetsLost || 0
        jitter = report.jitter || 0
      }
      if (report.type === 'candidate-pair' && report.state === 'succeeded') {
        roundTripTime = report.currentRoundTripTime ? report.currentRoundTripTime * 1000 : 0
      }
    })

    return { bitrate, packetLoss, roundTripTime, jitter }
  }

  // Add ICE candidate with buffering
  async addIceCandidate(peerId: string, candidate: RTCIceCandidateInit): Promise<void> {
    const pc = this.peers.get(peerId)
    if (!pc) {
      console.warn(`⚠️ No peer connection for ${peerId}, buffering candidate`)
      if (!this.candidateBuffers.has(peerId)) {
        this.candidateBuffers.set(peerId, [])
      }
      this.candidateBuffers.get(peerId)!.push(candidate)
      return
    }

    try {
      if (pc.remoteDescription) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate))
        console.log(`✅ Added ICE candidate for ${peerId}`)
      } else {
        // Buffer until remote description is set
        if (!this.candidateBuffers.has(peerId)) {
          this.candidateBuffers.set(peerId, [])
        }
        this.candidateBuffers.get(peerId)!.push(candidate)
        console.log(`📦 Buffered ICE candidate for ${peerId}`)
      }
    } catch (error) {
      console.error(`❌ Failed to add ICE candidate for ${peerId}:`, error)
    }
  }

  // Process buffered ICE candidates
  private async processBufferedCandidates(peerId: string): Promise<void> {
    const candidates = this.candidateBuffers.get(peerId)
    if (!candidates || candidates.length === 0) return

    const pc = this.peers.get(peerId)
    if (!pc || !pc.remoteDescription) return

    console.log(`📦 Processing ${candidates.length} buffered candidates for ${peerId}`)

    for (const candidate of candidates) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate))
      } catch (error) {
        console.error('Failed to add buffered candidate:', error)
      }
    }

    this.candidateBuffers.delete(peerId)
  }

  // Create and send offer
  async createOffer(peerId: string): Promise<RTCSessionDescriptionInit> {
    const pc = this.peers.get(peerId)
    if (!pc) throw new Error(`No peer connection for ${peerId}`)

    try {
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      console.log(`📤 Created offer for ${peerId}`)
      return offer
    } catch (error) {
      console.error(`❌ Failed to create offer for ${peerId}:`, error)
      throw error
    }
  }

  // Handle received offer
  async handleOffer(peerId: string, offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    let pc = this.peers.get(peerId)

    // Create peer connection if it doesn't exist (late joiner)
    if (!pc) {
      console.log(`⚠️ Creating peer connection for late joiner ${peerId}`)
      pc = this.createPeerConnection(peerId, 'viewer')
    }

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offer))
      console.log(`📥 Set remote offer for ${peerId}`)

      // Process buffered candidates
      await this.processBufferedCandidates(peerId)

      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)

      console.log(`📤 Created answer for ${peerId}`)
      return answer
    } catch (error) {
      console.error(`❌ Failed to handle offer from ${peerId}:`, error)
      throw error
    }
  }

  // Handle received answer
  async handleAnswer(peerId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    const pc = this.peers.get(peerId)
    if (!pc) {
      console.error(`❌ No peer connection for ${peerId}`)
      return
    }

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(answer))
      console.log(`📥 Set remote answer for ${peerId}`)

      // Process buffered candidates
      await this.processBufferedCandidates(peerId)
    } catch (error) {
      console.error(`❌ Failed to handle answer from ${peerId}:`, error)
      throw error
    }
  }

  // Replace video track (for screen sharing)
  async replaceVideoTrack(track: MediaStreamTrack, peerId?: string): Promise<void> {
    const peers = peerId ? [this.peers.get(peerId)!] : Array.from(this.peers.values())

    for (const pc of peers) {
      if (!pc) continue

      const sender = pc.getSenders().find((s) => s.track?.kind === 'video')
      if (sender) {
        try {
          await sender.replaceTrack(track)
          console.log('✅ Replaced video track')
        } catch (error) {
          console.error('❌ Failed to replace video track:', error)
        }
      }
    }
  }

  // Start screen sharing
  async startScreenShare(profile: keyof typeof SCREEN_SHARE_PROFILES = 'standard'): Promise<void> {
    const stream = await this.getScreenShare(profile)
    const videoTrack = stream.getVideoTracks()[0]

    await this.replaceVideoTrack(videoTrack)

    // Trigger renegotiation for all peers
    for (const [peerId, pc] of this.peers) {
      if (pc.signalingState === 'stable') {
        try {
          const offer = await this.createOffer(peerId)
          this.emit('renegotiation-offer', { peerId, offer })
        } catch (error) {
          console.error(`Failed to renegotiate for ${peerId}:`, error)
        }
      }
    }
  }

  // Stop screen sharing
  async stopScreenShare(): Promise<void> {
    if (!this.screenStream) return

    // Stop screen tracks
    this.screenStream.getTracks().forEach((track) => track.stop())
    this.screenStream = null

    // Replace with camera track
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0]
      if (videoTrack) {
        await this.replaceVideoTrack(videoTrack)
      }
    }

    console.log('🛑 Screen share stopped')
    this.emit('screen-share-stopped')
  }

  // Close specific peer connection
  closePeerConnection(peerId: string): void {
    const pc = this.peers.get(peerId)
    if (!pc) return

    this.stopStatsMonitoring(peerId)

    pc.getSenders().forEach((sender) => {
      if (sender.track) sender.track.stop()
    })

    pc.close()
    this.peers.delete(peerId)
    this.peerStates.delete(peerId)
    this.candidateBuffers.delete(peerId)

    console.log(`🔌 Closed peer connection for ${peerId}`)
    this.emit('peer-closed', { peerId })
  }

  // Close all connections and cleanup
  destroy(): void {
    console.log('🧹 Destroying WebRTC engine...')

    // Close all peer connections
    for (const peerId of this.peers.keys()) {
      this.closePeerConnection(peerId)
    }

    // Stop local media
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop())
      this.localStream = null
    }

    // Stop screen share
    if (this.screenStream) {
      this.screenStream.getTracks().forEach((track) => track.stop())
      this.screenStream = null
    }

    this.removeAllListeners()
    console.log('✅ WebRTC engine destroyed')
  }

  // Get peer state
  getPeerState(peerId: string): PeerConnectionState | undefined {
    return this.peerStates.get(peerId)
  }

  // Get all peer states
  getAllPeerStates(): PeerConnectionState[] {
    return Array.from(this.peerStates.values())
  }

  // Set role
  setRole(role: ParticipantRole): void {
    this.myRole = role
    console.log(`👤 Role set to: ${role}`)
  }

  // Get role
  getRole(): ParticipantRole {
    return this.myRole
  }
}
