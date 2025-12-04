'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface Settings {
  adsEnabled: boolean
  premiumPrice: number
  maxParticipantsFree: number
  defaultCoinReward: number
}

interface SettingsFormProps {
  settings: Settings
  onSave: (settings: Settings) => Promise<void>
}

export default function SettingsForm({ settings: initialSettings, onSave }: SettingsFormProps) {
  const [settings, setSettings] = useState(initialSettings)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      await onSave(settings)
      setMessage('Settings saved successfully!')
    } catch (error) {
      setMessage('Failed to save settings')
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">System Settings</h2>

      <div className="space-y-6">
        {/* Ads Enabled */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-pink-50 to-sky-50">
          <div>
            <label htmlFor="adsEnabled" className="font-medium text-gray-900">
              Enable Advertisements
            </label>
            <p className="text-sm text-gray-600">Show ads to free users</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              id="adsEnabled"
              checked={settings.adsEnabled}
              onChange={(e) => setSettings({ ...settings, adsEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-heartshare"></div>
          </label>
        </div>

        {/* Premium Price */}
        <div>
          <label htmlFor="premiumPrice" className="block font-medium text-gray-900 mb-2">
            Premium Subscription Price ($)
          </label>
          <input
            type="number"
            id="premiumPrice"
            step="0.01"
            value={settings.premiumPrice}
            onChange={(e) =>
              setSettings({ ...settings, premiumPrice: parseFloat(e.target.value) })
            }
            className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-pink-300 focus:outline-none bg-white"
          />
        </div>

        {/* Max Participants Free */}
        <div>
          <label htmlFor="maxParticipantsFree" className="block font-medium text-gray-900 mb-2">
            Max Participants (Free Users)
          </label>
          <input
            type="number"
            id="maxParticipantsFree"
            min="2"
            value={settings.maxParticipantsFree}
            onChange={(e) =>
              setSettings({ ...settings, maxParticipantsFree: parseInt(e.target.value) })
            }
            className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-pink-300 focus:outline-none bg-white"
          />
          <p className="text-sm text-gray-600 mt-1">
            Premium users have unlimited participants
          </p>
        </div>

        {/* Default Coin Reward */}
        <div>
          <label htmlFor="defaultCoinReward" className="block font-medium text-gray-900 mb-2">
            Default Coin Reward (New Users)
          </label>
          <input
            type="number"
            id="defaultCoinReward"
            min="0"
            value={settings.defaultCoinReward}
            onChange={(e) =>
              setSettings({ ...settings, defaultCoinReward: parseInt(e.target.value) })
            }
            className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-pink-300 focus:outline-none bg-white"
          />
        </div>

        {/* Save Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={saving}
          className="w-full px-6 py-4 rounded-lg bg-gradient-heartshare hover:shadow-lg text-gray-900 font-semibold text-lg transition-all disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </motion.button>

        {/* Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg text-center font-medium ${
              message.includes('success')
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {message}
          </motion.div>
        )}
      </div>
    </form>
  )
}
