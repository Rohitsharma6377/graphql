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
  })

  // Handle ICE candidates
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('ice-candidate', { roomId, candidate: event.candidate })
      onIceCandidate?.(event.candidate)
    }
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
  const offer = await pc.createOffer({
    offerToReceiveAudio: true,
    offerToReceiveVideo: true,
  })
  await pc.setLocalDescription(offer)
  socket.emit('offer', { roomId, offer })
  console.log('Sent offer to room:', roomId)
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
  await pc.setRemoteDescription(new RTCSessionDescription(offer))
  const answer = await pc.createAnswer()
  await pc.setLocalDescription(answer)
  socket.emit('answer', { roomId, answer })
  console.log('Sent answer to room:', roomId)
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
  await pc.setRemoteDescription(new RTCSessionDescription(answer))
  console.log('Set remote description from answer')
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
