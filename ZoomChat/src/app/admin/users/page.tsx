'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import AdminSidebar from '@/components/admin/AdminSidebar'
import UsersTable from '@/components/admin/UsersTable'
import { useAdminStore, useAuthStore } from '@/stores'

export default function UsersPage() {
  const router = useRouter()
  const { users, loading, usersPagination, fetchUsers, updateUserRole, updateUserAccountType, banUser, unbanUser } = useAdminStore()
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

    // Fetch users
    fetchUsers({ page: 1, limit: 20 })
  }, [isAuthenticated, user, router, fetchUsers])

  const handleUpdateRole = async (userId: string, role: string) => {
    try {
      await updateUserRole(userId, role)
    } catch (error) {
      console.error('Failed to update role:', error)
    }
  }

  const handleToggleBan = async (userId: string, banned: boolean) => {
    try {
      if (banned) {
        await banUser(userId)
      } else {
        await unbanUser(userId)
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
              {usersPagination.total} total users
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
