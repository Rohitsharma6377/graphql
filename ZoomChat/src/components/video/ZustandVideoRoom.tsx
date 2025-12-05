'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useCallStore } from '@/stores/useCallStore'
import { useChatStore } from '@/stores/useChatStore'
import { useUIStore } from '@/stores/useUIStore'
import { useUserStore } from '@/stores/useUserStore'
import { ablySignaling } from '@/lib/ably-signaling'
import { Video, VideoOff, Mic, MicOff, PhoneOff, ScreenShare, MessageCircle, Users, Settings } from 'lucide-react'

export default function ZustandVideoRoom() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.roomId as string
  
  // Zustand stores - only subscribe to what we need (selective re-renders)
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
  
  const { sendMessage, addMessage, addSystemMessage, setTyping, loadMessages } = useChatStore()
  const messages = useChatStore(state => state.messages)
  const unreadCount = useChatStore(state => state.unreadCount)
  const isChatOpen = useChatStore(state => state.isOpen)
  const toggleChat = useChatStore(state => state.toggleChat)
  
  const { addToast } = useUIStore()
  const user = useUserStore(state => state.user)
  
  // Local refs
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const screenVideoRef = useRef<HTMLVideoElement>(null)
  const [chatInput, setChatInput] = useState('')
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Initialize call
  useEffect(() => {
    if (!user || !roomId || isInitialized) return
    
    const init = async () => {
      try {
        await joinCall(roomId, user.name)
        setupAblyListeners()
        await loadMessages(roomId)
        setIsInitialized(true)
        
        addToast({
          message: `Joined room: ${roomId}`,
          type: 'success',
        })
      } catch (error: any) {
        console.error('Failed to join call:', error)
        addToast({
          message: error.message || 'Failed to join call',
          type: 'error',
        })
      }
    }
    
    init()
    
    return () => {
      if (isInCall) {
        leaveCall()
      }
    }
  }, [user, roomId, isInitialized])
  
  // Setup Ably listeners
  const setupAblyListeners = () => {
    ablySignaling.on('user-joined', ({ userId, username }) => {
      addParticipant({
        id: userId,
        username,
        isCameraOn: true,
        isMicOn: true,
        isScreenSharing: false,
        stream: null,
      })
      addSystemMessage(`${username} joined`)
    })
    
    ablySignaling.on('user-left', ({ userId, username }) => {
      removeParticipant(userId)
      addSystemMessage(`${username} left`)
    })
    
    ablySignaling.on('chat-message', ({ userId, username, text, timestamp }) => {
      addMessage({
        id: `${userId}-${timestamp}`,
        roomId,
        userId,
        username,
        text,
        timestamp,
        read: false,
        type: 'text',
      })
    })
    
    ablySignaling.on('typing', ({ userId, username, isTyping }) => {
      setTyping(userId, username, isTyping)
    })
    
    ablySignaling.on('media-state-changed', ({ userId, isCameraOn, isMicOn }) => {
      updateParticipant(userId, { isCameraOn, isMicOn })
    })
  }
  
  // Call duration timer
  useEffect(() => {
    if (!isInCall) return
    
    const timer = setInterval(() => {
      incrementCallDuration()
    }, 1000)
    
    return () => clearInterval(timer)
  }, [isInCall])
  
  // Update local video
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])
  
  // Update screen share video
  useEffect(() => {
    if (screenVideoRef.current && screenStream) {
      screenVideoRef.current.srcObject = screenStream
    }
  }, [screenStream])
  
  const handleToggleCamera = () => {
    toggleCamera()
  }
  
  const handleToggleMic = () => {
    toggleMic()
  }
  
  const handleScreenShare = async () => {
    if (isScreenSharing) {
      stopScreenShare()
    } else {
      try {
        await startScreenShare()
        addToast({ message: 'Screen sharing started', type: 'success' })
      } catch (error) {
        addToast({ message: 'Screen share denied', type: 'error' })
      }
    }
  }
  
  const handleLeaveCall = () => {
    leaveCall()
    router.push('/dashboard')
  }
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || !user) return
    
    sendMessage(roomId, chatInput, user.name)
    setChatInput('')
  }
  
  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <h2 className="text-white text-2xl mb-4">Please sign in to join</h2>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }
  
  if (status === 'connecting') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Connecting to room...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-4 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-4">
          <h1 className="text-white text-xl font-semibold">Room: {roomId}</h1>
          <span className="text-gray-400 text-sm">{formatDuration(callDuration)}</span>
          <span className="text-gray-400 text-sm">
            {participants.length + 1} participant{participants.length !== 0 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleChat}
            className="relative p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors"
          >
            <MessageCircle size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                {unreadCount}
              </span>
            )}
          </button>
          <button className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors">
            <Users size={20} />
          </button>
          <button className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors">
            <Settings size={20} />
          </button>
        </div>
      </div>
      
      {/* Video Grid */}
      <div className="flex-1 p-4 grid grid-cols-2 gap-4 overflow-y-auto">
        {/* Local Video */}
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-4 bg-black/70 px-3 py-1 rounded-lg text-white text-sm font-medium">
            {user.name} (You)
          </div>
          {!isCameraOn && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="text-center">
                <VideoOff size={64} className="text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400">Camera Off</p>
              </div>
            </div>
          )}
          <div className="absolute top-4 right-4 flex gap-2">
            {!isMicOn && (
              <div className="bg-red-600 p-2 rounded-full">
                <MicOff size={16} className="text-white" />
              </div>
            )}
          </div>
        </div>
        
        {/* Screen Share */}
        {isScreenSharing && screenStream && (
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <video
              ref={screenVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
            <div className="absolute bottom-4 left-4 bg-black/70 px-3 py-1 rounded-lg text-white text-sm font-medium">
              Your Screen
            </div>
          </div>
        )}
        
        {/* Remote Participants */}
        {participants.map((participant) => (
          <div key={participant.id} className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <div className="absolute bottom-4 left-4 bg-black/70 px-3 py-1 rounded-lg text-white text-sm font-medium">
              {participant.username}
            </div>
            {!participant.isCameraOn && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <div className="text-center">
                  <VideoOff size={64} className="text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400">Camera Off</p>
                </div>
              </div>
            )}
            {!participant.isMicOn && (
              <div className="absolute top-4 right-4 bg-red-600 p-2 rounded-full">
                <MicOff size={16} className="text-white" />
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Controls */}
      <div className="bg-gray-800 px-6 py-6 flex items-center justify-center gap-4 border-t border-gray-700">
        <button
          onClick={handleToggleCamera}
          className={`p-4 rounded-full transition-all ${
            isCameraOn 
              ? 'bg-gray-700 hover:bg-gray-600 text-white' 
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
          title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
        >
          {isCameraOn ? <Video size={24} /> : <VideoOff size={24} />}
        </button>
        
        <button
          onClick={handleToggleMic}
          className={`p-4 rounded-full transition-all ${
            isMicOn 
              ? 'bg-gray-700 hover:bg-gray-600 text-white' 
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
          title={isMicOn ? 'Mute' : 'Unmute'}
        >
          {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
        </button>
        
        <button
          onClick={handleScreenShare}
          className={`p-4 rounded-full transition-all ${
            isScreenSharing 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
          title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
        >
          <ScreenShare size={24} />
        </button>
        
        <button
          onClick={handleLeaveCall}
          className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all ml-4"
          title="Leave call"
        >
          <PhoneOff size={24} />
        </button>
      </div>
      
      {/* Chat Panel */}
      {isChatOpen && (
        <div className="fixed right-0 top-0 h-full w-96 bg-gray-800 shadow-2xl flex flex-col border-l border-gray-700">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h3 className="text-white text-lg font-semibold">Chat</h3>
            <button
              onClick={toggleChat}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id}>
                {msg.type === 'system' ? (
                  <div className="text-center text-gray-400 text-sm py-2">
                    {msg.text}
                  </div>
                ) : (
                  <div className={msg.userId === user.id ? 'text-right' : 'text-left'}>
                    <div className="text-xs text-gray-400 mb-1">{msg.username}</div>
                    <div className={`inline-block px-4 py-2 rounded-lg max-w-xs break-words ${
                      msg.userId === user.id 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 text-white'
                    }`}>
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
          
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
