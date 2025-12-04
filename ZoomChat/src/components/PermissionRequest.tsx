'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { requestPermissionsEarly, getPermissionInstructions } from '@/lib/permissions'

export default function PermissionRequest() {
  const [show, setShow] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [instructions, setInstructions] = useState('')

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        // Try to request permissions proactively
        await requestPermissionsEarly()
        setShow(false)
      } catch (error) {
        console.log('Permissions not granted yet, will show prompt')
        setShow(true)
        setPermissionDenied(true)
        setInstructions(getPermissionInstructions())
      }
    }

    // Small delay to not overwhelm the user
    setTimeout(checkPermissions, 500)
  }, [])

  const handleRequestAgain = async () => {
    try {
      await requestPermissionsEarly()
      setShow(false)
      setPermissionDenied(false)
    } catch (error) {
      setPermissionDenied(true)
      setInstructions(getPermissionInstructions())
    }
  }

  if (!show) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="glass-card p-8 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-heartshare flex items-center justify-center">
            <div className="text-4xl">🎥</div>
          </div>

          <h2 className="text-2xl font-bold mb-3 text-gray-800">
            Camera & Microphone Needed
          </h2>

          <p className="text-gray-700 mb-6">
            HeartShare needs access to your camera and microphone for video calls.
            Please grant permissions when prompted.
          </p>

          {permissionDenied && (
            <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800 mb-2 font-semibold">
                ⚠️ Permissions Required
              </p>
              <p className="text-xs text-yellow-700">{instructions}</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={handleRequestAgain}
              className="px-6 py-3 rounded-lg bg-gradient-heartshare text-gray-900 font-semibold hover:shadow-lg transition-all"
            >
              {permissionDenied ? '🔄 Try Again' : '✅ Grant Access'}
            </button>

            <button
              onClick={() => setShow(false)}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 text-sm"
            >
              I'll do it later
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              💡 <strong>Tip:</strong> For the best experience, make sure no other
              apps are using your camera or microphone.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
