'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import AdminSidebar from '@/components/admin/AdminSidebar'
import UsersTable from '@/components/admin/UsersTable'

interface User {
  _id: string
  name: string
  email: string
  avatar?: string
  role: 'user' | 'premium' | 'admin'
  banned: boolean
  coins: number
  createdAt: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, premium: 0, admins: 0, banned: 0 })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      if (data.success) {
        setUsers(data.users)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateRole = async (userId: string, role: string) => {
    try {
      const res = await fetch(`/api/admin/user/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })
      const data = await res.json()
      if (data.success) {
        await fetchUsers()
      }
    } catch (error) {
      console.error('Failed to update role:', error)
    }
  }

  const handleToggleBan = async (userId: string, banned: boolean) => {
    try {
      const res = await fetch(`/api/admin/user/${userId}/ban`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banned }),
      })
      const data = await res.json()
      if (data.success) {
        await fetchUsers()
      }
    } catch (error) {
      console.error('Failed to toggle ban:', error)
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
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Users Management</h1>
            <p className="text-gray-600">
              {stats.total} total users • {stats.premium} premium • {stats.banned} banned
            </p>
          </motion.div>

          <UsersTable
            users={users}
            onUpdateRole={handleUpdateRole}
            onToggleBan={handleToggleBan}
          />
        </div>
      </div>
    </div>
  )
}
