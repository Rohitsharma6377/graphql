'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, MoreVertical, Shield, Ban, Check, X } from 'lucide-react'
import { Avatar } from '../ui/Avatar'

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
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

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

  const getRoleBadge = (role: string) => {
    const styles = {
      admin: 'bg-purple-100 text-purple-700 border-purple-200',
      premium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      user: 'bg-gray-100 text-gray-700 border-gray-200',
    }
    return styles[role as keyof typeof styles] || styles.user
  }

  // Desktop Table View
  const DesktopTable = () => (
    <div className="hidden lg:block overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-pink-100 to-sky-100">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">User</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Email</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Role</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Coins</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Status</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Actions</th>
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
                  <Avatar name={user.name} src={user.avatar} size="md" />
                  <span className="font-medium text-gray-900">{user.name || 'Unknown'}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">{user.email || 'N/A'}</td>
              <td className="px-6 py-4">
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user._id, e.target.value)}
                  disabled={loading === user._id}
                  className="px-3 py-1.5 rounded-lg border-2 border-white/50 bg-white/70 focus:border-pink-300 focus:outline-none disabled:opacity-50 text-sm"
                >
                  <option value="user">User</option>
                  <option value="premium">Premium</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                  🪙 {user.coins || 0}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                  user.banned 
                    ? 'bg-red-100 text-red-700' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  {user.banned ? <Ban className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                  {user.banned ? 'Banned' : 'Active'}
                </span>
              </td>
              <td className="px-6 py-4">
                <button
                  onClick={() => handleBanToggle(user._id, user.banned)}
                  disabled={loading === user._id}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all active:scale-95 disabled:opacity-50 ${
                    user.banned
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  {loading === user._id ? '...' : user.banned ? 'Unban' : 'Ban'}
                </button>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  // Mobile Card View
  const MobileCards = () => (
    <div className="lg:hidden space-y-3">
      {users.map((user) => (
        <motion.div
          key={user._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 rounded-xl"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <Avatar name={user.name} src={user.avatar} size="md" />
              <div>
                <h3 className="font-semibold text-gray-900">{user.name}</h3>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => setExpandedRow(expandedRow === user._id ? null : user._id)}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              {expandedRow === user._id ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>

          {/* Quick Info */}
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadge(user.role)}`}>
              {user.role}
            </span>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
              🪙 {user.coins || 0}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              user.banned 
                ? 'bg-red-100 text-red-700' 
                : 'bg-green-100 text-green-700'
            }`}>
              {user.banned ? 'Banned' : 'Active'}
            </span>
          </div>

          {/* Expanded Actions */}
          <AnimatePresence>
            {expandedRow === user._id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-gray-200 pt-3 space-y-3"
              >
                {/* Role Selection */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    disabled={loading === user._id}
                    className="w-full px-3 py-2 rounded-lg border-2 border-white/50 bg-white/70 focus:border-pink-300 focus:outline-none disabled:opacity-50"
                  >
                    <option value="user">User</option>
                    <option value="premium">Premium</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {/* Ban Button */}
                <button
                  onClick={() => handleBanToggle(user._id, user.banned)}
                  disabled={loading === user._id}
                  className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all active:scale-95 disabled:opacity-50 ${
                    user.banned
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  {loading === user._id ? 'Processing...' : user.banned ? 'Unban User' : 'Ban User'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  )

  return (
    <div className="glass-card rounded-2xl shadow-lg overflow-hidden">
      {/* Table Header */}
      <div className="px-4 md:px-6 py-4 bg-gradient-to-r from-pink-100 to-sky-100 border-b border-white/30">
        <h2 className="text-lg md:text-xl font-bold text-gray-900">Users Management</h2>
        <p className="text-sm text-gray-600 mt-1">{users.length} total users</p>
      </div>

      {/* Content */}
      <div className="p-4">
        <DesktopTable />
        <MobileCards />
      </div>
    </div>
  )
}
