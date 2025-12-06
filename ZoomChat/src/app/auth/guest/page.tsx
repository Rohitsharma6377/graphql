'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useAuthStore } from '@/stores'
import { User, Heart, Zap, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

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
      const errorMessage = err instanceof Error ? err.message : 'Failed to create guest session'
      setError(errorMessage)
    }
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md fade-in">
        {/* Logo/Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 md:mb-8"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, -5, 5, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="inline-block mb-3"
          >
            <div className="text-6xl md:text-7xl">👤</div>
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gradient mb-2">
            Quick Start
          </h1>
          
          <p className="text-gray-600 text-sm md:text-base">
            Jump right in - no account needed!
          </p>
        </motion.div>

        {/* Guest Form */}
        <Card padding="lg" gradient className="slide-up">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-100 to-sky-100 border border-pink-200 mb-4">
              <Zap className="w-4 h-4 text-pink-500" />
              <span className="text-sm font-medium text-gray-700">Instant Access</span>
            </div>
            <p className="text-sm text-gray-600">
              Just enter your name and start connecting
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <Input
              type="text"
              label="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter your name"
              leftIcon={<User className="w-5 h-5" />}
              autoFocus
            />

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Continue Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={authLoading}
            >
              <Heart className="w-5 h-5 mr-2" />
              Start Video Chat
            </Button>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800 mb-1">Guest Mode Limitations</p>
                <p className="text-xs text-yellow-700">
                  No saved preferences, coins, or premium features.{' '}
                  <Link href="/auth/register" className="underline font-medium">
                    Create an account
                  </Link>{' '}
                  for the full experience!
                </p>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="mt-6 text-center space-y-2">
            <Link
              href="/auth/login"
              className="block text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Already have an account?{' '}
              <span className="font-semibold text-gradient">Sign In</span>
            </Link>
            <Link
              href="/auth/register"
              className="block text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Want full features?{' '}
              <span className="font-semibold text-gradient">Sign Up Free</span>
            </Link>
          </div>
        </Card>

        {/* Guest Limitations */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 md:mt-8"
        >
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div className="glass-card p-3 md:p-4 text-center opacity-60">
              <div className="text-2xl md:text-3xl mb-1">❌</div>
              <p className="text-xs md:text-sm font-medium text-gray-700">No Coins</p>
            </div>
            <div className="glass-card p-3 md:p-4 text-center opacity-60">
              <div className="text-2xl md:text-3xl mb-1">❌</div>
              <p className="text-xs md:text-sm font-medium text-gray-700">Limited</p>
              <p className="text-xs text-gray-500 hidden sm:block">Participants</p>
            </div>
            <div className="glass-card p-3 md:p-4 text-center opacity-60">
              <div className="text-2xl md:text-3xl mb-1">❌</div>
              <p className="text-xs md:text-sm font-medium text-gray-700">No History</p>
            </div>
            <div className="glass-card p-3 md:p-4 text-center">
              <div className="text-2xl md:text-3xl mb-1">✅</div>
              <p className="text-xs md:text-sm font-medium text-gray-700">Full Video</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
