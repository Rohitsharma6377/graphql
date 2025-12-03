'use client'

import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  Video, 
  MessageSquare, 
  FileText, 
  Users, 
  Settings,
  Calendar,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const pathname = usePathname()
  
  const menuItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: 'text-primary-400' },
    { href: '/meetings', icon: Video, label: 'Meetings', color: 'text-accent-400' },
    { href: '/messages', icon: MessageSquare, label: 'Messages', color: 'text-success-400' },
    { href: '/documents', icon: FileText, label: 'Documents', color: 'text-warning-400' },
    { href: '/calendar', icon: Calendar, label: 'Calendar', color: 'text-purple-400' },
    { href: '/recent', icon: Clock, label: 'Recent', color: 'text-pink-400' },
  ]

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
      className="fixed left-0 top-16 bottom-0 w-64 glass-strong border-r border-white/10 z-20 hidden lg:block"
    >
      <div className="p-6 h-full flex flex-col">
        {/* Menu */}
        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative',
                    isActive 
                      ? 'bg-white/10 shadow-lg' 
                      : 'hover:bg-white/5'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-primary rounded-r-full"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <item.icon className={cn('w-5 h-5', isActive ? item.color : 'text-muted-foreground group-hover:text-foreground')} />
                  <span className={cn(
                    'font-medium',
                    isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                  )}>
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto w-2 h-2 rounded-full bg-gradient-primary"
                    />
                  )}
                </motion.div>
              </Link>
            )
          })}
        </nav>

        {/* Bottom Section */}
        <div className="space-y-4">
          <div className="glass p-4 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-primary-400" />
              <span className="font-medium text-sm">Active Users</span>
            </div>
            <div className="text-3xl font-bold gradient-text">1,234</div>
            <div className="text-xs text-muted-foreground mt-1">+12% from last week</div>
          </div>
          
          <Link href="/settings">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl glass hover:bg-white/5 transition-all"
            >
              <Settings className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium text-muted-foreground">Settings</span>
            </motion.div>
          </Link>
        </div>
      </div>
    </motion.aside>
  )
}
