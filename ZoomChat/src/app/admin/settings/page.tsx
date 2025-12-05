'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import AdminSidebar from '@/components/admin/AdminSidebar'
import SettingsForm from '@/components/admin/SettingsForm'

interface Settings {
  adsEnabled: boolean
  premiumPrice: number
  maxParticipantsFree: number
  defaultCoinReward: number
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings')
      const data = await res.json()
      if (data.success) {
        setSettings(data.settings)
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (newSettings: Settings) => {
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings),
    })
    const data = await res.json()
    if (data.success) {
      setSettings(data.settings)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-pink-50 to-sky-50">
        <div className="text-2xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-sky-50">
      <div className="flex">
        <div className="w-64 shrink-0">
          <AdminSidebar />
        </div>

        <div className="flex-1 p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-2">System Settings</h1>
            <p className="text-gray-600">Configure application-wide settings</p>
          </motion.div>

          {settings && <SettingsForm settings={settings} onSave={handleSave} />}
        </div>
      </div>
    </div>
  )
}
