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
  const screenShareVideoRef = useRef<HTMLVideoElement>(null)
  const [showScreenSharePopup, setShowScreenSharePopup] = useState(false)

  // Set up local video
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  // Set up remote video
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream
      
      // Check if remote stream has screen share track
      const videoTracks = remoteStream.getVideoTracks()
      if (videoTracks.length > 0) {
        const trackLabel = videoTracks[0].label.toLowerCase()
        const isScreenShare = trackLabel.includes('screen') || trackLabel.includes('window')
        setShowScreenSharePopup(isScreenShare)
      }
    }
  }, [remoteStream])

  // Set up screen share video
  useEffect(() => {
    if (screenShareVideoRef.current && screenStream) {
      screenShareVideoRef.current.srcObject = screenStream
      setShowScreenSharePopup(true)
    } else {
      setShowScreenSharePopup(false)
    }
  }, [screenStream])

  return (
    <>
      {/* Main Grid - Always show both video cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 h-full">
        {/* Local Video Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900"
        >
          {localStream && isCameraOn ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-center"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 mx-auto mb-4 rounded-full bg-gradient-to-r from-pink-400 via-purple-400 to-pink-300 flex items-center justify-center shadow-2xl">
                  <span className="text-3xl sm:text-4xl md:text-6xl font-bold text-white">
                    {username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <p className="text-white text-lg sm:text-xl md:text-2xl font-semibold">
                  {username}
                </p>
                <p className="text-white/60 text-xs sm:text-sm mt-2">
                  Camera is {isCameraOn ? 'starting...' : 'off'}
                </p>
              </motion.div>
            </div>
          )}
          
          {/* Username overlay */}
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-sm font-medium shadow-lg">
            <span className="mr-1">👤</span> {username} (You)
          </div>

          {/* Camera status indicator */}
          <div className="absolute top-3 right-3">
            {isCameraOn ? (
              <div className="bg-green-500/90 backdrop-blur-sm px-2 py-1 rounded-full text-white text-xs font-medium flex items-center gap-1">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Live
              </div>
            ) : (
              <div className="bg-red-500/90 backdrop-blur-sm px-2 py-1 rounded-full text-white text-xs font-medium">
                Camera Off
              </div>
            )}
          </div>
        </motion.div>

        {/* Remote Video Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900"
        >
          {remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-center"
              >
                <motion.div
                  className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 flex items-center justify-center shadow-2xl"
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.8, 1, 0.8],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  <svg
                    className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </motion.div>
                <p className="text-white text-lg sm:text-xl md:text-2xl font-semibold">
                  {remoteUsername}
                </p>
                <p className="text-white/60 text-xs sm:text-sm mt-2">
                  Waiting to connect...
                </p>
              </motion.div>
            </div>
          )}
          
          {/* Remote username overlay */}
          {remoteStream && (
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-sm font-medium shadow-lg">
              <span className="mr-1">👤</span> {remoteUsername}
            </div>
          )}

          {/* Connection status */}
          <div className="absolute top-3 right-3">
            {remoteStream ? (
              <div className="bg-green-500/90 backdrop-blur-sm px-2 py-1 rounded-full text-white text-xs font-medium flex items-center gap-1">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Connected
              </div>
            ) : (
              <div className="bg-yellow-500/90 backdrop-blur-sm px-2 py-1 rounded-full text-white text-xs font-medium">
                Waiting...
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Screen Share Popup Modal */}
      <AnimatePresence>
        {(isScreenSharing || showScreenSharePopup) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => !isScreenSharing && setShowScreenSharePopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-6xl h-[80vh] rounded-2xl overflow-hidden shadow-2xl border-2 border-white/30 bg-gray-900"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => !isScreenSharing && setShowScreenSharePopup(false)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-all"
              >
                <span className="text-xl">×</span>
              </motion.button>

              {/* Screen share title */}
              <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-white font-medium shadow-lg">
                <span className="mr-2">🖥️</span>
                {isScreenSharing ? 'Your Screen Share' : `${remoteUsername}'s Screen`}
              </div>

              {/* Screen share video */}
              <video
                ref={screenShareVideoRef}
                autoPlay
                playsInline
                muted={isScreenSharing}
                className="w-full h-full object-contain bg-black"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
