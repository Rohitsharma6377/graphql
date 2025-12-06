'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface AdminCardProps {
  title: string
  value: string | number
  icon: string
  subtitle?: string
  gradient?: string
  trend?: { value: number; isPositive: boolean }
}

export default function AdminCard({
  title,
  value,
  icon,
  subtitle,
  gradient = 'from-pink-100 to-sky-100',
  trend,
}: AdminCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`bg-gradient-to-br ${gradient} p-4 md:p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-xs md:text-sm font-medium mb-1">{title}</p>
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{value}</h3>
          
          {/* Trend Indicator */}
          {trend && (
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              trend.isPositive 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {trend.isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
          
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="text-3xl md:text-4xl lg:text-5xl flex-shrink-0">{icon}</div>
      </div>
    </motion.div>
  )
}
