'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Particle {
  id: number
  left: number
  duration: number
  delay: number
  size: number
  rotation: number
  emoji: string
}

interface FloatingText {
  id: number
  text: string
  left: number
  delay: number
}

export default function RomanticRoses() {
  const [particles, setParticles] = useState<Particle[]>([])
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([])

  useEffect(() => {
    const emojis = ['🌹', '🌸', '🌺', '💐', '🌷', '🌼', '💕', '💖', '💝', '🦋', '✨', '☁️🌹', '☁️💕', '☁️❤️']
    const newParticles: Particle[] = []
    for (let i = 0; i < 45; i++) {
      newParticles.push({
        id: i,
        left: Math.random() * 100,
        duration: 10 + Math.random() * 8,
        delay: Math.random() * 5,
        size: 20 + Math.random() * 25,
        rotation: Math.random() * 360,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
      })
    }
    setParticles(newParticles)

    // Romantic floating texts
    const texts = ['Love You 🌹', 'My Love', 'Forever', 'Be Mine', '💕 Love 💕', 'Together', 'Always ❤️', 'You & Me']
    const newTexts: FloatingText[] = []
    for (let i = 0; i < 10; i++) {
      newTexts.push({
        id: i,
        text: texts[Math.floor(Math.random() * texts.length)],
        left: 15 + Math.random() * 70,
        delay: i * 3.5,
      })
    }
    setFloatingTexts(newTexts)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Movie-style floating romantic texts */}
      {floatingTexts.map((item) => (
        <motion.div
          key={`text-${item.id}`}
          className="absolute text-2xl md:text-3xl font-bold bg-gradient-to-r from-rose-300 via-pink-400 to-rose-300 bg-clip-text text-transparent drop-shadow-2xl whitespace-nowrap"
          style={{
            left: `${item.left}%`,
            bottom: '-100px',
          }}
          animate={{
            y: [0, -(window.innerHeight + 200)],
            x: [0, Math.sin(item.id) * 120],
            opacity: [0, 1, 1, 1, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 16,
            delay: item.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {item.text}
        </motion.div>
      ))}

      {/* Floating rose petals and hearts overlay */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute"
          style={{
            left: `${particle.left}%`,
            top: '-50px',
            fontSize: `${particle.size}px`,
          }}
          animate={{
            y: [0, window.innerHeight + 100],
            x: [0, Math.sin(particle.id) * 150, Math.cos(particle.id) * 100],
            rotate: [particle.rotation, particle.rotation + 720],
            opacity: [0, 1, 1, 0],
            scale: [0.5, 1.3, 1, 0.7],
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
