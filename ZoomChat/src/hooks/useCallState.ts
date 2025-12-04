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
      const myId = signalingClient.getSocket()?.id || ''
      
      // CRITICAL: Ignore if this is us (same socket ID)
      if (userId === myId) {
        console.log('⚠️ Ignoring self-join event')
        return
      }
      
      console.log('👥 User joined:', joinedUsername, 'ID:', userId)
      console.log('📍 My ID:', myId)
      setRemotePeerId(userId)

      // If we're already in the room, determine who initiates based on socket IDs
      if (peerConnectionRef.current && localStreamRef.current) {
        
        // Only initiate if our ID is "greater" to ensure only one peer initiates
        if (myId > userId) {
          console.log('🎯 I will initiate the offer (my ID is higher)')
          isInitiatorRef.current = true
          
          // Small delay to ensure both peers are ready
          setTimeout(async () => {
            if (peerConnectionRef.current && remotePeerId) {
              console.log('📤 Creating and sending offer...')
              await createOffer(peerConnectionRef.current, signalingClient.getSocket()!, roomId)
            }
          }, 500)
        } else {
          console.log('⏳ Waiting for other peer to initiate (their ID is higher)')
          isInitiatorRef.current = false
        }
      } else {
        console.warn('⚠️ Peer connection or local stream not ready')
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
      console.log('📩 Received offer from:', from, 'Current state:', peerConnectionRef.current?.signalingState)
      
      // Ignore offers from ourselves
      if (from === signalingClient.getSocket()?.id) {
        console.warn('⚠️ Ignoring offer from self')
        return
      }
      
      setRemotePeerId(from)

      if (peerConnectionRef.current) {
        isInitiatorRef.current = false
        console.log('📝 Creating answer...')
        await createAnswer(peerConnectionRef.current, signalingClient.getSocket()!, roomId, offer)
      } else {
        console.error('❌ No peer connection to create answer!')
      }
    })

    // Received answer
    signalingClient.on('answer', async ({ from, answer }) => {
      console.log('📩 Received answer from:', from)
      
      // Ignore answers from ourselves
      if (from === signalingClient.getSocket()?.id) {
        console.warn('⚠️ Ignoring answer from self')
        return
      }

      if (peerConnectionRef.current) {
        console.log('✅ Setting remote description (answer)...')
        await handleAnswer(peerConnectionRef.current, answer)
      } else {
        console.error('❌ No peer connection to handle answer!')
      }
    })

    // Received ICE candidate
    signalingClient.on('ice-candidate', async ({ from, candidate }) => {
      console.log('🧊 Received ICE candidate from:', from, 'type:', candidate.candidate?.split(' ')[7])
      
      // Ignore candidates from ourselves
      if (from === signalingClient.getSocket()?.id) {
        return
      }
      
      if (peerConnectionRef.current) {
        await addIceCandidate(peerConnectionRef.current, candidate)
      } else {
        console.warn('⚠️ No peer connection for ICE candidate')
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
        // Prevent duplicate joins
        if (isInCall && peerConnectionRef.current) {
          console.warn('⚠️ Already in a call, cleaning up first')
          if (peerConnectionRef.current) {
            closePeerConnection(peerConnectionRef.current)
            peerConnectionRef.current = null
          }
          signalingClient.leaveRoom()
          setIsInCall(false)
          // Small delay to ensure cleanup
          await new Promise(resolve => setTimeout(resolve, 500))
        }
        
        console.log('🚀 Joining call:', callRoomId, 'as', callUsername)
        localStreamRef.current = localStream

        // Create peer connection
        const pc = createPeerConnection(
          callRoomId,
          signalingClient.getSocket()!,
          (stream) => {
            console.log('✅ Setting remote stream')
            setRemoteStream(stream)
          }
        )

        // Add connection timeout (30 seconds)
        const connectionTimeout = setTimeout(() => {
          if (pc.iceConnectionState !== 'connected' && pc.iceConnectionState !== 'completed') {
            console.warn('⚠️ Connection timeout - attempting to restart ICE')
            pc.restartIce()
          }
        }, 30000)

        // Clear timeout on successful connection
        pc.oniceconnectionstatechange = () => {
          console.log('🔌 ICE connection state:', pc.iceConnectionState)
          if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
            clearTimeout(connectionTimeout)
          }
        }

        peerConnectionRef.current = pc

        // Add local stream to peer connection
        addStreamToPeer(pc, localStream)

        // Join room via signaling
        signalingClient.joinRoom(callRoomId, callUsername)
        setIsInCall(true)

        console.log('✅ Joined call in room:', callRoomId)
      } catch (error) {
        console.error('❌ Error joining call:', error)
        throw error
      }
    },
    [isInCall]
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
        // Replace camera track with screen track (more reliable than adding multiple tracks)
        const sender = await replaceVideoTrack(peerConnectionRef.current, screenTrack)
        
        if (!sender) {
          // If no video sender exists, add the track
          addAdditionalVideoTrack(peerConnectionRef.current, screenTrack, screenStream)
        }

        // Always renegotiate when changing tracks, regardless of who initiated originally
        console.log('Renegotiating for screen share...')
        await createOffer(peerConnectionRef.current, signalingClient.getSocket()!, roomId)

        console.log('Added screen share track and renegotiated')
      } catch (error) {
        console.error('Error adding screen track:', error)
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

      // Always renegotiate when changing tracks
      console.log('Renegotiating after stopping screen share...')
      await createOffer(peerConnectionRef.current, signalingClient.getSocket()!, roomId)
    }

    console.log('Removed screen share track and renegotiated')
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
