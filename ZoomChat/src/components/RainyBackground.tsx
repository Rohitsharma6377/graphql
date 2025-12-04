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

interface Lightning {
  id: number
  show: boolean
}

export default function RainyBackground() {
  const [rainDrops, setRainDrops] = useState<RainDrop[]>([])
  const [leaves, setLeaves] = useState<Leaf[]>([])
  const [lightning, setLightning] = useState<Lightning>({ id: 0, show: false })

  useEffect(() => {
    // Create rain drops
    const newRainDrops: RainDrop[] = []
    for (let i = 0; i < 80; i++) {
      newRainDrops.push({
        id: i,
        left: Math.random() * 100,
        duration: 0.8 + Math.random() * 0.8,
        delay: Math.random() * 3,
      })
    }
    setRainDrops(newRainDrops)

    // Create falling leaves
    const leafEmojis = ['🍃', '🍂', '🌸', '🌺', '🌼', '🌷', '💧', '☂️']
    const newLeaves: Leaf[] = []
    for (let i = 0; i < 30; i++) {
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

      {/* Rain drops */}
      {rainDrops.map((drop) => (
        <motion.div
          key={`rain-${drop.id}`}
          className="absolute w-0.5 h-16 bg-gradient-to-b from-blue-300/50 to-transparent"
          style={{
            left: `${drop.left}%`,
            top: '-80px',
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

      {/* Falling leaves, flowers and rain elements */}
      {leaves.map((leaf) => (
        <motion.div
          key={`leaf-${leaf.id}`}
          className="absolute text-2xl opacity-70"
          style={{
            left: `${leaf.left}%`,
            top: '-50px',
          }}
          animate={{
            y: [0, window.innerHeight + 100],
            x: [0, Math.sin(leaf.id) * 150, Math.cos(leaf.id) * 150],
            rotate: [leaf.rotation, leaf.rotation + 720],
            opacity: [0, 0.7, 0.7, 0],
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

      {/* Dark Clouds */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`cloud-${i}`}
          className="absolute text-6xl opacity-30"
          style={{
            left: `${i * 35}%`,
            top: `${5 + i * 3}%`,
          }}
          animate={{
            x: [-100, window.innerWidth + 100],
          }}
          transition={{
            duration: 40 + i * 10,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          ☁️
        </motion.div>
      ))}
    </div>
  )
}
