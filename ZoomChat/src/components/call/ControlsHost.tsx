'use client'

import { useState } from 'react'
import { Participant } from '@/lib/call/ParticipantManager'

interface ControlsHostProps {
  participants: Participant[]
  onPromote: (userId: string) => void
  onDemote: (userId: string) => void
  onMute: (userId: string) => void
  onKick: (userId: string) => void
  onEndCall: () => void
}

export default function ControlsHost({
  participants,
  onPromote,
  onDemote,
  onMute,
  onKick,
  onEndCall,
}: ControlsHostProps) {
  const [showParticipants, setShowParticipants] = useState(false)

  const speakers = participants.filter((p) => p.role === 'speaker')
  const viewers = participants.filter((p) => p.role === 'viewer')
  const handRaised = participants.filter((p) => p.handRaised)

  return (
    <div className="host-controls">
      {/* Host control panel */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
        <h3 className="text-white font-semibold mb-4">Host Controls</h3>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-800 rounded p-3 text-center">
            <div className="text-2xl font-bold text-white">{participants.length}</div>
            <div className="text-xs text-gray-400">Total</div>
          </div>
          <div className="bg-gray-800 rounded p-3 text-center">
            <div className="text-2xl font-bold text-blue-500">{speakers.length}</div>
            <div className="text-xs text-gray-400">Speakers</div>
          </div>
          <div className="bg-gray-800 rounded p-3 text-center">
            <div className="text-2xl font-bold text-yellow-500">{handRaised.length}</div>
            <div className="text-xs text-gray-400">Hands Raised</div>
          </div>
        </div>

        {/* Participants list toggle */}
        <button
          onClick={() => setShowParticipants(!showParticipants)}
          className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 rounded mb-2 transition"
        >
          {showParticipants ? 'Hide' : 'Show'} Participants
        </button>

        {/* End call button */}
        <button
          onClick={onEndCall}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded font-semibold transition"
        >
          End Call for Everyone
        </button>
      </div>

      {/* Participants list */}
      {showParticipants && (
        <div className="mt-4 bg-gray-900 border border-gray-700 rounded-lg max-h-96 overflow-y-auto">
          {/* Hands raised section */}
          {handRaised.length > 0 && (
            <div className="border-b border-gray-700">
              <div className="bg-yellow-900/30 px-4 py-2 text-yellow-500 font-semibold text-sm">
                ✋ Hands Raised ({handRaised.length})
              </div>
              {handRaised.map((participant) => (
                <ParticipantItem
                  key={participant.id}
                  participant={participant}
                  onPromote={onPromote}
                  onDemote={onDemote}
                  onMute={onMute}
                  onKick={onKick}
                />
              ))}
            </div>
          )}

          {/* Speakers section */}
          {speakers.length > 0 && (
            <div className="border-b border-gray-700">
              <div className="bg-blue-900/30 px-4 py-2 text-blue-400 font-semibold text-sm">
                🎤 Speakers ({speakers.length})
              </div>
              {speakers.map((participant) => (
                <ParticipantItem
                  key={participant.id}
                  participant={participant}
                  onPromote={onPromote}
                  onDemote={onDemote}
                  onMute={onMute}
                  onKick={onKick}
                />
              ))}
            </div>
          )}

          {/* Viewers section */}
          {viewers.length > 0 && (
            <div>
              <div className="bg-gray-800 px-4 py-2 text-gray-400 font-semibold text-sm">
                👁️ Viewers ({viewers.length})
              </div>
              {viewers.map((participant) => (
                <ParticipantItem
                  key={participant.id}
                  participant={participant}
                  onPromote={onPromote}
                  onDemote={onDemote}
                  onMute={onMute}
                  onKick={onKick}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Individual participant item
function ParticipantItem({
  participant,
  onPromote,
  onDemote,
  onMute,
  onKick,
}: {
  participant: Participant
  onPromote: (userId: string) => void
  onDemote: (userId: string) => void
  onMute: (userId: string) => void
  onKick: (userId: string) => void
}) {
  const [showActions, setShowActions] = useState(false)

  return (
    <div
      className="px-4 py-3 hover:bg-gray-800 transition cursor-pointer"
      onClick={() => setShowActions(!showActions)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-semibold">
            {participant.username[0]?.toUpperCase()}
          </div>

          {/* Info */}
          <div>
            <div className="text-white font-medium">{participant.username}</div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="capitalize">{participant.role}</span>
              {participant.audioMuted && <span className="text-red-400">🔇</span>}
              {participant.handRaised && <span>✋</span>}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-1">
          {participant.role === 'viewer' && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onPromote(participant.id)
              }}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition"
              title="Promote to Speaker"
            >
              Promote
            </button>
          )}
          {participant.role === 'speaker' && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDemote(participant.id)
              }}
              className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded transition"
              title="Demote to Viewer"
            >
              Demote
            </button>
          )}
        </div>
      </div>

      {/* Extended actions */}
      {showActions && (
        <div className="mt-3 pt-3 border-t border-gray-700 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onMute(participant.id)
            }}
            className="flex-1 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded transition"
          >
            🔇 Mute
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onKick(participant.id)
            }}
            className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition"
          >
            🚫 Kick
          </button>
        </div>
      )}
    </div>
  )
}
