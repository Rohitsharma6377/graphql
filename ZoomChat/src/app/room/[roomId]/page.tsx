'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useCallStore, useChatStore, useUIStore } from '@/stores'
import { ablySignaling } from '@/lib/ably-signaling'
import { Video, VideoOff, Mic, MicOff, PhoneOff, ScreenShare, MessageCircle, Send, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function RoomPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = typeof params?.roomId === 'string' ? params.roomId : 'default'
  
  // Auth from context
  const { user, isAuthenticated, loading } = useAuth()
  
  // Zustand stores - selective subscriptions
  const {
    joinCall,
    leaveCall,
    toggleCamera,
    toggleMic,
    startScreenShare,
    stopScreenShare,
    addParticipant,
    removeParticipant,
    updateParticipant,
    incrementCallDuration,
    setRemoteStream,
  } = useCallStore()
  
  const isInCall = useCallStore(state => state.isInCall)
  const isCameraOn = useCallStore(state => state.isCameraOn)
  const isMicOn = useCallStore(state => state.isMicOn)
  const isScreenSharing = useCallStore(state => state.isScreenSharing)
  const localStream = useCallStore(state => state.localStream)
  const screenStream = useCallStore(state => state.screenStream)
  const participants = useCallStore(state => state.participants)
  const callDuration = useCallStore(state => state.callDuration)
  const status = useCallStore(state => state.status)
  const remoteStreams = useCallStore(state => state.remoteStreams)
  
  const { sendMessage, addMessage, addSystemMessage, setTyping, loadMessages } = useChatStore()
  const messages = useChatStore(state => state.messages)
  const unreadCount = useChatStore(state => state.unreadCount)
  const isChatOpen = useChatStore(state => state.isOpen)
  const toggleChat = useChatStore(state => state.toggleChat)
  
  const { addToast } = useUIStore()
  
  // Local refs & state
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const screenVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map())
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map())
  const pendingIceCandidatesRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map())
  const inboundStreamsRef = useRef<Map<string, MediaStream>>(new Map())
  const [chatInput, setChatInput] = useState('')
  const [isInitialized, setIsInitialized] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [roomReady, setRoomReady] = useState(false)
  const [isChatVisible, setIsChatVisible] = useState(true) // Show chat by default
  const [showDebug, setShowDebug] = useState(false) // Debug panel
  
  // Auto-hide controls on mobile
  useEffect(() => {
    let timeout: NodeJS.Timeout
    const handleInteraction = () => {
      setShowControls(true)
      clearTimeout(timeout)
      timeout = setTimeout(() => setShowControls(false), 3000)
    }
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      window.addEventListener('touchstart', handleInteraction)
      timeout = setTimeout(() => setShowControls(false), 3000)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('touchstart', handleInteraction)
        clearTimeout(timeout)
      }
    }
  }, [])
  
  // WebRTC Peer Connection (per user) - UPGRADED WITH ALL FIXES
  const createPeerConnection = (userId: string) => {
    console.log('🔗 Creating peer connection for:', userId)
    console.log('🎥 Local stream available:', !!localStream)
    console.log('🎵 Local stream tracks:', localStream?.getTracks().length)
    
    // Clean up existing connection
    const existingPc = peerConnectionsRef.current.get(userId)
    if (existingPc) {
      console.log('🧹 Cleaning up existing peer connection')
      existingPc.ontrack = null
      existingPc.onicecandidate = null
      existingPc.onnegotiationneeded = null
      existingPc.close()
    }
    
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    })
    
    // Add local tracks to this peer connection
    if (localStream) {
      const tracks = localStream.getTracks()
      console.log('🎶 Adding', tracks.length, 'local tracks to peer', userId)
      tracks.forEach((track, index) => {
        console.log(`  ${index + 1}. ${track.kind} track (enabled: ${track.enabled}, readyState: ${track.readyState})`)
        pc.addTrack(track, localStream)
      })
    } else {
      console.warn('⚠️  No local stream available when creating peer connection for:', userId)
    }
    
    // Handle incoming tracks - UPGRADED WITH DUAL STREAM SUPPORT
    let inboundStream = inboundStreamsRef.current.get(userId) || new MediaStream()
    inboundStreamsRef.current.set(userId, inboundStream)
    
    pc.ontrack = (event) => {
      console.log('\n📺 === REMOTE TRACK RECEIVED ===')
      console.log('From user:', userId)
      console.log('Track kind:', event.track.kind)
      console.log('Track ID:', event.track.id)
      console.log('Track label:', event.track.label)
      console.log('Track enabled:', event.track.enabled)
      console.log('Track readyState:', event.track.readyState)
      console.log('Streams:', event.streams.length)
      
      // Use stream from event if available, otherwise build our own
      let stream: MediaStream
      if (event.streams && event.streams[0]) {
        stream = event.streams[0]
        console.log('✅ Using stream from event')
      } else {
        // Fallback for Safari/older browsers
        inboundStream.addTrack(event.track)
        stream = inboundStream
        console.log('✅ Added track to inbound stream (fallback mode)')
      }
      
      console.log('Stream ID:', stream.id)
      console.log('Stream tracks:', stream.getTracks().map(t => `${t.kind}:${t.label}`))
      
      setRemoteStream(userId, stream)
      console.log('✅ Remote stream set in store for:', userId)
      
      // Attach to video element with retry logic
      const attachStream = () => {
        const videoEl = remoteVideoRefs.current.get(userId)
        if (videoEl && stream) {
          videoEl.srcObject = stream
          console.log('✅ Stream attached to <video> element for:', userId)
          // Force play with retry
          const playPromise = videoEl.play()
          if (playPromise !== undefined) {
            playPromise.catch(err => {
              console.log('⚠️ Auto-play prevented, retrying...', err.message)
              setTimeout(() => videoEl.play().catch(() => {}), 500)
            })
          }
        } else {
          console.warn('⚠️ Video element not found for:', userId)
        }
      }
      
      attachStream()
      setTimeout(attachStream, 100)
      setTimeout(attachStream, 500)
      
      console.log('=== END REMOTE TRACK ===\n')
    }
    
    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('🧊 Sending ICE candidate to:', userId)
        ablySignaling.sendIceCandidate(roomId, event.candidate.toJSON(), userId)
      }
    }
    
    // Handle negotiation needed - CRITICAL FOR SCREEN SHARE
    pc.onnegotiationneeded = async () => {
      try {
        console.log('🔄 Negotiation needed for:', userId)
        if (pc.signalingState !== 'stable') {
          console.log('⏸️ Signaling state not stable, waiting...', pc.signalingState)
          return
        }
        
        console.log('📝 Creating offer for renegotiation...')
        const offer = await pc.createOffer()
        
        if (pc.signalingState !== 'stable') {
          console.log('⚠️ Signaling state changed during createOffer, aborting')
          return
        }
        
        await pc.setLocalDescription(offer)
        console.log('📤 Sending renegotiation offer to:', userId)
        ablySignaling.sendOffer(roomId, offer, userId)
        console.log('✅ Renegotiation offer sent')
      } catch (error) {
        console.error('❌ Renegotiation error:', error)
      }
    }
    
    // Connection state monitoring
    pc.onconnectionstatechange = () => {
      console.log('🔌 Connection state with', userId, ':', pc.connectionState)
      if (pc.connectionState === 'failed') {
        console.log('🔄 Connection failed, restarting ICE...')
        addToast({ message: `Connection failed with ${userId}`, type: 'error' })
        pc.restartIce()
      }
      if (pc.connectionState === 'connected') {
        console.log('✅ Connection established!')
        addToast({ message: 'Connected!', type: 'success' })
        
        // Process pending ICE candidates
        const pending = pendingIceCandidatesRef.current.get(userId) || []
        if (pending.length > 0) {
          console.log(`📦 Processing ${pending.length} pending ICE candidates`)
          pending.forEach(async (candidate) => {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidate))
            } catch (err) {
              console.error('❌ Error adding pending candidate:', err)
            }
          })
          pendingIceCandidatesRef.current.set(userId, [])
        }
      }
    }
    
    pc.oniceconnectionstatechange = () => {
      console.log('❄️ ICE state with', userId, ':', pc.iceConnectionState)
      if (pc.iceConnectionState === 'failed') {
        console.log('🔄 ICE failed, restarting...')
        pc.restartIce()
      }
    }
    
    peerConnectionsRef.current.set(userId, pc)
    return pc
  }
  
  // Setup Ably signaling listeners
  const setupAblyListeners = () => {
    console.log('\n🎧 === SETTING UP ABLY LISTENERS ===')
    console.log('Room ID:', roomId)
    console.log('Current User:', user?.name, user?.id)
    console.log('Current Participants:', participants.length)
    
    // Room joined confirmation
    ablySignaling.on('room-joined', ({ roomId: joinedRoomId, participants: existingParticipants }) => {
      console.log('\n✅ === ROOM-JOINED EVENT ===')
      console.log('Joined Room ID:', joinedRoomId)
      console.log('Existing Participants Count:', existingParticipants.length)
      console.log('Existing Participants:', existingParticipants)
      console.log('Current User ID:', user?.id || user?._id)
      
      // Add existing participants
      existingParticipants.forEach((p: any, index: number) => {
        console.log(`\n👥 Processing participant ${index + 1}:`, {
          userId: p.userId,
          username: p.username,
          isCurrentUser: p.userId === user?.id || p.userId === user?._id
        })
        
        if (p.userId !== user?.id && p.userId !== user?._id) {
          console.log('➕ Adding participant to store:', p.userId)
          addParticipant({
            id: p.userId,
            username: p.name || p.username || 'User',
            isCameraOn: p.isVideoOn || false,
            isMicOn: p.isAudioOn || false,
            isScreenSharing: p.isScreenSharing || false,
            stream: null
          })
        } else {
          console.log('⏭️ Skipping current user:', p.userId)
        }
      })
      
      console.log('➕ Room joined processing complete')
      
      // Read updated participants count directly from store
      const updatedParticipants = useCallStore.getState().participants
      console.log('Total participants in store:', updatedParticipants.length)
      console.log('Participants:', updatedParticipants.map(p => p.username))
      console.log('=== END ROOM-JOINED EVENT ===\n')
    })
    
    ablySignaling.on('user-joined', async ({ userId, user: joinedUser }) => {
      console.log('\n👤 === USER-JOINED EVENT ===')
      console.log('User ID:', userId)
      console.log('User Data:', joinedUser)
      console.log('Current User ID:', user?.id || user?._id)
      console.log('Is Current User:', userId === user?.id || userId === user?._id)
      console.log('Current Participants Before:', participants.map(p => ({ id: p.id, name: p.username })))
      
      const username = joinedUser?.name || 'User'
      
      console.log('➕ Adding participant to store...')
      addParticipant({ 
        id: userId, 
        username, 
        isCameraOn: true, 
        isMicOn: true, 
        isScreenSharing: false, 
        stream: null 
      })
      
      console.log('📢 Adding system message and toast')
      addSystemMessage(`${username} joined the room`)
      addToast({ message: `${username} joined`, type: 'success' })
      
      // Wait a bit for participant state to update
      await new Promise(resolve => setTimeout(resolve, 500))
      
      console.log('Current Participants After:', participants.map(p => ({ id: p.id, name: p.username })))
      
      // Create peer connection and send offer (works even without local media)
      console.log('🔗 Creating peer connection with:', userId)
      console.log('🎥 Local stream status:', !!localStream, 'tracks:', localStream?.getTracks().length)
      const pc = createPeerConnection(userId)
      try {
        console.log('📝 Creating offer...')
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        console.log('📤 Sending offer to:', userId)
        ablySignaling.sendOffer(roomId, offer, userId)
        console.log('✅ Offer sent successfully')
      } catch (error) {
        console.error('❌ Error creating offer:', error)
      }
      
      console.log('=== END USER-JOINED EVENT ===\n')
    })
    
    ablySignaling.on('user-left', ({ userId }) => {
      console.log('👋 USER LEFT EVENT:', userId)
      const participant = participants.find(p => p.id === userId)
      if (participant) {
        addSystemMessage(`${participant.username} left the room`)
        addToast({ message: `${participant.username} left`, type: 'info' })
      }
      
      // Close peer connection
      const pc = peerConnectionsRef.current.get(userId)
      if (pc) {
        pc.close()
        peerConnectionsRef.current.delete(userId)
      }
      
      removeParticipant(userId)
      remoteVideoRefs.current.delete(userId)
    })
    
    ablySignaling.on('offer', async ({ from, offer }) => {
      console.log('\n📨 === OFFER RECEIVED ===')
      console.log('From:', from)
      console.log('🎥 Local stream available:', !!localStream)
      
      let pc = peerConnectionsRef.current.get(from)
      if (!pc) {
        console.log('⚠️ Creating new peer connection for offer from:', from)
        pc = createPeerConnection(from)
      }
      
      try {
        // Wait for stable state if needed - FIX FOR RACE CONDITIONS
        if (pc.signalingState !== 'stable') {
          console.log('⏸️ Waiting for stable state... current:', pc.signalingState)
          await new Promise<void>((resolve) => {
            const checkState = () => {
              if (pc.signalingState === 'stable') {
                pc.removeEventListener('signalingstatechange', checkState)
                resolve()
              }
            }
            pc.addEventListener('signalingstatechange', checkState)
            // Timeout after 3 seconds
            setTimeout(() => {
              pc.removeEventListener('signalingstatechange', checkState)
              resolve()
            }, 3000)
          })
        }
        
        // Check remote description before setting
        if (!pc.remoteDescription) {
          console.log('🗒️ Setting remote description (offer)...')
          await pc.setRemoteDescription(new RTCSessionDescription(offer))
          console.log('✅ Remote description set')
        } else {
          console.log('⚠️ Remote description already exists, replacing...')
          await pc.setRemoteDescription(new RTCSessionDescription(offer))
        }
        
        // Process any pending ICE candidates now that we have remote description
        const pending = pendingIceCandidatesRef.current.get(from) || []
        if (pending.length > 0) {
          console.log(`📦 Adding ${pending.length} pending ICE candidates`)
          for (const candidate of pending) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidate))
              console.log('✅ Added pending ICE candidate')
            } catch (err) {
              console.error('❌ Error adding pending candidate:', err)
            }
          }
          pendingIceCandidatesRef.current.set(from, [])
        }
        
        console.log('📝 Creating answer...')
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        console.log('📤 Sending answer to:', from)
        await ablySignaling.sendAnswer(roomId, answer, from)
        console.log('✅ Answer sent successfully')
      } catch (error) {
        console.error('❌ Error handling offer:', error)
      }
      console.log('=== END OFFER HANDLING ===\n')
    })
    
    ablySignaling.on('answer', async ({ from, answer }) => {
      console.log('\n📨 === ANSWER RECEIVED ===')
      console.log('From:', from)
      const pc = peerConnectionsRef.current.get(from)
      if (!pc) {
        console.warn('⚠️ No peer connection found for answer from:', from)
        return
      }
      
      try {
        console.log('Signaling state:', pc.signalingState)
        
        // Only set remote description if we're in the right state
        if (pc.signalingState === 'have-local-offer') {
          console.log('🗒️ Setting remote description (answer)...')
          await pc.setRemoteDescription(new RTCSessionDescription(answer))
          console.log('✅ Remote description set from answer')
          
          // Process any pending ICE candidates
          const pending = pendingIceCandidatesRef.current.get(from) || []
          if (pending.length > 0) {
            console.log(`📦 Adding ${pending.length} pending ICE candidates`)
            for (const candidate of pending) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate))
                console.log('✅ Added pending ICE candidate')
              } catch (err) {
                console.error('❌ Error adding pending candidate:', err)
              }
            }
            pendingIceCandidatesRef.current.set(from, [])
          }
        } else {
          console.warn('⚠️ Unexpected signaling state for answer:', pc.signalingState)
        }
      } catch (error) {
        console.error('❌ Error setting remote description:', error)
      }
      console.log('=== END ANSWER HANDLING ===\n')
    })
    
    ablySignaling.on('ice-candidate', async ({ from, candidate }) => {
      console.log('🧊 ICE CANDIDATE from:', from)
      const pc = peerConnectionsRef.current.get(from)
      if (!pc) {
        console.warn('⚠️ No peer connection for ICE candidate from:', from)
        return
      }
      
      // Queue ICE candidates if we don't have remote description yet
      if (!pc.remoteDescription) {
        console.log('📦 Queuing ICE candidate (no remote description yet)')
        const queue = pendingIceCandidatesRef.current.get(from) || []
        queue.push(candidate)
        pendingIceCandidatesRef.current.set(from, queue)
        return
      }
      
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate))
        console.log('✅ Added ICE candidate from:', from)
      } catch (error) {
        console.error('❌ ICE candidate error:', error)
      }
    })
    
    ablySignaling.on('chat-message', ({ userId, username, text, timestamp }) => {
      console.log('💬 Chat message from:', username, text)
      addMessage({ 
        id: `${userId}-${timestamp}-${Math.random().toString(36).substr(2, 9)}`, 
        roomId, 
        userId, 
        username, 
        text, 
        timestamp, 
        read: false, 
        type: 'text' 
      })
    })
    
    ablySignaling.on('media-state-changed', ({ userId, isCameraOn, isMicOn, isScreenSharing }) => {
      console.log('🎥 Media state changed:', userId, { isCameraOn, isMicOn, isScreenSharing })
      updateParticipant(userId, { 
        isCameraOn: isCameraOn !== undefined ? isCameraOn : undefined, 
        isMicOn: isMicOn !== undefined ? isMicOn : undefined,
        isScreenSharing: isScreenSharing !== undefined ? isScreenSharing : undefined
      })
    })
    
    console.log('✅ All Ably listeners registered')
  }
  
  // Initialize
  useEffect(() => {
    if (loading) return // Wait for auth to load
    if (!isAuthenticated || !user) {
      router.push('/auth/guest')
      return
    }
    if (isInitialized) return
    
    const init = async () => {
      try {
        console.log('🎬 Initializing room...')
        
        // Initialize Ably connection
        await ablySignaling.init(roomId, user.id || user._id)
        
        // Setup listeners BEFORE joining
        setupAblyListeners()
        
        // Join the room via Ably
        await ablySignaling.joinRoom(user.name)
        
        // Update local call state
        await joinCall(roomId, user.id || user._id, user.name)
        
        // Load chat history
        await loadMessages(roomId)
        
        setIsInitialized(true)
        setRoomReady(true)
        
        console.log('✅ Room initialized successfully')
        addToast({ message: `Joined ${roomId.slice(0, 8)}...`, type: 'success' })
      } catch (error: any) {
        console.error('❌ Join failed:', error)
        addToast({ message: error.message || 'Failed to join', type: 'error' })
      }
    }
    init()
    return () => {
      if (isInCall) {
        console.log('🧹 Cleaning up room...')
        // Close all peer connections
        peerConnectionsRef.current.forEach(pc => pc.close())
        peerConnectionsRef.current.clear()
        // Leave Ably room
        ablySignaling.leaveRoom()
        ablySignaling.disconnect()
        // Update call state
        leaveCall()
      }
    }
  }, [user, roomId, isInitialized, loading, isAuthenticated])
  
  // Timer
  useEffect(() => {
    if (!isInCall) return
    const timer = setInterval(() => incrementCallDuration(), 1000)
    return () => clearInterval(timer)
  }, [isInCall])
  
  // Video refs
  useEffect(() => {
    if (localVideoRef.current && localStream) localVideoRef.current.srcObject = localStream
  }, [localStream])
  useEffect(() => {
    if (screenVideoRef.current && screenStream) screenVideoRef.current.srcObject = screenStream
  }, [screenStream])
  useEffect(() => {
    // remoteStreams is an object, not an array
    Object.entries(remoteStreams || {}).forEach(([userId, stream]) => {
      const video = remoteVideoRefs.current.get(userId)
      if (video && stream) {
        video.srcObject = stream
        console.log('📺 Attached remote stream for:', userId)
      }
    })
  }, [remoteStreams])
  
  const handleToggleCamera = () => {
    toggleCamera()
    ablySignaling.sendMediaState(roomId, {
      userId: user?.id || user?._id,
      isCameraOn: !isCameraOn,
      isMicOn,
      isScreenSharing
    })
  }
  const handleToggleMic = () => {
    toggleMic()
    ablySignaling.sendMediaState(roomId, {
      userId: user?.id || user?._id,
      isCameraOn,
      isMicOn: !isMicOn,
      isScreenSharing
    })
  }
  // Handle screen sharing - UPGRADED WITH PROPER RENEGOTIATION
  const handleScreenShare = async () => {
    if (isScreenSharing) {
      console.log('🛑 Stopping screen share')
      stopScreenShare()
      
      // Restore original camera and mic tracks
      if (localStream) {
        console.log('📹 Restoring original camera/mic tracks...')
        const videoTrack = localStream.getVideoTracks()[0]
        const audioTrack = localStream.getAudioTracks()[0]
        
        const restorePromises: Promise<any>[] = []
        
        peerConnectionsRef.current.forEach((pc, userId) => {
          // Restore video track
          if (videoTrack) {
            const videoSender = pc.getSenders().find(s => s.track?.kind === 'video')
            if (videoSender) {
              console.log(`📹 Restoring camera for ${userId}`)
              const promise = videoSender.replaceTrack(videoTrack)
                .then(() => console.log(`✅ Camera restored for ${userId}`))
                .catch(err => console.error(`❌ Failed to restore video for ${userId}:`, err))
              restorePromises.push(promise)
            }
          }
          
          // Restore audio track
          if (audioTrack) {
            const audioSender = pc.getSenders().find(s => s.track?.kind === 'audio')
            if (audioSender) {
              console.log(`🎤 Restoring mic for ${userId}`)
              const promise = audioSender.replaceTrack(audioTrack)
                .then(() => console.log(`✅ Mic restored for ${userId}`))
                .catch(err => console.error(`❌ Failed to restore audio for ${userId}:`, err))
              restorePromises.push(promise)
            }
          }
        })
        
        await Promise.all(restorePromises)
        console.log('✅ Original tracks restored')
      }
      
      // Broadcast stopped state
      await ablySignaling.sendMediaState(roomId, {
        userId: user?.id || user?._id,
        isScreenSharing: false,
        isCameraOn,
        isMicOn
      })
      
      addToast({ message: 'Screen sharing stopped', type: 'info' })
    } else {
      try {
        console.log('\n🖥️ === STARTING SCREEN SHARE ===')
        
        // Get screen stream directly
        const stream = await startScreenShare()
        console.log('📺 Screen stream received:', !!stream)
        console.log('🎥 Stream ID:', stream?.id)
        console.log('🎵 Stream tracks:', stream?.getTracks().map((t: any) => ({ kind: t.kind, id: t.id, enabled: t.enabled })))
        
        if (!stream) {
          throw new Error('Failed to get screen stream')
        }
        
        const videoTrack = stream.getVideoTracks()[0]
        if (!videoTrack) {
          console.error('❌ No video track in screen stream')
          throw new Error('No video track in screen stream')
        }
        
        console.log('🎬 Screen video track:', {
          id: videoTrack.id,
          kind: videoTrack.kind,
          enabled: videoTrack.enabled,
          readyState: videoTrack.readyState,
          label: videoTrack.label
        })
        
        // Handle screen share end (when user clicks "Stop sharing" in browser UI)
        videoTrack.onended = async () => {
          console.log('🛑 Screen share ended by user')
          stopScreenShare()
          
          // Restore camera track
          if (localStream) {
            const camTrack = localStream.getVideoTracks()[0]
            if (camTrack) {
              const restorePromises: Promise<any>[] = []
              peerConnectionsRef.current.forEach((pc, userId) => {
                const videoSender = pc.getSenders().find(s => s.track?.kind === 'video')
                if (videoSender) {
                  restorePromises.push(
                    videoSender.replaceTrack(camTrack)
                      .then(() => console.log(`✅ Camera restored for ${userId} after screen share end`))
                  )
                }
              })
              await Promise.all(restorePromises)
            }
          }
          
          await ablySignaling.sendMediaState(roomId, {
            userId: user?.id || user?._id,
            isScreenSharing: false,
            isCameraOn,
            isMicOn
          })
        }
        
        // Replace video track in ALL peer connections
        console.log('🔄 Replacing video tracks in peer connections...')
        let replacedCount = 0
        const replacePromises: Promise<any>[] = []
        
        peerConnectionsRef.current.forEach((pc, userId) => {
          console.log(`\n🔍 Processing peer: ${userId}`)
          const senders = pc.getSenders()
          console.log(`  Senders: ${senders.length}`)
          
          const videoSender = senders.find(s => s.track?.kind === 'video')
          
          if (videoSender) {
            // Replace existing video track
            console.log(`✅ Found video sender, replacing track...`)
            const promise = videoSender.replaceTrack(videoTrack)
              .then(() => {
                console.log(`✅ Video track replaced for: ${userId}`)
                replacedCount++
              })
              .catch(err => {
                console.error(`❌ Failed to replace track for ${userId}:`, err)
              })
            replacePromises.push(promise)
          } else {
            // No sender exists - add track and trigger renegotiation
            console.log(`⚠️ No video sender found, adding track...`)
            const promise = (async () => {
              try {
                pc.addTrack(videoTrack, stream)
                console.log(`✅ Video track added to peer: ${userId}`)
                
                // The onnegotiationneeded handler will fire automatically
                // But we can also manually trigger if needed
                replacedCount++
              } catch (err) {
                console.error(`❌ Failed to add video track for ${userId}:`, err)
              }
            })()
            replacePromises.push(promise)
          }
        })
        
        await Promise.all(replacePromises)
        console.log(`\n✅ Processed video tracks for ${replacedCount} peer connections\n`)
        
        // Handle audio track if present (system audio)
        const audioTracks = stream.getAudioTracks()
        if (audioTracks.length > 0) {
          console.log('🔊 Screen share includes system audio')
          const audioTrack = audioTracks[0]
          console.log('Audio track:', {
            id: audioTrack.id,
            label: audioTrack.label,
            enabled: audioTrack.enabled
          })
          
          const audioPromises: Promise<any>[] = []
          peerConnectionsRef.current.forEach((pc, userId) => {
            const audioSender = pc.getSenders().find(s => s.track?.kind === 'audio')
            if (audioSender) {
              console.log(`🔄 Replacing audio track for ${userId}`)
              audioPromises.push(
                audioSender.replaceTrack(audioTrack)
                  .then(() => console.log(`✅ Audio replaced for ${userId}`))
                  .catch(err => console.error(`❌ Failed to replace audio for ${userId}:`, err))
              )
            } else {
              console.log(`➕ Adding audio track for ${userId}`)
              pc.addTrack(audioTrack, stream)
              // onnegotiationneeded will fire
            }
          })
          await Promise.all(audioPromises)
        } else {
          console.log('ℹ️ No system audio in screen share')
        }
        
        // Broadcast screen sharing state
        console.log('📡 Broadcasting screen sharing state...')
        await ablySignaling.sendMediaState(roomId, {
          userId: user?.id || user?._id,
          isScreenSharing: true,
          isCameraOn,
          isMicOn
        })
        console.log('✅ Screen share state broadcasted')
        console.log('=== END SCREEN SHARE START ===\n')
        
        addToast({ message: 'Screen sharing started', type: 'success' })
      } catch (error) {
        console.error('❌ Screen share error:', error)
        addToast({ message: 'Screen share denied', type: 'error' })
      }
    }
  }

  const handleLeaveCall = () => {
    peerConnectionsRef.current.forEach(pc => pc.close())
    peerConnectionsRef.current.clear()
    leaveCall()
    router.push('/chat')
  }
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || !user) return
    
    // Send via Ably signaling
    const message = {
      userId: user.id || user._id,
      username: user.name,
      text: chatInput,
      timestamp: Date.now()
    }
    console.log('📤 Sending chat message:', message)
    ablySignaling.sendChatMessage(roomId, message)
    
    // Don't add locally - let server broadcast it back to avoid duplicates
    setChatInput('')
  }
  const formatDuration = (s: number) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }
  
  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading...</p>
        </div>
      </div>
    )
  }
  
  // Redirect if not authenticated
  if (!isAuthenticated || !user) {
    return null // useEffect will handle redirect
  }
  
  if (status === 'connecting') return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-white text-xl">Connecting...</p>
      </div>
    </div>
  )
  
  return (
    <div className="h-screen bg-gray-900 flex">
      {/* Main video area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <AnimatePresence>
          {(showControls || (typeof window !== 'undefined' && window.innerWidth >= 768)) && (
            <motion.div initial={{ y: -100 }} animate={{ y: 0 }} exit={{ y: -100 }} className="bg-gray-800 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between border-b border-gray-700">
              <div className="flex items-center gap-2 md:gap-4">
                <h1 className="text-white text-sm md:text-xl font-semibold truncate max-w-[150px] md:max-w-none">{roomId.slice(0, 15)}...</h1>
                <span className="text-gray-400 text-xs md:text-sm">{formatDuration(callDuration)}</span>
                <span className="text-gray-400 text-xs md:text-sm">{participants.length + 1} participant{participants.length !== 0 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowDebug(!showDebug)}
                  className="p-2 md:p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white text-xs"
                  title="Toggle Debug"
                >
                  🐛
                </button>
                <button 
                  onClick={() => setIsChatVisible(!isChatVisible)} 
                  className="relative p-2 md:p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white"
                >
                  <MessageCircle size={18} className="md:w-5 md:h-5" />
                  {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center">{unreadCount}</span>}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Video Grid */}
        <div className="flex-1 p-2 md:p-4 grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 overflow-y-auto">
          {/* Local Video */}
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 bg-black/70 px-2 md:px-3 py-1 rounded-lg text-white text-xs md:text-sm font-semibold">
              {user.name} (You)
            </div>
            {!isCameraOn && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <div className="text-center">
                  <VideoOff size={48} className="md:w-16 md:h-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm md:text-base">Camera Off</p>
                </div>
              </div>
            )}
            {!isMicOn && (
              <div className="absolute top-2 md:top-4 right-2 md:right-4">
                <div className="bg-red-600 p-1.5 md:p-2 rounded-full">
                  <MicOff size={14} className="md:w-4 md:h-4 text-white" />
                </div>
              </div>
            )}
          </div>
          
          {/* Screen Share */}
          {isScreenSharing && screenStream && (
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              <video ref={screenVideoRef} autoPlay playsInline className="w-full h-full object-contain" />
              <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 bg-blue-600 px-2 md:px-3 py-1 rounded-lg text-white text-xs md:text-sm font-semibold">
                📺 Your Screen
              </div>
            </div>
          )}
          
          {/* Remote Participants */}
          {participants.map((p) => {
            const stream = remoteStreams[p.id]
            return (
              <div key={p.id} className="relative bg-black rounded-lg overflow-hidden aspect-video">
                {stream ? (
                  <video 
                    ref={(el) => { 
                      if (el) {
                        remoteVideoRefs.current.set(p.id, el)
                        el.srcObject = stream
                      }
                    }} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <div className="text-center">
                      <div className="text-6xl mb-4">👤</div>
                      <p className="text-gray-400">Connecting...</p>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 bg-black/70 px-2 md:px-3 py-1 rounded-lg text-white text-xs md:text-sm font-semibold">
                  {p.username}
                </div>
                {!p.isCameraOn && stream && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <div className="text-center">
                      <VideoOff size={48} className="md:w-16 md:h-16 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm md:text-base">Camera Off</p>
                    </div>
                  </div>
                )}
                {!p.isMicOn && (
                  <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-red-600 p-1.5 md:p-2 rounded-full">
                    <MicOff size={14} className="md:w-4 md:h-4 text-white" />
                  </div>
                )}
              </div>
            )
          })}
          
          {/* Empty state when no participants */}
          {participants.length === 0 && !isScreenSharing && (
            <div className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video flex items-center justify-center border-2 border-dashed border-gray-600">
              <div className="text-center p-8">
                <div className="text-6xl mb-4">🔗</div>
                <h3 className="text-white text-lg font-semibold mb-2">Waiting for others to join</h3>
                <p className="text-gray-400 text-sm mb-4">Share the room link with others</p>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href)
                    addToast({ message: 'Room link copied!', type: 'success' })
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-all"
                >
                  📋 Copy Room Link
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Bottom Controls */}
        <AnimatePresence>
          {(showControls || (typeof window !== 'undefined' && window.innerWidth >= 768)) && (
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="bg-gray-800 px-4 md:px-6 py-4 md:py-6 flex items-center justify-center gap-3 md:gap-4 border-t border-gray-700">
              <button onClick={handleToggleCamera} className={`p-3 md:p-4 rounded-full transition-all touch-manipulation active:scale-95 ${isCameraOn ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}>
                {isCameraOn ? <Video size={20} className="md:w-6 md:h-6" /> : <VideoOff size={20} className="md:w-6 md:h-6" />}
              </button>
              <button onClick={handleToggleMic} className={`p-3 md:p-4 rounded-full transition-all touch-manipulation active:scale-95 ${isMicOn ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}>
                {isMicOn ? <Mic size={20} className="md:w-6 md:h-6" /> : <MicOff size={20} className="md:w-6 md:h-6" />}
              </button>
              <button onClick={handleScreenShare} className={`p-3 md:p-4 rounded-full transition-all touch-manipulation active:scale-95 ${isScreenSharing ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}>
                <ScreenShare size={20} className="md:w-6 md:h-6" />
              </button>
              <button onClick={handleLeaveCall} className="p-3 md:p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all ml-2 md:ml-4 touch-manipulation active:scale-95">
                <PhoneOff size={20} className="md:w-6 md:h-6" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Chat Panel - Always visible on desktop, toggle on mobile */}
      {isChatVisible && (
        <motion.div
          initial={{ x: 300 }}
          animate={{ x: 0 }}
          exit={{ x: 300 }}
          className="w-full md:w-96 bg-gray-800 border-l border-gray-700 flex flex-col fixed md:relative right-0 top-0 h-full z-50"
        >
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h3 className="text-white text-lg font-semibold flex items-center gap-2">
              <MessageCircle size={20} />
              Live Chat
            </h3>
            <button 
              onClick={() => setIsChatVisible(false)} 
              className="md:hidden text-gray-400 hover:text-white p-2 touch-manipulation"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <MessageCircle size={48} className="mx-auto mb-2 opacity-50" />
                <p>No messages yet</p>
                <p className="text-sm">Say hi! 👋</p>
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id}>
                {msg.type === 'system' ? (
                  <div className="text-center text-gray-400 text-sm py-2 bg-gray-900/50 rounded">
                    {msg.text}
                  </div>
                ) : (
                  <div className={msg.userId === user?._id ? 'text-right' : 'text-left'}>
                    <div className="text-xs text-gray-400 mb-1">{msg.username}</div>
                    <div className={`inline-block px-4 py-2 rounded-lg max-w-xs break-words ${msg.userId === user?._id ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'}`}>
                      {msg.text}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="px-4 md:px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all touch-manipulation active:scale-95 flex items-center gap-2"
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </motion.div>
      )}
      
      {/* Debug Panel */}
      {showDebug && (
        <div className="fixed bottom-20 right-4 bg-black/90 text-white p-4 rounded-lg text-xs max-w-md z-50 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold">🐛 Debug Info</h4>
            <button onClick={() => setShowDebug(false)} className="text-gray-400 hover:text-white">×</button>
          </div>
          <div className="space-y-1">
            <div><strong>Room ID:</strong> {roomId}</div>
            <div><strong>Username:</strong> {user?.name}</div>
            <div><strong>User ID:</strong> {user?._id}</div>
            <div><strong>Is In Call:</strong> {isInCall ? '✅' : '❌'}</div>
            <div><strong>Status:</strong> {status}</div>
            <div><strong>Participants:</strong> {participants.length}</div>
            <div><strong>Peer Connections:</strong> {peerConnectionsRef.current.size}</div>
            <div><strong>Remote Streams:</strong> {remoteStreams.size}</div>
            <div className="pt-2 border-t border-gray-700">
              <strong>Participants List:</strong>
              {participants.map(p => (
                <div key={p.id} className="ml-2">
                  • {p.username} ({p.id.slice(0, 8)}...) 
                  {remoteStreams.has(p.id) ? ' 📹' : ' ⏳'}
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-gray-700">
              <strong>Peer Connections:</strong>
              {Array.from(peerConnectionsRef.current.entries()).map(([id, pc]) => (
                <div key={id} className="ml-2">
                  • {id.slice(0, 8)}... - {pc.connectionState}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
    