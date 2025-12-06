'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useAuthStore } from '@/stores'
import { fadeInUp, scaleIn, floatingAnimation, pulseAnimation } from '@/lib/animations'

export default function LoginPage() {
  const router = useRouter()
  const { login, user, loading: authLoading, error: authError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await login({ email, password })
      
      // Get the updated user from store
      const currentUser = useAuthStore.getState().user
      
      // Redirect based on role
      if (currentUser?.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/chat')
      }
    } catch (err) {
      console.error('Login failed:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-sky-50 flex items-center justify-center p-3 md:p-4">
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="w-full max-w-md"
      >
        {/* Logo/Title */}
        <div className="text-center mb-6 md:mb-8">
          <motion.div
            animate={floatingAnimation}
            className="inline-block"
          >
            <motion.h1
              animate={pulseAnimation}
              className="text-4xl md:text-5xl font-bold bg-gradient-heartshare bg-clip-text text-transparent mb-2"
            >
              💕 HeartShare
            </motion.h1>
          </motion.div>
          <motion.p 
            variants={fadeInUp}
            className="text-gray-600 text-sm md:text-base"
          >
            Sign in to your account
          </motion.p>
        </div>

        {/* Login Form */}
        <motion.div
          variants={scaleIn}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.1 }}
          className="glass-card p-6 md:p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
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
                className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-lg border-2 border-gray-300 focus:border-pink-300 focus:outline-none bg-white transition-all text-base"
                placeholder="••••••••"
              />
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {authError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3 rounded-lg bg-red-100 text-red-800 text-sm"
                >
                  {authError}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={authLoading}
              className="w-full px-4 md:px-6 py-3 md:py-4 rounded-lg bg-gradient-heartshare hover:shadow-lg text-gray-900 font-semibold text-base md:text-lg transition-all disabled:opacity-50 touch-manipulation"
            >
              {authLoading ? 'Signing in...' : 'Sign In'}
            </motion.button>
          </form>

          {/* Links */}
          <div className="mt-4 md:mt-6 space-y-3">
            <div className="text-center">
              <Link
                href="/auth/register"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Don't have an account? <span className="font-semibold">Sign Up</span>
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
                className="w-full px-4 md:px-6 py-2.5 md:py-3 rounded-lg bg-white border-2 border-gray-300 hover:border-pink-300 text-gray-700 font-medium transition-all touch-manipulation"
              >
                Continue as Guest 👤
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 md:mt-8 text-center"
        >
          <p className="text-sm text-gray-600 mb-3 md:mb-4">Why sign up?</p>
          <div className="flex flex-wrap justify-center gap-3 md:gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <span>💎</span>
              <span className="hidden sm:inline">Premium Features</span>
              <span className="sm:hidden">Premium</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🪙</span>
              <span>Earn Coins</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🎨</span>
              <span>Custom Themes</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
