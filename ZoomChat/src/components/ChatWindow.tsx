'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Smile, Paperclip } from 'lucide-react'
import { Message } from '@/lib/signaling'
import EmojiPicker from './EmojiPicker'
import { useTheme } from '@/hooks/useTheme'
import { Avatar } from './ui/Avatar'

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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { theme } = useTheme()

  // Get themed background pattern
  const getBackgroundPattern = () => {
    switch (theme) {
      case 'nightlofi':
        return 'bg-gradient-to-b from-indigo-900/20 to-purple-900/20'
      case 'romantic':
        return 'bg-gradient-to-b from-rose-50/50 to-pink-50/50'
      case 'rainy':
        return 'bg-gradient-to-b from-blue-50/50 to-cyan-50/50'
      case 'sunset':
        return 'bg-gradient-to-b from-orange-50/50 to-pink-50/50'
      case 'ocean':
        return 'bg-gradient-to-b from-purple-50/50 to-indigo-50/50'
      default:
        return 'bg-gradient-to-b from-pink-50/30 to-sky-50/30'
    }
  }

  // Auto-scroll to bottom with smooth behavior
  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }, 100)
    return () => clearTimeout(timer)
  }, [messages])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    onTyping(true)

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

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
      
      // Refocus input on mobile
      inputRef.current?.focus()
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    onSendEmoji(emoji)
    setShowEmojiPicker(false)
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex flex-col h-full glass-card overflow-hidden relative">
      {/* Themed Background */}
      <div className={`absolute inset-0 ${getBackgroundPattern()} -z-10`} />
      
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {messages.map((message, index) => {
            const isOwnMessage = message.username === username
            
            return (
              <motion.div
                key={`${message.timestamp}-${index}`}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ 
                  type: "spring",
                  stiffness: 500,
                  damping: 30
                }}
                className={`flex items-end gap-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                {!isOwnMessage && (
                  <Avatar 
                    name={message.username} 
                    size="sm" 
                    className="flex-shrink-0"
                  />
                )}
                
                {/* Message Bubble */}
                <div className={`flex flex-col max-w-[75%] sm:max-w-[60%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                  {/* Username (only for others) */}
                  {!isOwnMessage && (
                    <span className="text-xs font-medium text-gray-600 mb-1 px-2">
                      {message.username}
                    </span>
                  )}
                  
                  {/* Message Content */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`px-4 py-2.5 rounded-2xl shadow-md break-words ${
                      isOwnMessage
                        ? 'bg-gradient-to-r from-pink-400 to-sky-400 text-white rounded-br-sm'
                        : 'bg-white/90 text-gray-800 rounded-bl-sm'
                    }`}
                  >
                    <p className="text-sm md:text-base leading-relaxed">{message.text}</p>
                  </motion.div>
                  
                  {/* Timestamp */}
                  <span className="text-xs text-gray-500 mt-1 px-2">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* Typing Indicator */}
        <AnimatePresence>
          {typingUser && typingUser !== username && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2"
            >
              <Avatar name={typingUser} size="sm" />
              <div className="px-4 py-2.5 bg-white/90 rounded-2xl rounded-bl-sm shadow-md">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-gray-400 rounded-full"
                      animate={{ y: [0, -5, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.1,
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 md:p-4 bg-white/50 backdrop-blur-sm border-t border-white/30">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          {/* Emoji Button */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="flex-shrink-0 p-2.5 rounded-xl bg-white/70 hover:bg-white transition-all active:scale-95 touch-manipulation"
          >
            <Smile className="w-5 h-5 text-gray-600" />
          </button>

          {/* Input Field */}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Type a message..."
              className="w-full px-4 py-2.5 pr-10 text-base bg-white/70 border-2 border-white/50 
                       rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300
                       transition-all placeholder:text-gray-400 touch-manipulation"
              maxLength={500}
            />
            
            {/* Character count on mobile */}
            {inputValue.length > 400 && (
              <span className="absolute right-3 bottom-3 text-xs text-gray-400">
                {inputValue.length}/500
              </span>
            )}
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-r from-pink-400 to-sky-400 
                     hover:from-pink-500 hover:to-sky-500 text-white shadow-md hover:shadow-lg
                     transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                     touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

        {/* Emoji Picker Popup */}
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-full left-0 right-0 mb-2 mx-3 md:mx-4"
            >
              <EmojiPicker
                onEmojiSelect={handleEmojiSelect}
                onClose={() => setShowEmojiPicker(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
