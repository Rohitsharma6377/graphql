// Hook for managing WebRTC call state with Ably signaling (Vercel-compatible)

import { useState, useCallback, useRef, useEffect } from 'react'
import { ablySignaling, Message } from '@/lib/ably-signaling'
import { FallingEmoji } from '@/components/FallingEmojis'

// WebRTC configuration
const iceServers: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
]

function createPeerConnection(): RTCPeerConnection {
  const config: RTCConfiguration = {
    iceServers,
    iceCandidatePoolSize: 10,
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require',
  }
  return new RTCPeerConnection(config)
}

function closePeerConnection(pc: RTCPeerConnection): void {
  pc.close()
  console.log('🔌 Peer connection closed')
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

      if (peerConnectionRef.current) {
        isInitiatorRef.current = false
        console.log('📝 Creating answer...')
        
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer))
        const answer = await peerConnectionRef.current.createAnswer()
        await peerConnectionRef.current.setLocalDescription(answer)
        ablySignaling.sendAnswer(roomId, answer)
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
      setMessages((prev) => [...prev, message])
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

        // Create peer connection
        const pc = createPeerConnection()
        peerConnectionRef.current = pc

        // Add local stream
        localStream.getTracks().forEach((track) => {
          pc.addTrack(track, localStream)
        })

        // Handle remote stream
        pc.ontrack = (event: RTCTrackEvent) => {
          console.log('🎥 Received remote track:', event.track.kind)
          const stream = event.streams[0]
          setRemoteStream(stream)
        }

        // Handle ICE candidates
        pc.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
          if (event.candidate) {
            console.log('🧊 Sending ICE candidate')
            ablySignaling.sendIceCandidate(roomId, event.candidate.toJSON())
          }
        }

        // Connection state
        pc.onconnectionstatechange = () => {
          console.log('🔌 Connection state:', pc.connectionState)
          if (pc.connectionState === 'connected') {
            console.log('✅ Peer connection established!')
          } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
            console.warn('⚠️ Connection lost')
            setRemoteStream(null)
          }
        }

        // Join room via Ably
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
      if (!peerConnectionRef.current) return

      console.log('📺 Adding screen share track')

      // Replace video track with screen track
      const sender = peerConnectionRef.current
        .getSenders()
        .find((s) => s.track?.kind === 'video')

      if (sender) {
        await sender.replaceTrack(screenTrack)
        console.log('✅ Replaced video track with screen track')
      }
    },
    []
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
