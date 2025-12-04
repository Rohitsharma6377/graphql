// Hook for managing WebRTC call state

import { useState, useCallback, useRef, useEffect } from 'react'
import { signalingClient, Message, RoomUser } from '@/lib/signaling'
import { FallingEmoji } from '@/components/FallingEmojis'
import {
  createPeerConnection,
  addStreamToPeer,
  createOffer,
  createAnswer,
  handleAnswer,
  addIceCandidate,
  closePeerConnection,
  replaceVideoTrack,
  addAdditionalVideoTrack,
} from '@/lib/webrtc'

export interface UseCallStateReturn {
  isConnected: boolean
  isInCall: boolean
  remoteStream: MediaStream | null
  remotePeerId: string | null
  messages: Message[]
  roomUsers: RoomUser[]
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
  const [roomUsers, setRoomUsers] = useState<RoomUser[]>([])
  const [typingUser, setTypingUser] = useState<string | null>(null)
  const [fallingEmojis, setFallingEmojis] = useState<FallingEmoji[]>([])
  const [lastEmojiSender, setLastEmojiSender] = useState<{ emoji: string; username: string } | null>(null)

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const isInitiatorRef = useRef(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize signaling
  useEffect(() => {
    const socket = signalingClient.connect()

    socket.on('connect', () => {
      setIsConnected(true)
      console.log('Signaling connected')
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
      console.log('Signaling disconnected')
    })

    return () => {
      signalingClient.disconnect()
    }
  }, [])

  // Handle signaling events
  useEffect(() => {
    if (!isConnected) return

    // User joined
    signalingClient.on('user-joined', async ({ userId, username: joinedUsername }) => {
      console.log('User joined:', joinedUsername)
      setRemotePeerId(userId)

      // If we're already in the room, initiate the call
      if (peerConnectionRef.current && localStreamRef.current) {
        isInitiatorRef.current = true
        await createOffer(peerConnectionRef.current, signalingClient.getSocket()!, roomId)
      }
    })

    // User left
    signalingClient.on('user-left', ({ userId }) => {
      console.log('User left:', userId)
      if (userId === remotePeerId) {
        setRemoteStream(null)
        setRemotePeerId(null)
      }
    })

    // Received offer
    signalingClient.on('offer', async ({ from, offer }) => {
      console.log('Received offer from:', from)
      setRemotePeerId(from)

      if (peerConnectionRef.current) {
        await createAnswer(peerConnectionRef.current, signalingClient.getSocket()!, roomId, offer)
      }
    })

    // Received answer
    signalingClient.on('answer', async ({ from, answer }) => {
      console.log('Received answer from:', from)

      if (peerConnectionRef.current) {
        await handleAnswer(peerConnectionRef.current, answer)
      }
    })

    // Received ICE candidate
    signalingClient.on('ice-candidate', async ({ from, candidate }) => {
      if (peerConnectionRef.current) {
        await addIceCandidate(peerConnectionRef.current, candidate)
      }
    })

    // New message
    signalingClient.on('message:new', (message) => {
      setMessages((prev) => [...prev, message])
    })

    // Message read
    signalingClient.on('message:read', ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, read: true } : msg))
      )
    })

    // Typing indicator
    signalingClient.on('typing', ({ username: typingUsername, isTyping }) => {
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

    // Emoji reaction
    signalingClient.on('emoji:receive', ({ emoji, from, username: senderUsername, id }) => {
      console.log('🎉 Received emoji:', emoji, 'from', senderUsername, 'id:', id)
      
      // Add new emoji to the array
      const newEmoji = { id, emoji, timestamp: Date.now() }
      setFallingEmojis([newEmoji])
      
      console.log('✨ Triggering falling animation for:', emoji)
      
      // Only show notification if from someone else
      if (senderUsername !== username) {
        setLastEmojiSender({ emoji, username: senderUsername })
        console.log('📢 Showing notification from:', senderUsername)
      }
    })

    // Presence update
    signalingClient.on('presence:update', ({ users }) => {
      setRoomUsers(users)
    })

    return () => {
      signalingClient.off('user-joined')
      signalingClient.off('user-left')
      signalingClient.off('offer')
      signalingClient.off('answer')
      signalingClient.off('ice-candidate')
      signalingClient.off('message:new')
      signalingClient.off('message:read')
      signalingClient.off('typing')
      signalingClient.off('emoji:receive')
      signalingClient.off('presence:update')
    }
  }, [isConnected, roomId, remotePeerId])

  // Join call
  const joinCall = useCallback(
    async (callRoomId: string, callUsername: string, localStream: MediaStream) => {
      try {
        localStreamRef.current = localStream

        // Create peer connection
        const pc = createPeerConnection(
          callRoomId,
          signalingClient.getSocket()!,
          (stream) => {
            console.log('Setting remote stream')
            setRemoteStream(stream)
          }
        )

        peerConnectionRef.current = pc

        // Add local stream to peer connection
        addStreamToPeer(pc, localStream)

        // Join room via signaling
        signalingClient.joinRoom(callRoomId, callUsername)
        setIsInCall(true)

        console.log('Joined call in room:', callRoomId)
      } catch (error) {
        console.error('Error joining call:', error)
        throw error
      }
    },
    []
  )

  // Leave call
  const leaveCall = useCallback(() => {
    if (peerConnectionRef.current) {
      closePeerConnection(peerConnectionRef.current)
      peerConnectionRef.current = null
    }

    signalingClient.leaveRoom()
    setIsInCall(false)
    setRemoteStream(null)
    setRemotePeerId(null)
    setMessages([])
    setRoomUsers([])

    console.log('Left call')
  }, [])

  // Send chat message
  const sendMessage = useCallback(
    (text: string) => {
      if (!isInCall) return
      signalingClient.sendMessage(roomId, text, username)
    },
    [isInCall, roomId, username]
  )

  // Send typing indicator
  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (!isInCall) return
      signalingClient.sendTypingIndicator(roomId, username, isTyping)
    },
    [isInCall, roomId, username]
  )

  // Send emoji reaction
  const sendEmoji = useCallback(
    (emoji: string) => {
      if (!isInCall) return
      signalingClient.sendEmoji(roomId, emoji, username)
    },
    [isInCall, roomId, username]
  )

  // Add screen share track to existing connection
  const addScreenTrack = useCallback(
    async (screenTrack: MediaStreamTrack, screenStream: MediaStream) => {
      if (!peerConnectionRef.current) return

      try {
        // Try to add as additional track (some browsers support multiple video tracks)
        addAdditionalVideoTrack(peerConnectionRef.current, screenTrack, screenStream)

        // Renegotiate
        if (isInitiatorRef.current) {
          await createOffer(peerConnectionRef.current, signalingClient.getSocket()!, roomId)
        }

        console.log('Added screen share track')
      } catch (error) {
        console.error('Error adding screen track, trying replaceTrack:', error)

        // Fallback: replace camera track with screen track
        await replaceVideoTrack(peerConnectionRef.current, screenTrack)
      }
    },
    [roomId]
  )

  // Remove screen share track
  const removeScreenTrack = useCallback(async () => {
    if (!peerConnectionRef.current || !localStreamRef.current) return

    // Replace screen track with camera track
    const cameraTrack = localStreamRef.current.getVideoTracks()[0]
    if (cameraTrack) {
      await replaceVideoTrack(peerConnectionRef.current, cameraTrack)

      // Renegotiate
      if (isInitiatorRef.current) {
        await createOffer(peerConnectionRef.current, signalingClient.getSocket()!, roomId)
      }
    }

    console.log('Removed screen share track')
  }, [roomId])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      leaveCall()
    }
  }, [leaveCall])

  return {
    isConnected,
    isInCall,
    remoteStream,
    remotePeerId,
    messages,
    roomUsers,
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
