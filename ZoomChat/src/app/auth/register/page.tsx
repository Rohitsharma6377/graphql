'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useAuthStore } from '@/stores'
import { Mail, Lock, User, Sparkles, Heart, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

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
              y: [0, -10, 0],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="inline-block mb-3"
          >
            <div className="text-6xl md:text-7xl">💕</div>
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gradient mb-2">
            Join HeartShare
          </h1>
          
          <p className="text-gray-600 text-sm md:text-base flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-400" />
            Create your account to get started
            <Sparkles className="w-4 h-4 text-sky-400" />
          </p>
        </motion.div>

        {/* Register Form */}
        <Card padding="lg" gradient className="slide-up">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <Input
              type="text"
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="John Doe"
              leftIcon={<User className="w-5 h-5" />}
            />

            {/* Email */}
            <Input
              type="email"
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              leftIcon={<Mail className="w-5 h-5" />}
            />

            {/* Password */}
            <Input
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              leftIcon={<Lock className="w-5 h-5" />}
            />

            {/* Confirm Password */}
            <Input
              type="password"
              label="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
              leftIcon={<Lock className="w-5 h-5" />}
            />

            {/* Error Message */}
            <AnimatePresence>
              {(validationError || authError) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {validationError || authError}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Register Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={authLoading}
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Create Account
            </Button>
          </form>

          {/* Links */}
          <div className="mt-6 space-y-4">
            <div className="text-center">
              <Link
                href="/auth/login"
                className="text-sm md:text-base text-gray-600 hover:text-gray-900 transition-colors"
              >
                Already have an account?{' '}
                <span className="font-semibold text-gradient">Sign In</span>
              </Link>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/90 text-gray-500">Or</span>
              </div>
            </div>

            <Link href="/auth/guest" className="block">
              <Button variant="outline" size="lg" fullWidth>
                <span className="text-2xl mr-2">👤</span>
                Continue as Guest
              </Button>
            </Link>
          </div>
        </Card>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 md:mt-8"
        >
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div className="glass-card p-3 md:p-4 text-center">
              <div className="text-2xl md:text-3xl mb-1">🪙</div>
              <p className="text-xs md:text-sm font-medium text-gray-700">100 Free</p>
              <p className="text-xs text-gray-500 hidden sm:block">Coins</p>
            </div>
            <div className="glass-card p-3 md:p-4 text-center">
              <div className="text-2xl md:text-3xl mb-1">💎</div>
              <p className="text-xs md:text-sm font-medium text-gray-700">Premium</p>
              <p className="text-xs text-gray-500 hidden sm:block">Features</p>
            </div>
            <div className="glass-card p-3 md:p-4 text-center">
              <div className="text-2xl md:text-3xl mb-1">🎨</div>
              <p className="text-xs md:text-sm font-medium text-gray-700">Custom</p>
              <p className="text-xs text-gray-500 hidden sm:block">Themes</p>
            </div>
            <div className="glass-card p-3 md:p-4 text-center">
              <div className="text-2xl md:text-3xl mb-1">📊</div>
              <p className="text-xs md:text-sm font-medium text-gray-700">History</p>
              <p className="text-xs text-gray-500 hidden sm:block">Tracking</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
