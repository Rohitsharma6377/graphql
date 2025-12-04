'use client'

import { motion } from 'framer-motion'
import { Calendar as CalendarIcon, Clock, Video, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, gql } from '@apollo/client'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FadeIn } from '@/components/animations/AnimatedCard'
import { formatDate } from '@/lib/utils'

const GET_ROOMS = gql`
  query GetRooms {
    rooms {
      id
      name
      createdAt
      participants {
        user {
          id
          name
        }
      }
    }
  }
`

export default function CalendarPage() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  
  const { data: roomsData } = useQuery(GET_ROOMS, {
    pollInterval: 10000,
  })

  const events = roomsData?.rooms?.map(room => ({
    id: room.id,
    title: room.name,
    date: new Date(room.createdAt),
    participants: room.participants?.length || 0,
  })) || []

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate()

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay()

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const hasEventOnDay = (day) => {
    return events.some(event => {
      const eventDate = new Date(event.date)
      return eventDate.getDate() === day &&
             eventDate.getMonth() === currentDate.getMonth() &&
             eventDate.getFullYear() === currentDate.getFullYear()
    })
  }

  const renderCalendarDays = () => {
    const days = []
    const today = new Date().getDate()
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = 
        day === today && 
        currentDate.getMonth() === currentMonth && 
        currentDate.getFullYear() === currentYear

      const hasEvent = hasEventOnDay(day)

      days.push(
        <motion.div
          key={day}
          whileHover={{ scale: 1.05 }}
          className={`
            p-3 rounded-lg cursor-pointer transition-all
            ${isToday ? 'bg-primary text-white font-bold' : 'hover:bg-white/5'}
            ${hasEvent && !isToday ? 'border border-accent-500/50' : ''}
          `}
        >
          <div className="text-center">
            <div className="text-sm">{day}</div>
            {hasEvent && !isToday && (
              <div className="w-1 h-1 bg-accent-500 rounded-full mx-auto mt-1"></div>
            )}
          </div>
        </motion.div>
      )
    }

    return days
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />
        <Sidebar />
        
        <main className="lg:ml-64 pt-16">
          <div className="container mx-auto px-4 py-8">
            <FadeIn className="mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2">
                    <CalendarIcon className="inline-block mr-3 text-primary-500" size={40} />
                    Calendar
                  </h1>
                  <p className="text-muted-foreground">Real GraphQL Events • {events.length} scheduled meetings</p>
                </div>
                <Button size="lg" onClick={() => router.push('/dashboard')}>
                  <Plus className="w-5 h-5 mr-2" />
                  Schedule Meeting
                </Button>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <FadeIn delay={0.1} className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={goToPreviousMonth}>
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={goToNextMonth}>
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-2 mb-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {renderCalendarDays()}
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>

              <FadeIn delay={0.2}>
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Events</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {events.slice(0, 5).map((event, index) => (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="glass p-4 rounded-lg cursor-pointer hover:bg-white/10 transition-all"
                          onClick={() => router.push(`/meeting/${event.id}`)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
                              <Video className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold truncate">{event.title}</h4>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <Clock className="w-3 h-3" />
                                <span>{formatDate(event.date)}</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      {events.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">No events scheduled</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
