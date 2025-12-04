'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

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

interface UsersTableProps {
  users: User[]
  onUpdateRole: (userId: string, role: string) => Promise<void>
  onToggleBan: (userId: string, banned: boolean) => Promise<void>
}

export default function UsersTable({ users, onUpdateRole, onToggleBan }: UsersTableProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleRoleChange = async (userId: string, newRole: string) => {
    setLoading(userId)
    await onUpdateRole(userId, newRole)
    setLoading(null)
  }

  const handleBanToggle = async (userId: string, currentBanned: boolean) => {
    setLoading(userId)
    await onToggleBan(userId, !currentBanned)
    setLoading(null)
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-heartshare">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                User
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                Email
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                Role
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                Coins
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                Status
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <motion.tr
                key={user._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
                className="transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-heartshare flex items-center justify-center text-lg">
                      {user.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={user.name || 'User'}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        (user.name && user.name[0] ? user.name[0].toUpperCase() : '?')
                      )}
                    </div>
                    <span className="font-medium text-gray-900">{user.name || 'Unknown'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{user.email || 'N/A'}</td>
                <td className="px-6 py-4">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    disabled={loading === user._id}
                    className="px-3 py-1 rounded-lg border-2 border-gray-300 focus:border-pink-300 focus:outline-none bg-white disabled:opacity-50"
                  >
                    <option value="user">User</option>
                    <option value="premium">Premium</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium">
                    🪙 {user.coins}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      user.banned
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {user.banned ? '🚫 Banned' : '✅ Active'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleBanToggle(user._id, user.banned)}
                    disabled={loading === user._id}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                      user.banned
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                  >
                    {user.banned ? 'Unban' : 'Ban'}
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
