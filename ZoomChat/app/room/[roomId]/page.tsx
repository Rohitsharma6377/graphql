'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import VideoPanel from '@/components/VideoPanel'
import ChatWindow from '@/components/ChatWindow'
import CallControls from '@/components/CallControls'
import FallingEmojis from '@/components/FallingEmojis'
import EmojiNotification from '@/components/EmojiNotification'
import { useLocalMedia } from '@/hooks/useLocalMedia'
import { useCallState } from '@/hooks/useCallState-ably'

export default function RoomPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated, loading } = useAuth()
  const [roomReady, setRoomReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const roomId = typeof params?.roomId === 'string' ? params.roomId : 'default'
  const username = user?.name || 'Guest'

  const {
    localStream,
    screenStream,
    isCameraOn,
    isMicOn,
    isScreenSharing,
    shareSystemAudio,
    toggleCamera,
    toggleMic,
    startScreenShare,
    stopScreenShare,
    startLocalMedia,
    stopLocalMedia,
    setShareSystemAudio,
  } = useLocalMedia()

  const {
    isConnected,
    isInCall,
    remoteStream,
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
  } = useCallState(roomId, username)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, loading, router])

  // Initialize call
  useEffect(() => {
    if (user && !roomReady) {
      initializeCall()
    }
  }, [user, roomReady])

  const initializeCall = async () => {
    try {
      setError(null)
      console.log('🎥 Initializing call...')
      
      const stream = await startLocalMedia()
      console.log('✅ Got local media stream')
      
      await joinCall(roomId, username, stream)
      console.log('✅ Joined call successfully')
      
      setRoomReady(true)
    } catch (err: any) {
      console.error('❌ Error initializing call:', err)
      
      // Try audio-only if camera fails
      try {
        console.log('🎤 Camera failed, trying audio-only...')
        const audioStream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true,
        })
        await joinCall(roomId, username, audioStream)
        setRoomReady(true)
        console.log('✅ Joined with audio only')
        return
      } catch (audioErr: any) {
        console.error('❌ Audio-only also failed:', audioErr)
      }
      
      let errorMessage = 'Failed to access camera/microphone. '
      
      if (err.name === 'NotFoundError') {
        errorMessage += 'No camera or microphone found.'
      } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage += 'Permission denied. Please grant access in browser settings.'
      } else if (err.name === 'NotReadableError') {
        errorMessage += 'Device is already in use.'
      } else {
        errorMessage += 'Please check your device and permissions.'
      }
      
      setError(errorMessage)
    }
  }

  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      stopScreenShare()
      await removeScreenTrack()
    } else {
      try {
        const screen = await startScreenShare(shareSystemAudio)
        const screenTrack = screen.getVideoTracks()[0]
        if (screenTrack) {
          await addScreenTrack(screenTrack, screen)
        }
      } catch (err) {
        console.error('Error sharing screen:', err)
      }
    }
  }

  const handleEndCall = () => {
    leaveCall()
    stopLocalMedia()
    stopScreenShare()
    router.push('/chat')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div 
            className="text-6xl mb-4"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            💕
          </motion.div>
          <div className="flex gap-2 justify-center">
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
            <div className="text-4xl">⚠️</div>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-800">Camera/Microphone Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <div className="flex flex-col gap-3">
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 rounded-lg bg-gradient-heartshare text-gray-900 font-semibold hover:shadow-lg transition-all"
              >
                🎥 Try Video Again
              </button>
              <button
                onClick={async () => {
                  try {
                    setError(null)
                    const audioStream = await navigator.mediaDevices.getUserMedia({
                      video: false,
                      audio: true,
                    })
                    await joinCall(roomId, username, audioStream)
                    setRoomReady(true)
                  } catch (err) {
                    setError('Failed to access microphone. Please check permissions.')
                  }
                }}
                className="px-6 py-3 rounded-lg bg-purple-500 text-white font-semibold hover:bg-purple-600 transition-all"
              >
                🎤 Join Audio Only
              </button>
            </div>
            <button
              onClick={() => router.push('/chat')}
              className="px-6 py-3 rounded-lg bg-white border-2 border-gray-300 text-gray-700 font-medium hover:border-pink-300 transition-all"
            >
              ← Back to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  if (!roomReady) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-heartshare"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-gray-700 text-lg">Connecting to room...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-2 md:p-4">
      <div className="max-w-7xl mx-auto h-[calc(100vh-1rem)] md:h-[calc(100vh-2rem)]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 md:mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between glass-card p-3 md:p-4 gap-2 sm:gap-0"
        >
          <div className="flex-1">
            <motion.h1 
              className="text-lg md:text-2xl font-bold bg-gradient-heartshare bg-clip-text text-transparent"
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              💕 HeartShare
            </motion.h1>
            <p className="text-xs md:text-sm text-gray-600">
              Room: <span className="font-mono bg-white/50 px-2 py-0.5 rounded">{roomId.slice(-8)}</span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  const url = `${window.location.origin}/room/${roomId}`
                  navigator.clipboard.writeText(url)
                  alert('Room URL copied! 📋\\n\\nOpen this link in a DIFFERENT browser or incognito window to test with 2 users.')
                }}
                className="ml-2 px-2 py-1 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded text-xs font-semibold transition-all"
                title="Copy room URL"
              >
                📋 Copy Link
              </motion.button>
            </p>
            <p className="text-xs text-orange-600 mt-1">
              💡 Tip: Open the copied link in a different browser or incognito window to test
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span className="text-xs md:text-sm text-gray-600 hidden sm:inline">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </motion.div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 md:gap-4 h-[calc(100%-4rem)] md:h-[calc(100%-5rem)]">
          {/* Left column: Video */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 flex flex-col gap-2 md:gap-4 order-1"
          >
            <div className="flex-1 min-h-[300px] md:min-h-[400px]">
              <VideoPanel
                localStream={localStream}
                remoteStream={remoteStream}
                screenStream={screenStream}
                isCameraOn={isCameraOn}
                isScreenSharing={isScreenSharing}
                username={username}
                remoteUsername="Remote User"
              />
            </div>

            {/* Controls */}
            <CallControls
              isCameraOn={isCameraOn}
              isMicOn={isMicOn}
              isScreenSharing={isScreenSharing}
              shareSystemAudio={shareSystemAudio}
              onToggleCamera={toggleCamera}
              onToggleMic={toggleMic}
              onToggleScreenShare={handleToggleScreenShare}
              onToggleSystemAudio={setShareSystemAudio}
              onEndCall={handleEndCall}
            />
          </motion.div>

          {/* Right column: Chat */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="h-full min-h-[300px] md:min-h-[400px] lg:min-h-0 order-2"
          >
            <ChatWindow
              messages={messages}
              typingUser={typingUser}
              username={username}
              onSendMessage={sendMessage}
              onTyping={sendTyping}
              onSendEmoji={sendEmoji}
            />
          </motion.div>
        </div>

        {/* Falling Emojis Overlay */}
        <FallingEmojis emojis={fallingEmojis} />
        
        {/* Emoji Notification */}
        <EmojiNotification
          emoji={lastEmojiSender?.emoji || null}
          username={lastEmojiSender?.username || null}
        />
      </div>
    </div>
  )
}

