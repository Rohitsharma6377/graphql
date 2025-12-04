import { prisma, pubsub } from '../../config/database.js'
import { EVENTS } from '../../config/constants.js'

/**
 * Create a new document
 */
export const createDocument = async (_, { input }, { user }) => {
  if (!user) throw new Error('Not authenticated')
  
  const { name, content, roomId } = input
  
  // If roomId provided, create document for that room
  if (roomId) {
    const document = await prisma.document.create({
      data: {
        name,
        content,
        roomId,
        authorId: user.id,
      },
      include: {
        author: true,
        room: true,
      },
    })
    return document
  }
  
  // Otherwise create a standalone document with temporary room
  const room = await prisma.room.create({
    data: {
      name: `Document: ${name}`,
      createdById: user.id,
      isActive: false,
    },
  })
  
  const document = await prisma.document.create({
    data: {
      name,
      content,
      roomId: room.id,
      authorId: user.id,
    },
    include: {
      author: true,
      room: true,
    },
  })
  
  return document
}

/**
 * Update document content
 */
export const updateDocument = async (_, { roomId, content }, { user }) => {
  if (!user) throw new Error('Not authenticated')
  
  const document = await prisma.document.findUnique({
    where: { roomId },
  })
  
  if (!document) {
    throw new Error('Document not found')
  }
  
  // Update document
  const updatedDocument = await prisma.document.update({
    where: { roomId },
    data: { content },
  })
  
  // Track edit history
  await prisma.documentEdit.create({
    data: {
      content,
      userId: user.id,
      documentId: document.id,
    },
  })
  
  // Publish update
  pubsub.publish(`${EVENTS.DOCUMENT_UPDATE}_${roomId}`, {
    documentUpdate: {
      roomId,
      content,
      userId: user.id,
      timestamp: new Date().toISOString(),
    },
  })
  
  return updatedDocument
}

/**
 * Delete a document
 */
export const deleteDocument = async (_, { id }, { user }) => {
  if (!user) throw new Error('Not authenticated')
  
  const document = await prisma.document.findUnique({
    where: { id },
    include: { room: true },
  })
  
  if (!document) throw new Error('Document not found')
  
  // Check if user is the room creator
  if (document.room.createdById !== user.id) {
    throw new Error('Not authorized to delete this document')
  }
  
  await prisma.document.delete({ where: { id } })
  return true
}

export const documentMutations = {
  createDocument,
  updateDocument,
  deleteDocument,
}
