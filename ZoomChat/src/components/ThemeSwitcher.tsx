'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useTheme, themes, Theme } from '@/hooks/useTheme'

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div 
      drag
      dragMomentum={false}
      dragElastic={0.1}
      dragConstraints={{
        top: 0,
        left: 0,
        right: typeof window !== 'undefined' ? window.innerWidth - 100 : 0,
        bottom: typeof window !== 'undefined' ? window.innerHeight - 100 : 0,
      }}
      className="fixed top-4 right-4 z-50 cursor-move"
    >
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-2xl shadow-lg cursor-pointer"
        title="Change theme (Drag to move)"
      >
        🎨
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 10, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="absolute right-0 mt-2 p-4 bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl min-w-[200px] border border-white/20"
          >
            <h3 className="font-semibold text-white mb-3 text-sm drop-shadow-lg">Choose Theme</h3>
            <div className="space-y-2">
              {(Object.keys(themes) as Theme[]).map((themeKey) => (
                <motion.button
                  key={themeKey}
                  whileHover={{ scale: 1.05, x: 5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTheme(themeKey)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                    theme === themeKey
                      ? 'bg-white/30 backdrop-blur-md shadow-lg border border-white/40'
                      : 'bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/10'
                  }`}
                >
                  <span className="text-xl">{themes[themeKey].icon}</span>
                  <span className="text-sm font-medium text-white drop-shadow-md">
                    {themes[themeKey].name}
                  </span>
                  {theme === themeKey && <span className="ml-auto text-green-400 drop-shadow-lg">✓</span>}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
