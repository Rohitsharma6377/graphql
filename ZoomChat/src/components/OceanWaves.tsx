'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Bubble {
  id: number
  left: number
  duration: number
  delay: number
}

interface Particle {
  id: number
  left: number
  startY: number
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

export default function OceanWaves() {
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const [particles, setParticles] = useState<Particle[]>([])
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([])

  useEffect(() => {
    // Bubbles
    const newBubbles: Bubble[] = []
    for (let i = 0; i < 25; i++) {
      newBubbles.push({
        id: i,
        left: Math.random() * 100,
        duration: 5 + Math.random() * 4,
        delay: Math.random() * 4,
      })
    }
    setBubbles(newBubbles)

    // Ocean creatures and elements with clouds+hearts
    const emojis = ['🐠', '🐟', '🐡', '🦈', '🐬', '🐙', '🦑', '🐚', '⭐', '🌊', '💧', '💦', '☁️❤️', '☁️💙', '☁️💛']
    const newParticles: Particle[] = []
    for (let i = 0; i < 35; i++) {
      newParticles.push({
        id: i,
        left: Math.random() * 100,
        startY: 20 + Math.random() * 60,
        duration: 10 + Math.random() * 8,
        delay: Math.random() * 5,
        size: 25 + Math.random() * 20,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
      })
    }
    setParticles(newParticles)

    // Ocean-themed floating texts with wave motion
    const texts = ['Love You 🌊', 'Ocean Love', 'Deep Blue', 'Dive In', '💙 Love 💙', 'Blue Heart', 'Waves ❤️', 'Sea You']
    const newTexts: FloatingText[] = []
    for (let i = 0; i < 12; i++) {
      newTexts.push({
        id: i,
        text: texts[Math.floor(Math.random() * texts.length)],
        left: 10 + Math.random() * 80,
        delay: i * 2.8,
      })
    }
    setFloatingTexts(newTexts)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Movie-style floating ocean texts with wave-like motion */}
      {floatingTexts.map((item) => (
        <motion.div
          key={`text-${item.id}`}
          className="absolute text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300 bg-clip-text text-transparent drop-shadow-2xl whitespace-nowrap"
          style={{
            left: `${item.left}%`,
            bottom: '-100px',
          }}
          animate={{
            y: [0, -(window.innerHeight + 200)],
            x: [0, Math.sin(item.id * 0.5) * 150, Math.cos(item.id * 0.3) * 120, 0],
            opacity: [0, 1, 1, 1, 0],
            scale: [0.8, 1.1, 1, 1, 0.8],
          }}
          transition={{
            duration: 18,
            delay: item.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {item.text}
        </motion.div>
      ))}

      {/* Swimming creatures */}
      {particles.map((particle) => (
        <motion.div
          key={`creature-${particle.id}`}
          className="absolute"
          style={{
            left: '-100px',
            top: `${particle.startY}%`,
            fontSize: `${particle.size}px`,
          }}
          animate={{
            x: [0, window.innerWidth + 200],
            y: [0, Math.sin(particle.id) * 80, 0],
            rotateY: [0, 180, 0],
            scale: [0.8, 1.2, 1, 0.9],
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

      {/* Floating Bubbles overlay */}
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className="absolute w-3 h-3 bg-white/50 rounded-full shadow-lg"
          style={{
            left: `${bubble.left}%`,
            bottom: '-20px',
          }}
          animate={{
            y: [0, -(window.innerHeight + 50)],
            x: [0, Math.sin(bubble.id) * 100],
            opacity: [0, 0.9, 0],
            scale: [0.5, 1.5, 0.5],
          }}
          transition={{
            duration: bubble.duration,
            delay: bubble.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}
