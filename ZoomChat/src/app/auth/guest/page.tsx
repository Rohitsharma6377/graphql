'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useAuthStore } from '@/stores'

export default function GuestPage() {
  const router = useRouter()
  const { guestLogin, loading: authLoading, error: authError } = useAuthStore()
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (name.trim().length === 0) {
      setError('Please enter your name')
      return
    }

    try {
      await guestLogin(name)
      router.push('/chat')
    } catch (err) {
      setError(err.message || 'Failed to create guest session')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-sky-50 flex items-center justify-center p-3 md:p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo/Title */}
        <div className="text-center mb-6 md:mb-8">
          <motion.h1
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-4xl md:text-5xl font-bold bg-gradient-heartshare bg-clip-text text-transparent mb-2"
          >
            💕 HeartShare
          </motion.h1>
          <p className="text-gray-600 text-sm md:text-base">Continue as Guest</p>
        </div>

        {/* Guest Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 md:p-8"
        >
          <div className="text-center mb-4 md:mb-6">
            <div className="text-5xl md:text-6xl mb-3 md:mb-4">👤</div>
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">Quick Start</h2>
            <p className="text-sm text-gray-600">
              No account needed. Just enter your name to get started!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
                className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-lg border-2 border-gray-300 focus:border-pink-300 focus:outline-none bg-white transition-all text-center text-base md:text-lg"
                placeholder="Enter your name"
              />
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3 rounded-lg bg-red-100 text-red-800 text-sm"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Continue Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={authLoading}
              className="w-full px-6 py-4 rounded-lg bg-gradient-heartshare hover:shadow-lg text-gray-900 font-semibold text-lg transition-all disabled:opacity-50"
            >
              {authLoading ? 'Starting...' : 'Start Video Chat'}
            </motion.button>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-xs text-yellow-800">
              <strong>Guest Mode:</strong> You won't be able to save preferences, earn coins, or access premium features. 
              <Link href="/auth/register" className="underline ml-1">
                Create an account
              </Link> for the full experience!
            </p>
          </div>

          {/* Links */}
          <div className="mt-6 text-center space-y-2">
            <Link
              href="/auth/login"
              className="block text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Already have an account? <span className="font-semibold">Sign In</span>
            </Link>
            <Link
              href="/auth/register"
              className="block text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Want full features? <span className="font-semibold">Sign Up Free</span>
            </Link>
          </div>
        </motion.div>

        {/* Guest Limitations */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 glass-card p-6"
        >
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Guest Limitations:</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <span className="text-lg">❌</span>
              <span>No coins or rewards</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-lg">❌</span>
              <span>Limited to 2 participants per room</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-lg">❌</span>
              <span>No call history</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-lg">✅</span>
              <span>Full video and chat features</span>
            </li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  )
}
