'use client'

import { useEffect, useState } from 'react'
import { useTheme, themes } from '@/hooks/useTheme'
import FloatingHearts from './FloatingHearts'
import RainyBackground from './RainyBackground'
import ThemeSwitcher from './ThemeSwitcher'
import SparkleEffect from './SparkleEffect'

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      document.body.style.background = themes[theme].gradient
    }
  }, [theme, mounted])

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <>
      {/* Background animations based on theme */}
      {theme === 'default' && (
        <>
          <FloatingHearts />
          <SparkleEffect />
        </>
      )}
      {theme === 'romantic' && (
        <>
          <FloatingHearts />
          <SparkleEffect />
        </>
      )}
      {theme === 'rainy' && <RainyBackground />}
      {theme === 'sunset' && (
        <>
          <FloatingHearts />
          <SparkleEffect />
        </>
      )}
      {theme === 'ocean' && (
        <>
          <FloatingHearts />
          <SparkleEffect />
        </>
      )}

      {/* Theme switcher */}
      <ThemeSwitcher />

      {/* Main content */}
      <div className="relative z-10">{children}</div>
    </>
  )
}
