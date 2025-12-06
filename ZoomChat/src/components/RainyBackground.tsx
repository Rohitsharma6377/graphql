'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Lightning {
  id: number
  show: boolean
}

interface Particle {
  id: number
  left: number
  duration: number
  delay: number
  size: number
  emoji: string
  rotation: number
}

export default function RainyBackground() {
  const [lightning, setLightning] = useState<Lightning>({ id: 0, show: false })
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    // Rain-themed emojis
    const emojis = ['🍃', '💧', '☂️', '🌧️', '💦']
    const newParticles: Particle[] = []
    for (let i = 0; i < 5; i++) {
      newParticles.push({
        id: i,
        left: Math.random() * 100,
        duration: 4 + Math.random() * 4,
        delay: Math.random() * 3,
        size: 20 + Math.random() * 15,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        rotation: Math.random() * 360,
      })
    }
    setParticles(newParticles)

    // Thunder/Lightning effect
    const lightningInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        setLightning({ id: Date.now(), show: true })
        setTimeout(() => {
          setLightning((prev) => ({ ...prev, show: false }))
        }, 200)
      }
    }, 8000)

    return () => clearInterval(lightningInterval)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Animated "Love You" Text */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent drop-shadow-2xl">
          Love You
        </h1>
        <motion.p
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-2xl md:text-4xl mt-4 text-blue-200/60 drop-shadow-xl"
        >
          🌧️ Waiting for others...
        </motion.p>
      </motion.div>

      {/* Floating rain elements */}
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
            x: [0, Math.sin(particle.id) * 120, Math.cos(particle.id) * 100],
            rotate: [particle.rotation, particle.rotation + 720],
            opacity: [0, 0.9, 0.9, 0],
            scale: [0.5, 1.2, 1, 0.7],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className="drop-shadow-xl">{particle.emoji}</div>
        </motion.div>
      ))}

      {/* Lightning Flash */}
      {lightning.show && (
        <>
          <motion.div
            key={`lightning-${lightning.id}`}
            className="absolute inset-0 bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0, 0.4, 0] }}
            transition={{ duration: 0.3 }}
          />
          <motion.div
            className="absolute text-yellow-200 text-8xl"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: '10%',
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
            transition={{ duration: 0.3 }}
          >
            ⚡
          </motion.div>
        </>
      )}
    </div>
  )
}
