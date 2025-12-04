'use client'

import { motion } from 'framer-motion'
import { Plus, Video, Users, Calendar, Clock, Sparkles, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useMutation, useQuery, gql } from '@apollo/client'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
import { Input, Label } from '@/components/ui/Input'
import { AnimatedCard, FadeIn } from '@/components/animations/AnimatedCard'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

const CREATE_ROOM = gql`
  mutation CreateRoom($name: String!, $description: String) {
    createRoom(name: $name, description: $description) {
      id
      name
      description
    }
  }
`

const GET_USER_ROOMS = gql`
  query GetUserRooms {
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

export default function Dashboard() {
  const router = useRouter()
  const { data: session } = useSession()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [roomName, setRoomName] = useState('')
  const [roomDescription, setRoomDescription] = useState('')
  const [meetingUrl, setMeetingUrl] = useState('')
  const [roomIdInput, setRoomIdInput] = useState('')
  const [urlError, setUrlError] = useState('')
  
  const [createRoom, { loading: creating }] = useMutation(CREATE_ROOM)
  const { data: roomsData, loading: loadingRooms } = useQuery(GET_USER_ROOMS)

  const handleCreateRoom = async () => {
    if (roomName.trim()) {
      try {
        const { data } = await createRoom({
          variables: {
            name: roomName,
            description: roomDescription || ''
          }
        })
        
        if (data?.createRoom) {
          toast.success('Meeting created successfully!')
          setShowCreateModal(false)
          setRoomName('')
          setRoomDescription('')
          router.push(`/meeting/${data.createRoom.id}`)
        }
      } catch (error) {
        console.error('Error creating room:', error)
        toast.error('Failed to create meeting')
        // Fallback to local room creation
        const roomId = Math.random().toString(36).substring(7)
        router.push(`/meeting/${roomId}`)
      }
    }
  }

  const handleJoinByUrl = (e) => {
    e.preventDefault()
    setUrlError('')

    try {
      const urlPattern = /meeting\/([a-zA-Z0-9-_]+)/
      const match = meetingUrl.match(urlPattern)
      
      if (match && match[1]) {
        router.push(`/meeting/${match[1]}`)
      } else {
        setUrlError('Invalid meeting URL. Please paste a valid meeting link.')
      }
    } catch (err) {
      setUrlError('Error parsing URL. Please try again.')
    }
  }

  const handleJoinByRoomId = (e) => {
    e.preventDefault()
    setUrlError('')

    if (!roomIdInput.trim()) {
      setUrlError('Please enter a room ID')
      return
    }

    router.push(`/meeting/${roomIdInput}`)
  }

  const handleQuickJoin = () => {
    const roomId = Math.random().toString(36).substring(2, 10)
    router.push(`/meeting/${roomId}`)
  }

  const stats = [
    { label: 'Total Meetings', value: '24', icon: Video, color: 'from-primary-500 to-primary-700', change: '+12%' },
    { label: 'Participants', value: '156', icon: Users, color: 'from-accent-500 to-accent-700', change: '+8%' },
    { label: 'This Week', value: '8', icon: Calendar, color: 'from-success-500 to-success-700', change: '+4%' },
    { label: 'Hours Saved', value: '42', icon: Clock, color: 'from-warning-500 to-warning-700', change: '+15%' },
  ]

  // Use real data from GraphQL or fallback to mock data
  const recentMeetings = roomsData?.rooms?.slice(0, 3).map(room => ({
    id: room.id,
    name: room.name,
    participants: room.participants.map(p => ({
      name: p.user.name,
      avatar: p.user.avatar || '/api/placeholder/40/40'
    })),
    time: new Date(room.createdAt),
    duration: '45 min',
    status: 'completed',
  })) || [
    {
      id: 1,
      name: 'Product Strategy Meeting',
      participants: [
        { name: 'Alice', avatar: '/api/placeholder/40/40' },
        { name: 'Bob', avatar: '/api/placeholder/40/40' },
        { name: 'Carol', avatar: '/api/placeholder/40/40' },
      ],
      time: new Date(Date.now() - 2 * 60 * 60 * 1000),
      duration: '45 min',
      status: 'completed',
    },
    {
      id: 2,
      name: 'Design Review Session',
      participants: [
        { name: 'Dave', avatar: '/api/placeholder/40/40' },
        { name: 'Eve', avatar: '/api/placeholder/40/40' },
      ],
      time: new Date(Date.now() - 5 * 60 * 60 * 1000),
      duration: '30 min',
      status: 'completed',
    },
    {
      id: 3,
      name: 'Weekly Team Standup',
      participants: [
        { name: 'Frank', avatar: '/api/placeholder/40/40' },
        { name: 'Grace', avatar: '/api/placeholder/40/40' },
        { name: 'Henry', avatar: '/api/placeholder/40/40' },
        { name: 'Ivy', avatar: '/api/placeholder/40/40' },
      ],
      time: new Date(Date.now() - 24 * 60 * 60 * 1000),
      duration: '25 min',
      status: 'completed',
    },
  ]

  const upcomingMeetings = [
    {
      id: 4,
      name: 'Client Presentation',
      time: new Date(Date.now() + 2 * 60 * 60 * 1000),
      participants: 5,
    },
    {
      id: 5,
      name: 'Sprint Planning',
      time: new Date(Date.now() + 24 * 60 * 60 * 1000),
      participants: 8,
    },
  ]

 

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />
        <Sidebar />
        
        <main className="lg:ml-64 pt-16">
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <FadeIn className="mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2">
                  Welcome back, <span className="gradient-text">{session?.user?.name || 'User'}</span> 👋
                </h1>
                <p className="text-muted-foreground">
                  Ready to collaborate? Start or join a meeting below.
                </p>
              </div>
              <Button 
                size="lg" 
                onClick={() => setShowCreateModal(true)}
                className="glow-hover group"
              >
                <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                New Meeting
              </Button>
            </div>
          </FadeIn>

          {/* Quick Join Section */}
          <FadeIn delay={0.15} className="mb-8">
            <Card className="glass-strong border border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-green-400" />
                  Quick Join Meeting
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Join by URL */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Paste Meeting URL</Label>
                  <form onSubmit={handleJoinByUrl} className="flex flex-col sm:flex-row gap-3">
                    <Input
                      type="text"
                      value={meetingUrl}
                      onChange={(e) => setMeetingUrl(e.target.value)}
                      placeholder="http://localhost:3000/meeting/abc123"
                      className="flex-1"
                    />
                    <Button type="submit" className="sm:w-auto w-full">
                      Join from URL
                    </Button>
                  </form>
                </div>

                {/* OR Divider */}
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-sm text-muted-foreground">OR</span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                {/* Join by Room ID */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Enter Room ID</Label>
                  <form onSubmit={handleJoinByRoomId} className="flex flex-col sm:flex-row gap-3">
                    <Input
                      type="text"
                      value={roomIdInput}
                      onChange={(e) => setRoomIdInput(e.target.value)}
                      placeholder="test123"
                      className="flex-1"
                    />
                    <Button type="submit" variant="outline" className="sm:w-auto w-full">
                      Join by ID
                    </Button>
                  </form>
                </div>

                {/* Error Message */}
                {urlError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                  >
                    <p className="text-red-400 text-sm">{urlError}</p>
                  </motion.div>
                )}

                {/* Quick Join Button */}
                <div className="pt-2">
                  <Button 
                    onClick={handleQuickJoin}
                    variant="outline"
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Or Create Instant Meeting
                  </Button>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <AnimatedCard key={stat.label} delay={index * 0.1}>
                <Card className="glass-strong border border-white/10 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-bold mb-2">{stat.value}</h3>
                        <div className="flex items-center gap-1 text-success text-sm">
                          <TrendingUp className="w-4 h-4" />
                          <span>{stat.change}</span>
                        </div>
                      </div>
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                        <stat.icon className="w-7 h-7 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedCard>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Meetings */}
            <div className="lg:col-span-2">
              <FadeIn delay={0.3}>
                <Card className="glass-strong border border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary-400" />
                      Recent Meetings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {recentMeetings.map((meeting, index) => (
                      <motion.div
                        key={meeting.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="glass p-4 rounded-xl hover:bg-white/10 transition-all cursor-pointer group"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1 group-hover:text-primary-400 transition-colors">
                              {meeting.name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(meeting.time)} • {meeting.duration}
                            </p>
                          </div>
                          <span className="px-3 py-1 bg-success/20 text-success text-xs rounded-full">
                            Completed
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {meeting.participants.slice(0, 3).map((participant, i) => (
                              <Avatar
                                key={i}
                                src={participant.avatar}
                                alt={participant.name}
                                size="sm"
                                className="ring-2 ring-background"
                              />
                            ))}
                            {meeting.participants.length > 3 && (
                              <div className="w-8 h-8 rounded-full glass-strong flex items-center justify-center text-xs font-medium ring-2 ring-background">
                                +{meeting.participants.length - 3}
                              </div>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground ml-2">
                            {meeting.participants.length} participants
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </FadeIn>
            </div>

            {/* Sidebar Widgets */}
            <div className="space-y-6">
              {/* Upcoming */}
              <FadeIn delay={0.4}>
                <Card className="glass-strong border border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-accent-400" />
                      Upcoming
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {upcomingMeetings.map((meeting, index) => (
                      <motion.div
                        key={meeting.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="glass p-3 rounded-xl"
                      >
                        <h4 className="font-medium mb-2">{meeting.name}</h4>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{formatDate(meeting.time)}</span>
                          <span className="text-accent-400">{meeting.participants} people</span>
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </FadeIn>

              {/* AI Insights */}
              <FadeIn delay={0.5}>
                <Card className="glass-strong border border-white/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 rounded-full blur-3xl" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-warning-400 animate-pulse" />
                      AI Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="glass p-3 rounded-lg">
                        <p className="text-sm">
                          🎯 Your most productive meeting time is <span className="text-primary-400 font-semibold">2-4 PM</span>
                        </p>
                      </div>
                      <div className="glass p-3 rounded-lg">
                        <p className="text-sm">
                          ⚡ You've saved <span className="text-accent-400 font-semibold">42 hours</span> with AI summaries this month
                        </p>
                      </div>
                      <div className="glass p-3 rounded-lg">
                        <p className="text-sm">
                          📈 Team engagement up <span className="text-success font-semibold">15%</span> from last week
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            </div>
          </div>
        </div>
        </main>

      {/* Create Room Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Meeting"
        size="default"
      >
        <div className="space-y-6">
          <div>
            <Label className="mb-2 block">Meeting Name</Label>
            <Input
              placeholder="Enter meeting name..."
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
          </div>
          <div>
            <Label className="mb-2 block">Description (Optional)</Label>
            <Input
              placeholder="What's this meeting about?"
              value={roomDescription}
              onChange={(e) => setRoomDescription(e.target.value)}
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRoom} disabled={!roomName.trim() || creating}>
              {creating ? 'Creating...' : 'Create Meeting'}
            </Button>
          </div>
        </div>
      </Modal>
      </div>
    </ProtectedRoute>
  )
}
