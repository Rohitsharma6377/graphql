'use client'

import { motion } from 'framer-motion'
import { Video, Clock, Users, Search } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useQuery, gql } from '@apollo/client'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { FadeIn } from '@/components/animations/AnimatedCard'
import { formatDate } from '@/lib/utils'

const GET_ROOMS = gql`
  query GetRooms {
    rooms {
      id
      name
      description
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

export default function MeetingsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState('')

  const { data: roomsData, loading } = useQuery(GET_ROOMS, {
    pollInterval: 5000, // Real-time updates every 5 seconds
  })

  const rooms = roomsData?.rooms || []
  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getRoomStatus = (room) => {
    return room.participants?.length > 0 ? 'live' : 'scheduled'
  }

  const getStatusColor = (status) => {
    return status === 'live' ? 'bg-success text-success-foreground' : 'bg-primary text-primary-foreground'
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
                    <Video className="inline-block mr-3 text-primary-500" size={40} />
                    Meetings
                  </h1>
                  <p className="text-muted-foreground">Real GraphQL Data • Live Updates Every 5s • {rooms.length} rooms</p>
                </div>
                <Button size="lg" onClick={() => router.push('/dashboard')}>
                  <Video className="w-5 h-5 mr-2" />
                  New Meeting
                </Button>
              </div>
            </FadeIn>

            <FadeIn delay={0.1} className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search meetings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </FadeIn>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full" />
              </div>
            ) : filteredRooms.length === 0 ? (
              <div className="text-center py-16">
                <Video className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No meetings found</h3>
                <p className="text-muted-foreground mb-6">Create your first meeting to get started</p>
                <Button onClick={() => router.push('/dashboard')}>
                  <Video className="w-4 h-4 mr-2" />
                  Create Meeting
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRooms.map((room, index) => {
                  const status = getRoomStatus(room)
                  
                  return (
                    <FadeIn key={room.id} delay={0.1 * (index + 2)}>
                      <Card 
                        className="group cursor-pointer hover:shadow-xl transition-all duration-300"
                        onClick={() => status === 'live' && router.push(`/meeting/${room.id}`)}
                      >
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center gap-6">
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
                              <Video className="w-8 h-8 text-white" />
                            </div>

                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <h3 className="text-xl font-semibold mb-1">{room.name}</h3>
                                  {room.description && (
                                    <p className="text-sm text-muted-foreground mb-2">{room.description}</p>
                                  )}
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="w-4 h-4" />
                                    <span>{formatDate(new Date(room.createdAt))}</span>
                                  </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                                  {status === 'live' && '🔴 '}
                                  {status.charAt(0).toUpperCase() + status.slice(1)}
                                </span>
                              </div>

                              <div className="flex items-center gap-3">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <div className="flex -space-x-2">
                                  {room.participants?.slice(0, 5).map((participant, i) => (
                                    <Avatar
                                      key={i}
                                      src={participant.user?.avatar}
                                      fallback={participant.user?.name || 'U'}
                                      size="sm"
                                      className="ring-2 ring-background"
                                    />
                                  ))}
                                  {room.participants?.length > 5 && (
                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium ring-2 ring-background">
                                      +{room.participants.length - 5}
                                    </div>
                                  )}
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {room.participants?.length || 0} participant{room.participants?.length !== 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              {status === 'live' && (
                                <Button>Join Now</Button>
                              )}
                              {status !== 'live' && (
                                <Button variant="outline" onClick={() => router.push(`/meeting/${room.id}`)}>
                                  View Room
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </FadeIn>
                  )
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
