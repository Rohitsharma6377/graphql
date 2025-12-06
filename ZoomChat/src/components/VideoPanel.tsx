'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { Maximize2, Minimize2, User, Monitor, Mic, MicOff } from 'lucide-react'

interface VideoPanelProps {
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  screenStream: MediaStream | null
  isCameraOn: boolean
  isScreenSharing: boolean
  isMicOn: boolean
  username: string
  remoteUsername?: string
  participants?: Array<{ id: string; username: string; stream?: MediaStream }>
}

export default function VideoPanel({
  localStream,
  remoteStream,
  screenStream,
  isCameraOn,
  isScreenSharing,
  isMicOn,
  username,
  remoteUsername = 'Remote User',
  participants = [],
}: VideoPanelProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const screenVideoRef = useRef<HTMLVideoElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [localPosition, setLocalPosition] = useState({ x: 0, y: 0 })

  // Check if streams have active video
  const hasLocalVideo = localStream?.getVideoTracks().some(t => t.enabled && t.readyState === 'live')
  const hasRemoteVideo = remoteStream?.getVideoTracks().some(t => t.enabled && t.readyState === 'live')
  const hasScreenShare = screenStream?.getVideoTracks().some(t => t.enabled && t.readyState === 'live')

  // Setup local video
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      const video = localVideoRef.current
      video.srcObject = localStream
      video.muted = true
      video.playsInline = true
      video.autoplay = true
      
      video.play().catch(err => {
        console.error('Local video play error:', err)
        setTimeout(() => video.play().catch(() => {}), 100)
      })
    }
  }, [localStream])

  // Setup remote video
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      const video = remoteVideoRef.current
      video.srcObject = remoteStream
      video.playsInline = true
      video.autoplay = true
      
      video.play().catch(err => {
        console.error('Remote video play error:', err)
        setTimeout(() => video.play().catch(() => {}), 100)
      })
    }
  }, [remoteStream])

  // Setup screen share
  useEffect(() => {
    if (screenVideoRef.current && screenStream) {
      const video = screenVideoRef.current
      video.srcObject = screenStream
      video.playsInline = true
      video.autoplay = true
      
      video.play().catch(err => {
        console.error('Screen share play error:', err)
        setTimeout(() => video.play().catch(() => {}), 100)
      })
    }
  }, [screenStream])

  const VideoBox = ({
    videoRef,
    stream,
    username: boxUsername,
    isMuted,
    isLocal,
    hasVideo,
    className = '',
  }: {
    videoRef: React.RefObject<HTMLVideoElement>
    stream: MediaStream | null
    username: string
    isMuted?: boolean
    isLocal?: boolean
    hasVideo: boolean
    className?: string
  }) => (
    <motion.div
      layout
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl ${className}`}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          hasVideo ? 'opacity-100' : 'opacity-0'
        }`}
        playsInline
        autoPlay
        muted={isLocal}
        style={{ transform: isLocal ? 'scaleX(-1)' : 'none' }}
      />

      {/* Avatar Fallback */}
      {!hasVideo && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-pink-400 to-sky-400">
          <div className="text-center">
            <div className="w-16 h-16 md:w-24 md:h-24 mx-auto mb-3 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <User className="w-8 h-8 md:w-12 md:h-12 text-white" />
            </div>
            <p className="text-white font-semibold text-sm md:text-base">{boxUsername}</p>
          </div>
        </div>
      )}

      {/* User Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white font-medium text-sm md:text-base truncate max-w-[150px]">
              {boxUsername}
            </span>
            {isLocal && (
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full text-white">
                You
              </span>
            )}
          </div>
          
          {/* Mic Status */}
          {isMuted !== undefined && (
            <div className={`p-1.5 rounded-full ${isMuted ? 'bg-red-500' : 'bg-green-500'}`}>
              {isMuted ? (
                <MicOff className="w-3 h-3 md:w-4 md:h-4 text-white" />
              ) : (
                <Mic className="w-3 h-3 md:w-4 md:h-4 text-white" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Connection Quality Indicator */}
      <div className="absolute top-3 right-3">
        <div className="flex gap-0.5">
          {[1, 2, 3].map((bar) => (
            <div
              key={bar}
              className={`w-1 rounded-full transition-all ${
                hasVideo 
                  ? 'bg-green-500 h-3' 
                  : bar === 1 
                    ? 'bg-yellow-500 h-2' 
                    : 'bg-gray-500 h-1'
              }`}
              style={{ height: hasVideo ? `${bar * 4}px` : `${bar * 2}px` }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )

  // Screen share layout
  if (hasScreenShare) {
    return (
      <div className="h-full flex flex-col gap-3 md:gap-4">
        {/* Screen Share - Full Width */}
        <div className="flex-1 relative">
          <motion.div
            layout
            className="h-full rounded-2xl overflow-hidden bg-black shadow-2xl"
          >
            <video
              ref={screenVideoRef}
              className="w-full h-full object-contain"
              playsInline
              autoPlay
            />
            
            {/* Screen Share Label */}
            <div className="absolute top-4 left-4 px-4 py-2 bg-blue-500 rounded-xl text-white font-medium flex items-center gap-2 shadow-lg">
              <Monitor className="w-5 h-5" />
              <span className="hidden sm:inline">Screen Sharing</span>
            </div>
          </motion.div>
        </div>

        {/* Participants Strip */}
        <div className="flex gap-2 md:gap-3 overflow-x-auto scrollbar-hide pb-1">
          {/* Local Video - Thumbnail */}
          <div className="flex-shrink-0 w-32 h-24 md:w-40 md:h-28">
            <VideoBox
              videoRef={localVideoRef}
              stream={localStream}
              username={username}
              isMuted={!isMicOn}
              isLocal
              hasVideo={hasLocalVideo || false}
            />
          </div>

          {/* Remote Video - Thumbnail */}
          {remoteStream && (
            <div className="flex-shrink-0 w-32 h-24 md:w-40 md:h-28">
              <VideoBox
                videoRef={remoteVideoRef}
                stream={remoteStream}
                username={remoteUsername}
                hasVideo={hasRemoteVideo || false}
              />
            </div>
          )}
        </div>
      </div>
    )
  }

  // Default layout - Grid view
  const hasRemote = remoteStream || participants.length > 0
  
  return (
    <div className="h-full">
      {hasRemote ? (
        // Two-person grid
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 h-full">
          {/* Remote Video - Main */}
          <VideoBox
            videoRef={remoteVideoRef}
            stream={remoteStream}
            username={remoteUsername}
            hasVideo={hasRemoteVideo || false}
            className="h-full min-h-[300px] md:min-h-[400px]"
          />

          {/* Local Video */}
          <VideoBox
            videoRef={localVideoRef}
            stream={localStream}
            username={username}
            isMuted={!isMicOn}
            isLocal
            hasVideo={hasLocalVideo || false}
            className="h-full min-h-[300px] md:min-h-[400px]"
          />
        </div>
      ) : (
        // Solo view - Centered local video
        <div className="flex items-center justify-center h-full p-4">
          <div className="w-full max-w-2xl aspect-video">
            <VideoBox
              videoRef={localVideoRef}
              stream={localStream}
              username={username}
              isMuted={!isMicOn}
              isLocal
              hasVideo={hasLocalVideo || false}
              className="h-full"
            />
          </div>
        </div>
      )}

      {/* Floating Local Video (PiP mode) - Hidden on mobile when in grid */}
      {hasRemote && (
        <motion.div
          drag
          dragMomentum={false}
          dragElastic={0.1}
          dragConstraints={{
            top: 0,
            left: 0,
            right: window.innerWidth - 200,
            bottom: window.innerHeight - 150,
          }}
          className="hidden lg:block fixed bottom-20 right-6 w-48 h-36 z-40 cursor-move"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
        >
          <VideoBox
            videoRef={localVideoRef}
            stream={localStream}
            username={username}
            isMuted={!isMicOn}
            isLocal
            hasVideo={hasLocalVideo || false}
            className="h-full ring-2 ring-white/50"
          />
        </motion.div>
      )}
    </div>
  )
}
