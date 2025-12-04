'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'

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

const CATEGORY_ICONS = {
  hearts: '💕',
  faces: '😊',
  hands: '👋',
  nature: '🌸',
  animals: '🐱',
  food: '🍕',
}

export default function EmojiPicker({ onEmojiSelect, className = '' }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<keyof typeof EMOJI_CATEGORIES>('hearts')
  const pickerRef = useRef<HTMLDivElement>(null)

  const handleEmojiClick = (emoji: string) => {
    console.log('👆 Emoji clicked:', emoji)
    onEmojiSelect(emoji)
    setIsOpen(false)
  }

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div ref={pickerRef} className={`relative ${className}`}>
      {/* Emoji Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-pink-400 via-purple-400 to-pink-300 flex items-center justify-center text-lg sm:text-xl hover:shadow-xl transition-all shadow-md flex-shrink-0"
        type="button"
        aria-label="Open emoji picker"
      >
        <span className="filter drop-shadow-sm">😊</span>
      </motion.button>

      {/* Emoji Picker Popup */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 sm:hidden"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute bottom-full right-0 mb-2 w-[280px] sm:w-80 md:w-96 glass-card p-3 sm:p-4 shadow-2xl border border-white/30 rounded-2xl z-50"
              style={{
                maxHeight: 'calc(100vh - 150px)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">Choose Emoji</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-6 h-6 rounded-full bg-white/50 hover:bg-white/80 flex items-center justify-center transition-all"
                  type="button"
                  aria-label="Close"
                >
                  <span className="text-gray-600 text-sm">✕</span>
                </button>
              </div>

              {/* Category Tabs */}
              <div className="flex gap-1 mb-3 overflow-x-auto pb-2 scrollbar-hide">
                {(Object.keys(EMOJI_CATEGORIES) as Array<keyof typeof EMOJI_CATEGORIES>).map((category) => (
                  <motion.button
                    key={category}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveCategory(category)}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all capitalize flex items-center gap-1 flex-shrink-0 ${
                      activeCategory === category
                        ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-md'
                        : 'bg-white/50 text-gray-600 hover:bg-white/70'
                    }`}
                    type="button"
                  >
                    <span className="text-sm sm:text-base">{CATEGORY_ICONS[category]}</span>
                    <span className="hidden sm:inline">{category}</span>
                  </motion.button>
                ))}
              </div>

              {/* Emoji Grid */}
              <div className="grid grid-cols-6 sm:grid-cols-7 md:grid-cols-8 gap-1.5 sm:gap-2 max-h-48 sm:max-h-60 overflow-y-auto custom-scrollbar p-1">
                {EMOJI_CATEGORIES[activeCategory].map((emoji, index) => (
                  <motion.button
                    key={`${emoji}-${index}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.01 }}
                    whileHover={{ scale: 1.25, zIndex: 10 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleEmojiClick(emoji)}
                    className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-lg bg-white/50 hover:bg-white/90 flex items-center justify-center text-xl sm:text-2xl transition-all hover:shadow-lg active:shadow-sm"
                    type="button"
                    aria-label={`Select ${emoji} emoji`}
                  >
                    <span className="filter drop-shadow-sm">{emoji}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
