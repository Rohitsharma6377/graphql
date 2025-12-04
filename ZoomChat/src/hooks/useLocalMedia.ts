// Hook for managing local media (camera, microphone, screen share)

import { useState, useCallback, useRef, useEffect } from 'react'
import { requestMediaPermissions, requestScreenShare } from '@/lib/permissions'

export interface MediaDevices {
  audioInputs: MediaDeviceInfo[]
  audioOutputs: MediaDeviceInfo[]
  videoInputs: MediaDeviceInfo[]
}

export interface UseLocalMediaReturn {
  localStream: MediaStream | null
  screenStream: MediaStream | null
  isCameraOn: boolean
  isMicOn: boolean
  isScreenSharing: boolean
  shareSystemAudio: boolean
  devices: MediaDevices
  toggleCamera: () => Promise<void>
  toggleMic: () => void
  startScreenShare: (includeAudio?: boolean) => Promise<MediaStream>
  stopScreenShare: () => void
  switchAudioOutput: (deviceId: string) => Promise<void>
  startLocalMedia: () => Promise<MediaStream>
  stopLocalMedia: () => void
  setShareSystemAudio: (value: boolean) => void
}

export function useLocalMedia(): UseLocalMediaReturn {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null)
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [isMicOn, setIsMicOn] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [shareSystemAudio, setShareSystemAudio] = useState(false)
  const [devices, setDevices] = useState<MediaDevices>({
    audioInputs: [],
    audioOutputs: [],
    videoInputs: [],
  })

  const videoRef = useRef<HTMLVideoElement | null>(null)

  // Enumerate media devices
  const enumerateDevices = useCallback(async () => {
    try {
      const deviceList = await navigator.mediaDevices.enumerateDevices()
      setDevices({
        audioInputs: deviceList.filter((d) => d.kind === 'audioinput'),
        audioOutputs: deviceList.filter((d) => d.kind === 'audiooutput'),
        videoInputs: deviceList.filter((d) => d.kind === 'videoinput'),
      })
    } catch (error) {
      console.error('Error enumerating devices:', error)
    }
  }, [])

  // Start local camera and microphone
  const startLocalMedia = useCallback(async (): Promise<MediaStream> => {
    console.log('🎥 ========================================')
    console.log('🎥 STARTING LOCAL MEDIA')
    console.log('🎥 ========================================')
    
    try {
      // Use the permission helper with retry logic
      const stream = await requestMediaPermissions(3)
      
      if (!stream) {
        throw new Error('Failed to get media stream')
      }

      setLocalStream(stream)
      setIsCameraOn(stream.getVideoTracks().length > 0)
      setIsMicOn(stream.getAudioTracks().length > 0)

      // Enumerate devices after getting permission
      await enumerateDevices()

      console.log('✅ ========================================')
      console.log('✅ LOCAL MEDIA STARTED')
      console.log('✅ Video tracks:', stream.getVideoTracks().map((t) => t.label))
      console.log('✅ Audio tracks:', stream.getAudioTracks().map((t) => t.label))
      console.log('✅ ========================================')
      
      return stream
    } catch (error: any) {
      console.error('❌ Error starting local media:', error.message)
      throw error
    }
  }, [enumerateDevices])

  // Stop local media
  const stopLocalMedia = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop())
      setLocalStream(null)
      setIsCameraOn(false)
      setIsMicOn(false)
    }
  }, [localStream])

  // Toggle camera on/off
  const toggleCamera = useCallback(async () => {
    if (!localStream) return

    const videoTrack = localStream.getVideoTracks()[0]
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled
      setIsCameraOn(videoTrack.enabled)
      console.log('Camera toggled:', videoTrack.enabled)
    }
  }, [localStream])

  // Toggle microphone on/off
  const toggleMic = useCallback(() => {
    if (!localStream) return

    const audioTrack = localStream.getAudioTracks()[0]
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled
      setIsMicOn(audioTrack.enabled)
      console.log('Mic toggled:', audioTrack.enabled)
    }
  }, [localStream])

  // Start screen sharing
  const startScreenShare = useCallback(
    async (includeAudio: boolean = shareSystemAudio): Promise<MediaStream> => {
      console.log('🖥️  ========================================')
      console.log('🖥️  STARTING SCREEN SHARE')
      console.log('🖥️  Include audio:', includeAudio)
      console.log('🖥️  ========================================')
      
      try {
        // Use the permission helper
        const stream = await requestScreenShare(includeAudio)
        
        if (!stream) {
          throw new Error('Failed to get screen share stream')
        }

        setScreenStream(stream)
        setIsScreenSharing(true)

        // Listen for user stopping screen share via browser UI
        stream.getVideoTracks()[0].onended = () => {
          console.log('⚠️  Screen share ended by user')
          stopScreenShare()
        }

        console.log('✅ ========================================')
        console.log('✅ SCREEN SHARE STARTED')
        console.log('✅ Video tracks:', stream.getVideoTracks().map((t) => t.label))
        console.log('✅ Audio tracks:', stream.getAudioTracks().map((t) => t.label))
        console.log('✅ ========================================')

        if (includeAudio && stream.getAudioTracks().length === 0) {
          console.warn('⚠️  System audio requested but not captured')
          console.warn('   User may need to select "Share audio" in browser dialog')
        }

        return stream
      } catch (error: any) {
        console.error('❌ Error starting screen share:', error.message)
        throw error
      }
    },
    [shareSystemAudio]
  )

  // Stop screen sharing
  const stopScreenShare = useCallback(() => {
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop())
      setScreenStream(null)
      setIsScreenSharing(false)
      console.log('Screen sharing stopped')
    }
  }, [screenStream])

  // Switch audio output device (if supported)
  const switchAudioOutput = useCallback(async (deviceId: string) => {
    if (videoRef.current && 'setSinkId' in videoRef.current) {
      try {
        await (videoRef.current as any).setSinkId(deviceId)
        console.log('Audio output switched to:', deviceId)
      } catch (error) {
        console.error('Error switching audio output:', error)
      }
    } else {
      console.warn('setSinkId not supported on this browser')
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopLocalMedia()
      stopScreenShare()
    }
  }, [stopLocalMedia, stopScreenShare])

  return {
    localStream,
    screenStream,
    isCameraOn,
    isMicOn,
    isScreenSharing,
    shareSystemAudio,
    devices,
    toggleCamera,
    toggleMic,
    startScreenShare,
    stopScreenShare,
    switchAudioOutput,
    startLocalMedia,
    stopLocalMedia,
    setShareSystemAudio,
  }
}

/**
 * Utility functions for media streams
 */

export async function getLocalMedia(options?: {
  video?: boolean
  audio?: boolean
}): Promise<MediaStream> {
  const { video = true, audio = true } = options || {}
  return navigator.mediaDevices.getUserMedia({ video, audio })
}

export async function getScreenMedia(options?: {
  audio?: boolean
}): Promise<MediaStream> {
  const { audio = false } = options || {}
  return navigator.mediaDevices.getDisplayMedia({ video: true, audio })
}
