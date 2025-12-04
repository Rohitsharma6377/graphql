'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface EmojiNotificationProps {
  emoji: string | null
  username: string | null
}

export default function EmojiNotification({ emoji, username }: EmojiNotificationProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (emoji && username) {
      setShow(true)
      const timer = setTimeout(() => setShow(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [emoji, username])

  return (
    <AnimatePresence>
      {show && emoji && username && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-40 glass-card px-6 py-3 flex items-center gap-3 shadow-2xl"
        >
          <span className="text-3xl">{emoji}</span>
          <span className="text-sm font-medium text-gray-700">
            {username} sent a reaction
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
