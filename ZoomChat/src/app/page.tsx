'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Video, MessageCircle, Heart, Sparkles, Shield, Users } from 'lucide-react'

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
    <div className="min-h-[100dvh] relative overflow-hidden flex items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Animated gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-pink-50 via-white to-sky-50 -z-10" />
      
      {/* Floating hearts animation */}
      <div className="fixed inset-0 -z-5 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          >
            ❤️
          </motion.div>
        ))}
      </div>

      <div className="max-w-6xl w-full mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-card p-8 sm:p-10 md:p-12 text-center"
        >
          {/* Logo and title */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="mb-6"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-3 bg-gradient-to-r from-pink-500 via-pink-400 to-sky-500 bg-clip-text text-transparent">
              HeartShare
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 font-medium">
              Connect face-to-face with crystal clear video
            </p>
          </motion.div>

          {/* Loading indicator */}
          <div className="flex gap-2 justify-center mb-12">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-pink-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <FeatureCard
              icon={<Video className="w-6 h-6 sm:w-8 sm:h-8" />}
              title="HD Video"
              description="Crystal clear video quality"
              delay={0}
            />
            <FeatureCard
              icon={<MessageCircle className="w-6 h-6 sm:w-8 sm:h-8" />}
              title="Real-time Chat"
              description="Instant messaging & emojis"
              delay={0.1}
            />
            <FeatureCard
              icon={<Heart className="w-6 h-6 sm:w-8 sm:h-8" />}
              title="Romantic Themes"
              description="Beautiful animations & effects"
              delay={0.2}
            />
            <FeatureCard
              icon={<Sparkles className="w-6 h-6 sm:w-8 sm:h-8" />}
              title="Premium Features"
              description="Exclusive backgrounds & stickers"
              delay={0.3}
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6 sm:w-8 sm:h-8" />}
              title="Secure & Private"
              description="End-to-end encrypted calls"
              delay={0.4}
            />
            <FeatureCard
              icon={<Users className="w-6 h-6 sm:w-8 sm:h-8" />}
              title="Multi-user Rooms"
              description="Connect with multiple people"
              delay={0.5}
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description, delay }: {
  icon: React.ReactNode
  title: string
  description: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow"
    >
      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-pink-400 to-sky-400 flex items-center justify-center text-white mx-auto mb-3 sm:mb-4">
        {icon}
      </div>
      <h3 className="font-bold text-base sm:text-lg mb-1 sm:mb-2 text-gray-800">{title}</h3>
      <p className="text-xs sm:text-sm text-gray-600">{description}</p>
    </motion.div>
  )
}
