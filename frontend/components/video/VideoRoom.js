'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor, 
  MonitorOff,
  Phone,
  MessageSquare,
  Users,
  Settings,
  MoreVertical,
  Smile,
  FileText,
  Pen
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'

export function VideoRoom({ roomId }) {
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showWhiteboard, setShowWhiteboard] = useState(false)
  const [showDocument, setShowDocument] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)
  const [reactions, setReactions] = useState([])

  const participants = [
    { id: 1, name: 'You', avatar: '/api/placeholder/100/100', isSpeaking: false, isMuted: isMuted },
    { id: 2, name: 'Alice Johnson', avatar: '/api/placeholder/100/100', isSpeaking: true, isMuted: false },
    { id: 3, name: 'Bob Smith', avatar: '/api/placeholder/100/100', isSpeaking: false, isMuted: false },
    { id: 4, name: 'Carol Williams', avatar: '/api/placeholder/100/100', isSpeaking: false, isMuted: true },
    { id: 5, name: 'David Brown', avatar: '/api/placeholder/100/100', isSpeaking: false, isMuted: false },
    { id: 6, name: 'Eve Davis', avatar: '/api/placeholder/100/100', isSpeaking: false, isMuted: false },
  ]

  const handleReaction = (emoji) => {
    const id = Date.now()
    setReactions(prev => [...prev, { id, emoji }])
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== id))
    }, 3000)
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Main Video Grid */}
      <div className="flex-1 p-4 relative">
        <div className="h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 custom-scrollbar overflow-auto">
          {participants.map((participant, index) => (
            <motion.div
              key={participant.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'relative rounded-2xl overflow-hidden glass-strong group',
                participant.isSpeaking && 'ring-4 ring-primary-500 shadow-neon'
              )}
            >
              {/* Video Placeholder */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 to-accent-900/20 flex items-center justify-center">
                <Avatar
                  src={participant.avatar}
                  alt={participant.name}
                  size="xl"
                  status={participant.isMuted ? 'busy' : 'online'}
                  className="opacity-80"
                />
              </div>

              {/* Participant Info */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {participant.isMuted ? (
                      <div className="p-1.5 bg-destructive/80 rounded-full">
                        <MicOff className="w-3 h-3" />
                      </div>
                    ) : (
                      <div className="p-1.5 bg-success/80 rounded-full">
                        <Mic className="w-3 h-3" />
                      </div>
                    )}
                    <span className="font-medium text-sm">{participant.name}</span>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-white/10 rounded-full">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Speaking Indicator */}
              {participant.isSpeaking && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute top-4 right-4"
                >
                  <div className="flex gap-0.5">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{
                          height: ['8px', '16px', '8px'],
                        }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.1,
                        }}
                        className="w-1 bg-primary-400 rounded-full"
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Floating Reactions */}
        <AnimatePresence>
          {reactions.map((reaction) => (
            <motion.div
              key={reaction.id}
              initial={{ opacity: 0, y: 0, scale: 0 }}
              animate={{ opacity: 1, y: -100, scale: 1.5 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 3 }}
              className="absolute bottom-32 right-8 text-4xl pointer-events-none"
              style={{
                left: `${Math.random() * 80 + 10}%`,
              }}
            >
              {reaction.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Control Bar */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
        className="relative z-20"
      >
        <div className="glass-strong border-t border-white/10 px-6 py-4">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            {/* Left Controls */}
            <div className="flex items-center gap-2">
              <div className="glass-strong px-3 py-2 rounded-xl">
                <span className="text-sm font-medium text-muted-foreground">
                  Meeting: <span className="text-foreground">{roomId}</span>
                </span>
              </div>
            </div>

            {/* Center Controls */}
            <div className="flex items-center gap-3">
              <Button
                variant={isMuted ? 'destructive' : 'glass'}
                size="icon"
                className="w-12 h-12 rounded-full"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>

              <Button
                variant={isVideoOff ? 'destructive' : 'glass'}
                size="icon"
                className="w-12 h-12 rounded-full"
                onClick={() => setIsVideoOff(!isVideoOff)}
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </Button>

              <Button
                variant={isScreenSharing ? 'default' : 'glass'}
                size="icon"
                className="w-12 h-12 rounded-full"
                onClick={() => setIsScreenSharing(!isScreenSharing)}
              >
                {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
              </Button>

              <Button
                variant="destructive"
                size="icon"
                className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl"
              >
                <Phone className="w-6 h-6" />
              </Button>

              <Button
                variant="glass"
                size="icon"
                className="w-12 h-12 rounded-full"
                onClick={() => setShowChat(!showChat)}
              >
                <MessageSquare className="w-5 h-5" />
              </Button>

              <Button
                variant="glass"
                size="icon"
                className="w-12 h-12 rounded-full"
                onClick={() => setShowWhiteboard(!showWhiteboard)}
              >
                <Pen className="w-5 h-5" />
              </Button>

              <Button
                variant="glass"
                size="icon"
                className="w-12 h-12 rounded-full"
                onClick={() => setShowDocument(!showDocument)}
              >
                <FileText className="w-5 h-5" />
              </Button>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {['👍', '❤️', '😂', '🎉'].map((emoji) => (
                  <Button
                    key={emoji}
                    variant="ghost"
                    size="icon"
                    className="w-10 h-10 text-xl hover:scale-125 transition-transform"
                    onClick={() => handleReaction(emoji)}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>

              <Button
                variant="glass"
                size="icon"
                className="w-12 h-12 rounded-full"
                onClick={() => setShowParticipants(!showParticipants)}
              >
                <Users className="w-5 h-5" />
              </Button>

              <Button
                variant="glass"
                size="icon"
                className="w-12 h-12 rounded-full"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
