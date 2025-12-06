'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Particle {
  id: number
  left: number
  duration: number
  delay: number
  size: number
  emoji: string
}

interface FloatingText {
  id: number
  text: string
  left: number
  delay: number
}

export default function FloatingHearts() {
  const [particles, setParticles] = useState<Particle[]>([])
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([])

  useEffect(() => {
    const emojis = ['❤️', '💕', '💖', '💗', '💓', '💝', '💘', '💞', '✨', '⭐', '🌟', '💫', '☁️❤️', '☁️💕', '☁️💖']
    const newParticles: Particle[] = []
    for (let i = 0; i < 40; i++) {
      newParticles.push({
        id: i,
        left: Math.random() * 100,
        duration: 8 + Math.random() * 6,
        delay: Math.random() * 5,
        size: 15 + Math.random() * 20,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
      })
    }
    setParticles(newParticles)

    // Create floating movie-style texts
    const texts = ['Love You', 'Waiting for you', 'Miss You', 'Come Soon', 'Love You ❤️', 'Waiting...', '❤️ Love ❤️']
    const newTexts: FloatingText[] = []
    for (let i = 0; i < 12; i++) {
      newTexts.push({
        id: i,
        text: texts[Math.floor(Math.random() * texts.length)],
        left: 10 + Math.random() * 80,
        delay: i * 3,
      })
    }
    setFloatingTexts(newTexts)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Movie-style floating Love You texts */}
      {floatingTexts.map((item) => (
        <motion.div
          key={`text-${item.id}`}
          className="absolute text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-300 via-purple-300 to-pink-300 bg-clip-text text-transparent drop-shadow-2xl whitespace-nowrap"
          style={{
            left: `${item.left}%`,
            bottom: '-100px',
          }}
          animate={{
            y: [0, -(window.innerHeight + 200)],
            x: [0, Math.sin(item.id) * 100],
            opacity: [0, 1, 1, 1, 0],
            scale: [0.8, 1.1, 1, 1, 0.8],
          }}
          transition={{
            duration: 15,
            delay: item.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {item.text}
        </motion.div>
      ))}

      {/* Floating particles overlay */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute"
          style={{
            left: `${particle.left}%`,
            bottom: '-50px',
            fontSize: `${particle.size}px`,
          }}
          animate={{
            y: [0, -window.innerHeight - 100],
            x: [0, Math.sin(particle.id) * 100, Math.cos(particle.id) * 80],
            rotate: [0, 360, 720],
            opacity: [0, 0.9, 0.9, 0],
            scale: [0.5, 1.2, 1, 0.8],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className="drop-shadow-2xl">{particle.emoji}</div>
        </motion.div>
      ))}
    </div>
  )
}
