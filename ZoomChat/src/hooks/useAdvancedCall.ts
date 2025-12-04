// Advanced call state hook with connection quality monitoring

import { useState, useEffect, useCallback, useRef } from 'react'
import { ParticipantManager, Participant } from '@/lib/call/ParticipantManager'
import { CallMode, ParticipantRole, ConnectionQuality } from '@/lib/webrtc/engine'

export interface UseAdvancedCallReturn {
  // State
  isConnected: boolean
  isInCall: boolean
  participants: Participant[]
  localParticipant: Participant | null
  connectionQuality: ConnectionQuality
  callDuration: number
  isScreenSharing: boolean

  // Media state
  isAudioMuted: boolean
  isVideoMuted: boolean
  isHandRaised: boolean

  // Actions
  joinCall: (roomId: string, username: string, role?: ParticipantRole, isHost?: boolean) => Promise<void>
  leaveCall: () => void
  toggleAudio: () => void
  toggleVideo: () => void
  toggleScreenShare: () => Promise<void>
  raiseHand: () => void

  // Host actions
  promoteToSpeaker: (userId: string) => Promise<void>
  demoteToViewer: (userId: string) => Promise<void>

  // Stats
  stats: {
    bitrate: number
    packetLoss: number
    latency: number
  }
}

export function useAdvancedCall(mode: CallMode = 'mesh'): UseAdvancedCallReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [isInCall, setIsInCall] = useState(false)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [localParticipant, setLocalParticipant] = useState<Participant | null>(null)
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality>('disconnected')
  const [callDuration, setCallDuration] = useState(0)
  const [isScreenSharing, setIsScreenSharing] = useState(false)

  const [isAudioMuted, setIsAudioMuted] = useState(false)
  const [isVideoMuted, setIsVideoMuted] = useState(false)
  const [isHandRaised, setIsHandRaised] = useState(false)

  const [stats, setStats] = useState({
    bitrate: 0,
    packetLoss: 0,
    latency: 0,
  })

  const managerRef = useRef<ParticipantManager | null>(null)
  const callStartTimeRef = useRef<number>(0)
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize participant manager
  useEffect(() => {
    managerRef.current = new ParticipantManager(mode, 50)

    const manager = managerRef.current

    // Setup event listeners
    manager.on('room-joined', () => {
      setIsInCall(true)
      callStartTimeRef.current = Date.now()
      startDurationTimer()
    })

    manager.on('room-left', () => {
      setIsInCall(false)
      stopDurationTimer()
      setCallDuration(0)
    })

    manager.on('participant-added', (participant: Participant) => {
      setParticipants((prev) => [...prev, participant])
    })

    manager.on('participant-removed', (participant: Participant) => {
      setParticipants((prev) => prev.filter((p) => p.id !== participant.id))
    })

    manager.on('participant-stream-ready', (participant: Participant) => {
      setParticipants((prev) => prev.map((p) => (p.id === participant.id ? participant : p)))
    })

    manager.on('participant-connected', () => {
      setConnectionQuality('excellent')
    })

    manager.on('participant-disconnected', () => {
      setConnectionQuality('poor')
    })

    manager.on('screen-share-started', () => {
      setIsScreenSharing(true)
    })

    manager.on('screen-share-stopped', () => {
      setIsScreenSharing(false)
    })

    manager.on('local-mute-changed', ({ audioMuted, videoMuted }) => {
      setIsAudioMuted(audioMuted)
      setIsVideoMuted(videoMuted)
    })

    manager.on('local-hand-raised', ({ raised }) => {
      setIsHandRaised(raised)
    })

    return () => {
      manager.destroy()
      stopDurationTimer()
    }
  }, [mode])

  // Start call duration timer
  const startDurationTimer = () => {
    durationIntervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - callStartTimeRef.current) / 1000)
      setCallDuration(elapsed)
    }, 1000)
  }

  // Stop call duration timer
  const stopDurationTimer = () => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current)
      durationIntervalRef.current = null
    }
  }

  // Join call
  const joinCall = useCallback(
    async (roomId: string, username: string, role: ParticipantRole = 'viewer', isHost = false) => {
      if (!managerRef.current) return

      try {
        await managerRef.current.joinRoom(roomId, username, role, isHost)
        const local = managerRef.current.getLocalParticipant()
        setLocalParticipant(local)
        setIsConnected(true)
      } catch (error) {
        console.error('Failed to join call:', error)
        throw error
      }
    },
    []
  )

  // Leave call
  const leaveCall = useCallback(() => {
    if (!managerRef.current) return

    managerRef.current.leaveRoom()
    setParticipants([])
    setLocalParticipant(null)
    setIsConnected(false)
  }, [])

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (!managerRef.current) return
    managerRef.current.toggleMute(!isAudioMuted, undefined)
  }, [isAudioMuted])

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (!managerRef.current) return
    managerRef.current.toggleMute(undefined, !isVideoMuted)
  }, [isVideoMuted])

  // Toggle screen share
  const toggleScreenShare = useCallback(async () => {
    if (!managerRef.current) return

    try {
      if (isScreenSharing) {
        await managerRef.current.stopScreenShare()
      } else {
        await managerRef.current.startScreenShare()
      }
    } catch (error) {
      console.error('Screen share error:', error)
    }
  }, [isScreenSharing])

  // Raise hand
  const raiseHand = useCallback(() => {
    if (!managerRef.current) return
    managerRef.current.raiseHand()
  }, [])

  // Promote to speaker
  const promoteToSpeaker = useCallback(async (userId: string) => {
    if (!managerRef.current) return
    await managerRef.current.promoteToSpeaker(userId)
  }, [])

  // Demote to viewer
  const demoteToViewer = useCallback(async (userId: string) => {
    if (!managerRef.current) return
    await managerRef.current.demoteToViewer(userId)
  }, [])

  return {
    isConnected,
    isInCall,
    participants,
    localParticipant,
    connectionQuality,
    callDuration,
    isScreenSharing,
    isAudioMuted,
    isVideoMuted,
    isHandRaised,
    joinCall,
    leaveCall,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    raiseHand,
    promoteToSpeaker,
    demoteToViewer,
    stats,
  }
}
