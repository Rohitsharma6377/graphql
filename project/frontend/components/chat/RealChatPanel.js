'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Smile, Paperclip, X, Image as ImageIcon, File, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { useSession } from 'next-auth/react'
import { useQuery, useMutation, useSubscription } from '@apollo/client'
import { GET_MESSAGES, SEND_MESSAGE, MESSAGE_SENT_SUBSCRIPTION } from '@/graphql/queries'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { formatDate } from '@/lib/utils'

export function RealChatPanel({ roomId }) {
  const { data: session } = useSession()
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)
  const [emojiCategory, setEmojiCategory] = useState('Smileys')
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  // Fetch existing messages
  const { data: messagesData, loading } = useQuery(GET_MESSAGES, {
    variables: { roomId },
    skip: !roomId,
  })

  // Send message mutation
  const [sendMessageMutation] = useMutation(SEND_MESSAGE)

  // Subscribe to new messages
  useSubscription(MESSAGE_SENT_SUBSCRIPTION, {
    variables: { roomId },
    onData: ({ data }) => {
      const newMessage = data?.data?.messageSent
      if (newMessage) {
        setMessages(prev => {
          // Avoid duplicates
          if (prev.find(m => m.id === newMessage.id)) return prev
          return [...prev, newMessage]
        })
      }
    },
  })

  // Load messages
  useEffect(() => {
    if (messagesData?.messages) {
      setMessages(messagesData.messages)
    }
  }, [messagesData])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Send text message
  const handleSendMessage = async (e) => {
    e?.preventDefault()
    
    if (!message.trim()) return

    if (!session?.user) {
      alert('Please sign in to send messages')
      return
    }

    try {
      await sendMessageMutation({
        variables: {
          input: {
            roomId,
            content: message.trim(),
            type: 'text',
          },
        },
      })

      setMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
      if (error.message?.includes('Not authenticated')) {
        alert('Please sign in to send messages')
      }
    }
  }

  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      const result = await uploadToCloudinary(file, 'chat-files')
      
      if (result.success) {
        await sendMessageMutation({
          variables: {
            input: {
              roomId,
              content: result.url,
              type: result.resourceType === 'image' ? 'image' : 'file',
              metadata: JSON.stringify({
                filename: file.name,
                size: file.size,
                format: result.format,
              }),
            },
          },
        })
      }
    } catch (error) {
      console.error('Error uploading file:', error)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Add emoji
  const addEmoji = (emoji) => {
    setMessage(prev => prev + emoji)
  }

  const emojiCategories = {
    'Smileys': ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔'],
    'Gestures': ['👍', '👎', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '🤲', '🤝', '🙏'],
    'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '💕', '💞', '💓', '💗', '💖', '💘', '💝'],
    'Celebrations': ['🎉', '🎊', '🎈', '🎁', '🎀', '🎂', '🍰', '🎆', '🎇', '✨', '🎄', '🎃', '🎗️', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️'],
    'Symbols': ['💯', '✅', '☑️', '✔️', '✖️', '❌', '❎', '⭕', '🔴', '🟢', '🟡', '🔵', '🟣', '⚪', '⚫', '🟤', '🔶', '🔷', '🔸', '🔹', '💠', '🔥', '⚡', '💫', '⭐', '🌟', '✨', '💥', '💢']
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="glass-dark border-b border-white/10 p-4 flex-shrink-0">
        <h3 className="text-lg font-semibold">Chat</h3>
        <p className="text-sm text-muted-foreground">
          {messages.length} message{messages.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!session?.user ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="glass rounded-2xl p-8 max-w-sm">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-primary-500" />
              <h3 className="text-xl font-bold mb-2">Sign In Required</h3>
              <p className="text-muted-foreground mb-4">
                Please sign in to send and receive messages
              </p>
              <Button
                onClick={() => window.location.href = '/auth/signin'}
                className="bg-primary-500 hover:bg-primary-600"
              >
                Sign In
              </Button>
            </div>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-muted-foreground mb-2">No messages yet</p>
            <p className="text-sm text-muted-foreground">Send a message to start the conversation</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => {
              const isOwn = msg.sender?.id === session?.user?.id
              const showAvatar = index === 0 || messages[index - 1].sender?.id !== msg.sender?.id

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
                >
                  {showAvatar && (
                    <Avatar
                      src={msg.sender?.avatar}
                      fallback={msg.sender?.name || 'U'}
                      size="sm"
                      className="flex-shrink-0"
                    />
                  )}
                  {!showAvatar && <div className="w-8" />}

                  <div className={`flex-1 ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                    {showAvatar && (
                      <div className={`flex items-baseline gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
                        <span className="text-sm font-medium">{msg.sender?.name || 'Unknown'}</span>
                        <span className="text-xs text-muted-foreground">{formatDate(new Date(msg.createdAt))}</span>
                      </div>
                    )}

                    {msg.type === 'text' && (
                      <div className={`glass rounded-2xl px-4 py-2 max-w-[80%] ${
                        isOwn ? 'bg-primary-500/20 rounded-tr-sm' : 'rounded-tl-sm'
                      }`}>
                        <p className="text-sm break-words">{msg.content}</p>
                      </div>
                    )}

                    {msg.type === 'image' && (
                      <div className={`rounded-2xl overflow-hidden max-w-[80%] ${
                        isOwn ? 'rounded-tr-sm' : 'rounded-tl-sm'
                      }`}>
                        <img
                          src={msg.content}
                          alt="Shared image"
                          className="w-full h-auto object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(msg.content, '_blank')}
                        />
                      </div>
                    )}

                    {msg.type === 'file' && (
                      <div className={`glass rounded-2xl px-4 py-3 max-w-[80%] flex items-center gap-3 ${
                        isOwn ? 'bg-primary-500/20 rounded-tr-sm' : 'rounded-tl-sm'
                      }`}>
                        <File className="w-8 h-8 text-primary-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {msg.metadata ? JSON.parse(msg.metadata).filename : 'File'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {msg.metadata ? `${(JSON.parse(msg.metadata).size / 1024).toFixed(1)} KB` : ''}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(msg.content, '_blank')}
                        >
                          Open
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="glass-dark border-t border-white/10 p-4 flex-shrink-0">
        {!session?.user ? (
          <div className="text-center py-2">
            <p className="text-sm text-muted-foreground">
              <a href="/auth/signin" className="text-primary-500 hover:underline">Sign in</a> to send messages
            </p>
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt"
            />

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              title="Upload file"
            >
              {isUploading ? (
                <div className="animate-spin w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full" />
              ) : (
                <Paperclip className="w-4 h-4" />
              )}
            </Button>

            <div className="relative">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowEmoji(!showEmoji)}
                title="Add emoji"
              >
                <Smile className="w-4 h-4" />
              </Button>

              <AnimatePresence>
                {showEmoji && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="absolute bottom-full right-0 mb-2 w-80 max-h-96 overflow-hidden z-50"
                  >
                    <div className="glass rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                      {/* Close button */}
                      <div className="flex items-center justify-between p-3 border-b border-white/10 bg-background-dark/50">
                        <span className="text-sm font-medium">Emojis</span>
                        <button
                          type="button"
                          onClick={() => setShowEmoji(false)}
                          className="w-6 h-6 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Category tabs */}
                      <div className="flex gap-1 p-2 border-b border-white/10 bg-background-dark/30 overflow-x-auto scrollbar-thin">
                        {Object.keys(emojiCategories).map(category => (
                          <button
                            key={category}
                            type="button"
                            onClick={() => setEmojiCategory(category)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                              emojiCategory === category
                                ? 'bg-primary-500 text-white'
                                : 'hover:bg-white/10 text-muted-foreground'
                            }`}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                      
                      {/* Emoji grid */}
                      <div className="p-3 max-h-64 overflow-y-auto scrollbar-thin">
                        <div className="grid grid-cols-8 gap-2">
                          {emojiCategories[emojiCategory].map((emoji, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => addEmoji(emoji)}
                              className="text-2xl hover:scale-125 hover:bg-white/10 rounded-lg p-1 transition-all"
                              title={emoji}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-background-dark/50 border-white/20 focus:border-primary-500 transition-all"
              disabled={isUploading}
              maxLength={2000}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage(e)
                }
              }}
            />

            <Button 
              type="submit" 
              disabled={!message.trim() || isUploading}
              className="bg-primary-500 hover:bg-primary-600 transition-all"
              title="Send message (Enter)"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          {message.length > 0 && (
            <div className="flex justify-end">
              <span className={`text-xs ${message.length > 1900 ? 'text-warning' : 'text-muted-foreground'}`}>
                {message.length}/2000
              </span>
            </div>
          )}
        </form>
        )}
      </div>
    </div>
  )
}
