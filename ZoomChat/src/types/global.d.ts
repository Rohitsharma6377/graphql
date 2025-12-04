import { Server as SocketIOServer } from 'socket.io'
import mongoose from 'mongoose'

declare global {
  var io: SocketIOServer | undefined
  var mongoose: {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
  }
}

export {}
