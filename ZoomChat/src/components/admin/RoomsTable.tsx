'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

interface Room {
  _id: string
  roomId: string
  host: {
    name: string
    email: string
  }
  participants: any[]
  active: boolean
  createdAt: string
}

interface RoomsTableProps {
  rooms: Room[]
  onCloseRoom: (roomId: string) => Promise<void>
}

export default function RoomsTable({ rooms, onCloseRoom }: RoomsTableProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString()
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-heartshare">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                Room ID
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                Host
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                Participants
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                Created
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                Status
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rooms.map((room) => (
              <motion.tr
                key={room._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
              >
                <td className="px-6 py-4">
                  <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                    {room.roomId}
                  </code>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{room.host.name}</p>
                    <p className="text-xs text-gray-500">{room.host.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                    👥 {room.participants.length}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {formatDate(room.createdAt)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      room.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {room.active ? '🟢 Active' : '⚫ Closed'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Link href={`/admin/room/${room.roomId}`}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors"
                      >
                        View
                      </motion.button>
                    </Link>
                    {room.active && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onCloseRoom(room.roomId)}
                        className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
                      >
                        Close
                      </motion.button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
