'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  joinCall,
  leaveCall,
  toggleCamera,
  toggleMic,
  setScreenStream,
  addParticipant,
  removeParticipant,
  updateParticipant,
} from '@/store/slices/callSlice'
import { 
  sendMessage, 
  addMessage, 
  toggleChat,
  addSystemMessage,
  setTypingUser,
} from '@/store/slices/chatSlice'
import { addToast } from '@/store/slices/uiSlice'
import { requestMediaPermissions } from '@/lib/permissions'
import { ablySignaling } from '@/lib/ably-signaling'
import { Video, VideoOff, Mic, MicOff, PhoneOff, ScreenShare, MessageCircle, Users } from 'lucide-react'

export default function ReduxVideoRoom() {
  const params = useParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  
  const roomId = params.roomId as string
  
  // Redux state
  const {
    isInCall,
    isCameraOn,
    isMicOn,
    isScreenSharing,
    participants,
    currentUser,
    localStream,
    screenStream,
    status,
    callDuration,
  } = useAppSelector((state) => state.call)
  
  const { messages, isOpen: isChatOpen, unreadCount } = useAppSelector((state) => state.chat)
  const { current: user } = useAppSelector((state) => state.user)
  
  // Local refs
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const screenVideoRef = useRef<HTMLVideoElement>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Initialize call
  useEffect(() => {
    if (!user || !roomId || isInitialized) return
    
    const init = async () => {
      try {
        // Request permissions and get local stream
        const stream = await requestMediaPermissions()
        
        // Join call via Redux
        await dispatch(joinCall({
          roomId,
          username: user.name,
          stream,
        })).unwrap()
        
        // Setup Ably event listeners
        setupAblyListeners()
        
        setIsInitialized(true)
        
        dispatch(addToast({
          message: 'Joined call successfully',
          type: 'success',
        }))
      } catch (error: any) {
        console.error('Failed to initialize call:', error)
        dispatch(addToast({
          message: error.message || 'Failed to join call',
          type: 'error',
        }))
      }
    }
    
    init()
    
    return () => {
      if (isInCall) {
        dispatch(leaveCall())
      }
    }
  }, [user, roomId, isInitialized])
  
  // Setup Ably event listeners
  const setupAblyListeners = () => {
    // User joined
    ablySignaling.on('user-joined', ({ userId, username }) => {
      console.log('User joined:', username)
      dispatch(addParticipant({
        id: userId,
        username,
        isCameraOn: true,
        isMicOn: true,
        isScreenSharing: false,
        stream: null,
      }))
      dispatch(addSystemMessage(`${username} joined the call`))
    })
    
    // User left
    ablySignaling.on('user-left', ({ userId, username }) => {
      console.log('User left:', username)
      dispatch(removeParticipant(userId))
      dispatch(addSystemMessage(`${username} left the call`))
    })
    
    // Chat message
    ablySignaling.on('chat-message', ({ userId, username, text, timestamp }) => {
      dispatch(addMessage({
        id: `${userId}-${timestamp}`,
        roomId,
        userId,
        username,
        text,
        timestamp,
        read: false,
        type: 'text',
      }))
    })
    
    // Typing indicator
    ablySignaling.on('typing', ({ userId, username, isTyping }) => {
      dispatch(setTypingUser({ userId, username, isTyping }))
    })
    
    // Media state changes
    ablySignaling.on('media-state-changed', ({ userId, isCameraOn, isMicOn }) => {
      dispatch(updateParticipant({ id: userId, isCameraOn, isMicOn }))
    })
  }
  
  // Update local video ref
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])
  
  // Update screen share video ref
  useEffect(() => {
    if (screenVideoRef.current && screenStream) {
      screenVideoRef.current.srcObject = screenStream
    }
  }, [screenStream])
  
  // Handle camera toggle
  const handleToggleCamera = async () => {
    await dispatch(toggleCamera()).unwrap()
    
    // Notify other participants
    ablySignaling.sendMediaState(roomId, !isCameraOn, isMicOn)
  }
  
  // Handle mic toggle
  const handleToggleMic = async () => {
    await dispatch(toggleMic()).unwrap()
    
    // Notify other participants
    ablySignaling.sendMediaState(roomId, isCameraOn, !isMicOn)
  }
  
  // Handle screen share
  const handleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen share
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop())
      }
      dispatch(setScreenStream(null))
      return
    }
    
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      })
      
      dispatch(setScreenStream(stream))
      
      // Handle screen share stopped by user
      stream.getVideoTracks()[0].onended = () => {
        dispatch(setScreenStream(null))
      }
      
      dispatch(addToast({
        message: 'Screen sharing started',
        type: 'success',
      }))
    } catch (error) {
      console.error('Screen share error:', error)
      dispatch(addToast({
        message: 'Failed to start screen sharing',
        type: 'error',
      }))
    }
  }
  
  // Handle leave call
  const handleLeaveCall = async () => {
    await dispatch(leaveCall()).unwrap()
    router.push('/dashboard')
  }
  
  // Handle send message
  const handleSendMessage = async (text: string) => {
    if (!user) return
    
    await dispatch(sendMessage({
      roomId,
      text,
      username: user.name,
    })).unwrap()
  }
  
  // Format call duration
  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-white text-xl">Please sign in to join the call</div>
      </div>
    )
  }
  
  if (status === 'connecting') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-white text-xl">Connecting to call...</div>
      </div>
    )
  }
  
  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-white text-xl font-semibold">Room: {roomId}</h1>
          <span className="text-gray-400">{formatDuration(callDuration)}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => dispatch(toggleChat())}
            className="relative p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white"
          >
            <MessageCircle size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          <button className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white">
            <Users size={20} />
          </button>
        </div>
      </div>
      
      {/* Video Grid */}
      <div className="flex-1 p-4 grid grid-cols-2 gap-4">
        {/* Local Video */}
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded text-white">
            {currentUser?.username} (You)
          </div>
          {!isCameraOn && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <VideoOff size={48} className="text-gray-400" />
            </div>
          )}
        </div>
        
        {/* Screen Share */}
        {isScreenSharing && (
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={screenVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
            <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded text-white">
              Your Screen
            </div>
          </div>
        )}
        
        {/* Participants */}
        {participants.map((participant) => (
          <div key={participant.id} className="relative bg-black rounded-lg overflow-hidden">
            {participant.stream && (
              <video
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded text-white">
              {participant.username}
            </div>
            {!participant.isCameraOn && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <VideoOff size={48} className="text-gray-400" />
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Controls */}
      <div className="bg-gray-800 px-6 py-4 flex items-center justify-center gap-4">
        <button
          onClick={handleToggleCamera}
          className={`p-4 rounded-full ${isCameraOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'} text-white`}
        >
          {isCameraOn ? <Video size={24} /> : <VideoOff size={24} />}
        </button>
        
        <button
          onClick={handleToggleMic}
          className={`p-4 rounded-full ${isMicOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'} text-white`}
        >
          {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
        </button>
        
        <button
          onClick={handleScreenShare}
          className={`p-4 rounded-full ${isScreenSharing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'} text-white`}
        >
          <ScreenShare size={24} />
        </button>
        
        <button
          onClick={handleLeaveCall}
          className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white"
        >
          <PhoneOff size={24} />
        </button>
      </div>
      
      {/* Chat Panel */}
      {isChatOpen && (
        <div className="fixed right-0 top-0 h-full w-80 bg-gray-800 shadow-xl">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-white text-lg font-semibold">Chat</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={msg.type === 'system' ? 'text-center text-gray-400 text-sm' : ''}>
                {msg.type === 'system' ? (
                  msg.text
                ) : (
                  <div className={msg.userId === user.id ? 'text-right' : 'text-left'}>
                    <div className="text-xs text-gray-400 mb-1">{msg.username}</div>
                    <div className={`inline-block px-3 py-2 rounded-lg ${
                      msg.userId === user.id ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
