import { prisma } from '../config/database.js'

/**
 * Room field resolvers
 */
export const Room = {
  inviteLink: (parent) => {
    // Generate invite link based on room ID
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    return `${baseUrl}/meeting/${parent.id}`
  },
}

/**
 * Participant field resolver for videoState
 */
export const Participant = {
  videoState: async (parent) => {
    return await prisma.videoState.findUnique({
      where: {
        userId_roomId: {
          userId: parent.userId,
          roomId: parent.roomId,
        },
      },
    })
  },
}

/**
 * Document field resolvers
 */
export const Document = {
  author: async (parent) => {
    if (!parent.authorId) {
      // If no author, get room creator
      const room = await prisma.room.findUnique({
        where: { id: parent.roomId },
        include: { createdBy: true },
      })
      return room?.createdBy || null
    }
    return await prisma.user.findUnique({
      where: { id: parent.authorId },
    })
  },
  
  edits: async (parent) => {
    return await prisma.documentEdit.findMany({
      where: { documentId: parent.id },
      include: { user: true },
      orderBy: { timestamp: 'desc' },
      take: 10,
    })
  },
}

export const fieldResolvers = {
  Room,
  Participant,
  Document,
}
