'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useMutation } from '@apollo/client'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { RealVideoRoom } from '@/components/video/RealVideoRoom'
import { RealChatPanel } from '@/components/chat/RealChatPanel'
import { Whiteboard } from '@/components/whiteboard/Whiteboard'
import { CollaborativeEditor } from '@/components/editor/CollaborativeEditor'
import { JOIN_ROOM, LEAVE_ROOM } from '@/graphql/queries'

export default function MeetingPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.roomId
  const [showChat, setShowChat] = useState(true)
  const [showWhiteboard, setShowWhiteboard] = useState(false)
  const [showDocument, setShowDocument] = useState(false)
  const [roomJoined, setRoomJoined] = useState(false)

  const [joinRoom] = useMutation(JOIN_ROOM)
  const [leaveRoom] = useMutation(LEAVE_ROOM)

  // Auto-join room on mount
  useEffect(() => {
    const joinRoomAsync = async () => {
      if (roomId && !roomJoined) {
        console.log('Attempting to join room:', roomId)
        try {
          const result = await joinRoom({ 
            variables: { roomId }
          })
          console.log('Successfully joined room:', result)
          setRoomJoined(true)
        } catch (error) {
          console.error('Error joining room:', error)
          console.error('Error details:', error.graphQLErrors, error.networkError)
        }
      }
    }
    joinRoomAsync()
  }, [roomId, joinRoom, roomJoined])

  const handleLeave = async () => {
    try {
      await leaveRoom({ variables: { roomId } })
    } catch (error) {
      console.error('Error leaving room:', error)
    }
    router.push('/dashboard')
  }

  return (
    <ProtectedRoute>
      <div className="h-screen flex flex-col md:flex-row bg-background-dark overflow-hidden">
        {/* Video Room */}
        <div className={`${showChat ? 'flex-1' : 'w-full'} relative`}>
          {roomJoined ? (
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
          ) : (
            <div className="h-full flex items-center justify-center bg-background-dark">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Joining room...</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Chat Panel (Right Side on desktop, bottom sheet on mobile) */}
        {showChat && (
          <div className="w-full md:w-96 h-64 md:h-full border-t md:border-t-0 md:border-l border-white/10 bg-background">
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

