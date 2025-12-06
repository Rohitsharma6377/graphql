'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useAuthStore } from '@/stores'

export default function RegisterPage() {
  const router = useRouter()
  const { register, loading: authLoading, error: authError } = useAuthStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [validationError, setValidationError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError('')

    // Validation
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters')
      return
    }

    try {
      await register({ name, email, password })
      
      // Get the updated user from store
      const currentUser = useAuthStore.getState().user
      
      // Redirect based on role
      if (currentUser?.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/chat')
      }
    } catch (err) {
      console.error('Registration failed:', err)
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
          <p className="text-gray-600 text-sm md:text-base">Create your account</p>
        </div>

        {/* Register Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 md:p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-lg border-2 border-gray-300 focus:border-pink-300 focus:outline-none bg-white transition-all text-base"
                placeholder="John Doe"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-lg border-2 border-gray-300 focus:border-pink-300 focus:outline-none bg-white transition-all text-base"
                placeholder="your@email.com"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-pink-300 focus:outline-none bg-white transition-all"
                placeholder="••••••••"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-lg border-2 border-gray-300 focus:border-pink-300 focus:outline-none bg-white transition-all text-base"
                placeholder="••••••••"
              />
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {(validationError || authError) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3 rounded-lg bg-red-100 text-red-800 text-sm"
                >
                  {validationError || authError}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Register Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={authLoading}
              className="w-full px-4 md:px-6 py-3 md:py-4 rounded-lg bg-gradient-heartshare hover:shadow-lg text-gray-900 font-semibold text-base md:text-lg transition-all disabled:opacity-50 touch-manipulation"
            >
              {authLoading ? 'Creating account...' : 'Create Account'}
            </motion.button>
          </form>

          {/* Links */}
          <div className="mt-4 md:mt-6 space-y-3">
            <div className="text-center">
              <Link
                href="/auth/login"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Already have an account? <span className="font-semibold">Sign In</span>
              </Link>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            <Link href="/auth/guest">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-6 py-3 rounded-lg bg-white border-2 border-gray-300 hover:border-pink-300 text-gray-700 font-medium transition-all"
              >
                Continue as Guest 👤
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 glass-card p-6"
        >
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Account Benefits:</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <span className="text-lg">🎁</span>
              <span>Get 100 free coins on signup</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-lg">💎</span>
              <span>Unlock premium features</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-lg">🎨</span>
              <span>Access custom themes and emojis</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-lg">📊</span>
              <span>Track your call history</span>
            </li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  )
}
