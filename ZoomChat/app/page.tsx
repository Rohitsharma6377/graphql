'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function Home() {
  const router = useRouter()
  const { user, isAuthenticated, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        // Redirect admins to admin panel
        if (user?.role === 'admin') {
          router.push('/admin')
        } else {
          router.push('/chat')
        }
      } else {
        router.push('/auth/login')
      }
    }
  }, [isAuthenticated, loading, user, router])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-card p-12 max-w-md w-full text-center"
      >
        <motion.h1
          className="text-5xl font-bold mb-4 bg-gradient-to-r from-pink-2 to-sky-2 bg-clip-text text-transparent"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          HeartShare
        </motion.h1>
        <p className="text-gray-700 mb-8 text-lg">
          Connect face-to-face with crystal clear video and audio
        </p>
        <div className="flex gap-2 justify-center">
          <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </motion.div>
    </div>
  )
}
