'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore, useRoomStore } from '@/stores'
import { fadeInUp, staggerContainer, staggerItem, hoverScale, tapScale, pulseAnimation } from '@/lib/animations'

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
  const { rooms, createRoom, fetchRooms, loading: roomLoading } = useRoomStore()
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showCreateRoom, setShowCreateRoom] = useState(false)
  const [showJoinRoom, setShowJoinRoom] = useState(false)
  const [bio, setBio] = useState('')
  const [roomHistory, setRoomHistory] = useState<RoomHistory[]>([])
  const [newRoomName, setNewRoomName] = useState('')
  const [joinRoomId, setJoinRoomId] = useState('')
  const [isCreatingRoom, setIsCreatingRoom] = useState(false)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, loading, router])

  useEffect(() => {
    if (isAuthenticated) {
      // Fetch available rooms
      fetchRooms({ page: 1, limit: 20, status: 'active' })
    }
  }, [isAuthenticated, fetchRooms])

  useEffect(() => {
    if (user && !user.isGuest) {
      // Load bio from localStorage
      const savedBio = localStorage.getItem(`heartshare_bio_${user._id}`)
      if (savedBio) setBio(savedBio)

      // Load room history
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

      // Navigate to room
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
      // Extract room ID from URL if user pastes full URL
      let roomId = joinRoomId.trim()
      
      // Check if it's a URL
      if (roomId.includes('/room/')) {
        const match = roomId.match(/\/room\/([^/?]+)/)
        if (match && match[1]) {
          roomId = match[1]
        }
      }

      // Add to history
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-sky-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">💕</div>
          <div className="flex gap-2 justify-center">
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </motion.div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-sky-50">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-card sticky top-0 z-50 mb-8"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold bg-gradient-heartshare bg-clip-text text-transparent">
              💕 HeartShare
            </h1>
            {user.isGuest && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                Guest Mode
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Admin Panel Button */}
            {user.role === 'admin' && (
              <button
                onClick={() => router.push('/admin')}
                className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg font-medium hover:bg-purple-200 transition-all text-sm"
              >
                👑 Admin Panel
              </button>
            )}

            {/* Coins Display */}
            {!user.isGuest && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-full">
                <span className="text-xl">🪙</span>
                <span className="font-bold text-yellow-900">{user.coins}</span>
              </div>
            )}

            {/* User Profile Button */}
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-3 px-4 py-2 rounded-full bg-white shadow-sm hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-heartshare flex items-center justify-center text-white font-bold text-lg">
                {user.name[0].toUpperCase()}
              </div>
              <span className="font-medium text-gray-900">{user.name}</span>
            </button>

            {/* Logout */}
            <button
              onClick={logoutUser}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Actions */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Create Room Card */}
            <div className="glass-card p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              
              <button
                onClick={() => setShowCreateRoom(true)}
                className="w-full px-6 py-4 rounded-lg bg-gradient-heartshare hover:shadow-lg text-gray-900 font-semibold text-lg transition-all mb-3"
              >
                🎥 Create Room
              </button>

              <button
                onClick={() => setShowJoinRoom(true)}
                className="w-full px-6 py-4 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-semibold text-lg transition-all mb-3"
              >
                🔗 Join with Room ID
              </button>

              <button
                onClick={() => router.push('/room/random')}
                className="w-full px-6 py-4 rounded-lg bg-white border-2 border-gray-300 hover:border-pink-300 text-gray-700 font-medium transition-all"
              >
                🎲 Join Random Room
              </button>
            </div>

            {/* User Stats */}
            {!user.isGuest && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Your Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Rooms</span>
                    <span className="font-bold text-gray-900">{roomHistory.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Coins</span>
                    <span className="font-bold text-yellow-600">{user.coins} 🪙</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Role</span>
                    <span className="px-2 py-1 bg-pink-100 text-pink-800 text-xs font-semibold rounded-full capitalize">
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Right Column - History */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="glass-card p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {user.isGuest ? 'Recent Rooms' : 'Your Room History'}
              </h2>

              {roomHistory.length === 0 ? (
                <motion.div 
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  className="text-center py-12"
                >
                  <motion.div 
                    animate={pulseAnimation}
                    className="text-6xl mb-4"
                  >
                    📭
                  </motion.div>
                  <p className="text-gray-600 mb-2">No rooms yet</p>
                  <p className="text-sm text-gray-500">Create your first room to get started!</p>
                </motion.div>
              ) : (
                <motion.div 
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="space-y-4"
                >
                  {roomHistory.map((room, index) => (
                    <motion.div
                      key={room._id}
                      variants={staggerItem}
                      whileHover={hoverScale}
                      whileTap={tapScale}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-pink-300 transition-all cursor-pointer"
                      onClick={() => handleJoinRoom(room.roomId)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-heartshare flex items-center justify-center text-white font-bold">
                            🎥
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">Room #{room.roomId.slice(-8)}</h3>
                            <p className="text-sm text-gray-500">
                              {new Date(room.createdAt).toLocaleDateString()} at{' '}
                              {new Date(room.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-gradient-heartshare text-gray-900 font-medium rounded-lg hover:shadow-lg transition-all">
                          Join Again
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-3">
                        <span>👥 Participants:</span>
                        <div className="flex gap-2">
                          {room.participants.map((p, i) => (
                            <span key={i} className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfileModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowProfileModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-8 max-w-md w-full"
            >
              <div className="text-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-heartshare flex items-center justify-center text-white font-bold text-4xl mx-auto mb-4">
                  {user.name[0].toUpperCase()}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                {user.email && (
                  <p className="text-gray-600 mt-1">{user.email}</p>
                )}
                <div className="mt-2">
                  <span className="px-3 py-1 bg-pink-100 text-pink-800 text-sm font-semibold rounded-full capitalize">
                    {user.role}
                  </span>
                </div>
              </div>

              {!user.isGuest && (
                <>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-pink-300 focus:outline-none bg-white resize-none"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-lg text-center">
                      <div className="text-2xl mb-1">🪙</div>
                      <div className="text-2xl font-bold text-yellow-900">{user.coins}</div>
                      <div className="text-xs text-yellow-800">Coins</div>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-pink-100 to-pink-200 rounded-lg text-center">
                      <div className="text-2xl mb-1">🎥</div>
                      <div className="text-2xl font-bold text-pink-900">{roomHistory.length}</div>
                      <div className="text-xs text-pink-800">Rooms</div>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveBio}
                    className="w-full px-6 py-3 rounded-lg bg-gradient-heartshare text-gray-900 font-semibold hover:shadow-lg transition-all mb-3"
                  >
                    Save Profile
                  </button>
                </>
              )}

              <button
                onClick={() => setShowProfileModal(false)}
                className="w-full px-6 py-3 rounded-lg bg-white border-2 border-gray-300 text-gray-700 font-medium hover:border-pink-300 transition-all"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Room Modal */}
      <AnimatePresence>
        {showCreateRoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateRoom(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-8 max-w-md w-full"
            >
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🎥</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Room</h2>
                <p className="text-gray-600">Start a video chat room</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Name (Optional)
                </label>
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="My Awesome Room"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-pink-300 focus:outline-none bg-white"
                  autoFocus
                />
              </div>

              <button
                onClick={handleCreateRoom}
                disabled={isCreatingRoom}
                className="w-full px-6 py-4 rounded-lg bg-gradient-heartshare text-gray-900 font-semibold text-lg hover:shadow-lg transition-all mb-3 disabled:opacity-50"
              >
                {isCreatingRoom ? 'Creating...' : 'Create & Join Room'}
              </button>

              <button
                onClick={() => setShowCreateRoom(false)}
                className="w-full px-6 py-3 rounded-lg bg-white border-2 border-gray-300 text-gray-700 font-medium hover:border-pink-300 transition-all"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Join Room Modal */}
      <AnimatePresence>
        {showJoinRoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowJoinRoom(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-8 max-w-md w-full"
            >
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🔗</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Join Room</h2>
                <p className="text-gray-600">Enter room ID or code to join</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room ID / Code
                </label>
                <input
                  type="text"
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleJoinRoomById()}
                  placeholder="room_123456_abc or paste URL"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-400 focus:outline-none bg-white font-mono text-sm"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 You can paste the full URL or just the room ID
                </p>
              </div>

              <button
                onClick={handleJoinRoomById}
                disabled={!joinRoomId.trim()}
                className="w-full px-6 py-4 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-semibold text-lg transition-all mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Join Room
              </button>

              <button
                onClick={() => {
                  setShowJoinRoom(false)
                  setJoinRoomId('')
                }}
                className="w-full px-6 py-3 rounded-lg bg-white border-2 border-gray-300 text-gray-700 font-medium hover:border-purple-300 transition-all"
              >
                Cancel
              </button>

              {/* Quick copy current URL */}
              <div className="mt-6 pt-6 border-t border-gray-300">
                <p className="text-xs font-semibold text-gray-700 mb-2">💡 Share Your Room:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/room/YOUR_ROOM_ID`}
                    readOnly
                    className="flex-1 px-3 py-2 rounded bg-gray-100 text-xs font-mono text-gray-600 border border-gray-300"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/room/YOUR_ROOM_ID`)
                    }}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-xs font-semibold transition-all"
                  >
                    📋
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
