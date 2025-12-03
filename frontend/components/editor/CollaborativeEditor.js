'use client'

import { motion } from 'framer-motion'
import { 
  X, 
  Bold, 
  Italic, 
  List, 
  ListOrdered,
  Heading1,
  Heading2,
  Code,
  Quote,
  Download,
  Users
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'

export function CollaborativeEditor({ roomId, onClose }) {
  const [content, setContent] = useState('')
  const [collaborators, setCollaborators] = useState([
    { id: 1, name: 'Alice', color: '#6366F1', cursor: null },
    { id: 2, name: 'Bob', color: '#22D3EE', cursor: null },
    { id: 3, name: 'Carol', color: '#10B981', cursor: null },
  ])

  const toolbarButtons = [
    { icon: Bold, label: 'Bold', action: 'bold' },
    { icon: Italic, label: 'Italic', action: 'italic' },
    { icon: Heading1, label: 'Heading 1', action: 'h1' },
    { icon: Heading2, label: 'Heading 2', action: 'h2' },
    { icon: List, label: 'Bullet List', action: 'ul' },
    { icon: ListOrdered, label: 'Numbered List', action: 'ol' },
    { icon: Code, label: 'Code Block', action: 'code' },
    { icon: Quote, label: 'Quote', action: 'quote' },
  ]

  const handleFormat = (action) => {
    // Placeholder for formatting actions
    console.log('Format action:', action)
  }

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `document-${roomId}-${Date.now()}.md`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-lg"
    >
      {/* Header */}
      <div className="glass-strong border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-1">
              📝 Collaborative Document
            </h2>
            <p className="text-sm text-muted-foreground">
              Real-time editing with your team
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Active Collaborators */}
            <div className="flex items-center gap-2 glass px-4 py-2 rounded-xl">
              <Users className="w-4 h-4 text-muted-foreground" />
              <div className="flex -space-x-2">
                {collaborators.map((user) => (
                  <Avatar
                    key={user.id}
                    fallback={user.name[0]}
                    size="sm"
                    className="ring-2 ring-background"
                    style={{ borderColor: user.color }}
                  />
                ))}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="glass border-b border-white/10 px-6 py-3">
        <div className="flex items-center gap-1 flex-wrap">
          {toolbarButtons.map((btn) => (
            <Button
              key={btn.action}
              variant="ghost"
              size="icon"
              onClick={() => handleFormat(btn.action)}
              className="rounded-lg"
              title={btn.label}
            >
              <btn.icon className="w-5 h-5" />
            </Button>
          ))}
          
          <div className="w-px h-6 bg-white/10 mx-2" />
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDownload}
            className="rounded-lg"
            title="Download"
          >
            <Download className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="h-[calc(100vh-148px)] p-6">
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="h-full max-w-4xl mx-auto"
        >
          <div className="h-full glass-strong rounded-2xl p-8 overflow-hidden">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start typing your document here... (Markdown supported)"
              className="w-full h-full bg-transparent resize-none focus:outline-none text-base leading-relaxed custom-scrollbar"
              style={{ fontFamily: 'var(--font-inter)' }}
            />
          </div>

          {/* Floating Collaborator Cursors */}
          {collaborators.map((user) => user.cursor && (
            <motion.div
              key={user.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                position: 'absolute',
                left: user.cursor.x,
                top: user.cursor.y,
                pointerEvents: 'none',
              }}
            >
              <div
                className="w-0.5 h-6 animate-pulse"
                style={{ backgroundColor: user.color }}
              />
              <div
                className="px-2 py-1 rounded text-xs font-medium text-white mt-1 whitespace-nowrap"
                style={{ backgroundColor: user.color }}
              >
                {user.name}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Status Bar */}
      <div className="absolute bottom-0 left-0 right-0 glass-strong border-t border-white/10 px-6 py-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <span className="text-muted-foreground">
              {content.split(' ').filter(w => w).length} words
            </span>
            <span className="text-muted-foreground">
              {content.length} characters
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-muted-foreground">Saved</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
