// Hook for managing WebRTC call state with Ably signaling (Vercel-compatible)

import { useState, useCallback, useRef, useEffect } from 'react'
import { ablySignaling, Message } from '@/lib/ably-signaling'
import { FallingEmoji } from '@/components/FallingEmojis'

// WebRTC configuration
const iceServers: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
]

function createPeerConnection(): RTCPeerConnection {
  const config: RTCConfiguration = {
    iceServers,
    iceCandidatePoolSize: 10,
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require',
    iceTransportPolicy: 'all',
  }
  
  const pc = new RTCPeerConnection(config)
  
  // ICE connection state monitoring with auto-restart on failure
  pc.oniceconnectionstatechange = () => {
    console.log('🧊 ICE connection state:', pc.iceConnectionState)
    if (pc.iceConnectionState === 'failed') {
      console.warn('⚠️ ICE connection failed, restarting ICE...')
      pc.restartIce()
    }
  }
  
  // ICE gathering state
  pc.onicegatheringstatechange = () => {
    console.log('📡 ICE gathering state:', pc.iceGatheringState)
  }
  
  // Signaling state
  pc.onsignalingstatechange = () => {
    console.log('📶 Signaling state:', pc.signalingState)
  }
  
  return pc
}

function closePeerConnection(pc: RTCPeerConnection): void {
  console.log('🔌 Closing peer connection...')
  
  // Stop all senders
  pc.getSenders().forEach(sender => {
    if (sender.track) {
      sender.track.stop()
    }
  })
  
  // Close connection
  pc.close()
  console.log('✅ Peer connection closed')
}

export interface UseCallStateReturn {
  isConnected: boolean
  isInCall: boolean
  remoteStream: MediaStream | null
  remotePeerId: string | null
  messages: Message[]
  typingUser: string | null
  fallingEmojis: FallingEmoji[]
  lastEmojiSender: { emoji: string; username: string } | null
  joinCall: (roomId: string, username: string, localStream: MediaStream) => Promise<void>
  leaveCall: () => void
  sendMessage: (text: string) => void
  sendTyping: (isTyping: boolean) => void
  sendEmoji: (emoji: string) => void
  addScreenTrack: (screenTrack: MediaStreamTrack, screenStream: MediaStream) => Promise<void>
  removeScreenTrack: () => void
}

