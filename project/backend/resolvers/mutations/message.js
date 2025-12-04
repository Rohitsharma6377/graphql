import { prisma, pubsub } from '../../config/database.js'
import { EVENTS } from '../../config/constants.js'

/**
 * Send a message to a room
 */
export const sendMessage = async (_, { input }, { user }) => {
  if (!user) throw new Error('Not authenticated')
  
  const { roomId, content, type = 'text', metadata } = input
  
  // Find or create the room
  let room = await prisma.room.findUnique({ 
    where: { id: roomId } 
  })
  
  if (!room) {
    // Auto-create room if it doesn't exist
    room = await prisma.room.create({
      data: {
        name: `Meeting ${roomId.substring(0, 8)}`,
        description: 'Quick meeting room',
        createdById: user.id,
        isActive: true,
      },
    })
  }
  
  // Verify user is a participant
  const participant = await prisma.participant.findFirst({
    where: {
      roomId,
      userId: user.id,
      isActive: true,
    },
  })
  
  if (!participant) {
    // Auto-join user to room
    await prisma.participant.create({
      data: {
        roomId,
        userId: user.id,
        isActive: true,
      },
    })
  }
  
  const message = await prisma.message.create({
    data: {
      content,
      type,
      metadata,
      roomId,
      senderId: user.id,
    },
    include: {
      sender: true,
      reactions: { include: { user: true } },
    },
  })
  
  // Publish message to subscribers
  pubsub.publish(`${EVENTS.MESSAGE_SENT}_${roomId}`, {
    messageSent: message,
  })
  
  return message
}

/**
 * Add emoji reaction to message
 */
export const addReaction = async (_, { messageId, emoji }, { user }) => {
  if (!user) throw new Error('Not authenticated')
  
  await prisma.reaction.create({
    data: {
      messageId,
      emoji,
      userId: user.id,
    },
  })
  
  return await prisma.message.findUnique({
    where: { id: messageId },
    include: {
      sender: true,
      reactions: { include: { user: true } },
    },
  })
}

/**
 * Remove emoji reaction from message
 */
export const removeReaction = async (_, { messageId, emoji }, { user }) => {
  if (!user) throw new Error('Not authenticated')
  
  await prisma.reaction.deleteMany({
    where: {
      messageId,
      emoji,
      userId: user.id,
    },
  })
  
  return await prisma.message.findUnique({
    where: { id: messageId },
    include: {
      sender: true,
      reactions: { include: { user: true } },
    },
  })
}

export const messageMutations = {
  sendMessage,
  addReaction,
  removeReaction,
}
