'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

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
  remoteUsername,
}: VideoPanelProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const pipCameraRef = useRef<HTMLVideoElement>(null)

  // Set up local video
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  // Set up remote video (could be remote camera or remote screen share)
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

  // Set up PIP camera when screen sharing
  useEffect(() => {
    if (pipCameraRef.current && isScreenSharing && localStream) {
      pipCameraRef.current.srcObject = localStream
    }
  }, [isScreenSharing, localStream])

  return (
    <div className="relative w-full h-full bg-gray-900 rounded-2xl overflow-hidden">
      {/* Remote video (main view) */}
      {remoteStream ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full h-full"
        >
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          {remoteUsername && (
            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm">
              {remoteUsername}
            </div>
          )}
        </motion.div>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-heartshare flex items-center justify-center">
              <svg
                className="w-16 h-16 text-white"
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
            </div>
            <p className="text-white/70 text-lg">Waiting for others to join...</p>
          </motion.div>
        </div>
      )}

      {/* Local video (bottom-right corner) when not screen sharing */}
      {!isScreenSharing && localStream && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute bottom-4 right-4 w-48 h-36 rounded-xl overflow-hidden shadow-2xl border-2 border-white/30"
        >
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${!isCameraOn ? 'hidden' : ''}`}
          />
          {!isCameraOn && (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-heartshare flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {username.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          )}
          <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-white text-xs">
            You
          </div>
        </motion.div>
      )}

      {/* PIP camera overlay when screen sharing */}
      {isScreenSharing && localStream && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute bottom-4 right-4 w-48 h-36 rounded-xl overflow-hidden shadow-2xl border-2 border-white/30 bg-gray-900"
        >
          <video
            ref={pipCameraRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${!isCameraOn ? 'hidden' : ''}`}
          />
          {!isCameraOn && (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-heartshare flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {username.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          )}
          <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-white text-xs">
            Your Camera
          </div>
        </motion.div>
      )}
    </div>
  )
}
