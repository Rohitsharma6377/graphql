'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { RealVideoRoom } from '@/components/video/RealVideoRoom'
import { RealChatPanel } from '@/components/chat/RealChatPanel'
import { Whiteboard } from '@/components/whiteboard/Whiteboard'
import { CollaborativeEditor } from '@/components/editor/CollaborativeEditor'

export default function MeetingPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.roomId
  const [showChat, setShowChat] = useState(false)
  const [showWhiteboard, setShowWhiteboard] = useState(false)
  const [showDocument, setShowDocument] = useState(false)

  const handleLeave = () => {
    router.push('/dashboard')
  }

  return (
    <ProtectedRoute>
      <div className="h-screen flex bg-background-dark">
        {/* Video Room */}
        <div className={`${showChat ? 'flex-1' : 'w-full'} relative`}>
          <RealVideoRoom 
            roomId={roomId}
            onLeave={handleLeave}
            showChat={showChat}
            showWhiteboard={showWhiteboard}
            showDocument={showDocument}
            onToggleChat={() => setShowChat(!showChat)}
            onToggleWhiteboard={() => setShowWhiteboard(!showWhiteboard)}
            onToggleDocument={() => setShowDocument(!showDocument)}
          />
        </div>
        
        {/* Chat Panel (Right Side) */}
        {showChat && (
          <div className="w-96 border-l border-white/10 bg-background">
            <RealChatPanel roomId={roomId} />
          </div>
        )}
        
        {/* Whiteboard Overlay */}
        {showWhiteboard && (
          <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur-sm">
            <Whiteboard roomId={roomId} onClose={() => setShowWhiteboard(false)} />
          </div>
        )}
        
        {/* Document Editor Overlay */}
        {showDocument && (
          <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur-sm">
            <CollaborativeEditor roomId={roomId} onClose={() => setShowDocument(false)} />
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}

