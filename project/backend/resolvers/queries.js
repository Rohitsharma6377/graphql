import { prisma } from '../config/database.js'

/**
 * Get current authenticated user
 */
export const currentUser = async (_, __, { user }) => {
  if (!user) return null
  return await prisma.user.findUnique({ where: { id: user.id } })
}

/**
 * Get user by ID
 */
export const getUserById = async (_, { id }) => {
  return await prisma.user.findUnique({ where: { id } })
}

/**
 * Get all users
 */
export const getAllUsers = async () => {
  return await prisma.user.findMany()
}

/**
 * Get room by ID with all relations
 */
export const getRoomById = async (_, { id }) => {
  return await prisma.room.findUnique({
    where: { id },
    include: {
      createdBy: true,
      participants: {
        include: { user: true },
      },
      messages: {
        include: {
          sender: true,
          reactions: { include: { user: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
      document: true,
    },
  })
}

/**
 * Get all rooms
 */
export const getAllRooms = async () => {
  return await prisma.room.findMany({
    include: {
      createdBy: true,
      participants: {
        where: { isActive: true },
        include: { user: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Get messages for a room with pagination
 */
export const getMessages = async (_, { roomId, limit = 50, offset = 0 }) => {
  return await prisma.message.findMany({
    where: { roomId },
    include: {
      sender: true,
      reactions: { include: { user: true } },
    },
    orderBy: { createdAt: 'asc' },
    take: limit,
    skip: offset,
  })
}

/**
 * Get document for a room
 */
export const getDocument = async (_, { roomId }) => {
  return await prisma.document.findUnique({
    where: { roomId },
    include: {
      room: true,
      edits: {
        include: { user: true },
        orderBy: { timestamp: 'desc' },
        take: 10,
      },
    },
  })
}

/**
 * Get all documents
 */
export const getAllDocuments = async () => {
  return await prisma.document.findMany({
    include: {
      room: true,
      author: true,
      edits: {
        include: { user: true },
        orderBy: { timestamp: 'desc' },
        take: 1,
      },
    },
    orderBy: { updatedAt: 'desc' },
  })
}

/**
 * Get recordings for a room
 */
export const getRecordings = async (_, { roomId }) => {
  return await prisma.recording.findMany({
    where: { roomId },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Get transcript for a room
 */
export const getTranscript = async (_, { roomId }) => {
  return await prisma.transcript.findFirst({
    where: { roomId },
    orderBy: { timestamp: 'desc' },
  })
}

export const queries = {
  currentUser,
  user: getUserById,
  users: getAllUsers,
  room: getRoomById,
  rooms: getAllRooms,
  messages: getMessages,
  document: getDocument,
  documents: getAllDocuments,
  recordings: getRecordings,
  transcript: getTranscript,
}
