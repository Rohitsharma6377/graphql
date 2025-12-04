/**
 * Permission Helper - Ensures camera/mic permissions are always granted
 */

export interface PermissionStatus {
  camera: boolean
  microphone: boolean
  error: string | null
}

/**
 * Request camera and microphone permissions with retry logic
 */
export async function requestMediaPermissions(
  retries = 3
): Promise<MediaStream | null> {
  let attempts = 0

  while (attempts < retries) {
    attempts++
    console.log(`🎥 Requesting media permissions (attempt ${attempts}/${retries})...`)

    try {
      // Request both video and audio
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      console.log('✅ Media permissions granted!')
      console.log('  Video tracks:', stream.getVideoTracks().length)
      console.log('  Audio tracks:', stream.getAudioTracks().length)

      return stream
    } catch (error: any) {
      console.error(`❌ Attempt ${attempts} failed:`, error.name, error.message)

      // If permission denied, try audio-only
      if (
        error.name === 'NotAllowedError' ||
        error.name === 'PermissionDeniedError'
      ) {
        console.log('⚠️ Permission denied, trying audio-only...')

        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true,
          })

          console.log('✅ Audio-only permission granted')
          return audioStream
        } catch (audioError: any) {
          console.error('❌ Audio-only also failed:', audioError.name)

          if (attempts >= retries) {
            throw new Error(
              'Camera and microphone access denied. Please grant permissions in browser settings.'
            )
          }
        }
      }

      // If device not found, try different constraints
      if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        console.log('⚠️ No devices found, trying simplified constraints...')

        try {
          const simpleStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          })

          console.log('✅ Permissions granted with simple constraints')
          return simpleStream
        } catch (simpleError) {
          console.error('❌ Simplified constraints failed')

          if (attempts >= retries) {
            throw new Error(
              'No camera or microphone found. Please connect a device and try again.'
            )
          }
        }
      }

      // If device busy, wait and retry
      if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        console.log('⚠️ Device busy, waiting before retry...')
        await new Promise((resolve) => setTimeout(resolve, 1000))

        if (attempts >= retries) {
          throw new Error(
            'Camera or microphone is already in use. Please close other apps and try again.'
          )
        }
      }

      // Wait before next retry
      if (attempts < retries) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }
  }

  throw new Error('Failed to access camera/microphone after multiple attempts.')
}

/**
 * Check current permission status
 */
export async function checkPermissionStatus(): Promise<PermissionStatus> {
  const status: PermissionStatus = {
    camera: false,
    microphone: false,
    error: null,
  }

  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      status.error = 'Media devices not supported in this browser'
      return status
    }

    // Check if we can enumerate devices
    const devices = await navigator.mediaDevices.enumerateDevices()
    const hasCamera = devices.some((d) => d.kind === 'videoinput')
    const hasMic = devices.some((d) => d.kind === 'audioinput')

    console.log('📹 Available devices:')
    console.log('  Cameras:', devices.filter((d) => d.kind === 'videoinput').length)
    console.log('  Microphones:', devices.filter((d) => d.kind === 'audioinput').length)

    if (!hasCamera && !hasMic) {
      status.error = 'No camera or microphone found'
      return status
    }

    status.camera = hasCamera
    status.microphone = hasMic
  } catch (error: any) {
    status.error = error.message
  }

  return status
}

/**
 * Request screen share permission
 */
export async function requestScreenShare(
  includeAudio = true
): Promise<MediaStream | null> {
  console.log('🖥️ Requesting screen share permission...')

  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        cursor: 'always',
      } as any,
      audio: includeAudio,
    } as any)

    console.log('✅ Screen share permission granted')
    console.log('  Video tracks:', stream.getVideoTracks().length)
    console.log('  Audio tracks:', stream.getAudioTracks().length)

    return stream
  } catch (error: any) {
    console.error('❌ Screen share failed:', error.name, error.message)

    if (error.name === 'NotAllowedError') {
      throw new Error('Screen share permission denied')
    }

    throw new Error('Failed to capture screen')
  }
}

/**
 * Show permission instructions based on browser
 */
export function getPermissionInstructions(): string {
  const ua = navigator.userAgent.toLowerCase()

  if (ua.includes('chrome')) {
    return 'Click the camera icon in the address bar and select "Always allow"'
  } else if (ua.includes('firefox')) {
    return 'Click the camera icon in the address bar and select "Remember this decision"'
  } else if (ua.includes('safari')) {
    return 'Go to Safari > Settings > Websites > Camera/Microphone and allow this site'
  } else if (ua.includes('edge')) {
    return 'Click the camera icon in the address bar and select "Always allow"'
  }

  return 'Please grant camera and microphone permissions in your browser settings'
}

/**
 * Request permissions on page load (proactive approach)
 */
export async function requestPermissionsEarly(): Promise<void> {
  console.log('🚀 Proactively requesting permissions...')

  try {
    const stream = await requestMediaPermissions(1)
    if (stream) {
      console.log('✅ Early permissions granted, stopping tracks')
      // Stop tracks immediately, we just wanted the permission
      stream.getTracks().forEach((track) => track.stop())
    }
  } catch (error) {
    console.log('⚠️ Early permission request failed (user will be prompted later)')
  }
}
