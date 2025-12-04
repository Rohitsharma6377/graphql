'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Wave {
  id: number
  delay: number
}

interface Fish {
  id: number
  startY: number
  duration: number
  delay: number
  emoji: string
}

export default function OceanWaves() {
  const [waves, setWaves] = useState<Wave[]>([])
  const [fish, setFish] = useState<Fish[]>([])
  const [bubbles, setBubbles] = useState<{ id: number; left: number; duration: number; delay: number }[]>([])

  useEffect(() => {
    // Wave layers
    const newWaves: Wave[] = []
    for (let i = 0; i < 3; i++) {
      newWaves.push({
        id: i,
        delay: i * 0.5,
      })
    }
    setWaves(newWaves)

    // Swimming fish
    const fishEmojis = ['🐠', '🐟', '🐡', '🦈', '🐬']
    const newFish: Fish[] = []
    for (let i = 0; i < 10; i++) {
      newFish.push({
        id: i,
        startY: 20 + Math.random() * 60,
        duration: 10 + Math.random() * 8,
        delay: Math.random() * 5,
        emoji: fishEmojis[Math.floor(Math.random() * fishEmojis.length)],
      })
    }
    setFish(newFish)

    // Floating bubbles
    const newBubbles = []
    for (let i = 0; i < 20; i++) {
      newBubbles.push({
        id: i,
        left: Math.random() * 100,
        duration: 5 + Math.random() * 3,
        delay: Math.random() * 4,
      })
    }
    setBubbles(newBubbles)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Swimming Fish */}
      {fish.map((item) => (
        <motion.div
          key={`fish-${item.id}`}
          className="absolute text-3xl"
          style={{
            left: '-100px',
            top: `${item.startY}%`,
          }}
          animate={{
            x: [0, window.innerWidth + 200],
            y: [0, Math.sin(item.id) * 80, 0],
            rotateY: [0, 180, 0],
          }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {item.emoji}
        </motion.div>
      ))}

      {/* Floating Bubbles */}
      {bubbles.map((bubble) => (
        <motion.div
          key={`bubble-${bubble.id}`}
          className="absolute w-2 h-2 bg-white/40 rounded-full"
          style={{
            left: `${bubble.left}%`,
            bottom: '-20px',
          }}
          animate={{
            y: [0, -(window.innerHeight + 50)],
            x: [0, Math.sin(bubble.id) * 50],
            opacity: [0, 0.6, 0],
            scale: [0.5, 1, 0.5],
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
