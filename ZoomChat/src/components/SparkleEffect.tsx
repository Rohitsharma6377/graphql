'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Sparkle {
  id: number
  x: number
  y: number
  size: number
}

export default function SparkleEffect() {
  const [sparkles, setSparkles] = useState<Sparkle[]>([])

  useEffect(() => {
    const interval = setInterval(() => {
      const newSparkle: Sparkle = {
        id: Date.now(),
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: 5 + Math.random() * 10,
      }
      
      setSparkles((prev) => [...prev.slice(-20), newSparkle])
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          className="absolute"
          style={{
            left: sparkle.x,
            top: sparkle.y,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            rotate: [0, 180]
          }}
          transition={{ duration: 1.5 }}
        >
          <div 
            className="bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 rounded-full blur-sm"
            style={{ 
              width: sparkle.size,
              height: sparkle.size 
            }}
          />
        </motion.div>
      ))}
    </div>
  )
}
