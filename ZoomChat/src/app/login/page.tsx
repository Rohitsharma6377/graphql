'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [roomId, setRoomId] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (username.trim()) {
      localStorage.setItem('heartshare_username', username.trim())
      
      if (roomId.trim()) {
        router.push(`/chat?room=${encodeURIComponent(roomId.trim())}`)
      } else {
        router.push('/chat')
      }
    }
  }

  const generateRoomId = () => {
    const random = Math.random().toString(36).substring(2, 8)
    setRoomId(`room-${random}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-card p-10 max-w-md w-full backdrop-blur-xl shadow-2xl relative z-10"
      >
        <motion.div
          className="text-center mb-8"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
        >
          <motion.div 
            className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-heartshare flex items-center justify-center shadow-lg"
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <motion.svg
              className="w-10 h-10 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </motion.svg>
          </motion.div>
          <motion.h1 
            className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-2 to-sky-2 bg-clip-text text-transparent"
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            HeartShare
          </motion.h1>
          <p className="text-gray-700 font-medium">Enter your details to start a video call</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Your Name
            </label>
            <input
              type="text"
              id="username"
              name="username"
              autoComplete="name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
              required
              autoFocus
              className="w-full px-4 py-3 rounded-xl bg-white/80 hover:bg-white focus:bg-white outline-none transition-all text-gray-800 placeholder-gray-500 border-2 border-transparent focus:border-pink-2 cursor-text"
            />
          </div>

          <div>
            <label
              htmlFor="roomId"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Room ID (Optional)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="roomId"
                name="roomId"
                autoComplete="off"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter or generate room ID"
                className="flex-1 px-4 py-3 rounded-xl bg-white/80 hover:bg-white focus:bg-white outline-none transition-all text-gray-800 placeholder-gray-500 border-2 border-transparent focus:border-sky-2 cursor-text"
              />
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={generateRoomId}
                className="btn-secondary whitespace-nowrap"
              >
                Generate
              </motion.button>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Leave empty to create a new room, or enter an existing room ID to join
            </p>
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary w-full text-lg"
          >
            Start Call
          </motion.button>
        </form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-4 bg-blue-50 rounded-xl"
        >
          <p className="text-xs text-gray-700 text-center">
            <strong>📹 Before you start:</strong>
            <br />
            Make sure to allow camera and microphone access when prompted by your browser.
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
