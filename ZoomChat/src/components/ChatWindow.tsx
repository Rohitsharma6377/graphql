'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Message } from '@/lib/signaling'
import EmojiPicker from './EmojiPicker'

interface ChatWindowProps {
  messages: Message[]
  typingUser: string | null
  username: string
  onSendMessage: (text: string) => void
  onTyping: (isTyping: boolean) => void
  onSendEmoji: (emoji: string) => void
}

export default function ChatWindow({
  messages,
  typingUser,
  username,
  onSendMessage,
  onTyping,
  onSendEmoji,
}: ChatWindowProps) {
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)

    // Send typing indicator
    onTyping(true)

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false)
    }, 2000)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (inputValue.trim()) {
      onSendMessage(inputValue.trim())
      setInputValue('')
      onTyping(false)

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }

  return (
    <div className="flex flex-col h-full glass-card">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {messages.map((message, index) => {
            const isOwn = message.from === username || message.username === username
            return (
              <motion.div
                key={message.id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    isOwn
                      ? 'bg-gradient-heartshare text-gray-800'
                      : 'bg-white/60 text-gray-800'
                  }`}
                >
                  {!isOwn && (
                    <div className="text-xs font-semibold mb-1 opacity-70">
                      {message.username}
                    </div>
                  )}
                  <div className="text-sm">{message.text}</div>
                  <div className="text-xs opacity-60 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {isOwn && message.read && ' • Read'}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* Typing indicator */}
        {typingUser && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex justify-start"
          >
            <div className="bg-white/60 rounded-2xl px-4 py-2">
              <div className="text-xs font-semibold mb-1 opacity-70">{typingUser}</div>
              <div className="flex gap-1">
                <motion.span
                  className="w-2 h-2 bg-gray-600 rounded-full"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                />
                <motion.span
                  className="w-2 h-2 bg-gray-600 rounded-full"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                />
                <motion.span
                  className="w-2 h-2 bg-gray-600 rounded-full"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/30">
        <div className="flex gap-2 items-center">
          {/* Emoji Picker */}
          <EmojiPicker onEmojiSelect={onSendEmoji} />
          
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 rounded-full bg-white/60 focus:bg-white/80 outline-none transition-all text-gray-800 placeholder-gray-500"
          />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 rounded-full bg-gradient-heartshare hover:bg-gradient-heartshare-hover text-gray-800 font-semibold transition-all"
          >
            Send
          </motion.button>
        </div>
      </form>
    </div>
  )
}
