'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminCard from '@/components/admin/AdminCard'

interface Stats {
  totalUsers: number
  premiumUsers: number
  activeRooms: number
  bannedUsers: number
  newUsers: number
  earnings: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      const data = await res.json()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
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
        {/* Sidebar */}
        <div className="w-64 shrink-0">
          <AdminSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Welcome to HeartShare Admin Panel</p>
          </motion.div>

          {/* Stats Grid */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <AdminCard
                title="Total Users"
                value={stats.totalUsers}
                icon="👥"
                subtitle={`${stats.newUsers} new this week`}
                gradient="from-blue-100 to-blue-200"
              />
              <AdminCard
                title="Premium Users"
                value={stats.premiumUsers}
                icon="⭐"
                subtitle={`${((stats.premiumUsers / stats.totalUsers) * 100).toFixed(1)}% of total`}
                gradient="from-purple-100 to-purple-200"
              />
              <AdminCard
                title="Active Rooms"
                value={stats.activeRooms}
                icon="🎥"
                subtitle="Currently live"
                gradient="from-green-100 to-green-200"
              />
              <AdminCard
                title="Banned Users"
                value={stats.bannedUsers}
                icon="🚫"
                subtitle="Moderation active"
                gradient="from-red-100 to-red-200"
              />
              <AdminCard
                title="Earnings"
                value={`$${stats.earnings.toFixed(2)}`}
                icon="💰"
                subtitle="From premium subscriptions"
                gradient="from-yellow-100 to-yellow-200"
              />
              <AdminCard
                title="New Users"
                value={stats.newUsers}
                icon="🆕"
                subtitle="Last 7 days"
                gradient="from-pink-100 to-sky-100"
              />
            </div>
          )}

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <a
                href="/admin/users"
                className="p-4 rounded-lg bg-gradient-to-br from-pink-100 to-sky-100 hover:shadow-lg transition-all text-center"
              >
                <div className="text-3xl mb-2">👥</div>
                <div className="font-medium text-gray-900">Manage Users</div>
              </a>
              <a
                href="/admin/rooms"
                className="p-4 rounded-lg bg-gradient-to-br from-pink-100 to-sky-100 hover:shadow-lg transition-all text-center"
              >
                <div className="text-3xl mb-2">🎥</div>
                <div className="font-medium text-gray-900">View Rooms</div>
              </a>
              <a
                href="/admin/settings"
                className="p-4 rounded-lg bg-gradient-to-br from-pink-100 to-sky-100 hover:shadow-lg transition-all text-center"
              >
                <div className="text-3xl mb-2">⚙️</div>
                <div className="font-medium text-gray-900">Settings</div>
              </a>
              <a
                href="/chat"
                className="p-4 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 hover:shadow-lg transition-all text-center"
              >
                <div className="text-3xl mb-2">💬</div>
                <div className="font-medium text-gray-900">Back to Chat</div>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
