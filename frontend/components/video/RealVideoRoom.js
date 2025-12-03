'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mic, MicOff, Video, VideoOff, PhoneOff, Monitor, MonitorOff,
  Users, Settings, MessageSquare, FileText, Pen, Smile, ThumbsUp, Heart
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { useSession } from 'next-auth/react'
import { useQuery, useSubscription } from '@apollo/client'
import { GET_ROOM, USER_JOINED_SUBSCRIPTION, USER_LEFT_SUBSCRIPTION } from '@/graphql/queries'

export function VideoRoom({ roomId, onLeave, showChat, showWhiteboard, showDocument, onToggleChat, onToggleWhiteboard, onToggleDocument }) {
  const { data: session } = useSession()
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [participants, setParticipants] = useState([])
  const [stream, setStream] = useState(null)
  const [screenStream, setScreenStream] = useState(null)
  const [showReactions, setShowReactions] = useState(false)
  const [reactions, setReactions] = useState([])
  
  const localVideoRef = useRef(null)
  const screenVideoRef = useRef(null)

  // Fetch room data
  const { data: roomData } = useQuery(GET_ROOM, {
    variables: { id: roomId },
    skip: !roomId,
    pollInterval: 5000, // Poll every 5 seconds
  })

  // Subscribe to user joined
  useSubscription(USER_JOINED_SUBSCRIPTION, {
    variables: { roomId },
    onData: ({ data }) => {
      const newUser = data?.data?.userJoined
      if (newUser) {
        setParticipants(prev => {
          if (prev.find(p => p.id === newUser.userId)) return prev
          return [...prev, {
            id: newUser.userId,
            name: newUser.user?.name || 'Guest',
            isMuted: false,
            isVideoOff: false,
            isSpeaking: false,
          }]
        })
      }
    },
  })

  // Subscribe to user left
  useSubscription(USER_LEFT_SUBSCRIPTION, {
    variables: { roomId },
    onData: ({ data }) => {
      const leftUser = data?.data?.userLeft
      if (leftUser) {
        setParticipants(prev => prev.filter(p => p.id !== leftUser.userId))
      }
    },
  })

  // Initialize local media stream
  useEffect(() => {
    const initMedia = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 1280 }, 
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        })
        
        setStream(mediaStream)
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = mediaStream
        }

        // Add self as first participant
        setParticipants(prev => [{
          id: session?.user?.id || 'local',
          name: session?.user?.name || 'You',
          isMuted: false,
          isVideoOff: false,
          isLocal: true,
          isSpeaking: false,
        }, ...prev])

        // Detect speaking
        const audioContext = new AudioContext()
        const analyser = audioContext.createAnalyser()
        const microphone = audioContext.createMediaStreamSource(mediaStream)
        microphone.connect(analyser)
        analyser.fftSize = 512
        const dataArray = new Uint8Array(analyser.frequencyBinCount)

        const detectSpeaking = () => {
          analyser.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length
          
          setParticipants(prev => prev.map(p => 
            p.isLocal ? { ...p, isSpeaking: average > 20 && !isMuted } : p
          ))
          
          requestAnimationFrame(detectSpeaking)
        }
        detectSpeaking()

      } catch (error) {
        console.error('Error accessing media devices:', error)
        alert('Please allow camera and microphone access to join the meeting')
      }
    }

    if (session?.user) {
      initMedia()
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [session])

  // Update room data
  useEffect(() => {
    if (roomData?.room?.participants) {
      const remoteParticipants = roomData.room.participants
        .filter(p => p.userId !== session?.user?.id)
        .map(p => ({
          id: p.userId,
          name: p.user?.name || 'Guest',
          isMuted: false,
          isVideoOff: false,
          isSpeaking: false,
        }))
      
      setParticipants(prev => {
        const localUser = prev.find(p => p.isLocal)
        return localUser ? [localUser, ...remoteParticipants] : remoteParticipants
      })
    }
  }, [roomData, session])

  // Toggle microphone
  const toggleMute = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsMuted(!audioTrack.enabled)
      }
    }
  }

  // Toggle video
  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoOff(!videoTrack.enabled)
      }
    }
  }

  // Toggle screen sharing
  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenMediaStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always' },
          audio: false,
        })
        
        setScreenStream(screenMediaStream)
        setIsScreenSharing(true)

        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = screenMediaStream
        }

        // Handle screen share stop
        screenMediaStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false)
          setScreenStream(null)
        }
      } catch (error) {
        console.error('Error sharing screen:', error)
      }
    } else {
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop())
        setScreenStream(null)
      }
      setIsScreenSharing(false)
    }
  }

  // Send reaction
  const sendReaction = (emoji) => {
    const id = Date.now()
    setReactions(prev => [...prev, { id, emoji }])
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== id))
    }, 3000)
    setShowReactions(false)
  }

  // Leave meeting
  const handleLeave = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop())
    }
    if (onLeave) {
      onLeave()
    }
  }

  return (
    <div className="relative w-full h-full bg-background-dark">
      {/* Reactions */}
      <AnimatePresence>
        {reactions.map(reaction => (
          <motion.div
            key={reaction.id}
            initial={{ opacity: 0, y: 0, x: Math.random() * 100 - 50 }}
            animate={{ opacity: 1, y: -200 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3 }}
            className="absolute bottom-24 left-1/2 text-6xl pointer-events-none z-50"
          >
            {reaction.emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Video Grid */}
      <div className={`grid gap-4 p-4 h-[calc(100%-80px)] ${
        participants.length === 1 ? 'grid-cols-1' :
        participants.length === 2 ? 'grid-cols-2' :
        participants.length <= 4 ? 'grid-cols-2 grid-rows-2' :
        participants.length <= 6 ? 'grid-cols-3 grid-rows-2' :
        'grid-cols-4 grid-rows-2'
      }`}>
        {/* Screen Share (if active) */}
        {isScreenSharing && screenStream && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative glass rounded-2xl overflow-hidden col-span-2 row-span-2 border border-primary-500/30"
          >
            <video
              ref={screenVideoRef}
              autoPlay
              muted
              className="w-full h-full object-contain bg-background-dark"
            />
            <div className="absolute bottom-4 left-4 flex items-center gap-2 glass px-3 py-2 rounded-lg">
              <Monitor className="w-4 h-4 text-primary-400" />
              <span className="text-sm font-medium">Your Screen</span>
            </div>
          </motion.div>
        )}

        {/* Participant Videos */}
        {participants.map((participant, index) => (
          <motion.div
            key={participant.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`relative glass rounded-2xl overflow-hidden ${
              participant.isSpeaking ? 'ring-4 ring-primary-500' : 'border border-white/10'
            }`}
          >
            {/* Video or Avatar */}
            {participant.isLocal && !participant.isVideoOff ? (
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover mirror"
                style={{ transform: 'scaleX(-1)' }}
              />
            ) : participant.isVideoOff || !participant.isLocal ? (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-900/20 to-accent-900/20">
                <Avatar
                  fallback={participant.name}
                  size="lg"
                  className="w-24 h-24"
                />
              </div>
            ) : null}

            {/* Participant Info */}
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              <div className="glass px-3 py-1.5 rounded-lg flex items-center gap-2">
                {participant.isMuted && (
                  <MicOff className="w-3 h-3 text-error" />
                )}
                <span className="text-sm font-medium truncate max-w-[120px]">
                  {participant.name}
                </span>
                {participant.isSpeaking && (
                  <div className="flex gap-0.5">
                    <motion.div
                      animate={{ height: [4, 12, 4] }}
                      transition={{ repeat: Infinity, duration: 0.5 }}
                      className="w-1 bg-primary-500 rounded"
                    />
                    <motion.div
                      animate={{ height: [4, 12, 4] }}
                      transition={{ repeat: Infinity, duration: 0.5, delay: 0.1 }}
                      className="w-1 bg-primary-500 rounded"
                    />
                    <motion.div
                      animate={{ height: [4, 12, 4] }}
                      transition={{ repeat: Infinity, duration: 0.5, delay: 0.2 }}
                      className="w-1 bg-primary-500 rounded"
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 h-20 glass-dark border-t border-white/10 flex items-center justify-between px-6">
        {/* Left: Meeting Info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-error rounded-full animate-pulse" />
            <span className="font-medium">Meeting: {roomId}</span>
          </div>
          <div className="text-muted-foreground text-sm">
            {participants.length} participant{participants.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Center: Main Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant={isMuted ? 'destructive' : 'default'}
            size="lg"
            onClick={toggleMute}
            className="rounded-xl"
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>

          <Button
            variant={isVideoOff ? 'destructive' : 'default'}
            size="lg"
            onClick={toggleVideo}
            className="rounded-xl"
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </Button>

          <Button
            variant={isScreenSharing ? 'primary' : 'default'}
            size="lg"
            onClick={toggleScreenShare}
            className="rounded-xl"
          >
            {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
          </Button>

          <Button
            variant="destructive"
            size="lg"
            onClick={handleLeave}
            className="rounded-xl bg-error hover:bg-error/90"
          >
            <PhoneOff className="w-5 h-5" />
          </Button>
        </div>

        {/* Right: Additional Controls */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setShowReactions(!showReactions)}
              className="rounded-xl"
            >
              <Smile className="w-5 h-5" />
            </Button>

            <AnimatePresence>
              {showReactions && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full right-0 mb-2 glass rounded-xl p-3 flex gap-2"
                >
                  {['👍', '❤️', '😂', '🎉', '👏', '🔥'].map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => sendReaction(emoji)}
                      className="text-2xl hover:scale-125 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Button
            variant="ghost"
            size="lg"
            onClick={onToggleChat}
            className="rounded-xl"
          >
            <MessageSquare className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="lg"
            onClick={onToggleWhiteboard}
            className="rounded-xl"
          >
            <Pen className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="lg"
            onClick={onToggleDocument}
            className="rounded-xl"
          >
            <FileText className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
