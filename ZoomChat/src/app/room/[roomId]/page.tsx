'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState, Fragment } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useCallStore, useChatStore, useUIStore } from '@/stores'
import { useAuthStore } from '@/stores/authStore'
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
  
  // Auth from Zustand store
  const { user, token } = useAuthStore()
  const isAuthenticated = !!user && !!token
  
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [roomReady, setRoomReady] = useState(false)
  const [isChatVisible, setIsChatVisible] = useState(false) // Hide chat on mobile by default
  const [showDebug, setShowDebug] = useState(false) // Debug panel
  
  // Responsive chat visibility - show on desktop, hide on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsChatVisible(true)
      } else {
        setIsChatVisible(false)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
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
    // Wait for user data to be available
    if (!user || !token) {
      console.log('⏳ Waiting for auth...', { user: !!user, token: !!token })
      return
    }
    
    if (isInitialized) return
    
    const init = async () => {
      try {
        console.log('🎬 Initializing room...')
        
        const userId = user._id || user.id || 'unknown'
        const userName = user.name || 'Guest'
        
        console.log('👤 User info:', { userId, userName })
        
        // Initialize Ably connection
        await ablySignaling.init(roomId, userId)
        
        // Setup listeners BEFORE joining
        setupAblyListeners()
        
        // Join the room via Ably
        await ablySignaling.joinRoom(userName)
        
        // Update local call state
        await joinCall(roomId, userId, userName)
        
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
  }, [user, token, roomId, isInitialized])
  
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
        const userId = user._id || user.id
        await ablySignaling.sendMediaState(roomId, {
          userId,
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
    const userId = user._id || user.id
    const message = {
      userId,
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
  
  // Redirect if not authenticated
  if (!user || !token) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading...</p>
        </div>
      </div>
    )
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
      <div className="h-[100dvh] bg-transparent flex relative z-10 overflow-hidden">
      {/* Main video area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <AnimatePresence>
          {(showControls || (typeof window !== 'undefined' && window.innerWidth >= 768)) && (
            <motion.div 
              initial={{ y: -100, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              exit={{ y: -100, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              className="bg-gradient-to-r from-pink-500/30 via-purple-500/30 to-sky-500/30 backdrop-blur-xl px-4 md:px-6 py-3 md:py-4 flex items-center justify-between border-b border-white/30 shadow-2xl relative overflow-hidden"
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400/10 via-purple-400/10 to-sky-400/10 animate-pulse" />
              
              <div className="flex items-center gap-2 md:gap-4 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
                  <h1 className="text-white text-sm md:text-xl font-bold truncate max-w-[100px] md:max-w-none drop-shadow-lg flex items-center gap-2">
                    <span className="text-xl md:text-2xl">💕</span>
                    <span className="hidden md:inline bg-gradient-to-r from-pink-200 to-sky-200 bg-clip-text text-transparent">
                      {roomId.slice(0, 20)}...
                    </span>
                    <span className="md:hidden">Room</span>
                  </h1>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/90 text-[10px] md:text-sm font-bold bg-white/20 px-2 md:px-3 py-1 rounded-full backdrop-blur-sm border border-white/30 shadow-lg">
                    ⏱️ {formatDuration(callDuration)}
                  </span>
                  <span className="text-white/90 text-[10px] md:text-sm font-bold bg-white/20 px-2 md:px-3 py-1 rounded-full backdrop-blur-sm border border-white/30 shadow-lg">
                    👥 {participants.length + 1}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 relative z-10">
                <button 
                  onClick={() => setIsChatVisible(!isChatVisible)}
                  className="md:hidden p-2 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-all active:scale-95"
                >
                  <MessageCircle size={20} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Video Grid - Card-based layout for participants */}
        <div className="flex-1 p-3 md:p-6 overflow-y-auto bg-gradient-to-br from-pink-900/5 via-purple-900/5 to-sky-900/5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {/* Local Camera Card */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="relative rounded-3xl overflow-hidden aspect-video shadow-2xl group"
            >
              {/* Gradient Border Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-sky-500 p-[3px] rounded-3xl">
                <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl overflow-hidden h-full w-full relative">
                  <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  
                  {/* User Name Badge */}
                  <div className="absolute bottom-2 md:bottom-3 left-2 md:left-3 bg-gradient-to-r from-pink-600 via-purple-600 to-sky-600 px-2 md:px-3 py-1 md:py-1.5 rounded-full text-white text-xs font-bold shadow-2xl backdrop-blur-sm border border-white/20 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
                    💕 {user.name}
                  </div>
                  
                  {/* Camera Off Overlay */}
                  {!isCameraOn && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-md">
                      <motion.div 
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', damping: 10 }}
                        className="text-center"
                      >
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center mb-2 mx-auto border-2 border-pink-400/30">
                          <VideoOff size={24} className="md:w-8 md:h-8 text-pink-300" />
                        </div>
                        <p className="text-gray-300 text-xs md:text-sm font-semibold">Camera Off</p>
                      </motion.div>
                    </div>
                  )}
                  
                  {/* Mic Muted Icon */}
                  {!isMicOn && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 md:top-3 right-2 md:right-3"
                    >
                      <div className="bg-gradient-to-r from-red-500 to-pink-500 p-1.5 md:p-2 rounded-full shadow-2xl border-2 border-red-300/50">
                        <MicOff size={12} className="md:w-4 md:h-4 text-white" />
                      </div>
                    </motion.div>
                  )}
                </div>
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
          
          {/* Remote Participants - Camera Cards */}
          {participants.map((p: any) => {
            const stream = remoteStreams[p.id]
            const screenStream = screenStreamRefs.current.get(p.id)
            
            return (
              <Fragment key={p.id}>
                {/* Remote User Camera Card */}
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', damping: 15, delay: 0.1 }}
                  className="relative rounded-3xl overflow-hidden aspect-video shadow-2xl group"
                >
                  {/* Gradient Border */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-sky-500 p-[3px] rounded-3xl">
                    <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl overflow-hidden h-full w-full relative">
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
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-md">
                          <motion.div 
                            animate={{ 
                              scale: [1, 1.05, 1],
                              opacity: [0.5, 1, 0.5]
                            }}
                            transition={{ 
                              duration: 2,
                              repeat: Infinity
                            }}
                            className="text-center"
                          >
                            <div className="text-4xl md:text-5xl mb-3">💞</div>
                            <div className="flex items-center gap-2 justify-center">
                              <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce"></div>
                              <p className="text-white/60 text-xs md:text-sm">Connecting...</p>
                              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </motion.div>
                        </div>
                      )}
                      
                      {/* User Name Badge */}
                      <div className="absolute bottom-2 md:bottom-3 left-2 md:left-3 bg-gradient-to-r from-purple-600 via-pink-600 to-sky-600 backdrop-blur-sm px-2 md:px-3 py-1 md:py-1.5 rounded-full text-white text-xs font-bold shadow-2xl border border-white/20 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
                        💕 {p.username}
                      </div>
                      
                      {/* Camera Off Overlay */}
                      {!p.isCameraOn && stream && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-md">
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-center"
                          >
                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center mb-2 mx-auto border-2 border-pink-400/30">
                              <VideoOff size={24} className="md:w-8 md:h-8 text-pink-300/60" />
                            </div>
                            <p className="text-white/60 text-xs md:text-sm font-semibold">Camera Off</p>
                          </motion.div>
                        </div>
                      )}
                      
                      {/* Mic Muted Icon */}
                      {!p.isMicOn && (
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 md:top-3 right-2 md:right-3"
                        >
                          <div className="bg-gradient-to-r from-red-500 to-pink-500 p-1.5 md:p-2 rounded-full shadow-2xl border-2 border-red-300/50">
                            <MicOff size={12} className="md:w-4 md:h-4 text-white" />
                          </div>
                        </motion.div>
                      )}
                      
                      {/* Screen Sharing Indicator */}
                      {p.isScreenSharing && (
                        <div className="absolute top-2 left-2 bg-gradient-to-r from-green-500 to-emerald-500 px-2 py-1 rounded-full text-white text-[10px] font-bold flex items-center gap-1 shadow-lg">
                          <ScreenShare size={10} />
                          Sharing
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
                
                {/* Remote User Screen Share Card (if sharing) */}
                {screenStream && (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: 'spring', damping: 15 }}
                    className="relative rounded-3xl overflow-hidden aspect-video shadow-2xl lg:col-span-2"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 p-[3px] rounded-3xl">
                      <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl overflow-hidden h-full w-full relative">
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
                        <div className="absolute bottom-2 md:bottom-3 left-2 md:left-3 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 px-2 md:px-3 py-1 md:py-1.5 rounded-full text-white text-xs font-bold shadow-2xl flex items-center gap-1.5 backdrop-blur-sm border border-white/20">
                          <ScreenShare size={14} />
                          🖥️ {p.username}'s Screen
                        </div>
                        <div className="absolute top-2 right-2 bg-gradient-to-r from-green-500 to-emerald-500 px-2 md:px-3 py-1 rounded-full text-white text-[10px] font-bold animate-pulse shadow-lg">
                          ✨ LIVE
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </Fragment>
            )
          })}
          
          {/* Empty state when no participants */}
          {participants.length === 0 && !isScreenSharing && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative rounded-3xl overflow-hidden aspect-video flex items-center justify-center"
            >
              {/* Animated gradient border */}
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/30 via-purple-500/30 to-sky-500/30 p-[2px] rounded-3xl">
                <div className="bg-gradient-to-br from-gray-900/40 to-black/40 backdrop-blur-md rounded-3xl h-full w-full flex items-center justify-center border border-white/10">
                  <div className="text-center p-4 md:p-6">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.05, 1],
                        rotate: [0, 3, -3, 0]
                      }}
                      transition={{ 
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="text-4xl md:text-5xl mb-3"
                    >
                      🔗
                    </motion.div>
                    <h3 className="text-white text-sm md:text-base font-bold mb-1.5 bg-gradient-to-r from-pink-300 to-sky-300 bg-clip-text text-transparent">
                      Waiting for others to join
                    </h3>
                    <p className="text-white/50 text-xs mb-3">Share the room link with others</p>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href)
                        addToast({ message: 'Room link copied!', type: 'success' })
                      }}
                      className="px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-full text-xs font-semibold transition-all shadow-xl border border-pink-400/50"
                    >
                      📋 Copy Link
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          </div>
        </div>
        
        {/* Floating Chat Toggle Button - Mobile Only */}
        {!isChatVisible && (
          <button
            onClick={() => setIsChatVisible(true)}
            className="md:hidden fixed bottom-24 right-4 z-40 p-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-2xl hover:scale-110 transition-transform touch-manipulation active:scale-95"
          >
            <MessageCircle size={24} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
        )}

        {/* Bottom Controls */}
        <AnimatePresence>
          {(showControls || (typeof window !== 'undefined' && window.innerWidth >= 768)) && (
            <motion.div 
              initial={{ y: 100, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              className="bg-gradient-to-r from-pink-500/30 via-purple-500/30 to-sky-500/30 backdrop-blur-xl px-4 md:px-6 py-4 md:py-6 flex items-center justify-center gap-3 md:gap-6 border-t border-white/30 shadow-2xl relative overflow-hidden"
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400/5 via-purple-400/5 to-sky-400/5" />
              
              <div className="flex items-center gap-3 md:gap-4 relative z-10">
                {/* Camera Toggle */}
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleToggleCamera} 
                  className={`p-3 md:p-4 rounded-full transition-all shadow-2xl border-2 relative group ${
                    isCameraOn 
                      ? 'bg-gradient-to-r from-sky-500/40 to-purple-500/40 hover:from-sky-500/60 hover:to-purple-500/60 border-sky-400/50 text-white backdrop-blur-sm' 
                      : 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 border-red-400 text-white'
                  }`}
                >
                  {isCameraOn ? <Video size={20} className="md:w-6 md:h-6" /> : <VideoOff size={20} className="md:w-6 md:h-6" />}
                  {isCameraOn && <div className="absolute top-0 right-0 w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />}
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/90 text-white px-3 py-1 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    {isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
                  </div>
                </motion.button>
                
                {/* Mic Toggle */}
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleToggleMic} 
                  className={`p-3 md:p-4 rounded-full transition-all shadow-2xl border-2 relative group ${
                    isMicOn 
                      ? 'bg-gradient-to-r from-emerald-500/40 to-teal-500/40 hover:from-emerald-500/60 hover:to-teal-500/60 border-emerald-400/50 text-white backdrop-blur-sm' 
                      : 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 border-red-400 text-white'
                  }`}
                >
                  {isMicOn ? <Mic size={20} className="md:w-6 md:h-6" /> : <MicOff size={20} className="md:w-6 md:h-6" />}
                  {isMicOn && <div className="absolute top-0 right-0 w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />}
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/90 text-white px-3 py-1 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    {isMicOn ? 'Mute' : 'Unmute'}
                  </div>
                </motion.button>
                
                {/* Screen Share */}
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleScreenShare} 
                  className={`hidden md:flex p-3 md:p-4 rounded-full transition-all shadow-2xl border-2 relative group ${
                    isScreenSharing 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border-green-400 text-white' 
                      : 'bg-gradient-to-r from-purple-500/40 to-blue-500/40 hover:from-purple-500/60 hover:to-blue-500/60 border-purple-400/50 text-white backdrop-blur-sm'
                  }`}
                >
                  <ScreenShare size={20} className="md:w-6 md:h-6" />
                  {isScreenSharing && (
                    <div className="absolute -top-1 -right-1 w-4 h-4">
                      <div className="absolute inset-0 bg-green-400 rounded-full animate-ping" />
                      <div className="absolute inset-0 bg-green-400 rounded-full" />
                    </div>
                  )}
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/90 text-white px-3 py-1 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    {isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
                  </div>
                </motion.button>
                
                {/* Leave Call */}
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLeaveCall} 
                  className="p-3 md:p-4 rounded-full bg-gradient-to-r from-red-600 to-pink-700 hover:from-red-700 hover:to-pink-800 text-white transition-all ml-2 md:ml-4 shadow-2xl border-2 border-red-400 relative group"
                >
                  <PhoneOff size={22} className="md:w-7 md:h-7" />
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/90 text-white px-3 py-1 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    Leave Call
                  </div>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Chat Panel - Fully responsive and animated */}
      <AnimatePresence>
      {isChatVisible && (
        <>
          {/* Mobile Overlay with fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsChatVisible(false)}
            className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          />
          
          {/* Chat Panel - Smooth slide animation */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="w-full md:w-96 lg:w-[420px] bg-transparent backdrop-blur-md border border-white/10 flex flex-col fixed md:fixed right-0 md:right-6 lg:right-8 top-0 md:top-6 lg:top-8 bottom-0 md:bottom-6 lg:bottom-8 h-full md:h-auto md:rounded-3xl z-50 shadow-2xl overflow-hidden"
          >
            {/* Chat Header - Animated gradient */}
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="p-4 md:p-5 border-b border-white/10 flex items-center gap-3 backdrop-blur-sm relative overflow-hidden md:rounded-t-3xl"
            >
              {/* Animated background gradient */}
              <motion.div 
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{ 
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  backgroundSize: '200% 200%'
                }}
                className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-sky-500/10"
              />
              
              {/* Close button - mobile only with animation */}
              <motion.button 
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsChatVisible(false)} 
                className="md:hidden text-white/80 hover:text-white p-2 rounded-full hover:bg-white/20 transition-all relative z-10 backdrop-blur-sm"
              >
                <X size={22} />
              </motion.button>
              
              {/* Header content */}
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', damping: 15 }}
                className="flex items-center gap-2 md:gap-3 relative z-10"
              >
                <motion.div 
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-sky-500 flex items-center justify-center shadow-xl"
                >
                  <MessageCircle size={20} className="md:w-6 md:h-6 text-white" />
                </motion.div>
                <div>
                  <h3 className="text-white text-base md:text-lg font-bold drop-shadow-lg bg-gradient-to-r from-pink-200 via-purple-200 to-sky-200 bg-clip-text text-transparent">
                    Live Chat
                  </h3>
                  <motion.p 
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-white/60 text-xs"
                  >
                    {participants.length + 1} participant{participants.length !== 0 ? 's' : ''}
                  </motion.p>
                </div>
              </motion.div>
              
              {/* Unread badge with animation */}
              {unreadCount > 0 && (
                <motion.div 
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  whileHover={{ scale: 1.1 }}
                  className="ml-auto bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-7 h-7 flex items-center justify-center font-bold shadow-xl relative z-10 border-2 border-white/30"
                >
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    {unreadCount}
                  </motion.span>
                </motion.div>
              )}
            </motion.div>
          
          {/* Messages - Auto-scroll with animations */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-5 space-y-3 md:space-y-4 chat-scrollbar">
            {messages.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.3, type: 'spring', damping: 15 }}
                className="text-center text-white/60 py-12 md:py-16"
              >
                <motion.div 
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4 border-2 border-pink-400/30 shadow-xl"
                >
                  <MessageCircle size={40} className="md:w-12 md:h-12 text-pink-300/60" />
                </motion.div>
                <motion.p 
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-base md:text-lg font-semibold mb-2 bg-gradient-to-r from-pink-200 to-purple-200 bg-clip-text text-transparent"
                >
                  No messages yet
                </motion.p>
                <p className="text-xs md:text-sm text-white/40">Say hi! 👋</p>
              </motion.div>
            )}
            <AnimatePresence mode="popLayout">
              {messages.map((msg: any, index: number) => (
                <motion.div 
                  key={msg.id}
                  initial={{ opacity: 0, x: msg.userId === user?._id ? 30 : -30, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ 
                    type: 'spring', 
                    damping: 25,
                    stiffness: 300,
                    delay: index * 0.05
                  }}
                  layout
                >
                  {msg.type === 'system' ? (
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="text-center text-white/70 text-xs md:text-sm py-2 px-4 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 shadow-lg"
                    >
                      {msg.text}
                    </motion.div>
                  ) : (
                    <div className={`flex ${msg.userId === user?._id ? 'justify-end' : 'justify-start'} mb-2`}>
                      <div className={`flex flex-col ${msg.userId === user?._id ? 'items-end' : 'items-start'} max-w-[80%] md:max-w-[75%]`}>
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-xs text-white/50 mb-1 font-medium px-2"
                        >
                          {msg.username}
                        </motion.div>
                        <motion.div 
                          whileHover={{ scale: 1.02, y: -2 }}
                          className={`px-4 md:px-5 py-2.5 md:py-3 rounded-2xl md:rounded-3xl break-words text-sm md:text-base shadow-2xl transition-all ${
                            msg.userId === user?._id 
                              ? 'bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 text-white border border-pink-400/50' 
                              : 'bg-white/15 backdrop-blur-md text-white border border-white/40'
                          }`}
                        >
                          {msg.text}
                        </motion.div>
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="text-xs text-white/30 mt-1 px-2"
                        >
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </motion.div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          {/* Chat Input - Fixed at bottom with animation */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="p-4 md:p-5 border-t border-white/10 bg-transparent backdrop-blur-sm relative md:rounded-b-3xl"
          >
            {/* Emoji Picker - Fast & Responsive */}
            <AnimatePresence>
              {showEmojiPicker && (
                <>
                  {/* Backdrop for mobile */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => setShowEmojiPicker(false)}
                    className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
                  />
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="fixed md:absolute bottom-20 md:bottom-full left-1/2 md:left-5 -translate-x-1/2 md:translate-x-0 mb-0 md:mb-3 w-[95vw] max-w-sm md:max-w-md bg-black/95 backdrop-blur-2xl rounded-3xl p-4 shadow-2xl border-2 border-pink-400/40 z-[70] max-h-[70vh] md:max-h-[500px] overflow-hidden flex flex-col"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/20">
                      <h4 className="text-white font-semibold text-sm md:text-base bg-gradient-to-r from-pink-200 to-purple-200 bg-clip-text text-transparent">
                        Choose Emoji
                      </h4>
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowEmojiPicker(false)}
                        className="text-white/60 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-all"
                      >
                        <X size={18} />
                      </motion.button>
                    </div>

                    {/* Emoji Grid - Scrollable */}
                    <div className="overflow-y-auto flex-1 custom-scrollbar pr-1">
                      <div className="grid grid-cols-8 sm:grid-cols-9 md:grid-cols-10 gap-1.5 md:gap-2">
                        {['😊', '😂', '🥰', '😍', '🤗', '😘', '💕', '💖', '💝', '💗', '💓', '💞', '💘', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '❣️', '💋', '👋', '🤚', '✋', '🖐️', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👍', '👎', '👏', '🙌', '🤝', '🙏', '✨', '💫', '⭐', '🌟', '💥', '🎉', '🎊', '🎈', '🎁', '🎀', '🌹', '🌸', '🌺', '🌻', '🌷', '🌼', '💐', '🦋', '🐝', '🐞', '🦄', '🌈', '☀️', '🌙', '⭐', '💎', '🔥', '💧', '🌊', '🍀', '🌿', '🍃'].map((emoji) => (
                          <motion.button
                            key={emoji}
                            type="button"
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.85 }}
                            onClick={() => {
                              setChatInput(prev => prev + emoji);
                            }}
                            className="text-xl sm:text-2xl md:text-2xl hover:bg-white/15 rounded-lg p-1.5 md:p-2 transition-all active:bg-white/20"
                          >
                            {emoji}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            <form onSubmit={handleSendMessage} className="w-full">
              <div className="flex items-center gap-2">
                {/* Emoji Button */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="flex-shrink-0 w-11 h-11 md:w-12 md:h-12 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-2xl transition-all flex items-center justify-center border border-yellow-400/50 shadow-lg"
                >
                  <motion.div
                    animate={{ rotate: showEmojiPicker ? 180 : 0 }}
                    transition={{ type: 'spring', damping: 15 }}
                  >
                    <span className="text-xl">😊</span>
                  </motion.div>
                </motion.button>

                <motion.input
                  whileFocus={{ scale: 1.002 }}
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 min-w-0 px-3 md:px-4 py-2.5 md:py-3 bg-white/10 backdrop-blur-md text-white placeholder-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-400/50 border border-white/30 text-sm md:text-base transition-all shadow-lg hover:bg-white/15"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="flex-shrink-0 w-11 h-11 md:w-auto md:px-5 md:h-12 bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 hover:from-pink-700 hover:via-purple-700 hover:to-pink-700 text-white rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 border border-pink-400/50 shadow-lg font-semibold"
                >
                  <Send size={18} className="md:w-5 md:h-5" />
                  <span className="hidden md:inline text-sm">Send</span>
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
        </>
      )}
      </AnimatePresence>
      
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
    