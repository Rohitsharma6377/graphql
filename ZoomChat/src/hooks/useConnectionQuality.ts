// Connection quality monitor hook

import { useState, useEffect, useRef } from 'react'

export type QualityLevel = 'excellent' | 'good' | 'fair' | 'poor' | 'critical'

export interface ConnectionQualityData {
  level: QualityLevel
  latency: number
  packetLoss: number
  jitter: number
  bitrate: number
  score: number // 0-100
}

export interface UseConnectionQualityReturn {
  quality: ConnectionQualityData
  isMonitoring: boolean
  startMonitoring: (peerConnection: RTCPeerConnection) => void
  stopMonitoring: () => void
}

export function useConnectionQuality(): UseConnectionQualityReturn {
  const [quality, setQuality] = useState<ConnectionQualityData>({
    level: 'excellent',
    latency: 0,
    packetLoss: 0,
    jitter: 0,
    bitrate: 0,
    score: 100,
  })
  const [isMonitoring, setIsMonitoring] = useState(false)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)

  const calculateQualityScore = (data: Partial<ConnectionQualityData>): number => {
    let score = 100

    // Latency penalty (0-50 points)
    const latency = data.latency || 0
    if (latency > 300) score -= 50
    else if (latency > 200) score -= 30
    else if (latency > 100) score -= 15

    // Packet loss penalty (0-30 points)
    const packetLoss = data.packetLoss || 0
    if (packetLoss > 5) score -= 30
    else if (packetLoss > 2) score -= 20
    else if (packetLoss > 1) score -= 10

    // Jitter penalty (0-20 points)
    const jitter = data.jitter || 0
    if (jitter > 50) score -= 20
    else if (jitter > 30) score -= 10
    else if (jitter > 20) score -= 5

    return Math.max(0, Math.min(100, score))
  }

  const getQualityLevel = (score: number): QualityLevel => {
    if (score >= 90) return 'excellent'
    if (score >= 75) return 'good'
    if (score >= 50) return 'fair'
    if (score >= 25) return 'poor'
    return 'critical'
  }

  const updateQuality = async () => {
    if (!pcRef.current) return

    try {
      const stats = await pcRef.current.getStats()

      let latency = 0
      let packetLoss = 0
      let jitter = 0
      let bitrate = 0
      let packetsReceived = 0
      let packetsLost = 0

      stats.forEach((report) => {
        // Inbound RTP (receiving)
        if (report.type === 'inbound-rtp' && report.kind === 'video') {
          packetsReceived = report.packetsReceived || 0
          packetsLost = report.packetsLost || 0
          jitter = (report.jitter || 0) * 1000 // Convert to ms
          bitrate = Math.round((report.bytesReceived || 0) * 8 / 1000) // kbps
        }

        // Candidate pair (for RTT/latency)
        if (report.type === 'candidate-pair' && report.state === 'succeeded') {
          latency = report.currentRoundTripTime ? Math.round(report.currentRoundTripTime * 1000) : 0
        }
      })

      // Calculate packet loss percentage
      const totalPackets = packetsReceived + packetsLost
      const packetLossPercent = totalPackets > 0 ? (packetsLost / totalPackets) * 100 : 0

      const newData: ConnectionQualityData = {
        latency,
        packetLoss: Math.round(packetLossPercent * 10) / 10,
        jitter: Math.round(jitter * 10) / 10,
        bitrate,
        score: 0,
        level: 'excellent',
      }

      newData.score = calculateQualityScore(newData)
      newData.level = getQualityLevel(newData.score)

      setQuality(newData)
    } catch (error) {
      console.error('Failed to get connection stats:', error)
    }
  }

  const startMonitoring = (peerConnection: RTCPeerConnection) => {
    pcRef.current = peerConnection
    setIsMonitoring(true)

    // Update every 2 seconds
    intervalRef.current = setInterval(updateQuality, 2000)
    
    // Initial update
    updateQuality()
  }

  const stopMonitoring = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    pcRef.current = null
    setIsMonitoring(false)

    // Reset quality
    setQuality({
      level: 'excellent',
      latency: 0,
      packetLoss: 0,
      jitter: 0,
      bitrate: 0,
      score: 100,
    })
  }

  useEffect(() => {
    return () => {
      stopMonitoring()
    }
  }, [])

  return {
    quality,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
  }
}

// Quality indicator component
export function ConnectionQualityIndicator({ quality }: { quality: ConnectionQualityData }) {
  const getColor = () => {
    switch (quality.level) {
      case 'excellent':
        return 'text-green-500'
      case 'good':
        return 'text-blue-500'
      case 'fair':
        return 'text-yellow-500'
      case 'poor':
        return 'text-orange-500'
      case 'critical':
        return 'text-red-500'
    }
  }

  const getBars = () => {
    const score = quality.score
    if (score >= 90) return 4
    if (score >= 75) return 3
    if (score >= 50) return 2
    if (score >= 25) return 1
    return 0
  }

  const bars = getBars()

  return (
    <div className="connection-quality-indicator flex items-center gap-2">
      <div className="flex items-end gap-0.5">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`w-1 transition-all ${i < bars ? getColor() : 'bg-gray-600'}`}
            style={{ height: `${(i + 1) * 4}px` }}
          />
        ))}
      </div>
      <span className={`text-sm font-medium ${getColor()}`}>{quality.level}</span>
    </div>
  )
}
