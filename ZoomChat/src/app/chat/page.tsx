'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore, useRoomStore } from '@/stores'
import { 
  Video, Plus, Link as LinkIcon, Shuffle, User, LogOut, 
  Crown, Coins, TrendingUp, Clock, Users, Settings, Heart
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Avatar } from '@/components/ui/Avatar'
import { ResponsiveGrid } from '@/components/ui/ResponsiveGrid'
import { TopBar } from '@/components/ui/TopBar'
import { SectionTitle } from '@/components/ui/SectionTitle'

interface RoomHistory {
  _id: string
  roomId: string
  participants: string[]
  createdAt: string
  duration?: number
}

export default function ChatPage() {
  const router = useRouter()
  const { user, isAuthenticated, logoutUser, loading } = useAuthStore()
  const { rooms, createRoom, fetchRooms, loading: roomLoading, error } = useRoomStore()
  
  // Modals
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showCreateRoom, setShowCreateRoom] = useState(false)
  const [showJoinRoom, setShowJoinRoom] = useState(false)
  
  // Form states
  const [bio, setBio] = useState('')
  const [newRoomName, setNewRoomName] = useState('')
  const [joinRoomId, setJoinRoomId] = useState('')
  const [isCreatingRoom, setIsCreatingRoom] = useState(false)
  const [roomHistory, setRoomHistory] = useState<RoomHistory[]>([])

  // Authentication check
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, loading, router])

  // Fetch rooms
  useEffect(() => {
    if (isAuthenticated) {
      fetchRooms({ page: 1, limit: 20, status: 'active' }).catch(err => {
        console.error('Failed to fetch rooms:', err)
        // Continue anyway - UI will show empty state
      })
    }
  }, [isAuthenticated, fetchRooms])

  // Load user data
  useEffect(() => {
    if (user && !user.isGuest) {
      const savedBio = localStorage.getItem(`heartshare_bio_${user._id}`)
      if (savedBio) setBio(savedBio)

      const savedHistory = localStorage.getItem(`heartshare_history_${user._id}`)
      if (savedHistory) {
        try {
          setRoomHistory(JSON.parse(savedHistory))
        } catch (e) {
          console.error('Failed to load history:', e)
        }
      }
    }
  }, [user])

  const handleSaveBio = () => {
    if (user) {
      localStorage.setItem(`heartshare_bio_${user._id}`, bio)
      setShowProfileModal(false)
    }
  }

  const handleCreateRoom = async () => {
    if (isCreatingRoom) return
    
    try {
      setIsCreatingRoom(true)
      const roomName = newRoomName.trim() || `${user?.name}'s Room`
      
      const room = await createRoom({
        name: roomName,
        type: 'public',
        maxParticipants: 50,
        settings: {
          allowChat: true,
          allowScreenShare: true,
          waitingRoom: false
        }
      })

      // Add to history
      const newRoom: RoomHistory = {
        _id: room._id,
        roomId: room._id,
        participants: [user?.name || 'You'],
        createdAt: new Date().toISOString(),
      }

      const updatedHistory = [newRoom, ...roomHistory]
      setRoomHistory(updatedHistory)
      
      if (user && !user.isGuest) {
        localStorage.setItem(`heartshare_history_${user._id}`, JSON.stringify(updatedHistory))
      }

      setNewRoomName('')
      setShowCreateRoom(false)
      router.push(`/room/${room._id}`)
    } catch (error) {
      console.error('Failed to create room:', error)
    } finally {
      setIsCreatingRoom(false)
    }
  }

  const handleJoinRoom = (roomId: string) => {
    router.push(`/room/${roomId}`)
  }

  const handleJoinRoomById = () => {
    if (joinRoomId.trim()) {
      let roomId = joinRoomId.trim()
      
      if (roomId.includes('/room/')) {
        const match = roomId.match(/\/room\/([^/?]+)/)
        if (match && match[1]) roomId = match[1]
      }

      const newRoom: RoomHistory = {
        _id: Date.now().toString(),
        roomId: roomId,
        participants: [user?.name || 'You'],
        createdAt: new Date().toISOString(),
      }

      const updatedHistory = [newRoom, ...roomHistory]
      setRoomHistory(updatedHistory)
      
      if (user && !user.isGuest) {
        localStorage.setItem(`heartshare_history_${user._id}`, JSON.stringify(updatedHistory))
      }

      setJoinRoomId('')
      setShowJoinRoom(false)
      router.push(`/room/${roomId}`)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="text-6xl md:text-7xl mb-4 animate-pulse">💕</div>
          <div className="flex gap-2 justify-center">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 bg-gradient-to-r from-pink-400 to-sky-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading HeartShare...</p>
        </motion.div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-[100dvh] pb-8">
      {/* Header */}
      <TopBar className="mb-4 md:mb-8">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 md:gap-4">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gradient flex items-center gap-2">
              <Heart className="w-6 h-6 md:w-8 md:h-8 text-pink-500" />
              <span className="hidden sm:inline">HeartShare</span>
            </h1>
            {user.isGuest && (
              <span className="px-2 md:px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                Guest
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Admin Panel */}
            {user.role === 'admin' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/admin')}
                className="hidden md:flex"
              >
                <Crown className="w-4 h-4 mr-2 text-purple-500" />
                Admin
              </Button>
            )}

            {/* Coins */}
            {!user.isGuest && (
              <div className="hidden sm:flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-gradient-to-r from-yellow-100 to-yellow-200">
                <Coins className="w-4 h-4 md:w-5 md:h-5 text-yellow-600" />
                <span className="font-bold text-yellow-900 text-sm md:text-base">{user.coins || 0}</span>
              </div>
            )}

            {/* User Profile */}
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-2 tap-target hover-lift"
            >
              <Avatar name={user.name} size="md" status="online" />
              <span className="hidden md:inline font-medium text-gray-800 text-sm lg:text-base max-w-[120px] truncate">
                {user.name}
              </span>
            </button>

            {/* Logout */}
            <Button variant="ghost" size="sm" onClick={logoutUser}>
              <LogOut className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
        </div>
      </TopBar>

      {/* Main Content */}
      <div className="container-responsive">
        <ResponsiveGrid cols={{ default: 1, lg: 3 }} gap="lg">
          {/* Left Column - Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4 md:space-y-6"
          >
            {/* Quick Actions Card */}
            <Card padding="lg" gradient>
              <SectionTitle icon="⚡">Quick Actions</SectionTitle>
              
              <div className="space-y-3">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => setShowCreateRoom(true)}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Room
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  fullWidth
                  onClick={() => setShowJoinRoom(true)}
                >
                  <LinkIcon className="w-5 h-5 mr-2" />
                  Join with ID
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  onClick={() => router.push('/room/random')}
                >
                  <Shuffle className="w-5 h-5 mr-2" />
                  Random Room
                </Button>
              </div>
            </Card>

            {/* User Stats */}
            {!user.isGuest && (
              <Card padding="lg">
                <CardHeader>
                  <CardTitle>Your Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-pink-50 to-pink-100">
                      <div className="flex items-center gap-3">
                        <Video className="w-5 h-5 text-pink-500" />
                        <span className="text-sm font-medium text-gray-700">Total Rooms</span>
                      </div>
                      <span className="text-lg font-bold text-pink-600">{roomHistory.length}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-yellow-50 to-yellow-100">
                      <div className="flex items-center gap-3">
                        <Coins className="w-5 h-5 text-yellow-600" />
                        <span className="text-sm font-medium text-gray-700">Coins</span>
                      </div>
                      <span className="text-lg font-bold text-yellow-600">{user.coins || 0}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100">
                      <div className="flex items-center gap-3">
                        <Crown className="w-5 h-5 text-purple-500" />
                        <span className="text-sm font-medium text-gray-700">Role</span>
                      </div>
                      <span className="px-3 py-1 bg-purple-200 text-purple-800 text-xs font-bold rounded-full capitalize">
                        {user.role}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Right Column - Active Rooms & History */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Active Rooms */}
            <Card padding="lg" gradient>
              <SectionTitle icon="🎥" subtitle={`${rooms?.length || 0} active rooms`}>
                Join Active Rooms
              </SectionTitle>

              {/* API Error Warning */}
              {error && (
                <div className="mb-4 p-4 rounded-xl bg-yellow-50 border border-yellow-200">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">⚠️</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-yellow-900 mb-1">Backend Server Not Running</h4>
                      <p className="text-sm text-yellow-800 mb-2">
                        The API server is not responding. To use rooms and chat features, please start the backend server:
                      </p>
                      <div className="bg-yellow-100 p-3 rounded-lg font-mono text-xs text-yellow-900">
                        <div>1. Open a new terminal</div>
                        <div>2. cd c:\Users\ASUS\Desktop\graphql\server</div>
                        <div>3. npm install (first time only)</div>
                        <div>4. npm start</div>
                      </div>
                      <p className="text-xs text-yellow-700 mt-2">
                        Error: {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {roomLoading ? (
                <div className="flex justify-center py-12">
                  <div className="flex gap-2">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>
                </div>
              ) : rooms && rooms.length > 0 ? (
                <ResponsiveGrid cols={{ default: 1, md: 2 }} gap="md">
                  {rooms.map((room) => (
                    <Card
                      key={room._id}
                      padding="md"
                      hover
                      onClick={() => handleJoinRoom(room._id)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-gray-900 text-base md:text-lg mb-1">
                            {room.name || 'Untitled Room'}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Users className="w-3 h-3" />
                            <span>{room.participants?.length || 0} / {room.maxParticipants || 50}</span>
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          room.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {room.status || 'active'}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Clock className="w-3 h-3" />
                        <span>Created {new Date(room.createdAt).toLocaleDateString()}</span>
                      </div>
                    </Card>
                  ))}
                </ResponsiveGrid>
              ) : (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">🎬</div>
                  <p className="text-gray-600 mb-4">No active rooms yet</p>
                  <Button variant="primary" onClick={() => setShowCreateRoom(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Room
                  </Button>
                </div>
              )}
            </Card>

            {/* Room History */}
            {roomHistory.length > 0 && (
              <Card padding="lg">
                <SectionTitle icon="📜">Recent Rooms</SectionTitle>

                <div className="space-y-2">
                  {roomHistory.slice(0, 5).map((room) => (
                    <div
                      key={room._id}
                      onClick={() => handleJoinRoom(room.roomId)}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/50 hover:bg-white/80 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-sky-400 flex items-center justify-center">
                          <Video className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-sm">Room {room.roomId.slice(0, 8)}...</p>
                          <p className="text-xs text-gray-500">
                            {new Date(room.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        Join
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </motion.div>
        </ResponsiveGrid>
      </div>

      {/* Modals */}
      
      {/* Create Room Modal */}
      <Modal
        isOpen={showCreateRoom}
        onClose={() => setShowCreateRoom(false)}
        title="Create New Room"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Room Name (Optional)"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            placeholder="My Awesome Room"
            leftIcon={<Video className="w-5 h-5" />}
          />
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowCreateRoom(false)} fullWidth>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateRoom}
              loading={isCreatingRoom}
              fullWidth
            >
              Create & Join
            </Button>
          </div>
        </div>
      </Modal>

      {/* Join Room Modal */}
      <Modal
        isOpen={showJoinRoom}
        onClose={() => setShowJoinRoom(false)}
        title="Join Room by ID"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Room ID or URL"
            value={joinRoomId}
            onChange={(e) => setJoinRoomId(e.target.value)}
            placeholder="Paste room ID or URL"
            leftIcon={<LinkIcon className="w-5 h-5" />}
          />
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowJoinRoom(false)} fullWidth>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleJoinRoomById}
              disabled={!joinRoomId.trim()}
              fullWidth
            >
              Join Room
            </Button>
          </div>
        </div>
      </Modal>

      {/* Profile Modal */}
      <Modal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        title="Your Profile"
        size="md"
      >
        <div className="space-y-6">
          <div className="flex flex-col items-center">
            <Avatar name={user.name} size="2xl" className="mb-4" />
            <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
            <p className="text-gray-600">{user.email}</p>
            {user.isGuest && (
              <span className="mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full">
                Guest User
              </span>
            )}
          </div>

          {!user.isGuest && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="input-glass min-h-[100px] resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <Button variant="primary" onClick={handleSaveBio} fullWidth>
                Save Changes
              </Button>
            </>
          )}

          {user.isGuest && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-pink-50 to-sky-50 border border-pink-200">
              <p className="text-sm text-gray-700 mb-3">
                Create an account to unlock all features!
              </p>
              <Button
                variant="primary"
                onClick={() => router.push('/auth/register')}
                fullWidth
              >
                Create Account
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
