import { prisma, pubsub } from '../../config/database.js'
import { EVENTS } from '../../config/constants.js'

/**
 * Update participant video state (mute, video off, screen share, speaking)
 */
export const updateVideoState = async (_, { roomId, isMuted, isVideoOff, isScreenSharing, isSpeaking }, { user }) => {
  if (!user) throw new Error('Not authenticated')
  
  // Verify room exists
  const room = await prisma.room.findUnique({ where: { id: roomId } })
  
  if (!room) {
    throw new Error('Room not found')
  }
  
  // Ensure user is a participant
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
  
  const videoState = await prisma.videoState.upsert({
    where: {
      userId_roomId: {
        userId: user.id,
        roomId,
      },
    },
    create: {
      userId: user.id,
      roomId,
      isMuted: isMuted ?? false,  
      isVideoOff: isVideoOff ?? false,
      isScreenSharing: isScreenSharing ?? false,
      isSpeaking: isSpeaking ?? false,
    },
    update: {
      ...(isMuted !== undefined && { isMuted }),
      ...(isVideoOff !== undefined && { isVideoOff }),
      ...(isScreenSharing !== undefined && { isScreenSharing }),
      ...(isSpeaking !== undefined && { isSpeaking }),
    },
  })
  
  // Publish video state change
  pubsub.publish(`${EVENTS.VIDEO_STATE_CHANGED}_${roomId}`, {
    videoStateChanged: {
      userId: videoState.userId,
      roomId: videoState.roomId,
      isMuted: videoState.isMuted,
      isVideoOff: videoState.isVideoOff,
      isScreenSharing: videoState.isScreenSharing,
      isSpeaking: videoState.isSpeaking,
      updatedAt: videoState.updatedAt.toISOString(),
    },
  })
  
  return {
    userId: videoState.userId,
    roomId: videoState.roomId,
    isMuted: videoState.isMuted,
    isVideoOff: videoState.isVideoOff,
    isScreenSharing: videoState.isScreenSharing,
    isSpeaking: videoState.isSpeaking,
    updatedAt: videoState.updatedAt.toISOString(),
  }
}

/**
 * Set typing indicator
 */
export const setTyping = async (_, { roomId, isTyping }, { user }) => {
  if (!user) throw new Error('Not authenticated')
  
  const userObj = await prisma.user.findUnique({ where: { id: user.id } })
  
  pubsub.publish(`${EVENTS.TYPING_INDICATOR}_${roomId}`, {
    typingIndicator: {
      userId: user.id,
      userName: userObj.name,
      isTyping,
    },
  })
  
  return true
}

export const realtimeMutations = {
  updateVideoState,
  setTyping,
}
