'use client'

import { motion } from 'framer-motion'
import { Clock, Video, Users, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useQuery, gql } from '@apollo/client'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { FadeIn } from '@/components/animations/AnimatedCard'
import { formatDate } from '@/lib/utils'

const GET_RECENT_ACTIVITY = gql`
  query GetRecentActivity {
    rooms {
      id
      name
      createdAt
      participants {
        user {
          id
          name
          avatar
        }
      }
    }
  }
`

export default function RecentPage() {
  const router = useRouter()

  const { data: activityData, loading } = useQuery(GET_RECENT_ACTIVITY, {
    pollInterval: 5000,
  })

  const recentRooms = activityData?.rooms?.slice(0, 10) || []

  const stats = [
    { 
      label: 'Total Meetings', 
      value: activityData?.rooms?.length || 0, 
      icon: Video, 
      trend: `+${Math.min(activityData?.rooms?.length || 0, 5)}`
    },
    { 
      label: 'Participants', 
      value: activityData?.rooms?.reduce((sum, room) => sum + (room.participants?.length || 0), 0) || 0, 
      icon: Users, 
      trend: '+12'
    },
    { 
      label: 'Active Now', 
      value: recentRooms.filter(r => r.participants?.length > 0).length, 
      icon: Clock, 
      trend: '+3'
    },
  ]

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />
        <Sidebar />
        
        <main className="lg:ml-64 pt-16">
          <div className="container mx-auto px-4 py-8">
            <FadeIn className="mb-8">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  <Clock className="inline-block mr-3 text-primary-500" size={40} />
                  Recent Activity
                </h1>
                <p className="text-muted-foreground">Real-time GraphQL Data • Live Updates</p>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {stats.map((stat, index) => (
                <FadeIn key={stat.label} delay={0.1 * (index + 1)}>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                          <p className="text-3xl font-bold">{stat.value}</p>
                          <div className="flex items-center gap-1 mt-2 text-success text-sm">
                            <TrendingUp className="w-4 h-4" />
                            <span>{stat.trend}</span>
                          </div>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
                          <stat.icon className="w-6 h-6 text-primary-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>
              ))}
            </div>

            <FadeIn delay={0.4}>
              <Card>
                <CardHeader>
                  <CardTitle>Recent Meetings (GraphQL Live Data)</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
                    </div>
                  ) : recentRooms.length === 0 ? (
                    <div className="text-center py-12">
                      <Video className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-muted-foreground">No recent activity</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentRooms.map((room, index) => (
                        <motion.div
                          key={room.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="glass p-6 rounded-xl cursor-pointer hover:bg-white/10 transition-all group"
                          onClick={() => router.push(`/meeting/${room.id}`)}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
                              <Video className="w-7 h-7 text-white" />
                            </div>

                            <div className="flex-1">
                              <h3 className="text-lg font-semibold mb-2 group-hover:text-primary-400 transition-colors">
                                {room.name}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  <span>{formatDate(new Date(room.createdAt))}</span>
                                </div>
                                <span>•</span>
                                <span>{room.participants?.length || 0} participants</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="flex -space-x-2">
                                {room.participants?.slice(0, 3).map((participant, i) => (
                                  <Avatar
                                    key={i}
                                    src={participant.user?.avatar}
                                    fallback={participant.user?.name || 'U'}
                                    size="sm"
                                    className="ring-2 ring-background"
                                  />
                                ))}
                                {room.participants?.length > 3 && (
                                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium ring-2 ring-background">
                                    +{room.participants.length - 3}
                                  </div>
                                )}
                              </div>
                              <Button variant="ghost" size="sm">
                                View
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </FadeIn>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
