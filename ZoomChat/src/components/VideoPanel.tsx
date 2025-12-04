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

  // Set up local video
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  // Set up remote video and detect screen share
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream
      
      // Check if remote stream is screen share
      const videoTracks = remoteStream.getVideoTracks()
      if (videoTracks.length > 0) {
        const trackLabel = videoTracks[0].label.toLowerCase()
        const isScreen = trackLabel.includes('screen') || trackLabel.includes('window') || trackLabel.includes('display')
        setRemoteIsScreenSharing(isScreen)
        
        // If it's screen share, route to screen ref instead
        if (isScreen && remoteScreenRef.current) {
          remoteScreenRef.current.srcObject = remoteStream
        }
      }
    }
  }, [remoteStream])

  // Set up local screen share
  useEffect(() => {
    if (localScreenRef.current && screenStream) {
      localScreenRef.current.srcObject = screenStream
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
        scale: expandedBox === boxId ? 1 : 1,
      }}
      className={`relative rounded-xl overflow-hidden shadow-xl border-2 border-white/20 ${
        expandedBox === boxId ? 'col-span-2 row-span-2' : ''
      } ${gradient}`}
    >
      {/* Video or Placeholder */}
      {showVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={boxId.includes('local')}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 flex items-center justify-center shadow-2xl">
              <span className="text-2xl sm:text-3xl font-bold text-white">
                {fallbackInitial}
              </span>
            </div>
            <p className="text-white text-sm sm:text-base font-semibold">{title}</p>
            {subtitle && <p className="text-white/60 text-xs mt-1">{subtitle}</p>}
          </motion.div>
        </div>
      )}

      {/* Title Badge */}
      <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full text-white text-xs font-medium shadow-lg flex items-center gap-1">
        <span>{boxId.includes('screen') ? '🖥️' : '👤'}</span>
        {title}
      </div>

      {/* Status Badge */}
      <div className="absolute top-2 right-2">
        {isLive ? (
          <div className="bg-green-500/90 backdrop-blur-sm px-2 py-1 rounded-full text-white text-xs font-medium flex items-center gap-1">
            <motion.div
              className="w-1.5 h-1.5 bg-white rounded-full"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            Live
          </div>
        ) : (
          <div className="bg-gray-500/90 backdrop-blur-sm px-2 py-1 rounded-full text-white text-xs font-medium">
            Off
          </div>
        )}
      </div>

      {/* Expand/Collapse Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setExpandedBox(expandedBox === boxId ? null : boxId)}
        className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition-all"
        title={expandedBox === boxId ? 'Minimize' : 'Expand'}
      >
        {expandedBox === boxId ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        )}
      </motion.button>
    </motion.div>
  )

  return (
    <div className="w-full h-full">
      {/* 4 Box Grid Layout */}
      <div className={`grid gap-2 h-full ${
        expandedBox 
          ? 'grid-cols-2 grid-rows-2' 
          : 'grid-cols-2 grid-rows-2'
      }`}>
        {/* Box 1: Your Camera */}
        <VideoBox
          videoRef={localVideoRef}
          title={`${username} (You)`}
          subtitle={isCameraOn ? 'Camera On' : 'Camera Off'}
          isLive={isCameraOn && !!localStream}
          showVideo={isCameraOn && !!localStream}
          fallbackInitial={username.charAt(0).toUpperCase()}
          gradient="bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900"
          boxId="local-camera"
        />

        {/* Box 2: Your Screen Share */}
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

        {/* Box 3: Remote User Camera */}
        <VideoBox
          videoRef={remoteVideoRef}
          title={remoteUsername}
          subtitle={remoteStream && !remoteIsScreenSharing ? 'Connected' : 'Waiting...'}
          isLive={!!remoteStream && !remoteIsScreenSharing}
          showVideo={!!remoteStream && !remoteIsScreenSharing}
          fallbackInitial={remoteUsername.charAt(0).toUpperCase()}
          gradient="bg-gradient-to-br from-pink-900 via-purple-800 to-indigo-900"
          boxId="remote-camera"
        />

        {/* Box 4: Remote User Screen Share */}
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
      </div>

      {/* Expanded View Overlay */}
      <AnimatePresence>
        {expandedBox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm p-4"
            onClick={() => setExpandedBox(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="w-full h-full rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {expandedBox === 'local-camera' && (
                <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-contain bg-black" />
              )}
              {expandedBox === 'local-screen' && (
                <video ref={localScreenRef} autoPlay playsInline muted className="w-full h-full object-contain bg-black" />
              )}
              {expandedBox === 'remote-camera' && (
                <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-contain bg-black" />
              )}
              {expandedBox === 'remote-screen' && (
                <video ref={remoteScreenRef} autoPlay playsInline className="w-full h-full object-contain bg-black" />
              )}
              
              {/* Close Button */}
              <button
                onClick={() => setExpandedBox(null)}
                className="absolute top-4 right-4 w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-all z-10"
              >
                <span className="text-2xl">×</span>
              </button>

              {/* Title */}
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-white font-medium shadow-lg z-10">
                {expandedBox === 'local-camera' && `${username} - Camera`}
                {expandedBox === 'local-screen' && 'Your Screen Share'}
                {expandedBox === 'remote-camera' && `${remoteUsername} - Camera`}
                {expandedBox === 'remote-screen' && `${remoteUsername}'s Screen`}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
