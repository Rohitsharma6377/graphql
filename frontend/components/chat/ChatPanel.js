'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Send, Smile, Paperclip, X, MoreVertical } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

export function ChatPanel({ roomId }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      content: 'Hey everyone! Ready to start the meeting?',
      sender: { id: 2, name: 'Alice Johnson', avatar: '/api/placeholder/40/40' },
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      reactions: [{ emoji: '👍', count: 2 }],
    },
    {
      id: 2,
      content: 'Yes! Let me share my screen in a moment.',
      sender: { id: 3, name: 'Bob Smith', avatar: '/api/placeholder/40/40' },
      timestamp: new Date(Date.now() - 9 * 60 * 1000),
    },
    {
      id: 3,
      content: 'I have some exciting updates to share about the project!',
      sender: { id: 4, name: 'Carol Williams', avatar: '/api/placeholder/40/40' },
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      reactions: [{ emoji: '🎉', count: 3 }],
    },
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState(['Alice'])
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    const newMessage = {
      id: Date.now(),
      content: inputMessage,
      sender: { id: 1, name: 'You', avatar: '/api/placeholder/40/40' },
      timestamp: new Date(),
    }

    setMessages([...messages, newMessage])
    setInputMessage('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="h-full flex flex-col glass-strong">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <h2 className="text-xl font-bold flex items-center gap-2">
          💬 Chat
          <span className="text-sm font-normal text-muted-foreground">
            ({messages.length} messages)
          </span>
        </h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => {
            const isOwn = message.sender.id === 1
            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
                className={cn('flex gap-3', isOwn && 'flex-row-reverse')}
              >
                {!isOwn && (
                  <Avatar
                    src={message.sender.avatar}
                    alt={message.sender.name}
                    size="sm"
                    className="mt-1"
                  />
                )}

                <div className={cn('flex-1 max-w-[80%]', isOwn && 'flex flex-col items-end')}>
                  {!isOwn && (
                    <span className="text-xs text-muted-foreground mb-1 ml-1">
                      {message.sender.name}
                    </span>
                  )}
                  
                  <div className="group relative">
                    <div
                      className={cn(
                        'px-4 py-3 rounded-2xl transition-all',
                        isOwn
                          ? 'bg-gradient-primary text-white rounded-br-sm'
                          : 'glass-strong rounded-bl-sm'
                      )}
                    >
                      <p className="text-sm leading-relaxed break-words">
                        {message.content}
                      </p>
                      
                      {message.reactions && message.reactions.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {message.reactions.map((reaction, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-white/10 rounded-full text-xs flex items-center gap-1"
                            >
                              {reaction.emoji} {reaction.count}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div
                      className={cn(
                        'absolute top-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity',
                        isOwn ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'
                      )}
                    >
                      <button className="p-1 hover:bg-white/10 rounded-full text-muted-foreground hover:text-foreground">
                        <Smile className="w-4 h-4" />
                      </button>
                      <button className="p-1 hover:bg-white/10 rounded-full text-muted-foreground hover:text-foreground">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <span className="text-xs text-muted-foreground mt-1 ml-1">
                    {formatDate(message.timestamp)}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8" /> {/* Spacer for alignment */}
            <div className="glass-strong px-4 py-3 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                    className="w-2 h-2 bg-muted-foreground rounded-full"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-end gap-2">
          <Button variant="ghost" size="icon" className="mb-2">
            <Paperclip className="w-5 h-5" />
          </Button>
          
          <div className="flex-1">
            <Input
              placeholder="Type a message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="resize-none"
            />
          </div>

          <Button variant="ghost" size="icon" className="mb-2">
            <Smile className="w-5 h-5" />
          </Button>

          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            className="mb-2 glow-hover"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
