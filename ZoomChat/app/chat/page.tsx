'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import VideoPanel from '@/components/VideoPanel'
import ChatWindow from '@/components/ChatWindow'
import CallControls from '@/components/CallControls'
import { useLocalMedia } from '@/hooks/useLocalMedia'
import { useCallState } from '@/hooks/useCallState'

export default function ChatPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [username, setUsername] = useState('')
  const [roomId, setRoomId] = useState('')
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAudioOnly, setIsAudioOnly] = useState(false)

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
    joinCall,
    leaveCall,
    sendMessage,
    sendTyping,
    addScreenTrack,
    removeScreenTrack,
  } = useCallState(roomId, username)

  // Initialize on mount
  useEffect(() => {
    const storedUsername = localStorage.getItem('heartshare_username')
    const urlRoomId = searchParams?.get('room')

    if (!storedUsername) {
      router.push('/login')
      return
    }

    setUsername(storedUsername)
    setRoomId(urlRoomId || `room-${Date.now()}`)
  }, [router, searchParams])

  // Start call when ready
  useEffect(() => {
    if (username && roomId && !isReady) {
      initializeCall()
    }
  }, [username, roomId, isReady])

  const initializeCall = async () => {
    try {
      setError(null)
      const stream = await startLocalMedia()
      await joinCall(roomId, username, stream)
      setIsReady(true)
    } catch (err: any) {
      console.error('Error initializing call:', err)
      
      let errorMessage = 'Failed to access camera/microphone. '
      
      if (err.name === 'NotFoundError') {
        errorMessage += 'No camera or microphone found. Please connect a device and try again.'
      } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage += 'Permission denied. Please grant camera/microphone access in browser settings.'
      } else if (err.name === 'NotReadableError') {
        errorMessage += 'Device is already in use by another application.'
      } else {
        errorMessage += 'Please check your device connections and browser permissions.'
      }
      
      setError(errorMessage)
    }
  }

  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
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
        setError('Failed to start screen share. Please try again.')
      }
    }
  }

  const handleEndCall = () => {
    leaveCall()
    stopLocalMedia()
    stopScreenShare()
    router.push('/login')
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
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-800">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Try Again
            </motion.button>
            {error.includes('camera') && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={async () => {
                  setIsAudioOnly(true)
                  setError(null)
                  try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                      video: false,
                      audio: true,
                    })
                    await joinCall(roomId, username, stream)
                    setIsReady(true)
                  } catch (err) {
                    setError('Failed to access microphone. Please check permissions.')
                  }
                }}
                className="btn-secondary"
              >
                Audio Only
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    )
  }

  if (!isReady) {
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
          <p className="text-gray-700 text-lg">Connecting...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto h-[calc(100vh-2rem)]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-center justify-between glass-card p-4"
        >
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-2 to-sky-2 bg-clip-text text-transparent">
              HeartShare
            </h1>
            <p className="text-sm text-gray-600">
              Room: <span className="font-mono">{roomId}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span className="text-sm text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </motion.div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100%-5rem)]">
          {/* Left column: Video */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 flex flex-col gap-4"
          >
            <div className="flex-1 min-h-[400px]">
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

            {/* Browser compatibility notice */}
            {!isScreenSharing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card p-3"
              >
                <p className="text-xs text-gray-600 text-center">
                  💡 <strong>System Audio Tip:</strong> When sharing your screen, select
                  "Share audio" in the browser dialog to include system audio. Works best
                  in Chrome when sharing a browser tab.
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Right column: Chat */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="h-full min-h-[400px]"
          >
            <ChatWindow
              messages={messages}
              typingUser={typingUser}
              username={username}
              onSendMessage={sendMessage}
              onTyping={sendTyping}
            />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
