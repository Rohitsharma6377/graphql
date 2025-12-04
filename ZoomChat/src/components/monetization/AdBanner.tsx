'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'

interface AdBannerProps {
  slot: string
  format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle'
  className?: string
  isPremium?: boolean
}

export default function AdBanner({ slot, format = 'auto', className = '', isPremium = false }: AdBannerProps) {
  const [adLoaded, setAdLoaded] = useState(false)

  useEffect(() => {
    // Don't show ads for premium users
    if (isPremium) return

    try {
      // @ts-ignore
      if (window.adsbygoogle && !adLoaded) {
        // @ts-ignore
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})
        setAdLoaded(true)
      }
    } catch (error) {
      console.error('AdSense error:', error)
    }
  }, [isPremium, adLoaded])

  // Don't render if user is premium
  if (isPremium) return null

  return (
    <>
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />

      <div className={`ad-banner ${className}`}>
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    </>
  )
}

// Floating ad component
export function AdFloating({ isPremium = false }: { isPremium?: boolean }) {
  const [visible, setVisible] = useState(true)

  if (isPremium || !visible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-2xl p-4 max-w-sm">
      <button onClick={() => setVisible(false)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
        ✕
      </button>
      <AdBanner slot="FLOATING_AD_SLOT" format="rectangle" />
    </div>
  )
}

// Sidebar ad component
export function AdSidebar({ isPremium = false }: { isPremium?: boolean }) {
  if (isPremium) return null

  return (
    <div className="ad-sidebar bg-gray-900 border border-gray-700 rounded-lg p-4">
      <div className="text-xs text-gray-400 mb-2">Advertisement</div>
      <AdBanner slot="SIDEBAR_AD_SLOT" format="vertical" />
    </div>
  )
}
