'use client'

import { useEffect, useState } from 'react'

interface DebugEvent {
  timestamp: number
  type: 'signaling' | 'webrtc' | 'media' | 'error' | 'info'
  event: string
  data: any
}

interface DebugStats {
  signalingEvents: number
  webrtcEvents: number
  errors: number
  peersConnected: number
  mediaStreams: number
}

export default function DebugPanel() {
  const [events, setEvents] = useState<DebugEvent[]>([])
  const [stats, setStats] = useState<DebugStats>({
    signalingEvents: 0,
    webrtcEvents: 0,
    errors: 0,
    peersConnected: 0,
    mediaStreams: 0,
  })
  const [filter, setFilter] = useState<string>('all')
  const [isMinimized, setIsMinimized] = useState(false)

  useEffect(() => {
    // Intercept console logs
    const originalLog = console.log
    const originalError = console.error
    const originalWarn = console.warn

    console.log = (...args: any[]) => {
      addEvent('info', 'log', args)
      originalLog(...args)
    }

    console.error = (...args: any[]) => {
      addEvent('error', 'error', args)
      originalError(...args)
    }

    console.warn = (...args: any[]) => {
      addEvent('error', 'warning', args)
      originalWarn(...args)
    }

    return () => {
      console.log = originalLog
      console.error = originalError
      console.warn = originalWarn
    }
  }, [])

  const addEvent = (type: DebugEvent['type'], event: string, data: any) => {
    const newEvent: DebugEvent = {
      timestamp: Date.now(),
      type,
      event,
      data,
    }

    setEvents((prev) => [...prev.slice(-99), newEvent])

    // Update stats
    setStats((prev) => {
      const updated = { ...prev }
      if (type === 'signaling') updated.signalingEvents++
      if (type === 'webrtc') updated.webrtcEvents++
      if (type === 'error') updated.errors++
      return updated
    })
  }

  const clearEvents = () => {
    setEvents([])
    setStats({
      signalingEvents: 0,
      webrtcEvents: 0,
      errors: 0,
      peersConnected: 0,
      mediaStreams: 0,
    })
  }

  const exportLogs = () => {
    const blob = new Blob([JSON.stringify(events, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `debug-logs-${Date.now()}.json`
    a.click()
  }

  const filteredEvents = events.filter((e) => filter === 'all' || e.type === filter)

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg"
      >
        🐛 Debug ({events.length})
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[600px] h-[500px] bg-gray-900 border-2 border-gray-700 rounded-lg shadow-2xl flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-3 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-white font-semibold">🐛 Debug Panel</span>
          <div className="flex gap-2 text-xs">
            <span className="bg-blue-600 text-white px-2 py-1 rounded">{stats.signalingEvents} Signaling</span>
            <span className="bg-green-600 text-white px-2 py-1 rounded">{stats.webrtcEvents} WebRTC</span>
            <span className="bg-red-600 text-white px-2 py-1 rounded">{stats.errors} Errors</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportLogs} className="text-gray-400 hover:text-white text-sm">
            Export
          </button>
          <button onClick={clearEvents} className="text-gray-400 hover:text-white text-sm">
            Clear
          </button>
          <button onClick={() => setIsMinimized(true)} className="text-gray-400 hover:text-white">
            −
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 px-4 py-2 border-b border-gray-700">
        {['all', 'signaling', 'webrtc', 'media', 'error', 'info'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded text-xs capitalize ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Events list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs">
        {filteredEvents.map((event, idx) => (
          <div key={idx} className={`p-2 rounded ${getEventColor(event.type)}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold">{event.event}</span>
              <span className="text-gray-400">{new Date(event.timestamp).toLocaleTimeString()}</span>
            </div>
            <pre className="text-gray-300 overflow-x-auto">{JSON.stringify(event.data, null, 2)}</pre>
          </div>
        ))}

        {filteredEvents.length === 0 && (
          <div className="text-center text-gray-500 py-8">No events yet</div>
        )}
      </div>
    </div>
  )
}

function getEventColor(type: DebugEvent['type']): string {
  switch (type) {
    case 'signaling':
      return 'bg-blue-900/30 border border-blue-700'
    case 'webrtc':
      return 'bg-green-900/30 border border-green-700'
    case 'media':
      return 'bg-purple-900/30 border border-purple-700'
    case 'error':
      return 'bg-red-900/30 border border-red-700'
    default:
      return 'bg-gray-800 border border-gray-700'
  }
}

// Separate debug page
export function DebugPage() {
  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">🐛 Debug Dashboard</h1>

        {/* System info */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-white font-semibold mb-4">Connection Status</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Ably:</span>
                <span className="text-green-400">Connected</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">WebRTC:</span>
                <span className="text-green-400">Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Peers:</span>
                <span className="text-white">2</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-white font-semibold mb-4">Media Streams</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Local Video:</span>
                <span className="text-green-400">Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Local Audio:</span>
                <span className="text-green-400">Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Remote Streams:</span>
                <span className="text-white">1</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-white font-semibold mb-4">Performance</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Packet Loss:</span>
                <span className="text-green-400">0.1%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Latency:</span>
                <span className="text-yellow-400">45ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Bitrate:</span>
                <span className="text-white">2.5 Mbps</span>
              </div>
            </div>
          </div>
        </div>

        {/* Debug panel */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <DebugPanel />
        </div>
      </div>
    </div>
  )
}
