'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/rooms', label: 'Rooms', icon: '🎥' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="bg-gradient-to-b from-pink-200 to-sky-200 p-4 rounded-xl shadow-lg h-full min-h-screen">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">💕 HeartShare</h2>
        <p className="text-sm text-gray-600">Admin Panel</p>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-white shadow-md text-gray-900'
                    : 'text-gray-700 hover:bg-white/60'
                }`}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </motion.div>
            </Link>
          )
        })}
      </nav>

      <div className="mt-8 pt-8 border-t border-white/50">
        <Link href="/chat">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full px-4 py-3 rounded-lg bg-white/60 hover:bg-white text-gray-700 font-medium transition-all flex items-center justify-center gap-2"
          >
            <span>🏠</span>
            <span>Back to Chat</span>
          </motion.button>
        </Link>
      </div>
    </div>
  )
}
