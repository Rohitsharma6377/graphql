'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
  className?: string
}

const EMOJI_CATEGORIES = {
  hearts: ['❤️', '💖', '💕', '💗', '💓', '💝', '💞', '💘', '💟', '🩷', '🩵', '💙'],
  faces: ['😊', '😍', '🥰', '😘', '😄', '😁', '🤗', '🥳', '😎', '🤩', '😇', '🤭'],
  hands: ['👋', '🤚', '✋', '🖐️', '👌', '🤌', '🤏', '✌️', '🤞', '🫰', '🤟', '🤘'],
  nature: ['🌸', '🌺', '🌼', '🌻', '🌹', '🌷', '🦋', '🐝', '🌈', '⭐', '✨', '🌟'],
  animals: ['🐱', '🐶', '🐰', '🐻', '🐼', '🦊', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸'],
  food: ['🍕', '🍔', '🍟', '🌭', '🍿', '🧁', '🍰', '🎂', '🍪', '🍩', '🍦', '🍓'],
}

export default function EmojiPicker({ onEmojiSelect, className = '' }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<keyof typeof EMOJI_CATEGORIES>('hearts')

  const handleEmojiClick = (emoji: string) => {
    console.log('👆 Emoji clicked:', emoji)
    onEmojiSelect(emoji)
    setIsOpen(false)
  }

  return (
    <div className={`relative ${className}`}>
      {/* Emoji Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-gradient-heartshare flex items-center justify-center text-xl hover:shadow-lg transition-shadow"
        type="button"
      >
        😊
      </motion.button>

      {/* Emoji Picker Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full right-0 mb-2 w-72 glass-card p-3 shadow-2xl"
          >
            {/* Category Tabs */}
            <div className="flex gap-1 mb-3 overflow-x-auto pb-2">
              {Object.keys(EMOJI_CATEGORIES).map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category as keyof typeof EMOJI_CATEGORIES)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all capitalize ${
                    activeCategory === category
                      ? 'bg-gradient-heartshare text-gray-800'
                      : 'bg-white/40 text-gray-600 hover:bg-white/60'
                  }`}
                  type="button"
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Emoji Grid */}
            <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
              {EMOJI_CATEGORIES[activeCategory].map((emoji, index) => (
                <motion.button
                  key={`${emoji}-${index}`}
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleEmojiClick(emoji)}
                  className="w-10 h-10 rounded-lg bg-white/40 hover:bg-white/70 flex items-center justify-center text-2xl transition-all"
                  type="button"
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
