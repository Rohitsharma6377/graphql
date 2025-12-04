'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface RainDrop {
  id: number
  left: number
  duration: number
  delay: number
}

interface Leaf {
  id: number
  left: number
  duration: number
  delay: number
  rotation: number
  emoji: string
}

export default function RainyBackground() {
  const [rainDrops, setRainDrops] = useState<RainDrop[]>([])
  const [leaves, setLeaves] = useState<Leaf[]>([])

  useEffect(() => {
    // Create rain drops
    const newRainDrops: RainDrop[] = []
    for (let i = 0; i < 50; i++) {
      newRainDrops.push({
        id: i,
        left: Math.random() * 100,
        duration: 1 + Math.random() * 1,
        delay: Math.random() * 3,
      })
    }
    setRainDrops(newRainDrops)

    // Create falling leaves
    const leafEmojis = ['🍃', '🍂', '🌸', '🌺', '🌼']
    const newLeaves: Leaf[] = []
    for (let i = 0; i < 20; i++) {
      newLeaves.push({
        id: i,
        left: Math.random() * 100,
        duration: 10 + Math.random() * 5,
        delay: Math.random() * 5,
        rotation: Math.random() * 360,
        emoji: leafEmojis[Math.floor(Math.random() * leafEmojis.length)],
      })
    }
    setLeaves(newLeaves)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Rain drops */}
      {rainDrops.map((drop) => (
        <motion.div
          key={`rain-${drop.id}`}
          className="absolute w-0.5 h-12 bg-gradient-to-b from-sky-300/40 to-transparent"
          style={{
            left: `${drop.left}%`,
            top: '-50px',
          }}
          animate={{
            y: [0, window.innerHeight + 100],
          }}
          transition={{
            duration: drop.duration,
            delay: drop.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}

      {/* Falling leaves and flowers */}
      {leaves.map((leaf) => (
        <motion.div
          key={`leaf-${leaf.id}`}
          className="absolute text-2xl opacity-60"
          style={{
            left: `${leaf.left}%`,
            top: '-50px',
          }}
          animate={{
            y: [0, window.innerHeight + 100],
            x: [0, Math.sin(leaf.id) * 150, Math.cos(leaf.id) * 150],
            rotate: [leaf.rotation, leaf.rotation + 720],
            opacity: [0, 0.6, 0.6, 0],
          }}
          transition={{
            duration: leaf.duration,
            delay: leaf.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {leaf.emoji}
        </motion.div>
      ))}
    </div>
  )
}
