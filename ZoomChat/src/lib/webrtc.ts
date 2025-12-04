// WebRTC helper functions for peer connection management

export interface IceServerConfig {
  urls: string | string[]
  username?: string
  credential?: string
}

/**
 * Create a new RTCPeerConnection with STUN/TURN configuration
 * @param roomId - The room identifier for signaling
 * @param socket - Socket.IO instance for signaling
 * @param onRemoteStream - Callback when remote stream is received
 * @param onIceCandidate - Callback when ICE candidate is generated
 */
export function createPeerConnection(
  roomId: string,
  socket: any,
  onRemoteStream: (stream: MediaStream) => void,
  onIceCandidate?: (candidate: RTCIceCandidate) => void
): RTCPeerConnection {
  const iceServers: IceServerConfig[] = [
    { urls: process.env.NEXT_PUBLIC_STUN || 'stun:stun.l.google.com:19302' },
  ]

  // Add TURN server if configured
  if (process.env.TURN_URL) {
    iceServers.push({
      urls: process.env.TURN_URL,
      username: process.env.TURN_USER,
      credential: process.env.TURN_PASS,
    })
  }

  const pc = new RTCPeerConnection({
    iceServers,
    iceCandidatePoolSize: 10,  // Pre-gather ICE candidates for faster connection
    bundlePolicy: 'max-bundle',  // Optimize for mobile
    rtcpMuxPolicy: 'require',    // Reduce port usage
  })

  // Handle ICE candidates
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      console.log('🧊 ICE candidate:', event.candidate.type)
      socket.emit('ice-candidate', { roomId, candidate: event.candidate })
      onIceCandidate?.(event.candidate)
    } else {
      console.log('✅ ICE gathering complete')
    }
  }
  
  // Handle ICE gathering state
  pc.onicegatheringstatechange = () => {
    console.log('🔍 ICE gathering state:', pc.iceGatheringState)
  }

  // Handle remote track
  pc.ontrack = (event) => {
    console.log('Received remote track:', event.track.kind)
    if (event.streams && event.streams[0]) {
      onRemoteStream(event.streams[0])
    }
  }

  // Monitor connection state
  pc.onconnectionstatechange = () => {
    console.log('Connection state:', pc.connectionState)
  }

  pc.oniceconnectionstatechange = () => {
    console.log('ICE connection state:', pc.iceConnectionState)
  }

  return pc
}

/**
 * Add local media tracks to peer connection
 * @param pc - RTCPeerConnection instance
 * @param stream - MediaStream to add
 */
export function addStreamToPeer(pc: RTCPeerConnection, stream: MediaStream): void {
  stream.getTracks().forEach((track) => {
    pc.addTrack(track, stream)
    console.log('Added track to peer:', track.kind, track.label)
  })
}

/**
 * Replace a video track in the peer connection (used for screen sharing)
 * @param pc - RTCPeerConnection instance
 * @param newTrack - New video track to replace with
 * @returns The RTCRtpSender that was updated, or null if no video sender found
 */
export async function replaceVideoTrack(
  pc: RTCPeerConnection,
  newTrack: MediaStreamTrack
): Promise<RTCRtpSender | null> {
  const sender = pc.getSenders().find((s) => s.track?.kind === 'video')
  if (sender) {
    await sender.replaceTrack(newTrack)
    console.log('Replaced video track:', newTrack.label)
    return sender
  }
  return null
}

/**
 * Add an additional video track for simultaneous camera + screen sharing
 * NOTE: Some browsers may not support sending multiple video tracks simultaneously.
 * Use replaceTrack as a fallback if this fails.
 * @param pc - RTCPeerConnection instance
 * @param track - Additional video track
 * @param stream - MediaStream containing the track
 */
export function addAdditionalVideoTrack(
  pc: RTCPeerConnection,
  track: MediaStreamTrack,
  stream: MediaStream
): RTCRtpSender {
  const sender = pc.addTrack(track, stream)
  console.log('Added additional video track:', track.label)
  return sender
}

/**
 * Create and send an SDP offer
 * @param pc - RTCPeerConnection instance
 * @param socket - Socket.IO instance
 * @param roomId - Room identifier
 */
export async function createOffer(
  pc: RTCPeerConnection,
  socket: any,
  roomId: string
): Promise<void> {
  try {
    console.log('📝 Creating offer... Current state:', pc.signalingState)
    
    const offer = await pc.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    })
    
    await pc.setLocalDescription(offer)
    console.log('✅ Set local description (offer)')
    
    socket.emit('offer', { roomId, offer })
    console.log('📤 Sent offer to room:', roomId)
  } catch (error) {
    console.error('❌ Error creating offer:', error)
    throw error
  }
}

/**
 * Create and send an SDP answer
 * @param pc - RTCPeerConnection instance
 * @param socket - Socket.IO instance
 * @param roomId - Room identifier
 * @param offer - Remote SDP offer
 */
export async function createAnswer(
  pc: RTCPeerConnection,
  socket: any,
  roomId: string,
  offer: RTCSessionDescriptionInit
): Promise<void> {
  try {
    console.log('📝 Creating answer... Current state:', pc.signalingState)
    
    // Check if we can accept the offer
    if (pc.signalingState !== 'stable' && pc.signalingState !== 'have-remote-offer') {
      console.warn('⚠️ Cannot create answer in state:', pc.signalingState)
      // If we're in wrong state, reset to stable
      if (pc.signalingState === 'have-local-offer') {
        console.log('🔄 Rolling back local description...')
        await pc.setLocalDescription({ type: 'rollback' })
      }
    }
    
    await pc.setRemoteDescription(new RTCSessionDescription(offer))
    console.log('✅ Set remote description (offer)')
    
    const answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)
    console.log('✅ Set local description (answer)')
    
    socket.emit('answer', { roomId, answer })
    console.log('📤 Sent answer to room:', roomId)
  } catch (error) {
    console.error('❌ Error creating answer:', error)
    throw error
  }
}

/**
 * Handle received SDP answer
 * @param pc - RTCPeerConnection instance
 * @param answer - Remote SDP answer
 */
export async function handleAnswer(
  pc: RTCPeerConnection,
  answer: RTCSessionDescriptionInit
): Promise<void> {
  // Only set remote description if we're in the right state
  if (pc.signalingState === 'have-local-offer') {
    await pc.setRemoteDescription(new RTCSessionDescription(answer))
    console.log('Set remote description from answer')
  } else {
    console.warn('Ignoring answer - wrong signaling state:', pc.signalingState)
  }
}

/**
 * Add ICE candidate to peer connection
 * @param pc - RTCPeerConnection instance
 * @param candidate - ICE candidate
 */
export async function addIceCandidate(
  pc: RTCPeerConnection,
  candidate: RTCIceCandidateInit
): Promise<void> {
  try {
    await pc.addIceCandidate(new RTCIceCandidate(candidate))
    console.log('Added ICE candidate')
  } catch (error) {
    console.error('Error adding ICE candidate:', error)
  }
}

/**
 * Close peer connection and cleanup
 * @param pc - RTCPeerConnection instance
 */
export function closePeerConnection(pc: RTCPeerConnection): void {
  pc.close()
  console.log('Closed peer connection')
}

/**
 * Stop all tracks in a media stream
 * @param stream - MediaStream to stop
 */
export function stopMediaStream(stream: MediaStream): void {
  stream.getTracks().forEach((track) => {
    track.stop()
    console.log('Stopped track:', track.kind, track.label)
  })
}
