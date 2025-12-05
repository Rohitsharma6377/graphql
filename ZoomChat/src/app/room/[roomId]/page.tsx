'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState, Fragment } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useCallStore, useChatStore, useUIStore } from '@/stores'
import { ablySignaling } from '@/lib/ably-signaling'
import { Video, VideoOff, Mic, MicOff, PhoneOff, ScreenShare, MessageCircle, Send, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme, themes } from '@/hooks/useTheme'
import FloatingHearts from '@/components/FloatingHearts'
import RainyBackground from '@/components/RainyBackground'
import ThemeSwitcher from '@/components/ThemeSwitcher'
import SparkleEffect from '@/components/SparkleEffect'
import RomanticRoses from '@/components/RomanticRoses'
import SunsetBirds from '@/components/SunsetBirds'
import OceanWaves from '@/components/OceanWaves'
import NightLofiBackground from '@/components/animations/NightLofiBackground'

export default function RoomPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = typeof params?.roomId === 'string' ? params.roomId : 'default'
  
  // Auth from context
  const { user, isAuthenticated, loading } = useAuth()
  
  // Theme
  const { theme } = useTheme()
  
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
  const localScreenVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map())
  const remoteScreenRefs = useRef<Map<string, HTMLVideoElement>>(new Map())
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map())
  const pendingIceCandidatesRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map())
  const inboundStreamsRef = useRef<Map<string, MediaStream>>(new Map())
  const screenStreamRefs = useRef<Map<string, MediaStream>>(new Map())
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
    console.log('📺 Screen sharing active:', isScreenSharing)
    
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
    
    // Add camera/mic tracks if available
    if (localStream) {
      const tracks = localStream.getTracks()
      console.log(`🎶 Adding ${tracks.length} camera/mic tracks to peer ${userId}`)
      tracks.forEach((track, index) => {
        console.log(`  ${index + 1}. ${track.kind} track (enabled: ${track.enabled}, readyState: ${track.readyState}, label: ${track.label})`)
        pc.addTrack(track, localStream)
      })
    } else {
      console.warn('⚠️ No camera/mic stream when creating peer connection for:', userId)
    }
    
    // ALSO add screen tracks if screen sharing is active
    if (isScreenSharing && screenStream) {
      const screenTracks = screenStream.getTracks()
      console.log(`📺 ALSO adding ${screenTracks.length} screen tracks to peer ${userId}`)
      screenTracks.forEach((track, index) => {
        console.log(`  ${index + 1}. ${track.kind} screen track (label: ${track.label})`)
        pc.addTrack(track, screenStream)
      })
    }
    
    // Handle incoming tracks - UPGRADED WITH DUAL STREAM SUPPORT (CAMERA + SCREEN)
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
      console.log('Stream tracks:', stream.getTracks().map((t: any) => `${t.kind}:${t.label}`))
      
      // Detect if this is a screen share track by label
      const isScreenTrack = event.track.label.includes('screen') || 
                           event.track.label.includes('Screen') ||
                           event.track.label.includes('monitor') ||
                           event.track.label.includes('window')
      
      if (isScreenTrack && event.track.kind === 'video') {
        console.log('📺 SCREEN SHARE TRACK detected!')
        screenStreamRefs.current.set(userId, stream)
        
        // Attach to screen video element
        const attachScreen = () => {
          const screenEl = remoteScreenRefs.current.get(userId)
          if (screenEl && stream) {
            screenEl.srcObject = stream
            console.log('✅ Screen stream attached to element for:', userId)
            screenEl.play().catch(err => {
              console.log('⚠️ Screen auto-play prevented, retrying...', err.message)
              setTimeout(() => screenEl.play().catch(() => {}), 500)
            })
          }
        }
        attachScreen()
        setTimeout(attachScreen, 100)
      } else {
        console.log('📹 CAMERA/MIC TRACK detected')
        setRemoteStream(userId, stream)
        
        // Attach to camera video element
        const attachStream = () => {
          const videoEl = remoteVideoRefs.current.get(userId)
          if (videoEl && stream) {
            videoEl.srcObject = stream
            console.log('✅ Camera stream attached to element for:', userId)
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
      }
      
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
      
      // CRITICAL FIX: Create peer connections to existing participants
      // This ensures bidirectional connections so screen share works immediately
      if (updatedParticipants.length > 0) {
        console.log('\n🔗 Creating peer connections to existing participants...')
        updatedParticipants.forEach(async (participant: any) => {
          console.log(`🔗 Creating peer for existing participant: ${participant.id}`)
          const pc = createPeerConnection(participant.id)
          
          // Create and send offer
          try {
            const offer = await pc.createOffer()
            await pc.setLocalDescription(offer)
            await ablySignaling.sendOffer(roomId, offer, participant.id)
            console.log(`✅ Sent offer to existing participant: ${participant.id}`)
          } catch (error) {
            console.error(`❌ Error sending offer to ${participant.id}:`, error)
          }
        })
      }
      
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
  
  // Apply theme background
  useEffect(() => {
    document.body.style.background = themes[theme].gradient
  }, [theme])
  
  // Timer
  useEffect(() => {
    if (!isInCall) return
    const timer = setInterval(() => incrementCallDuration(), 1000)
    return () => clearInterval(timer)
  }, [isInCall])
  
  // Video refs
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
      console.log('✅ Local camera stream attached to video element')
    }
  }, [localStream])
  
  useEffect(() => {
    if (localScreenVideoRef.current && screenStream) {
      localScreenVideoRef.current.srcObject = screenStream
      console.log('✅ Local screen stream attached to video element')
    }
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
  // Handle screen sharing - UPGRADED TO ADD TRACKS (NOT REPLACE) SO CAMERA STAYS ON
  const handleScreenShare = async () => {
    if (isScreenSharing) {
      console.log('🛑 Stopping screen share')
      stopScreenShare()
      
      // Remove screen tracks from all peer connections
      if (screenStream) {
        console.log('🗑️ Removing screen tracks from peer connections...')
        const screenTracks = screenStream.getTracks()
        
        peerConnectionsRef.current.forEach((pc, userId) => {
          const senders = pc.getSenders()
          screenTracks.forEach(track => {
            const sender = senders.find(s => s.track?.id === track.id)
            if (sender) {
              console.log(`🗑️ Removing screen track from ${userId}`)
              pc.removeTrack(sender)
            }
          })
        })
        console.log('✅ Screen tracks removed')
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
        console.log('\n🖥️ === STARTING SCREEN SHARE (MULTI-TRACK MODE) ===')
        
        // Get screen stream
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
        
        // Handle screen share end
        videoTrack.onended = async () => {
          console.log('🛑 Screen share ended by user')
          stopScreenShare()
          
          // Remove screen tracks
          peerConnectionsRef.current.forEach((pc, userId) => {
            const senders = pc.getSenders()
            const screenSenders = senders.filter(s => 
              s.track?.label.includes('screen') || 
              s.track?.label.includes('Screen') ||
              s.track?.label.includes('monitor')
            )
            screenSenders.forEach(sender => {
              console.log(`🗑️ Removing screen sender for ${userId}`)
              pc.removeTrack(sender)
            })
          })
          
          await ablySignaling.sendMediaState(roomId, {
            userId: user?.id || user?._id,
            isScreenSharing: false,
            isCameraOn,
            isMicOn
          })
        }
        
        // ADD screen tracks to all peer connections (DON'T REPLACE camera)
        console.log('➕ Adding screen tracks to peer connections (keeping camera)...')
        console.log('📊 Total peer connections:', peerConnectionsRef.current.size)
        console.log('📊 Peer connection IDs:', Array.from(peerConnectionsRef.current.keys()))
        
        if (peerConnectionsRef.current.size === 0) {
          console.warn('⚠️ No peer connections found! Screen will not be shared yet.')
          console.log('💡 Screen will be shared when other users join.')
        }
        
        let addedCount = 0
        const addPromises: Promise<any>[] = []
        
        peerConnectionsRef.current.forEach((pc, userId) => {
          console.log(`\n➕ Adding screen track to peer: ${userId}`)
          const senders = pc.getSenders()
          console.log(`  Current senders: ${senders.length}`)
          
          // Always ADD screen track (never replace camera)
          const promise = (async () => {
            try {
              pc.addTrack(videoTrack, stream)
              console.log(`✅ Screen track added to peer: ${userId}`)
              addedCount++
            } catch (err) {
              console.error(`❌ Failed to add screen track for ${userId}:`, err)
            }
          })()
          addPromises.push(promise)
        })
        
        await Promise.all(addPromises)
        console.log(`\n✅ Added screen tracks to ${addedCount} peer connections\n`)
        
        // Handle audio track if present (system audio)
        const audioTracks = stream.getAudioTracks()
        if (audioTracks.length > 0) {
          console.log('🔊 Screen share includes system audio')
          const audioTrack = audioTracks[0]
          
          const audioPromises: Promise<any>[] = []
          peerConnectionsRef.current.forEach((pc, userId) => {
            console.log(`➕ Adding system audio for ${userId}`)
            pc.addTrack(audioTrack, stream)
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
    <>
      {/* Theme Background Animations */}
      {theme === 'default' && (
        <>
          <FloatingHearts />
          <SparkleEffect />
        </>
      )}
      {theme === 'romantic' && (
        <>
          <RomanticRoses />
          <FloatingHearts />
          <SparkleEffect />
        </>
      )}
      {theme === 'rainy' && (
        <>
          <RainyBackground />
        </>
      )}
      {theme === 'sunset' && (
        <>
          <SunsetBirds />
          <FloatingHearts />
          <SparkleEffect />
        </>
      )}
      {theme === 'ocean' && (
        <>
          <OceanWaves />
          <FloatingHearts />
          <SparkleEffect />
        </>
      )}
      {theme === 'nightlofi' && (
        <>
          <NightLofiBackground />
        </>
      )}

      {/* Theme Switcher */}
      <ThemeSwitcher />

      {/* Main Room Content */}
      <div className="h-screen bg-transparent flex relative z-10">
      {/* Main video area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <AnimatePresence>
          {(showControls || (typeof window !== 'undefined' && window.innerWidth >= 768)) && (
            <motion.div initial={{ y: -100 }} animate={{ y: 0 }} exit={{ y: -100 }} className="bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20 backdrop-blur-xl px-4 md:px-6 py-3 md:py-4 flex items-center justify-between border-b border-white/20 shadow-xl">
              <div className="flex items-center gap-2 md:gap-4">
                <h1 className="text-white text-sm md:text-xl font-bold truncate max-w-[150px] md:max-w-none drop-shadow-lg flex items-center gap-2">
                  💕 {roomId.slice(0, 15)}...
                </h1>
                <span className="text-white/80 text-xs md:text-sm font-medium bg-white/10 px-2 py-1 rounded-full backdrop-blur-sm">⏱️ {formatDuration(callDuration)}</span>
                <span className="text-white/80 text-xs md:text-sm font-medium bg-white/10 px-2 py-1 rounded-full backdrop-blur-sm">👥 {participants.length + 1}</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowDebug(!showDebug)}
                  className="p-2 md:p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-xs border border-white/20 transition-all"
                  title="Toggle Debug"
                >
                  🐛
                </button>
                <button 
                  onClick={() => setIsChatVisible(!isChatVisible)} 
                  className="relative p-2 md:p-3 rounded-full bg-gradient-to-r from-pink-500/30 to-purple-500/30 hover:from-pink-500/50 hover:to-purple-500/50 backdrop-blur-sm text-white border border-white/20 transition-all"
                >
                  <MessageCircle size={18} className="md:w-5 md:h-5" />
                  {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center animate-pulse shadow-lg">{unreadCount}</span>}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Video Grid - UPGRADED: Shows camera + screen for each user */}
        <div className="flex-1 p-2 md:p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 overflow-y-auto">
          {/* Local Camera */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative bg-black/30 backdrop-blur-sm rounded-2xl overflow-hidden aspect-video shadow-2xl border-2 border-transparent bg-gradient-to-r from-pink-500/50 via-purple-500/50 to-blue-500/50 p-[2px]"
          >
            <div className="bg-black/40 rounded-2xl overflow-hidden h-full w-full">
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 px-3 md:px-4 py-1.5 rounded-full text-white text-xs md:text-sm font-bold shadow-lg backdrop-blur-sm animate-pulse">
              💕 {user.name} (You)
            </div>
            {!isCameraOn && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-center"
                >
                  <VideoOff size={48} className="md:w-16 md:h-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm md:text-base font-semibold">Camera Off</p>
                </motion.div>
              </div>
            )}
            {!isMicOn && (
              <div className="absolute top-2 md:top-4 right-2 md:right-4">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-red-600 p-2 md:p-2.5 rounded-full shadow-lg"
                >
                  <MicOff size={14} className="md:w-5 md:h-5 text-white" />
                </motion.div>
              </div>
            )}
            </div>
          </motion.div>
          
          {/* Local Screen Share */}
          {isScreenSharing && screenStream && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative bg-black/30 backdrop-blur-sm rounded-2xl overflow-hidden aspect-video shadow-2xl border-2 border-transparent bg-gradient-to-r from-green-400/50 via-emerald-500/50 to-teal-500/50 p-[2px]"
            >
              <div className="bg-black/40 rounded-2xl overflow-hidden h-full w-full">
              <video ref={localScreenVideoRef} autoPlay playsInline className="w-full h-full object-contain bg-gradient-to-br from-gray-900/50 to-black/50" />
              <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 px-3 md:px-4 py-1.5 rounded-full text-white text-xs md:text-sm font-bold shadow-lg flex items-center gap-2 backdrop-blur-sm">
                <ScreenShare size={16} />
                🖥️ Your Screen
              </div>
              <div className="absolute top-2 right-2 bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-1 rounded-full text-white text-xs font-bold animate-pulse shadow-lg">
                ✨ LIVE
              </div>
              </div>
            </motion.div>
          )}
          
          {/* Remote Participants - Camera AND Screen */}
          {participants.map((p: any) => {
            const stream = remoteStreams[p.id]
            const screenStream = screenStreamRefs.current.get(p.id)
            
            return (
              <Fragment key={p.id}>
                {/* Remote User Camera */}
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative bg-black/30 backdrop-blur-sm rounded-2xl overflow-hidden aspect-video shadow-2xl border-2 border-transparent bg-gradient-to-r from-purple-500/50 via-pink-500/50 to-blue-500/50 p-[2px]"
                >
                  <div className="bg-black/40 rounded-2xl overflow-hidden h-full w-full">
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
                    <div className="w-full h-full flex items-center justify-center bg-black/50 backdrop-blur-md">
                      <motion.div 
                        animate={{ 
                          scale: [1, 1.1, 1],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity
                        }}
                        className="text-center"
                      >
                        <div className="text-6xl mb-4">💞</div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
                          <p className="text-white/60">Connecting...</p>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </motion.div>
                    </div>
                  )}
                  <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 backdrop-blur-sm px-3 md:px-4 py-1.5 rounded-full text-white text-xs md:text-sm font-bold shadow-lg">
                    💕 {p.username}
                  </div>
                  {!p.isCameraOn && stream && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md">
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-center"
                      >
                        <VideoOff size={48} className="md:w-16 md:h-16 text-pink-300/60 mx-auto mb-2" />
                        <p className="text-white/60 text-sm md:text-base font-semibold">Camera Off</p>
                      </motion.div>
                    </div>
                  )}
                  {!p.isMicOn && (
                    <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-red-600 p-2 md:p-2.5 rounded-full shadow-lg">
                      <MicOff size={14} className="md:w-5 md:h-5 text-white" />
                    </div>
                  )}
                  {p.isScreenSharing && (
                    <div className="absolute top-2 left-2 bg-green-600 px-2 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1">
                      <ScreenShare size={12} />
                      Sharing
                    </div>
                  )}
                  </div>
                </motion.div>
                
                {/* Remote User Screen Share */}
                {screenStream && (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="relative bg-black/30 backdrop-blur-sm rounded-2xl overflow-hidden aspect-video shadow-2xl border-2 border-transparent bg-gradient-to-r from-green-400/50 via-emerald-500/50 to-teal-500/50 p-[2px]"
                  >
                    <div className="bg-black/40 rounded-2xl overflow-hidden h-full w-full">
                    <video 
                      ref={(el) => {
                        if (el) {
                          remoteScreenRefs.current.set(p.id, el)
                          el.srcObject = screenStream
                        }
                      }}
                      autoPlay 
                      playsInline 
                      className="w-full h-full object-contain bg-gray-900" 
                    />
                    <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 px-3 md:px-4 py-1.5 rounded-full text-white text-xs md:text-sm font-bold shadow-lg flex items-center gap-2 backdrop-blur-sm">
                      <ScreenShare size={16} />
                      🖥️ {p.username}'s Screen
                    </div>
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-1 rounded-full text-white text-xs font-bold animate-pulse shadow-lg">
                      ✨ LIVE
                    </div>
                    </div>
                  </motion.div>
                )}
              </Fragment>
            )
          })}
          
          {/* Empty state when no participants */}
          {participants.length === 0 && !isScreenSharing && (
            <div className="relative bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-blue-500/10 backdrop-blur-sm rounded-2xl overflow-hidden aspect-video flex items-center justify-center border-2 border-dashed border-white/20">
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
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20 backdrop-blur-xl px-4 md:px-6 py-4 md:py-6 flex items-center justify-center gap-3 md:gap-4 border-t border-white/20 shadow-2xl">
              <button onClick={handleToggleCamera} className={`p-3 md:p-4 rounded-full transition-all touch-manipulation active:scale-95 shadow-lg border-2 ${isCameraOn ? 'bg-gradient-to-r from-blue-500/30 to-purple-500/30 hover:from-blue-500/50 hover:to-purple-500/50 border-blue-400/30 text-white backdrop-blur-sm' : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 border-red-400 text-white'}`}>
                {isCameraOn ? <Video size={20} className="md:w-6 md:h-6" /> : <VideoOff size={20} className="md:w-6 md:h-6" />}
              </button>
              <button onClick={handleToggleMic} className={`p-3 md:p-4 rounded-full transition-all touch-manipulation active:scale-95 shadow-lg border-2 ${isMicOn ? 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 hover:from-green-500/50 hover:to-emerald-500/50 border-green-400/30 text-white backdrop-blur-sm' : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 border-red-400 text-white'}`}>
                {isMicOn ? <Mic size={20} className="md:w-6 md:h-6" /> : <MicOff size={20} className="md:w-6 md:h-6" />}
              </button>
              <button onClick={handleScreenShare} className={`p-3 md:p-4 rounded-full transition-all touch-manipulation active:scale-95 shadow-lg border-2 ${isScreenSharing ? 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 border-green-400 text-white animate-pulse' : 'bg-gradient-to-r from-purple-500/30 to-blue-500/30 hover:from-purple-500/50 hover:to-blue-500/50 border-purple-400/30 text-white backdrop-blur-sm'}`}>
                <ScreenShare size={20} className="md:w-6 md:h-6" />
              </button>
              <button onClick={handleLeaveCall} className="p-3 md:p-4 rounded-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white transition-all ml-2 md:ml-4 touch-manipulation active:scale-95 shadow-xl border-2 border-red-400">
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
          className="w-full md:w-96 bg-black/20 backdrop-blur-lg border-l border-white/10 flex flex-col fixed md:relative right-0 top-0 h-full z-50"
        >
          {/* Chat Header */}
          <div className="p-3 md:p-4 border-b border-white/10 flex items-center justify-between backdrop-blur-sm">
            <h3 className="text-white text-base md:text-lg font-semibold flex items-center gap-2 drop-shadow-lg">
              <MessageCircle size={18} className="md:w-5 md:h-5" />
              Live Chat
            </h3>
            <button 
              onClick={() => setIsChatVisible(false)} 
              className="md:hidden text-white/60 hover:text-white p-2 touch-manipulation hover:bg-white/10 rounded-lg transition-all"
            >
              <X size={22} />
            </button>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2 md:space-y-3 custom-scrollbar">
            {messages.length === 0 && (
              <div className="text-center text-white/60 py-8">
                <MessageCircle size={48} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm md:text-base">No messages yet</p>
                <p className="text-xs md:text-sm">Say hi! 👋</p>
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id}>
                {msg.type === 'system' ? (
                  <div className="text-center text-white/80 text-xs md:text-sm py-2 bg-white/5 backdrop-blur-sm rounded border border-white/10">
                    {msg.text}
                  </div>
                ) : (
                  <div className={msg.userId === user?._id ? 'text-right' : 'text-left'}>
                    <div className="text-xs text-white/60 mb-1">{msg.username}</div>
                    <div className={`inline-block px-3 md:px-4 py-2 rounded-lg max-w-[75%] md:max-w-xs break-words text-sm md:text-base ${
                      msg.userId === user?._id 
                        ? 'bg-blue-500/30 backdrop-blur-md text-white border border-blue-400/30 shadow-lg' 
                        : 'bg-white/10 backdrop-blur-md text-white border border-white/20 shadow-lg'
                    }`}>
                      {msg.text}
                    </div>
                    <div className="text-xs text-white/40 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-3 md:p-4 border-t border-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 md:px-4 py-2 md:py-3 bg-white/5 backdrop-blur-md text-white placeholder-white/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50 border border-white/10 text-sm md:text-base"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="px-3 md:px-6 py-2 md:py-3 bg-blue-500/80 backdrop-blur-sm text-white rounded-lg hover:bg-blue-600/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all touch-manipulation active:scale-95 flex items-center gap-2 border border-blue-400/30"
              >
                <Send size={18} className="md:w-5 md:h-5" />
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
    </>
  )
}
    