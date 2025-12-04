'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import AdminSidebar from '@/components/admin/AdminSidebar'
import RoomsTable from '@/components/admin/RoomsTable'

interface Room {
  _id: string
  roomId: string
  host: {
    name: string
    email: string
  }
  participants: any[]
  active: boolean
  createdAt: string
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, totalParticipants: 0 })

  useEffect(() => {
    fetchRooms()
    
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchRooms, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/admin/rooms')
      const data = await res.json()
      if (data.success) {
        setRooms(data.rooms)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCloseRoom = async (roomId: string) => {
    if (!confirm('Are you sure you want to force close this room?')) return

    try {
      const res = await fetch(`/api/admin/room/${roomId}/close`, {
        method: 'PATCH',
      })
      const data = await res.json()
      if (data.success) {
        await fetchRooms()
      }
    } catch (error) {
      console.error('Failed to close room:', error)
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
              {stats.total} active rooms • {stats.totalParticipants} total participants
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
