'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Rose {
  id: number
  left: number
  duration: number
  delay: number
  size: number
  rotation: number
}

export default function RomanticRoses() {
  const [roses, setRoses] = useState<Rose[]>([])
  const [petals, setPetals] = useState<Rose[]>([])

  useEffect(() => {
    // Falling roses
    const newRoses: Rose[] = []
    for (let i = 0; i < 12; i++) {
      newRoses.push({
        id: i,
        left: Math.random() * 100,
        duration: 8 + Math.random() * 4,
        delay: Math.random() * 5,
        size: 30 + Math.random() * 20,
        rotation: Math.random() * 360,
      })
    }
    setRoses(newRoses)

    // Floating petals
    const newPetals: Rose[] = []
    for (let i = 0; i < 25; i++) {
      newPetals.push({
        id: i + 100,
        left: Math.random() * 100,
        duration: 10 + Math.random() * 5,
        delay: Math.random() * 5,
        size: 15 + Math.random() * 15,
        rotation: Math.random() * 360,
      })
    }
    setPetals(newPetals)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Falling Roses */}
      {roses.map((rose) => (
        <motion.div
          key={`rose-${rose.id}`}
          className="absolute"
          style={{
            left: `${rose.left}%`,
            top: '-80px',
            fontSize: `${rose.size}px`,
          }}
          animate={{
            y: [0, window.innerHeight + 100],
            x: [0, Math.sin(rose.id) * 100, Math.cos(rose.id) * 80],
            rotate: [rose.rotation, rose.rotation + 360],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: rose.duration,
            delay: rose.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          🌹
        </motion.div>
      ))}

      {/* Floating Rose Petals */}
      {petals.map((petal) => (
        <motion.div
          key={`petal-${petal.id}`}
          className="absolute opacity-60"
          style={{
            left: `${petal.left}%`,
            top: '-50px',
            fontSize: `${petal.size}px`,
          }}
          animate={{
            y: [0, window.innerHeight + 100],
            x: [0, Math.sin(petal.id) * 150, Math.cos(petal.id) * 120],
            rotate: [petal.rotation, petal.rotation + 720],
            opacity: [0, 0.7, 0.7, 0],
          }}
          transition={{
            duration: petal.duration,
            delay: petal.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          🌸
        </motion.div>
      ))}
    </div>
  )
}
