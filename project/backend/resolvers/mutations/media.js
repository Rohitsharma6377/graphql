import { prisma, pubsub } from '../../config/database.js'
import { EVENTS } from '../../config/constants.js'

/**
 * Add a whiteboard stroke
 */
export const addWhiteboardStroke = async (_, { roomId, points, color, width, tool = 'pen' }, { user }) => {
  if (!user) throw new Error('Not authenticated')
  
  const stroke = await prisma.whiteboardStroke.create({
    data: {
      roomId,
      points,
      color,
      width,
      tool,
    },
  })
  
  pubsub.publish(`${EVENTS.WHITEBOARD_UPDATE}_${roomId}`, {
    whiteboardUpdate: {
      roomId,
      stroke: {
        id: stroke.id,
        points: stroke.points,
        color: stroke.color,
        width: stroke.width,
      },
      action: 'add',
    },
  })
  
  return stroke
}

/**
 * Clear all whiteboard strokes
 */
export const clearWhiteboard = async (_, { roomId }, { user }) => {
  if (!user) throw new Error('Not authenticated')
  
  await prisma.whiteboardStroke.deleteMany({
    where: { roomId },
  })
  
  pubsub.publish(`${EVENTS.WHITEBOARD_UPDATE}_${roomId}`, {
    whiteboardUpdate: {
      roomId,
      stroke: null,
      action: 'clear',
    },
  })
  
  return true
}

/**
 * Create a recording
 */
export const createRecording = async (_, { roomId, url, duration, size }, { user }) => {
  if (!user) throw new Error('Not authenticated')
  
  const recording = await prisma.recording.create({
    data: {
      roomId,
      url,
      duration,
      size,
    },
    include: {
      room: true,
    },
  })
  
  return recording
}

/**
 * Delete a recording
 */
export const deleteRecording = async (_, { id }, { user }) => {
  if (!user) throw new Error('Not authenticated')
  
  const recording = await prisma.recording.findUnique({
    where: { id },
    include: { room: true },
  })
  
  if (!recording) throw new Error('Recording not found')
  
  if (recording.room.createdById !== user.id) {
    throw new Error('Not authorized to delete this recording')
  }
  
  await prisma.recording.delete({ where: { id } })
  return true
}

/**
 * Generate or update transcript
 */
export const generateTranscript = async (_, { roomId, content }, { user }) => {
  if (!user) throw new Error('Not authenticated')
  
  const transcript = await prisma.transcript.upsert({
    where: { roomId },
    create: {
      roomId,
      content,
    },
    update: {
      content,
    },
    include: {
      room: true,
    },
  })
  
  return transcript
}

export const mediaMutations = {
  addWhiteboardStroke,
  clearWhiteboard,
  createRecording,
  deleteRecording,
  generateTranscript,
}
