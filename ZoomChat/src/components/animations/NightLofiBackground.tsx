'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Star {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
}

interface ShootingStar {
  id: number
  x: number
  y: number
}

export default function NightLofiBackground() {
  const [stars, setStars] = useState<Star[]>([])
  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([])

  useEffect(() => {
    // Generate random stars - more stars for a fuller sky
    const newStars: Star[] = []
    for (let i = 0; i < 150; i++) {
      newStars.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 0.5,
        duration: Math.random() * 3 + 1.5,
        delay: Math.random() * 5,
      })
    }
    setStars(newStars)

    // Generate shooting stars periodically - more frequent
    const shootingStarInterval = setInterval(() => {
      const newShootingStar: ShootingStar = {
        id: Date.now(),
        x: Math.random() * 100,
        y: Math.random() * 40,
      }
      setShootingStars((prev) => [...prev, newShootingStar])

      // Remove shooting star after animation
      setTimeout(() => {
        setShootingStars((prev) => prev.filter((star) => star.id !== newShootingStar.id))
      }, 2000)
    }, 4000) // Every 4 seconds instead of 8

    return () => clearInterval(shootingStarInterval)
  }, [])

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      {/* Moon */}
      <motion.div
        className="absolute top-10 right-20 w-32 h-32 rounded-full bg-gradient-to-br from-yellow-200 to-orange-100 shadow-lg shadow-yellow-200/50"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: [0.7, 0.9, 0.7],
          scale: [0.98, 1.02, 0.98],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Moon craters */}
        <div className="absolute top-8 left-6 w-6 h-6 rounded-full bg-orange-200/30" />
        <div className="absolute top-16 right-8 w-4 h-4 rounded-full bg-orange-200/20" />
        <div className="absolute bottom-10 left-12 w-5 h-5 rounded-full bg-orange-200/25" />
      </motion.div>

      {/* Twinkling Stars */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Shooting Stars */}
      {shootingStars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
          }}
          initial={{ opacity: 0, x: 0, y: 0 }}
          animate={{
            opacity: [0, 1, 0],
            x: [0, -200],
            y: [0, 200],
          }}
          transition={{
            duration: 2,
            ease: "easeOut"
          }}
        >
          <div className="absolute w-20 h-0.5 bg-gradient-to-r from-white to-transparent -rotate-45" />
        </motion.div>
      ))}

      {/* Floating Music Notes */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`note-${i}`}
          className="absolute text-3xl opacity-20"
          style={{
            left: `${10 + i * 12}%`,
            bottom: -50,
          }}
          animate={{
            y: [-50, -window.innerHeight - 50],
            x: [0, Math.sin(i) * 50],
            rotate: [0, 360],
            opacity: [0, 0.3, 0.3, 0],
          }}
          transition={{
            duration: 15 + i * 2,
            repeat: Infinity,
            delay: i * 2,
            ease: "linear"
          }}
        >
          {i % 2 === 0 ? '♪' : '♫'}
        </motion.div>
      ))}

      {/* Floating Hearts (Romantic Theme) */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`heart-${i}`}
          className="absolute text-4xl opacity-15"
          style={{
            left: `${5 + i * 15}%`,
            bottom: -50,
          }}
          animate={{
            y: [-50, -window.innerHeight - 50],
            x: [0, Math.cos(i) * 40],
            rotate: [0, -20, 20, 0],
            scale: [0.8, 1.2, 0.8],
            opacity: [0, 0.2, 0.2, 0],
          }}
          transition={{
            duration: 20 + i * 3,
            repeat: Infinity,
            delay: i * 3,
            ease: "easeInOut"
          }}
        >
          💜
        </motion.div>
      ))}

      {/* Floating Clouds */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`cloud-${i}`}
          className="absolute text-white/20"
          style={{
            left: `${-20 + i * 25}%`,
            top: `${10 + (i % 3) * 20}%`,
            fontSize: i % 2 === 0 ? '4rem' : '6rem',
          }}
          animate={{
            x: [0, window.innerWidth + 200],
            opacity: [0, 0.3, 0.3, 0],
          }}
          transition={{
            duration: 40 + i * 10,
            repeat: Infinity,
            delay: i * 5,
            ease: "linear"
          }}
        >
          ☁️
        </motion.div>
      ))}

      {/* Fireflies (Jugnu) */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`firefly-${i}`}
          className="absolute w-2 h-2 rounded-full bg-yellow-300 shadow-lg shadow-yellow-400/80"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            x: [0, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, 0],
            y: [0, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, 0],
            opacity: [0, 1, 1, 0.5, 1, 0],
            scale: [0.5, 1.5, 1, 1.5, 0.5],
          }}
          transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Glowing Particles */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-1 h-1 rounded-full bg-purple-400"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: [0, 0.6, 0],
            scale: [0, 2, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Gradient Overlay for Depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-indigo-900/10" />
    </div>
  )
}
