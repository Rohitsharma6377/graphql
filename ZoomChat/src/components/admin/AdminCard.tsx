'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface AdminCardProps {
  title: string
  value: string | number
  icon: string
  subtitle?: string
  gradient?: string
}

export default function AdminCard({
  title,
  value,
  icon,
  subtitle,
  gradient = 'from-pink-100 to-sky-100',
}: AdminCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={`bg-gradient-to-br ${gradient} p-6 rounded-xl shadow-lg`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">{value}</h3>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </motion.div>
  )
}
