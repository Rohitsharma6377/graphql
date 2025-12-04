'use client'

import { useEffect, useRef, useState } from 'react'
import { Participant } from '@/lib/call/ParticipantManager'

interface ParticipantGridProps {
  participants: Participant[]
  localParticipant: Participant | null
  maxVisibleParticipants?: number
  className?: string
}

export default function ParticipantGrid({
  participants,
  localParticipant,
  maxVisibleParticipants = 49,
  className = '',
}: ParticipantGridProps) {
  const [layout, setLayout] = useState<'grid' | 'speaker' | 'sidebar'>('grid')
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null)

  const allParticipants = localParticipant ? [localParticipant, ...participants] : participants
  const visibleParticipants = allParticipants.slice(0, maxVisibleParticipants)
  const participantCount = visibleParticipants.length

  // Calculate grid layout
  const getGridColumns = () => {
    if (layout === 'speaker' || layout === 'sidebar') return 1
    if (participantCount === 1) return 1
    if (participantCount === 2) return 2
    if (participantCount <= 4) return 2
    if (participantCount <= 9) return 3
    if (participantCount <= 16) return 4
    if (participantCount <= 25) return 5
    return 6
  }

  const columns = getGridColumns()

  return (
    <div className={`participant-grid ${className}`}>
      {/* Layout controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={() => setLayout('grid')}
          className={`px-3 py-1 rounded ${layout === 'grid' ? 'bg-blue-600' : 'bg-gray-700'} text-white text-sm`}
        >
          Grid
        </button>
        <button
          onClick={() => setLayout('speaker')}
          className={`px-3 py-1 rounded ${layout === 'speaker' ? 'bg-blue-600' : 'bg-gray-700'} text-white text-sm`}
        >
          Speaker
        </button>
        <button
          onClick={() => setLayout('sidebar')}
          className={`px-3 py-1 rounded ${layout === 'sidebar' ? 'bg-blue-600' : 'bg-gray-700'} text-white text-sm`}
        >
          Sidebar
        </button>
      </div>

      {/* Participant count */}
      <div className="absolute top-4 left-4 z-10 bg-black/50 text-white px-3 py-1 rounded text-sm">
        {participantCount} {participantCount === 1 ? 'participant' : 'participants'}
      </div>

      {/* Grid layout */}
      {layout === 'grid' && (
        <div
          className="grid w-full h-full gap-2 p-4"
          style={{
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gridAutoRows: '1fr',
          }}
        >
          {visibleParticipants.map((participant) => (
            <ParticipantTile
              key={participant.id}
              participant={participant}
              isLocal={participant.id === localParticipant?.id}
            />
          ))}
        </div>
      )}

      {/* Speaker layout */}
      {layout === 'speaker' && (
        <div className="flex flex-col w-full h-full">
          {/* Main speaker */}
          <div className="flex-1 p-4">
            {activeSpeaker ? (
              <ParticipantTile
                participant={visibleParticipants.find((p) => p.id === activeSpeaker)!}
                isLocal={activeSpeaker === localParticipant?.id}
                className="w-full h-full"
              />
            ) : (
              <div className="w-full h-full bg-gray-900 rounded-lg flex items-center justify-center text-white">
                No active speaker
              </div>
            )}
          </div>

          {/* Thumbnails */}
          <div className="h-32 flex gap-2 p-2 overflow-x-auto">
            {visibleParticipants.map((participant) => (
              <div
                key={participant.id}
                onClick={() => setActiveSpeaker(participant.id)}
                className="cursor-pointer"
              >
                <ParticipantTile
                  participant={participant}
                  isLocal={participant.id === localParticipant?.id}
                  className="w-32 h-28"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sidebar layout */}
      {layout === 'sidebar' && (
        <div className="flex w-full h-full gap-4 p-4">
          {/* Main area */}
          <div className="flex-1">
            {activeSpeaker ? (
              <ParticipantTile
                participant={visibleParticipants.find((p) => p.id === activeSpeaker)!}
                isLocal={activeSpeaker === localParticipant?.id}
                className="w-full h-full"
              />
            ) : (
              <div className="w-full h-full bg-gray-900 rounded-lg flex items-center justify-center text-white">
                Select a participant
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-64 flex flex-col gap-2 overflow-y-auto">
            {visibleParticipants.map((participant) => (
              <div key={participant.id} onClick={() => setActiveSpeaker(participant.id)} className="cursor-pointer">
                <ParticipantTile
                  participant={participant}
                  isLocal={participant.id === localParticipant?.id}
                  className="w-full h-40"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Individual participant tile
function ParticipantTile({
  participant,
  isLocal,
  className = '',
}: {
  participant: Participant
  isLocal: boolean
  className?: string
}) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream

      // Auto-play with retry
      const playVideo = () => {
        videoRef.current
          ?.play()
          .then(() => console.log(`✅ Playing video for ${participant.username}`))
          .catch((err) => {
            console.warn(`⚠️ Auto-play blocked for ${participant.username}, retrying...`)
            setTimeout(playVideo, 500)
          })
      }

      playVideo()
    }
  }, [participant.stream, participant.username])

  return (
    <div className={`participant-tile relative bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      {/* Video */}
      {participant.stream && !participant.videoMuted ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover"
          style={{ transform: isLocal ? 'scaleX(-1)' : 'none' }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-blue-900">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white text-3xl font-bold">
            {participant.username[0]?.toUpperCase()}
          </div>
        </div>
      )}

      {/* Overlay info */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white text-sm font-medium truncate max-w-[150px]">
              {participant.username}
              {isLocal && ' (You)'}
            </span>
            {participant.role !== 'viewer' && (
              <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">{participant.role}</span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Audio muted indicator */}
            {participant.audioMuted && (
              <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3a3 3 0 00-3 3v4a3 3 0 006 0V6a3 3 0 00-3-3zm-5 7a5 5 0 0010 0V9a1 1 0 112 0v1a7 7 0 11-14 0V9a1 1 0 012 0v1z" />
                  <line x1="3" y1="3" x2="17" y2="17" stroke="white" strokeWidth="2" />
                </svg>
              </div>
            )}

            {/* Hand raised indicator */}
            {participant.handRaised && <span className="text-2xl animate-bounce">✋</span>}
          </div>
        </div>
      </div>

      {/* Connection quality indicator */}
      <div className="absolute top-2 right-2">
        <div className="w-2 h-2 rounded-full bg-green-500" />
      </div>
    </div>
  )
}
