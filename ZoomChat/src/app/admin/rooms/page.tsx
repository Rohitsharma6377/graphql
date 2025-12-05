'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import AdminSidebar from '@/components/admin/AdminSidebar'
import RoomsTable from '@/components/admin/RoomsTable'
import { useAdminStore, useAuthStore } from '@/stores'

export default function RoomsPage() {
  const router = useRouter()
  const { rooms, loading, roomsPagination, fetchRooms, deleteRoom } = useAdminStore()
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

    // Fetch rooms
    fetchRooms({ page: 1, limit: 20 })
    
    // Poll for updates every 5 seconds
    const interval = setInterval(() => {
      fetchRooms({ page: 1, limit: 20 })
    }, 5000)
    
    return () => clearInterval(interval)
  }, [isAuthenticated, user, router, fetchRooms])

  const handleCloseRoom = async (roomId: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return

    try {
      await deleteRoom(roomId)
    } catch (error) {
      console.error('Failed to delete room:', error)
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
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Active Rooms</h1>
            <p className="text-gray-600">
              {roomsPagination.total} total rooms
            </p>
          </motion.div>

          {rooms.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">🎥</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Active Rooms</h3>
              <p className="text-gray-600">All rooms are currently closed</p>
            </div>
          ) : (
            <RoomsTable rooms={rooms} onCloseRoom={handleCloseRoom} />
          )}
        </div>
      </div>
    </div>
  )
}
