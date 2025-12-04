'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useTheme, themes, Theme } from '@/hooks/useTheme'

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed top-4 right-4 z-50">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-2xl shadow-lg"
        title="Change theme"
      >
        🎨
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 10, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="absolute right-0 mt-2 p-4 glass-card rounded-2xl shadow-xl min-w-[200px]"
          >
            <h3 className="font-semibold text-gray-800 mb-3 text-sm">Choose Theme</h3>
            <div className="space-y-2">
              {(Object.keys(themes) as Theme[]).map((themeKey) => (
                <motion.button
                  key={themeKey}
                  whileHover={{ scale: 1.05, x: 5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setTheme(themeKey)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                    theme === themeKey
                      ? 'bg-gradient-heartshare shadow-md'
                      : 'bg-white/40 hover:bg-white/60'
                  }`}
                >
                  <span className="text-xl">{themes[themeKey].icon}</span>
                  <span className="text-sm font-medium text-gray-800">
                    {themes[themeKey].name}
                  </span>
                  {theme === themeKey && <span className="ml-auto text-green-600">✓</span>}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