export function useCallState(roomId: string, username: string): UseCallStateReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [isInCall, setIsInCall] = useState(false)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [remotePeerId, setRemotePeerId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [typingUser, setTypingUser] = useState<string | null>(null)
  const [fallingEmojis, setFallingEmojis] = useState<FallingEmoji[]>([])
  const [lastEmojiSender, setLastEmojiSender] = useState<{ emoji: string; username: string } | null>(null)

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const isInitiatorRef = useRef(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize Ably signaling
  useEffect(() => {
    try {
      ablySignaling.connect()
      setIsConnected(true)
      console.log('✅ Ably signaling ready')
    } catch (error) {
      console.error('❌ Failed to connect to Ably:', error)
      setIsConnected(false)
    }

    return () => {
      ablySignaling.disconnect()
    }
  }, [])

  // Handle signaling events
  useEffect(() => {
    if (!isConnected || !isInCall) return

    const myId = ablySignaling.getClientId()

    // User joined
    ablySignaling.on('user-joined', async ({ userId, username: joinedUsername }) => {
      // Ignore self
      if (userId === myId) {
        console.log('⚠️ Ignoring self-join event')
        return
      }
      
      console.log('👥 User joined:', joinedUsername, 'ID:', userId)
      setRemotePeerId(userId)

      // Determine who initiates based on client IDs
      if (peerConnectionRef.current && localStreamRef.current) {
        if (myId > userId) {
          console.log('🎯 I will initiate the offer (my ID is higher)')
          isInitiatorRef.current = true
          
          setTimeout(async () => {
            if (peerConnectionRef.current) {
              console.log('📤 Creating and sending offer...')
              const offer = await peerConnectionRef.current.createOffer()
              await peerConnectionRef.current.setLocalDescription(offer)
              ablySignaling.sendOffer(roomId, offer)
            }
          }, 500)
        } else {
          console.log('⏳ Waiting for other peer to initiate')
          isInitiatorRef.current = false
        }
      }
    })

    // User left
    ablySignaling.on('user-left', ({ userId }) => {
      console.log('👋 User left:', userId)
      if (userId === remotePeerId) {
        setRemoteStream(null)
        setRemotePeerId(null)
        if (peerConnectionRef.current) {
          closePeerConnection(peerConnectionRef.current)
          peerConnectionRef.current = null
        }
      }
    })

    // Received offer
    ablySignaling.on('offer', async ({ from, offer }) => {
      console.log('📩 Received offer from:', from)
      
      if (from === myId) {
        console.warn('⚠️ Ignoring offer from self')
        return
      }
      
      setRemotePeerId(from)

      // Ensure peer connection exists before handling offer
      if (!peerConnectionRef.current) {
        console.log('⚠️ No peer connection, creating one before handling offer')
        const pc = createPeerConnection()
        peerConnectionRef.current = pc
        
        // Add local stream if available
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach((track) => {
            pc.addTrack(track, localStreamRef.current!)
          })
        }
        
        // Set up handlers
        setupPeerConnectionHandlers(pc, roomId)
      }

      if (peerConnectionRef.current) {
        isInitiatorRef.current = false
        console.log('📝 Setting remote description and creating answer...')
        
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer))
        const answer = await peerConnectionRef.current.createAnswer()
        await peerConnectionRef.current.setLocalDescription(answer)
        ablySignaling.sendAnswer(roomId, answer)
        console.log('📤 Sent answer')
      }
    })

    // Received answer
    ablySignaling.on('answer', async ({ from, answer }) => {
      console.log('📩 Received answer from:', from)
      
      if (from === myId) {
        console.warn('⚠️ Ignoring answer from self')
        return
      }

      if (peerConnectionRef.current) {
        console.log('✅ Setting remote description (answer)...')
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer))
      }
    })

    // Received ICE candidate
    ablySignaling.on('ice-candidate', async ({ from, candidate }) => {
      if (from === myId) return
      
      console.log('🧊 Received ICE candidate from:', from)
      
      if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate))
      }
    })

    // New message
    ablySignaling.on('message:new', (message) => {
      setMessages((prev) => {
        // Prevent duplicates - check if message ID already exists
        if (prev.some(m => m.id === message.id)) {
          console.log('⚠️ Duplicate message detected, ignoring:', message.id)
          return prev
        }
        console.log('💬 New message:', message.text)
        return [...prev, message]
      })
    })

    // Typing indicator
    ablySignaling.on('typing', ({ username: typingUsername, isTyping }) => {
      if (isTyping) {
        setTypingUser(typingUsername)
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
        }
        typingTimeoutRef.current = setTimeout(() => {
          setTypingUser(null)
        }, 3000)
      } else {
        setTypingUser(null)
      }
    })

    return () => {
      // Cleanup listeners
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [isConnected, isInCall, roomId, remotePeerId])

  // Join call
  const joinCall = useCallback(
    async (roomId: string, username: string, localStream: MediaStream) => {
      try {
        console.log('🚀 Joining call:', roomId, 'as', username)

        localStreamRef.current = localStream

        // Close old peer connection if exists (prevent duplicates)
        if (peerConnectionRef.current) {
          console.log('⚠️ Closing existing peer connection before creating new one')
          closePeerConnection(peerConnectionRef.current)
          peerConnectionRef.current = null
        }

        // Create peer connection FIRST
        const pc = createPeerConnection()
        peerConnectionRef.current = pc

        // Add local stream tracks SECOND
        console.log('➕ Adding local tracks to peer connection')
        localStream.getTracks().forEach((track) => {
          const sender = pc.addTrack(track, localStream)
          console.log(`  ✅ Added ${track.kind} track:`, track.label)
        })

        // Set up ALL handlers THIRD (before any signaling)
        setupPeerConnectionHandlers(pc, roomId)

        // Join room via Ably FOURTH (this triggers offer/answer)
        ablySignaling.joinRoom(roomId, username)
        setIsInCall(true)

        console.log('✅ Call setup complete')
      } catch (error) {
        console.error('❌ Error joining call:', error)
        throw error
      }
    },
    []
  )

  // Helper function to set up peer connection handlers
  const setupPeerConnectionHandlers = (pc: RTCPeerConnection, roomId: string) => {
    // Handle remote stream - FIX for Safari/Mobile where event.streams might be empty
    pc.ontrack = (event: RTCTrackEvent) => {
      console.log('🎥 Received remote track:', event.track.kind, 'readyState:', event.track.readyState)
      
      let stream: MediaStream
      
      if (event.streams && event.streams[0]) {
        // Standard case
        stream = event.streams[0]
        console.log('  Using event.streams[0]')
      } else {
        // Safari/Mobile fallback - create stream manually
        console.log('  Creating MediaStream manually (Safari/Mobile)')
        stream = new MediaStream()
        stream.addTrack(event.track)
      }
      
      setRemoteStream(stream)
      console.log('✅ Remote stream set with', stream.getTracks().length, 'tracks')
    }

    // Handle ICE candidates
    pc.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate) {
        console.log('🧊 Sending ICE candidate:', event.candidate.candidate.substring(0, 50) + '...')
        ablySignaling.sendIceCandidate(roomId, event.candidate.toJSON())
      } else {
        console.log('✅ ICE gathering complete')
      }
    }

    // Connection state monitoring
    pc.onconnectionstatechange = () => {
      console.log('🔌 Connection state:', pc.connectionState)
      
      switch (pc.connectionState) {
        case 'connected':
          console.log('✅ Peer connection established!')
          break
        case 'disconnected':
          console.warn('⚠️ Connection disconnected')
          break
        case 'failed':
          console.error('❌ Connection failed')
          setRemoteStream(null)
          break
        case 'closed':
          console.log('🔒 Connection closed')
          setRemoteStream(null)
          break
      }
    }

    // Negotiation needed (for screen share and renegotiation)
    pc.onnegotiationneeded = async () => {
      try {
        console.log('🔄 Negotiation needed, creating offer...')
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        ablySignaling.sendOffer(roomId, offer)
        console.log('📤 Sent renegotiation offer')
      } catch (error) {
        console.error('❌ Error during negotiation:', error)
      }
    }
  }

  // Leave call
  const leaveCall = useCallback(() => {
    console.log('👋 Leaving call')

    if (peerConnectionRef.current) {
      closePeerConnection(peerConnectionRef.current)
      peerConnectionRef.current = null
    }

    ablySignaling.leaveRoom()

    setIsInCall(false)
    setRemoteStream(null)
    setRemotePeerId(null)
    setMessages([])
    setTypingUser(null)
  }, [])

  // Send message
  const sendMessage = useCallback(
    (text: string) => {
      if (!roomId || !username) return

      const timestamp = Date.now()
      const message = {
        id: `${ablySignaling.getClientId()}-${timestamp}`,
        roomId,
        from: ablySignaling.getClientId(),
        username,
        text,
        timestamp,
        read: false,
      }
      
      // Add to local state immediately for sender
      setMessages((prev) => [...prev, message])
      
      // Send to other users via Ably
      ablySignaling.sendMessage(roomId, text, username, timestamp)
    },
    [roomId, username]
  )

  // Send typing
  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (!roomId || !username) return
      ablySignaling.sendTyping(roomId, username, isTyping)
    },
    [roomId, username]
  )

  // Send emoji
  const sendEmoji = useCallback(
    (emoji: string) => {
      // TODO: Implement emoji sending via Ably
      console.log('Sending emoji:', emoji)
    },
    []
  )

  // Add screen track
  const addScreenTrack = useCallback(
    async (screenTrack: MediaStreamTrack, screenStream: MediaStream) => {
      if (!peerConnectionRef.current) {
        console.error('❌ No peer connection to add screen track')
        return
      }

      const pc = peerConnectionRef.current

      console.log('📺 Adding screen share track')

      // Find existing video sender
      const videoSender = pc.getSenders().find((s) => s.track?.kind === 'video')

      if (videoSender) {
        // Replace existing video track with screen track
        console.log('🔄 Replacing camera track with screen track')
        await videoSender.replaceTrack(screenTrack)
        console.log('✅ Replaced video track with screen track')
        
        // Force renegotiation to ensure remote peer gets the new track
        if (pc.signalingState === 'stable') {
          console.log('🔄 Triggering renegotiation for screen share')
          try {
            const offer = await pc.createOffer()
            await pc.setLocalDescription(offer)
            ablySignaling.sendOffer(roomId, offer)
            console.log('📤 Sent renegotiation offer for screen share')
          } catch (error) {
            console.error('❌ Error during screen share renegotiation:', error)
          }
        } else {
          console.log('⏳ Waiting for stable signaling state before renegotiation')
        }
      } else {
        // No existing video sender, add new track
        console.log('➕ Adding screen track as new sender')
        pc.addTrack(screenTrack, screenStream)
        console.log('✅ Added screen track')
      }
    },
    [roomId]
  )

  // Remove screen track
  const removeScreenTrack = useCallback(async () => {
    if (!peerConnectionRef.current || !localStreamRef.current) return

    console.log('📺 Removing screen share track')

    // Replace screen track with camera track
    const videoTrack = localStreamRef.current.getVideoTracks()[0]
    const sender = peerConnectionRef.current
      .getSenders()
      .find((s) => s.track?.kind === 'video')

    if (sender && videoTrack) {
      await sender.replaceTrack(videoTrack)
      console.log('✅ Replaced screen track with camera track')
    }
  }, [])

  return {
    isConnected,
    isInCall,
    remoteStream,
    remotePeerId,
    messages,
    typingUser,
    fallingEmojis,
    lastEmojiSender,
    joinCall,
    leaveCall,
    sendMessage,
    sendTyping,
    sendEmoji,
    addScreenTrack,
    removeScreenTrack,
  }
}
