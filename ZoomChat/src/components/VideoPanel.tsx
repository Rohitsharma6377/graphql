'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface VideoPanelProps {
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  screenStream: MediaStream | null
  isCameraOn: boolean
  isScreenSharing: boolean
  username: string
  remoteUsername?: string
}

export default function VideoPanel({
  localStream,
  remoteStream,
  screenStream,
  isCameraOn,
  isScreenSharing,
  username,
  remoteUsername = 'Remote User',
}: VideoPanelProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const localScreenRef = useRef<HTMLVideoElement>(null)
  const remoteScreenRef = useRef<HTMLVideoElement>(null)
  const [expandedBox, setExpandedBox] = useState<string | null>(null)
  const [remoteIsScreenSharing, setRemoteIsScreenSharing] = useState(false)
  
  // Check if local stream has active video track
  const hasLocalVideo = localStream && localStream.getVideoTracks().some(track => track.enabled && track.readyState === 'live')
  // Check if remote stream has active video track
  const hasRemoteVideo = remoteStream && remoteStream.getVideoTracks().some(track => track.enabled && track.readyState === 'live')

  // Set up local video
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      console.log('🎥 Setting local video stream', localStream.getTracks())
      localVideoRef.current.srcObject = localStream
      // Force play in case autoplay is blocked
      localVideoRef.current.play().catch(err => console.log('Local video play error:', err))
    }
  }, [localStream])

  // Set up remote video and detect screen share
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      console.log('🎥 Setting remote video stream', remoteStream.getTracks())
      remoteVideoRef.current.srcObject = remoteStream
      // Force play
      remoteVideoRef.current.play().catch(err => console.log('Remote video play error:', err))
      
      // Check if remote stream is screen share
      const videoTracks = remoteStream.getVideoTracks()
      if (videoTracks.length > 0) {
        const trackLabel = videoTracks[0].label.toLowerCase()
        const isScreen = trackLabel.includes('screen') || trackLabel.includes('window') || trackLabel.includes('display')
        setRemoteIsScreenSharing(isScreen)
        
        // If it's screen share, route to screen ref instead
        if (isScreen && remoteScreenRef.current) {
          remoteScreenRef.current.srcObject = remoteStream
          remoteScreenRef.current.play().catch(err => console.log('Remote screen play error:', err))
        }
      }
    }
  }, [remoteStream])

  // Set up local screen share
  useEffect(() => {
    if (localScreenRef.current && screenStream) {
      console.log('🖥️ Setting local screen stream')
      localScreenRef.current.srcObject = screenStream
      localScreenRef.current.play().catch(err => console.log('Local screen play error:', err))
    }
  }, [screenStream])

  const VideoBox = ({
    videoRef,
    title,
    subtitle,
    isLive,
    showVideo,
    fallbackInitial,
    gradient,
    boxId,
  }: {
    videoRef: React.RefObject<HTMLVideoElement>
    title: string
    subtitle?: string
    isLive: boolean
    showVideo: boolean
    fallbackInitial: string
    gradient: string
    boxId: string
  }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
      }}
      className={`relative rounded-lg sm:rounded-xl overflow-hidden shadow-lg sm:shadow-xl border border-white/20 sm:border-2 ${
        expandedBox === boxId ? 'fixed inset-2 z-50' : ''
      } ${gradient}`}
    >
      {/* Video or Placeholder */}
      {showVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={boxId.includes('local')}
          className="w-full h-full object-cover bg-black"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-center px-2"
          >
            <div className={`${
              expandedBox === boxId 
                ? 'w-24 h-24 sm:w-32 sm:h-32' 
                : 'w-10 h-10 sm:w-16 sm:h-16'
            } mx-auto mb-1 sm:mb-2 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 flex items-center justify-center shadow-2xl transition-all`}>
              <span className={`${
                expandedBox === boxId 
                  ? 'text-3xl sm:text-5xl' 
                  : 'text-lg sm:text-2xl'
              } font-bold text-white`}>
                {fallbackInitial}
              </span>
            </div>
            <p className={`text-white font-semibold truncate ${
              expandedBox === boxId 
                ? 'text-base sm:text-xl' 
                : 'text-xs sm:text-sm'
            }`}>{title}</p>
            {subtitle && <p className={`text-white/60 mt-0.5 sm:mt-1 truncate ${
              expandedBox === boxId 
                ? 'text-sm sm:text-base' 
                : 'text-[10px] sm:text-xs'
            }`}>{subtitle}</p>}
          </motion.div>
        </div>
      )}

      {/* Title Badge */}
      <div className={`absolute top-1 left-1 sm:top-2 sm:left-2 bg-black/60 backdrop-blur-md px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-white font-medium shadow-lg flex items-center gap-0.5 sm:gap-1 ${
        expandedBox === boxId ? 'text-xs sm:text-sm' : 'text-[9px] sm:text-xs'
      }`}>
        <span className="text-[10px] sm:text-xs">{boxId.includes('screen') ? '🖥️' : '👤'}</span>
        <span className="hidden sm:inline truncate max-w-[100px]">{title}</span>
      </div>

      {/* Status Badge */}
      <div className="absolute top-1 right-1 sm:top-2 sm:right-2">
        {isLive ? (
          <div className={`bg-green-500/90 backdrop-blur-sm px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-white font-medium flex items-center gap-0.5 sm:gap-1 ${
            expandedBox === boxId ? 'text-xs' : 'text-[9px] sm:text-xs'
          }`}>
            <motion.div
              className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="hidden sm:inline">Live</span>
          </div>
        ) : (
          <div className={`bg-gray-500/90 backdrop-blur-sm px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-white font-medium ${
            expandedBox === boxId ? 'text-xs' : 'text-[9px] sm:text-xs'
          }`}>
            <span className="hidden sm:inline">Off</span>
          </div>
        )}
      </div>

      {/* Expand/Collapse Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setExpandedBox(expandedBox === boxId ? null : boxId)}
        className={`absolute bottom-1 right-1 sm:bottom-2 sm:right-2 rounded-full bg-white/20 hover:bg-white/30 active:bg-white/40 backdrop-blur-md flex items-center justify-center text-white transition-all ${
          expandedBox === boxId ? 'w-8 h-8 sm:w-10 sm:h-10' : 'w-6 h-6 sm:w-8 sm:h-8'
        }`}
        title={expandedBox === boxId ? 'Minimize' : 'Expand'}
      >
        {expandedBox === boxId ? (
          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        )}
      </motion.button>
    </motion.div>
  )

  return (
    <div className="w-full h-full">
      {/* 4 Box Grid Layout - Responsive */}
      <div className={`grid gap-1 sm:gap-2 h-full ${
        expandedBox 
          ? 'grid-cols-1 grid-rows-1' 
          : 'grid-cols-2 grid-rows-2'
      }`}>
        {/* Box 1: Your Camera */}
        {(!expandedBox || expandedBox === 'local-camera') && (
          <VideoBox
            videoRef={localVideoRef}
            title={`${username} (You)`}
            subtitle={hasLocalVideo ? 'Camera On' : 'Camera Off'}
            isLive={!!hasLocalVideo}
            showVideo={!!hasLocalVideo}
            fallbackInitial={username.charAt(0).toUpperCase()}
            gradient="bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900"
            boxId="local-camera"
          />
        )}

        {/* Box 2: Your Screen Share */}
        {(!expandedBox || expandedBox === 'local-screen') && (
          <VideoBox
            videoRef={localScreenRef}
            title="Your Screen"
            subtitle={isScreenSharing ? 'Sharing...' : 'Not sharing'}
            isLive={isScreenSharing && !!screenStream}
            showVideo={isScreenSharing && !!screenStream}
            fallbackInitial="🖥️"
            gradient="bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900"
            boxId="local-screen"
          />
        )}

        {/* Box 3: Remote User Camera */}
        {(!expandedBox || expandedBox === 'remote-camera') && (
          <VideoBox
            videoRef={remoteVideoRef}
            title={remoteUsername}
            subtitle={hasRemoteVideo ? 'Connected' : 'Waiting...'}
            isLive={!!hasRemoteVideo && !remoteIsScreenSharing}
            showVideo={!!hasRemoteVideo && !remoteIsScreenSharing}
            fallbackInitial={remoteUsername.charAt(0).toUpperCase()}
            gradient="bg-gradient-to-br from-pink-900 via-purple-800 to-indigo-900"
            boxId="remote-camera"
          />
        )}

        {/* Box 4: Remote User Screen Share */}
        {(!expandedBox || expandedBox === 'remote-screen') && (
          <VideoBox
            videoRef={remoteScreenRef}
            title={`${remoteUsername}'s Screen`}
            subtitle={remoteIsScreenSharing ? 'Sharing...' : 'Not sharing'}
            isLive={remoteIsScreenSharing}
            showVideo={remoteIsScreenSharing}
            fallbackInitial="🖥️"
            gradient="bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900"
            boxId="remote-screen"
          />
        )}
      </div>


    </div>
  )
}
