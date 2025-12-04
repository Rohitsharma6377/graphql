'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

export interface FallingEmoji {
  id: string
  emoji: string
  timestamp: number
}

interface FallingEmojisProps {
  emojis: FallingEmoji[]
}

// Cute animation variations
const animations = [
  // Bouncy fall
  {
    y: (height: number) => [0, height * 0.3, height * 0.5, height * 0.8, height + 100],
    rotate: [0, 180, 360, 540, 720],
    scale: [0, 1.8, 1.3, 1.1, 0.8],
  },
  // Spiral fall
  {
    y: (height: number) => [0, height + 100],
    rotate: [0, 1080], // 3 full rotations
    scale: [0, 2, 1.5, 1, 0.7],
  },
  // Wave fall
  {
    y: (height: number) => [0, height + 100],
    rotate: [0, 360, 720],
    scale: [0, 1.5, 1.8, 1.2, 0.9],
  },
]

export default function FallingEmojis({ emojis }: FallingEmojisProps) {
  const [activeEmojis, setActiveEmojis] = useState<FallingEmoji[]>([])

  useEffect(() => {
    if (emojis.length > 0) {
      console.log('🎨 FallingEmojis received:', emojis)
      setActiveEmojis(emojis)
      
      // Remove emojis after animation completes (4 seconds)
      const timer = setTimeout(() => {
        console.log('⏰ Clearing emojis after animation')
        setActiveEmojis([])
      }, 4000)

      return () => clearTimeout(timer)
    }
  }, [emojis])

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {activeEmojis.map((item) => {
          // Random horizontal position
          const randomX = Math.random() * 100
          // Random animation variant
          const animIndex = Math.floor(Math.random() * animations.length)
          const anim = animations[animIndex]
          // Random horizontal drift
          const randomDrift = (Math.random() - 0.5) * 300
          // Random initial rotation
          const randomRotateStart = Math.random() * 360

          const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800

          return (
            <motion.div
              key={item.id}
              initial={{
                opacity: 1,
                scale: 0,
                x: `${randomX}vw`,
                y: -100,
                rotate: randomRotateStart,
              }}
              animate={{
                opacity: [1, 1, 1, 0.8, 0],
                scale: anim.scale,
                y: typeof anim.y === 'function' ? anim.y(windowHeight) : anim.y,
                x: `${randomX}vw`,
                rotate: anim.rotate.map((r) => r + randomRotateStart),
              }}
              exit={{
                opacity: 0,
                scale: 0,
              }}
              transition={{
                duration: 4,
                ease: 'easeInOut',
              }}
              className="absolute text-6xl md:text-7xl filter drop-shadow-2xl"
              style={{
                left: 0,
                top: 0,
              }}
            >
              <motion.div
                animate={{
                  x: [0, randomDrift, -randomDrift / 2, randomDrift / 3, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                {item.emoji}
              </motion.div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
