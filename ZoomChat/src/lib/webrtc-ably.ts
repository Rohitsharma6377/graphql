// WebRTC utilities for Ably-based signaling

// STUN servers for NAT traversal
const iceServers: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
]

export function createPeerConnection(): RTCPeerConnection {
  const config: RTCConfiguration = {
    iceServers,
    iceCandidatePoolSize: 10,
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require',
  }

  const pc = new RTCPeerConnection(config)

  pc.oniceconnectionstatechange = () => {
    console.log('🔌 ICE connection state:', pc.iceConnectionState)
  }

  pc.onicegatheringstatechange = () => {
    console.log('🧊 ICE gathering state:', pc.iceGatheringState)
  }

  pc.onsignalingstatechange = () => {
    console.log('📡 Signaling state:', pc.signalingState)
  }

  return pc
}

export function closePeerConnection(pc: RTCPeerConnection): void {
  pc.close()
  console.log('🔌 Peer connection closed')
}
