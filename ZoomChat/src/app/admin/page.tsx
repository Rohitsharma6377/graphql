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
    <div className="min-h-[100dvh] bg-gradient-to-br from-pink-50 to-sky-50">
      <div className="flex flex-col md:flex-row">
        {/* Sidebar - Hidden on mobile by default, shown via menu button */}
        <div className="hidden md:block md:w-64 shrink-0">
          <AdminSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 sm:p-6 md:p-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 md:mb-8"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-pink-600 to-sky-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-sm sm:text-base text-gray-600">Welcome to HeartShare Admin Panel</p>
          </motion.div>

          {/* Stats Grid - Responsive */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
              <AdminCard
                title="Total Users"
                value={stats.overview?.totalUsers || 0}
                icon="👥"
                subtitle={`${stats.overview?.activeUsers || 0} active now`}
                gradient="from-blue-100 to-blue-200"
                trend="up"
              />
              <AdminCard
                title="Premium Users"
                value={stats.users?.premium || 0}
                icon="⭐"
                subtitle={`${stats.users?.free || 0} free users`}
                gradient="from-purple-100 to-purple-200"
                trend="up"
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
                trend="up"
              />
            </div>
          )}

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-lg p-4 sm:p-6"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-pink-600 to-sky-600 bg-clip-text text-transparent">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <a
                href="/admin/users"
                className="p-4 sm:p-6 rounded-lg md:rounded-xl bg-gradient-to-br from-pink-100 to-sky-100 hover:shadow-lg transition-all text-center active:scale-95"
              >
                <div className="text-2xl sm:text-3xl mb-2">👥</div>
                <div className="font-medium text-gray-900 text-xs sm:text-sm md:text-base">Manage Users</div>
              </a>
              <a
                href="/admin/rooms"
                className="p-4 sm:p-6 rounded-lg md:rounded-xl bg-gradient-to-br from-pink-100 to-sky-100 hover:shadow-lg transition-all text-center active:scale-95"
              >
                <div className="text-2xl sm:text-3xl mb-2">🎥</div>
                <div className="font-medium text-gray-900 text-xs sm:text-sm md:text-base">View Rooms</div>
              </a>
              <a
                href="/admin/settings"
                className="p-4 sm:p-6 rounded-lg md:rounded-xl bg-gradient-to-br from-pink-100 to-sky-100 hover:shadow-lg transition-all text-center active:scale-95"
              >
                <div className="text-2xl sm:text-3xl mb-2">⚙️</div>
                <div className="font-medium text-gray-900 text-xs sm:text-sm md:text-base">Settings</div>
              </a>
              <a
                href="/chat"
                className="p-4 sm:p-6 rounded-lg md:rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 hover:shadow-lg transition-all text-center active:scale-95"
              >
                <div className="text-2xl sm:text-3xl mb-2">💬</div>
                <div className="font-medium text-gray-900 text-xs sm:text-sm md:text-base">Back to Chat</div>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
