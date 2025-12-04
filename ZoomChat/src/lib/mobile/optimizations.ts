// Mobile optimizations for WebRTC and video rendering

export const MOBILE_CONSTRAINTS = {
  video: {
    width: { ideal: 640 },
    height: { ideal: 480 },
    frameRate: { ideal: 15, max: 24 },
    facingMode: 'user',
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
}

export const MOBILE_SCREEN_SHARE_CONSTRAINTS = {
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 10, max: 15 },
  },
}

// Detect if running on mobile
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false
  
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
  
  return /android/i.test(userAgent) || 
         /iPad|iPhone|iPod/.test(userAgent) ||
         ('ontouchstart' in window) ||
         (navigator.maxTouchPoints > 0)
}

// Detect if iOS
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false
  
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

// Detect if Safari
export function isSafari(): boolean {
  if (typeof window === 'undefined') return false
  
  const ua = navigator.userAgent.toLowerCase()
  return ua.indexOf('safari') !== -1 && ua.indexOf('chrome') === -1
}

// Mobile video element configuration
export function configureMobileVideo(videoElement: HTMLVideoElement): void {
  // Critical for iOS
  videoElement.setAttribute('playsinline', '')
  videoElement.setAttribute('webkit-playsinline', '')
  videoElement.playsInline = true
  
  // Auto-play settings
  videoElement.autoplay = true
  videoElement.muted = false // Only for remote video
  
  // Disable picture-in-picture
  videoElement.disablePictureInPicture = true
  
  // Prevent fullscreen on double-tap (iOS)
  videoElement.style.webkitTouchCallout = 'none'
}

// Force video play with retry (mobile Safari often blocks autoplay)
export async function forceVideoPlay(videoElement: HTMLVideoElement, maxRetries = 5): Promise<void> {
  let retries = 0
  
  const attemptPlay = async (): Promise<void> => {
    try {
      await videoElement.play()
      console.log('✅ Video playing successfully')
    } catch (error) {
      retries++
      
      if (retries < maxRetries) {
        console.warn(`⚠️ Play blocked, retry ${retries}/${maxRetries}`)
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 200 * retries))
        return attemptPlay()
      } else {
        console.error('❌ Failed to play video after max retries:', error)
        throw error
      }
    }
  }
  
  return attemptPlay()
}

// Wake lock to prevent screen sleep during calls (Android)
export class WakeLock {
  private wakeLock: any = null
  
  async request(): Promise<void> {
    if (!('wakeLock' in navigator)) {
      console.warn('⚠️ Wake Lock API not supported')
      return
    }
    
    try {
      // @ts-ignore
      this.wakeLock = await navigator.wakeLock.request('screen')
      console.log('✅ Wake lock acquired')
      
      this.wakeLock.addEventListener('release', () => {
        console.log('🔓 Wake lock released')
      })
    } catch (error) {
      console.error('❌ Failed to acquire wake lock:', error)
    }
  }
  
  async release(): Promise<void> {
    if (this.wakeLock) {
      await this.wakeLock.release()
      this.wakeLock = null
    }
  }
}

// Optimize peer connection for mobile
export function getMobilePeerConfig(): RTCConfiguration {
  return {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
    iceCandidatePoolSize: 5, // Reduced for mobile
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require',
    iceTransportPolicy: 'all',
  }
}

// Handle mobile network changes (WiFi <-> Cellular)
export function setupNetworkChangeHandler(peerConnection: RTCPeerConnection): void {
  if (!('connection' in navigator)) return
  
  // @ts-ignore
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  
  if (!connection) return
  
  connection.addEventListener('change', () => {
    console.log('📶 Network type changed:', connection.effectiveType)
    
    // Restart ICE on network change
    if (peerConnection.iceConnectionState === 'connected' || 
        peerConnection.iceConnectionState === 'completed') {
      console.log('🔄 Restarting ICE due to network change')
      peerConnection.restartIce()
    }
  })
}

// Optimize for low bandwidth (mobile 3G/4G)
export function getLowBandwidthConstraints(): MediaStreamConstraints {
  return {
    video: {
      width: { ideal: 320 },
      height: { ideal: 240 },
      frameRate: { ideal: 10, max: 15 },
    },
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  }
}

// Detect connection type and adjust quality
export function getAdaptiveConstraints(): MediaStreamConstraints {
  if (typeof navigator === 'undefined') return MOBILE_CONSTRAINTS
  
  // @ts-ignore
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  
  if (!connection) {
    return isMobile() ? MOBILE_CONSTRAINTS : { video: true, audio: true }
  }
  
  const effectiveType = connection.effectiveType
  
  switch (effectiveType) {
    case 'slow-2g':
    case '2g':
      return getLowBandwidthConstraints()
    
    case '3g':
      return MOBILE_CONSTRAINTS
    
    case '4g':
    default:
      return {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 24 },
        },
        audio: true,
      }
  }
}

