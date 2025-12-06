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

export default function FloatingHearts() {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const emojis = ['❤️', '💕', '💖', '💗', '💓', '💝']
    const newParticles: Particle[] = []
    for (let i = 0; i < 6; i++) {
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
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
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
