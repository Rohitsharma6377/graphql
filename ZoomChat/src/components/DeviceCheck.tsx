'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface DeviceCheckProps {
  onContinue: () => void
}

export default function DeviceCheck({ onContinue }: DeviceCheckProps) {
  const [hasCamera, setHasCamera] = useState<boolean | null>(null)
  const [hasMicrophone, setHasMicrophone] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    checkDevices()
  }, [])

  const checkDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      setHasCamera(devices.some((d) => d.kind === 'videoinput'))
      setHasMicrophone(devices.some((d) => d.kind === 'audioinput'))
    } catch (error) {
      console.error('Error checking devices:', error)
      setHasCamera(false)
      setHasMicrophone(false)
    } finally {
      setIsChecking(false)
    }
  }

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-heartshare animate-spin" />
          <p className="text-gray-700">Checking devices...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 max-w-md w-full"
      >
        <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-pink-2 to-sky-2 bg-clip-text text-transparent">
          Device Check
        </h2>

        <div className="space-y-4 mb-6">
          <DeviceStatus
            icon="🎥"
            label="Camera"
            isAvailable={hasCamera}
          />
          <DeviceStatus
            icon="🎤"
            label="Microphone"
            isAvailable={hasMicrophone}
          />
        </div>

        {!hasCamera && !hasMicrophone && (
          <div className="mb-6 p-4 bg-red-50 rounded-xl">
            <p className="text-sm text-red-700">
              ⚠️ No camera or microphone detected. Please connect devices or check browser permissions.
            </p>
          </div>
        )}

        {!hasCamera && hasMicrophone && (
          <div className="mb-6 p-4 bg-yellow-50 rounded-xl">
            <p className="text-sm text-yellow-700">
              💡 No camera detected. You can continue with audio-only mode.
            </p>
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onContinue}
          className="btn-primary w-full"
          disabled={!hasCamera && !hasMicrophone}
        >
          {hasCamera && hasMicrophone
            ? 'Continue with Video & Audio'
            : hasMicrophone
            ? 'Continue with Audio Only'
            : 'Refresh to Check Again'}
        </motion.button>
      </motion.div>
    </div>
  )
}

function DeviceStatus({
  icon,
  label,
  isAvailable,
}: {
  icon: string
  label: string
  isAvailable: boolean | null
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/60 rounded-xl">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <span className="font-medium text-gray-800">{label}</span>
      </div>
      <AnimatePresence mode="wait">
        {isAvailable === null ? (
          <motion.div
            key="checking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-5 h-5 rounded-full bg-gray-300 animate-pulse"
          />
        ) : isAvailable ? (
          <motion.div
            key="available"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="text-green-500 text-xl"
          >
            ✓
          </motion.div>
        ) : (
          <motion.div
            key="unavailable"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="text-red-500 text-xl"
          >
            ✕
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
