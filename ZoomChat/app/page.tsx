'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useEffect } from 'react'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const username = localStorage.getItem('heartshare_username')
    if (username) {
      router.push('/chat')
    } else {
      router.push('/login')
    }
  }, [router])

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
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-primary w-full"
          onClick={() => router.push('/login')}
        >
          Get Started
        </motion.button>
      </motion.div>
    </div>
  )
}
