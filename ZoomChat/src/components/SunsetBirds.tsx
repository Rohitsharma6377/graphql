'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Bird {
  id: number
  startY: number
  duration: number
  delay: number
  size: number
}

interface Cloud {
  id: number
  top: number
  duration: number
  delay: number
}

export default function SunsetBirds() {
  const [birds, setBirds] = useState<Bird[]>([])
  const [clouds, setClouds] = useState<Cloud[]>([])

  useEffect(() => {
    // Flying birds - more birds for dynamic sky
    const newBirds: Bird[] = []
    for (let i = 0; i < 12; i++) {
      newBirds.push({
        id: i,
        startY: 10 + Math.random() * 50,
        duration: 12 + Math.random() * 10,
        delay: Math.random() * 10,
        size: 20 + Math.random() * 20,
      })
    }
    setBirds(newBirds)

    // Floating clouds
    const newClouds: Cloud[] = []
    for (let i = 0; i < 8; i++) {
      newClouds.push({
        id: i,
        top: 5 + Math.random() * 40,
        duration: 25 + Math.random() * 25,
        delay: Math.random() * 15,
      })
    }
    setClouds(newClouds)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Flying Birds */}
      {birds.map((bird) => (
        <motion.div
          key={`bird-${bird.id}`}
          className="absolute"
          style={{
            left: '-100px',
            top: `${bird.startY}%`,
            fontSize: `${bird.size}px`,
          }}
          animate={{
            x: [0, window.innerWidth + 200],
            y: [0, Math.sin(bird.id) * 50, Math.cos(bird.id) * 30, 0],
            rotate: [0, 10, -10, 0],
            opacity: [0, 1, 1, 1, 0],
          }}
          transition={{
            duration: bird.duration,
            delay: bird.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          🕊️
        </motion.div>
      ))}

      {/* Floating Clouds */}
      {clouds.map((cloud) => (
        <motion.div
          key={`cloud-${cloud.id}`}
          className="absolute text-6xl opacity-40"
          style={{
            left: '-200px',
            top: `${cloud.top}%`,
          }}
          animate={{
            x: [0, window.innerWidth + 400],
          }}
          transition={{
            duration: cloud.duration,
            delay: cloud.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          ☁️
        </motion.div>
      ))}

      {/* Twinkling Stars for evening effect */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute text-yellow-200"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 60}%`,
            fontSize: `${12 + Math.random() * 12}px`,
          }}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            delay: Math.random() * 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          ⭐
        </motion.div>
      ))}
    </div>
  )
}
