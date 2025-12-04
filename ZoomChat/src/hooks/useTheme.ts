'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'default' | 'romantic' | 'rainy' | 'sunset' | 'ocean' | 'nightlofi'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export const useTheme = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'default',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'heartshare-theme',
    }
  )
)

export const themes = {
  default: {
    name: 'Heart Pink',
    gradient: 'linear-gradient(135deg, #ffd6e0, #cfe9ff)',
    cardBg: 'bg-white/40',
    primary: 'from-pink-2 to-sky-2',
    icon: '💕',
  },
  romantic: {
    name: 'Romantic Rose',
    gradient: 'linear-gradient(135deg, #ff9a9e, #fecfef, #ffecd2)',
    cardBg: 'bg-white/30',
    primary: 'from-rose-400 to-pink-300',
    icon: '🌹',
  },
  rainy: {
    name: 'Rainy Day',
    gradient: 'linear-gradient(135deg, #89f7fe, #66a6ff, #a8edea)',
    cardBg: 'bg-white/35',
    primary: 'from-blue-400 to-cyan-300',
    icon: '🌧️',
  },
  sunset: {
    name: 'Sunset Glow',
    gradient: 'linear-gradient(135deg, #ff6b6b, #feca57, #ff9ff3)',
    cardBg: 'bg-white/30',
    primary: 'from-orange-400 to-pink-400',
    icon: '🌅',
  },
  ocean: {
    name: 'Ocean Breeze',
    gradient: 'linear-gradient(135deg, #667eea, #764ba2, #f093fb)',
    cardBg: 'bg-white/35',
    primary: 'from-purple-400 to-indigo-400',
    icon: '🌊',
  },
  nightlofi: {
    name: 'Night Lofi Romantic',
    gradient: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460, #533483)',
    cardBg: 'bg-black/40',
    primary: 'from-purple-500 to-indigo-600',
    icon: '🌙',
  },
}
