'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminCard from '@/components/admin/AdminCard'
import { useAdminStore, useAuthStore } from '@/stores'

export default function AdminDashboard() {
  const router = useRouter()
  const { stats, loading, fetchStats } = useAdminStore()
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    // Check if user is authenticated and is admin
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    
    if (user?.role !== 'admin') {
      router.push('/chat')
      return
    }

    // Fetch dashboard stats
    fetchStats()
  }, [isAuthenticated, user, router, fetchStats])

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
                value={stats.overview?.totalUsers || 0}
                icon="👥"
                subtitle={`${stats.overview?.activeUsers || 0} active now`}
                gradient="from-blue-100 to-blue-200"
              />
              <AdminCard
                title="Premium Users"
                value={stats.users?.premium || 0}
                icon="⭐"
                subtitle={`${stats.users?.free || 0} free users`}
                gradient="from-purple-100 to-purple-200"
              />
              <AdminCard
                title="Active Rooms"
                value={stats.overview?.activeRooms || 0}
                icon="🎥"
                subtitle={`${stats.overview?.totalRooms || 0} total rooms`}
                gradient="from-green-100 to-green-200"
              />
              <AdminCard
                title="Banned Users"
                value={stats.users?.banned || 0}
                icon="🚫"
                subtitle="Moderation active"
                gradient="from-red-100 to-red-200"
              />
              <AdminCard
                title="Total Sessions"
                value={stats.overview?.totalSessions || 0}
                icon="📊"
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
