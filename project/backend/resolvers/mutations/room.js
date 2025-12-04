import { prisma, pubsub } from '../../config/database.js'
import { EVENTS } from '../../config/constants.js'

/**
 * Create a new room
 */
export const createRoom = async (_, { name, description }, { user }) => {
  if (!user) throw new Error('Not authenticated')
  
  return await prisma.room.create({
    data: {
      name,
      description,
      createdById: user.id,
      isActive: true,
    },
    include: { createdBy: true },
  })
}

/**
 * Update room details
 */
export const updateRoom = async (_, { id, name, description }, { user }) => {
  if (!user) throw new Error('Not authenticated')
  
  const room = await prisma.room.findUnique({ where: { id } })
  if (!room) throw new Error('Room not found')
  
  if (room.createdById !== user.id) {
    throw new Error('Not authorized to update this room')
  }
  
  return await prisma.room.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description }),
    },
    include: { createdBy: true },
  })
}

/**
 * Delete a room
 */
export const deleteRoom = async (_, { id }, { user }) => {
  if (!user) throw new Error('Not authenticated')
  
  const room = await prisma.room.findUnique({ where: { id } })
  if (!room) throw new Error('Room not found')
  
  if (room.createdById !== user.id) {
    throw new Error('Not authorized to delete this room')
  }
  
  await prisma.room.delete({ where: { id } })
  return true
}

/**
 * Join a room
 */
export const joinRoom = async (_, { roomId }, { user }) => {
  if (!user) throw new Error('Not authenticated')
  
  // Find or create the room
  let room = await prisma.room.findUnique({ where: { id: roomId } })
  
  if (!room) {
    // Create the room if it doesn't exist
    room = await prisma.room.create({
      data: {
        name: `Meeting ${roomId.substring(0, 8)}`,
        description: 'Quick meeting room',
        createdById: user.id,
        isActive: true,
      },
    })
  }
  
  // Check if already a participant
  const existingParticipant = await prisma.participant.findFirst({
    where: {
      roomId: room.id,
      userId: user.id,
      leftAt: null,
    },
  })
  
  if (!existingParticipant) {
    await prisma.participant.create({
      data: {
        roomId: room.id,
        userId: user.id,
        isActive: true,
      },
    })
    
    // Publish user joined event
    const userObj = await prisma.user.findUnique({ where: { id: user.id } })
    pubsub.publish(`${EVENTS.USER_JOINED}_${room.id}`, {
      userJoined: {
        userId: user.id,
        user: userObj,
      },
    })
  }
  
  return await prisma.room.findUnique({
    where: { id: room.id },
    include: {
      createdBy: true,
      participants: {
        where: { isActive: true },
        include: { user: true },
      },
    },
  })
}

/**
 * Leave a room
 */
export const leaveRoom = async (_, { roomId }, { user }) => {
  if (!user) throw new Error('Not authenticated')
  
  await prisma.participant.updateMany({
    where: {
      roomId,
      userId: user.id,
      isActive: true,
    },
    data: {
      leftAt: new Date(),
      isActive: false,
    },
  })
  
  // Publish user left event
  const userObj = await prisma.user.findUnique({ where: { id: user.id } })
  pubsub.publish(`${EVENTS.USER_LEFT}_${roomId}`, {
    userLeft: {
      userId: user.id,
      user: userObj,
    },
  })
  
  return true
}

export const roomMutations = {
  createRoom,
  updateRoom,
  deleteRoom,
  joinRoom,
  leaveRoom,
}