// Handle mobile orientation changes
export function setupOrientationHandler(callback: (isLandscape: boolean) => void): () => void {
  const handleOrientationChange = () => {
    const isLandscape = window.innerWidth > window.innerHeight
    callback(isLandscape)
  }
  
  window.addEventListener('orientationchange', handleOrientationChange)
  window.addEventListener('resize', handleOrientationChange)
  
  // Initial call
  handleOrientationChange()
  
  // Cleanup function
  return () => {
    window.removeEventListener('orientationchange', handleOrientationChange)
    window.removeEventListener('resize', handleOrientationChange)
  }
}

// Mobile-specific video element fixes
export function applyMobileVideoFixes(): void {
  if (!isMobile()) return
  
  // Prevent zoom on double-tap
  document.addEventListener('dblclick', (e) => {
    if (e.target instanceof HTMLVideoElement) {
      e.preventDefault()
    }
  }, { passive: false })
  
  // Prevent long-press context menu on videos
  document.addEventListener('contextmenu', (e) => {
    if (e.target instanceof HTMLVideoElement) {
      e.preventDefault()
    }
  }, { passive: false })
  
  console.log('✅ Mobile video fixes applied')
}

// Battery optimization - reduce quality on low battery
export function setupBatteryOptimization(
  onLowBattery: () => void,
  onChargingChange: (isCharging: boolean) => void
): () => void {
  if (!('getBattery' in navigator)) {
    console.warn('⚠️ Battery API not supported')
    return () => {}
  }
  
  // @ts-ignore
  navigator.getBattery().then((battery) => {
    const handleBatteryChange = () => {
      console.log(`🔋 Battery: ${Math.round(battery.level * 100)}%, charging: ${battery.charging}`)
      
      if (battery.level < 0.2 && !battery.charging) {
        console.warn('⚠️ Low battery, reducing quality')
        onLowBattery()
      }
      
      onChargingChange(battery.charging)
    }
    
    battery.addEventListener('levelchange', handleBatteryChange)
    battery.addEventListener('chargingchange', handleBatteryChange)
    
    // Initial check
    handleBatteryChange()
    
    return () => {
      battery.removeEventListener('levelchange', handleBatteryChange)
      battery.removeEventListener('chargingchange', handleBatteryChange)
    }
  }).catch((error: any) => {
    console.error('❌ Battery API error:', error)
  })
  
  return () => {}
}

// Request persistent storage for mobile PWA
export async function requestPersistentStorage(): Promise<boolean> {
  if ('storage' in navigator && 'persist' in navigator.storage) {
    try {
      const isPersisted = await navigator.storage.persist()
      console.log(`📦 Persistent storage: ${isPersisted ? 'granted' : 'denied'}`)
      return isPersisted
    } catch (error) {
      console.error('❌ Storage persistence error:', error)
      return false
    }
  }
  
  return false
}

// Mobile performance monitoring
export class MobilePerformanceMonitor {
  private observers: PerformanceObserver[] = []
  
  start(): void {
    if (typeof window === 'undefined') return
    
    // Monitor long tasks (janky UI)
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            console.warn(`⚠️ Long task detected: ${entry.duration}ms`)
          }
        }
      })
      
      longTaskObserver.observe({ entryTypes: ['longtask'] })
      this.observers.push(longTaskObserver)
    } catch (error) {
      // Long task API not supported
    }
    
    // Monitor memory (if available)
    if ('memory' in performance) {
      setInterval(() => {
        // @ts-ignore
        const memory = performance.memory
        const usedMB = Math.round(memory.usedJSHeapSize / 1048576)
        const limitMB = Math.round(memory.jsHeapSizeLimit / 1048576)
        
        if (usedMB / limitMB > 0.9) {
          console.warn(`⚠️ High memory usage: ${usedMB}MB / ${limitMB}MB`)
        }
      }, 10000) // Check every 10 seconds
    }
  }
  
  stop(): void {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

export const mobileOptimizations = {
  isMobile,
  isIOS,
  isSafari,
  configureMobileVideo,
  forceVideoPlay,
  WakeLock,
  getMobilePeerConfig,
  setupNetworkChangeHandler,
  getAdaptiveConstraints,
  setupOrientationHandler,
  applyMobileVideoFixes,
  setupBatteryOptimization,
  requestPersistentStorage,
  MobilePerformanceMonitor,
}
