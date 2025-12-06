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

export default function RomanticRoses() {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const emojis = ['🌹', '🌸', '🌺', '💐', '🌷', '💕', '💖']
    const newParticles: Particle[] = []
    for (let i = 0; i < 7; i++) {
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
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
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
