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

export default function OceanWaves() {
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    // Bubbles
    const newBubbles: Bubble[] = []
    for (let i = 0; i < 4; i++) {
      newBubbles.push({
        id: i,
        left: Math.random() * 100,
        duration: 5 + Math.random() * 4,
        delay: Math.random() * 4,
      })
    }
    setBubbles(newBubbles)

    // Ocean creatures
    const emojis = ['🐠', '🐟', '🐡', '🐬', '🌊']
    const newParticles: Particle[] = []
    for (let i = 0; i < 5; i++) {
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
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
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
