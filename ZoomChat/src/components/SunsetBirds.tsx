'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Particle {
  id: number
  startY: number
  duration: number
  delay: number
  size: number
  emoji: string
}

export default function SunsetBirds() {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const emojis = ['🕊️', '🦅', '☁️', '🌅', '🌙']
    const newParticles: Particle[] = []
    for (let i = 0; i < 5; i++) {
      newParticles.push({
        id: i,
        startY: 20 + Math.random() * 60,
        duration: 12 + Math.random() * 10,
        delay: Math.random() * 5,
        size: 25 + Math.random() * 20,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
      })
    }
    setParticles(newParticles)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Animated "Love You" Text */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
        animate={{
          scale: [1, 1.08, 1],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold bg-gradient-to-r from-orange-300 via-amber-400 to-orange-300 bg-clip-text text-transparent drop-shadow-2xl">
          Love You
        </h1>
        <motion.p
          animate={{ opacity: [0.4, 0.9, 0.4], scale: [0.98, 1.02, 0.98] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-2xl md:text-4xl mt-5 text-orange-200/70 drop-shadow-xl"
        >
          🌅 Waiting for others... 🌅
        </motion.p>
      </motion.div>

      {/* Flying elements overlay */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute"
          style={{
            left: '-100px',
            top: `${particle.startY}%`,
            fontSize: `${particle.size}px`,
          }}
          animate={{
            x: [0, window.innerWidth + 200],
            y: [0, Math.sin(particle.id) * 60, Math.cos(particle.id) * 40, 0],
            rotate: [0, 15, -15, 0],
            opacity: [0, 1, 1, 0],
            scale: [0.5, 1.2, 1, 0.8],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <div className="drop-shadow-2xl">{particle.emoji}</div>
        </motion.div>
      ))}

      {/* Twinkling Stars */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute text-yellow-200"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 60}%`,
            fontSize: `${15 + Math.random() * 15}px`,
          }}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1.4, 0.8],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2 + Math.random() * 3,
            delay: Math.random() * 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className="drop-shadow-xl">⭐</div>
        </motion.div>
      ))}
    </div>
  )
}
