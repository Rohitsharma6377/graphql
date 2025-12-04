'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Message } from '@/lib/signaling'
import EmojiPicker from './EmojiPicker'
import { useTheme } from '@/hooks/useTheme'

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
  const { theme } = useTheme()

  // Get themed background pattern
  const getBackgroundPattern = () => {
    switch (theme) {
      case 'nightlofi':
        return 'bg-gradient-to-b from-indigo-900/30 to-purple-900/30'
      case 'romantic':
        return 'bg-gradient-to-b from-rose-100/40 to-pink-100/40'
      case 'rainy':
        return 'bg-gradient-to-b from-blue-100/40 to-cyan-100/40'
      case 'sunset':
        return 'bg-gradient-to-b from-orange-100/40 to-pink-100/40'
      case 'ocean':
        return 'bg-gradient-to-b from-purple-100/40 to-indigo-100/40'
      default:
        return 'bg-gradient-to-b from-pink-50/40 to-sky-50/40'
    }
  }

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
    <div className="flex flex-col h-full glass-card overflow-hidden relative">
      {/* Themed Background Pattern */}
      <div className={`absolute inset-0 ${getBackgroundPattern()} -z-10`} />
      
      {/* Theme-specific animations in chat */}
      {theme === 'nightlofi' && (
        <>
          {/* Twinkling stars */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={`chat-star-${i}`}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.2, 1, 0.2],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
          {/* Shooting stars */}
          {[...Array(2)].map((_, i) => (
            <motion.div
              key={`chat-shooting-${i}`}
              className="absolute w-0.5 h-0.5 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 30}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                x: [-50, -150],
                y: [0, 100],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 8 + i * 5,
                ease: "easeOut"
              }}
            >
              <div className="w-10 h-0.5 bg-gradient-to-r from-white to-transparent -rotate-45" />
            </motion.div>
          ))}
        </>
      )}

      {theme === 'sunset' && (
        <>
          {/* Flying birds */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={`chat-bird-${i}`}
              className="absolute text-orange-800/30"
              style={{
                fontSize: '1rem',
                left: -20,
                top: `${20 + i * 25}%`,
              }}
              animate={{
                x: [0, 400],
                y: [0, Math.sin(i) * 20],
              }}
              transition={{
                duration: 15 + i * 3,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              🦅
            </motion.div>
          ))}
        </>
      )}
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
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
                  className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-lg ${
                    isOwn
                      ? 'bg-gradient-heartshare text-gray-800'
                      : theme === 'nightlofi' 
                        ? 'bg-indigo-900/60 text-white backdrop-blur-sm' 
                        : 'bg-white/80 text-gray-800 backdrop-blur-sm'
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
            <div className={`rounded-2xl px-4 py-2 shadow-lg ${
              theme === 'nightlofi' 
                ? 'bg-indigo-900/60 text-white backdrop-blur-sm' 
                : 'bg-white/80 backdrop-blur-sm'
            }`}>
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
      <form onSubmit={handleSubmit} className="p-3 sm:p-4 border-t border-white/30 bg-white/20 backdrop-blur-sm">
        <div className="flex gap-2 items-center">
          {/* Emoji Picker */}
          <EmojiPicker onEmojiSelect={onSendEmoji} />
          
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-white/70 focus:bg-white/90 outline-none focus:ring-2 focus:ring-pink-300 transition-all text-gray-800 placeholder-gray-500 text-sm sm:text-base"
          />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!inputValue.trim()}
            className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base flex-shrink-0"
          >
            <span className="hidden sm:inline">Send</span>
            <span className="sm:hidden">➤</span>
          </motion.button>
        </div>
      </form>
    </div>
  )
}
