import { PrismaClient } from '@prisma/client'
import { PubSub } from 'graphql-subscriptions'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const pubsub = new PubSub()

// Event names
const MESSAGE_SENT = 'MESSAGE_SENT'
const USER_JOINED = 'USER_JOINED'
const USER_LEFT = 'USER_LEFT'
const TYPING_INDICATOR = 'TYPING_INDICATOR'
const WHITEBOARD_UPDATE = 'WHITEBOARD_UPDATE'
const DOCUMENT_UPDATE = 'DOCUMENT_UPDATE'
const ACTIVE_SPEAKER = 'ACTIVE_SPEAKER'

export const resolvers = {
  Query: {
    currentUser: async (_, __, { user }) => {
      if (!user) return null
      return await prisma.user.findUnique({ where: { id: user.id } })
    },

    user: async (_, { id }) => {
      return await prisma.user.findUnique({ where: { id } })
    },

    users: async () => {
      return await prisma.user.findMany()
    },

    room: async (_, { id }) => {
      return await prisma.room.findUnique({
        where: { id },
        include: {
          createdBy: true,
          participants: {
            include: { user: true }
          },
          messages: {
            include: {
              sender: true,
              reactions: { include: { user: true } }
            },
            orderBy: { createdAt: 'asc' }
          },
          document: true
        }
      })
    },

    rooms: async () => {
      return await prisma.room.findMany({
        where: { isActive: true },
        include: {
          createdBy: true,
          participants: {
            where: { isActive: true },
            include: { user: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    },

    messages: async (_, { roomId, limit = 50, offset = 0 }) => {
      return await prisma.message.findMany({
        where: { roomId },
        include: {
          sender: true,
          reactions: { include: { user: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      })
    },

    document: async (_, { roomId }) => {
      return await prisma.document.findUnique({
        where: { roomId },
        include: {
          room: true,
          edits: {
            include: { user: true },
            orderBy: { timestamp: 'desc' },
            take: 10
          }
        }
      })
    },

    documents: async () => {
      return await prisma.document.findMany({
        include: {
          room: true,
          edits: {
            include: { user: true },
            orderBy: { timestamp: 'desc' },
            take: 1
          }
        },
        orderBy: { updatedAt: 'desc' }
      })
    },

    recordings: async (_, { roomId }) => {
      return await prisma.recording.findMany({
        where: { roomId },
        orderBy: { createdAt: 'desc' }
      })
    },

    transcript: async (_, { roomId }) => {
      return await prisma.transcript.findFirst({
        where: { roomId },
        orderBy: { timestamp: 'desc' }
      })
    },
  },

  Mutation: {
    signup: async (_, { email, name, password }) => {
      const hashedPassword = await bcrypt.hash(password, 10)
      const user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          status: 'online'
        }
      })
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET)
      return { token, user }
    },

    login: async (_, { email, password }) => {
      const user = await prisma.user.findUnique({ where: { email } })
      if (!user) throw new Error('User not found')
      
      const valid = await bcrypt.compare(password, user.password)
      if (!valid) throw new Error('Invalid password')
      
      await prisma.user.update({
        where: { id: user.id },
        data: { status: 'online' }
      })
      
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET)
      return { token, user }
    },

    updateUserStatus: async (_, { status }, { user }) => {
      if (!user) throw new Error('Not authenticated')
      return await prisma.user.update({
        where: { id: user.id },
        data: { status }
      })
    },

    requestPasswordReset: async (_, { email }) => {
      const user = await prisma.user.findUnique({ where: { email } })
      if (!user) {
        // Return success even if user doesn't exist (security best practice)
        return { success: true, message: 'If an account exists, a reset link has been sent.' }
      }

      // In production, you would send an email with a reset token
      // For now, we'll create a token that expires in 1 hour
      const resetToken = jwt.sign({ id: user.id, type: 'reset' }, process.env.JWT_SECRET, { expiresIn: '1h' })
      
      console.log(`Password reset token for ${email}: ${resetToken}`)
      // TODO: Send email with resetToken
      
      return { success: true, message: 'If an account exists, a reset link has been sent.' }
    },

    resetPassword: async (_, { token, newPassword }) => {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if (decoded.type !== 'reset') throw new Error('Invalid token')
        
        const hashedPassword = await bcrypt.hash(newPassword, 10)
        const user = await prisma.user.update({
          where: { id: decoded.id },
          data: { password: hashedPassword }
        })
        
        const authToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET)
        return { token: authToken, user }
      } catch (error) {
        throw new Error('Invalid or expired reset token')
      }
    },

    createRoom: async (_, { name, description }, { user }) => {
      if (!user) throw new Error('Not authenticated')
      
      const room = await prisma.room.create({
        data: {
          name,
          description,
          createdById: user.id
        },
        include: { createdBy: true }
      })

      // Create empty document for the room
      await prisma.document.create({
        data: { roomId: room.id }
      })

      return room
    },

    updateRoom: async (_, { id, name, description }, { user }) => {
      if (!user) throw new Error('Not authenticated')
      
      return await prisma.room.update({
        where: { id },
        data: { name, description },
        include: { createdBy: true }
      })
    },

    deleteRoom: async (_, { id }, { user }) => {
      if (!user) throw new Error('Not authenticated')
      
      await prisma.room.update({
        where: { id },
        data: { isActive: false }
      })
      return true
    },

    joinRoom: async (_, { roomId }, { user }) => {
      if (!user) throw new Error('Not authenticated')

      await prisma.participant.upsert({
        where: {
          userId_roomId: {
            userId: user.id,
            roomId
          }
        },
        update: {
          isActive: true,
          leftAt: null
        },
        create: {
          userId: user.id,
          roomId,
          isActive: true
        }
      })

      const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: {
          createdBy: true,
          participants: {
            where: { isActive: true },
            include: { user: true }
          }
        }
      })

      const userObj = await prisma.user.findUnique({ where: { id: user.id } })
      pubsub.publish(`${USER_JOINED}_${roomId}`, { userJoined: userObj })

      return room
    },

    leaveRoom: async (_, { roomId }, { user }) => {
      if (!user) throw new Error('Not authenticated')

      await prisma.participant.update({
        where: {
          userId_roomId: {
            userId: user.id,
            roomId
          }
        },
        data: {
          isActive: false,
          leftAt: new Date()
        }
      })

      const userObj = await prisma.user.findUnique({ where: { id: user.id } })
      pubsub.publish(`${USER_LEFT}_${roomId}`, { userLeft: userObj })

      return true
    },

    sendMessage: async (_, { input }, { user }) => {
      if (!user) throw new Error('Not authenticated')

      const { roomId, content, type = 'text', metadata } = input

      const message = await prisma.message.create({
        data: {
          content,
          type,
          metadata,
          roomId,
          senderId: user.id
        },
        include: {
          sender: true,
          reactions: { include: { user: true } }
        }
      })

      pubsub.publish(`${MESSAGE_SENT}_${roomId}`, { messageSent: message })

      return message
    },

    addReaction: async (_, { messageId, emoji }, { user }) => {
      if (!user) throw new Error('Not authenticated')

      await prisma.reaction.upsert({
        where: {
          userId_messageId_emoji: {
            userId: user.id,
            messageId,
            emoji
          }
        },
        update: {},
        create: {
          userId: user.id,
          messageId,
          emoji
        }
      })

      return await prisma.message.findUnique({
        where: { id: messageId },
        include: {
          sender: true,
          reactions: { include: { user: true } }
        }
      })
    },

    removeReaction: async (_, { messageId, emoji }, { user }) => {
      if (!user) throw new Error('Not authenticated')

      await prisma.reaction.delete({
        where: {
          userId_messageId_emoji: {
            userId: user.id,
            messageId,
            emoji
          }
        }
      })

      return await prisma.message.findUnique({
        where: { id: messageId },
        include: {
          sender: true,
          reactions: { include: { user: true } }
        }
      })
    },

    createDocument: async (_, { input }, { user }) => {
      if (!user) throw new Error('Not authenticated')

      const { name, content, roomId } = input

      // If roomId provided, create as room document
      if (roomId) {
        const document = await prisma.document.create({
          data: {
            content: name, // Store name in content for standalone docs
            roomId
          },
          include: {
            room: true,
            edits: { include: { user: true } }
          }
        })

        return document
      }

      // Create standalone document (create a temporary room for it)
      const room = await prisma.room.create({
        data: {
          name: name,
          description: 'Document workspace',
          createdById: user.id
        }
      })

      const document = await prisma.document.create({
        data: {
          content: content,
          roomId: room.id
        },
        include: {
          room: true,
          edits: { include: { user: true } }
        }
      })

      return document
    },

    updateDocument: async (_, { roomId, content }, { user }) => {
      if (!user) throw new Error('Not authenticated')

      const document = await prisma.document.update({
        where: { roomId },
        data: { content }
      })

      // Track edit history
      await prisma.documentEdit.create({
        data: {
          content,
          userId: user.id,
          documentId: document.id
        }
      })

      pubsub.publish(`${DOCUMENT_UPDATE}_${roomId}`, { 
        documentUpdate: {
          roomId,
          content,
          userId: user.id,
          timestamp: new Date().toISOString()
        }
      })

      return document
    },

    deleteDocument: async (_, { id }, { user }) => {
      if (!user) throw new Error('Not authenticated')

      const document = await prisma.document.findUnique({
        where: { id },
        include: { room: true }
      })

      if (!document) throw new Error('Document not found')

      // Check if user is the room creator
      if (document.room.createdById !== user.id) {
        throw new Error('Not authorized to delete this document')
      }

      await prisma.document.delete({ where: { id } })

      return true
    },

    addWhiteboardStroke: async (_, { roomId, points, color, width, tool = 'pen' }, { user }) => {
      if (!user) throw new Error('Not authenticated')

      const stroke = await prisma.whiteboardStroke.create({
        data: {
          roomId,
          points,
          color,
          width,
          tool
        }
      })

      pubsub.publish(`${WHITEBOARD_UPDATE}_${roomId}`, {
        whiteboardUpdate: {
          roomId,
          stroke: {
            id: stroke.id,
            points: stroke.points,
            color: stroke.color,
            width: stroke.width
          },
          action: 'add'
        }
      })

      return stroke
    },

    clearWhiteboard: async (_, { roomId }, { user }) => {
      if (!user) throw new Error('Not authenticated')

      await prisma.whiteboardStroke.deleteMany({
        where: { roomId }
      })

      pubsub.publish(`${WHITEBOARD_UPDATE}_${roomId}`, {
        whiteboardUpdate: {
          roomId,
          stroke: null,
          action: 'clear'
        }
      })

      return true
    },

    setTyping: async (_, { roomId, isTyping }, { user }) => {
      if (!user) throw new Error('Not authenticated')

      const userObj = await prisma.user.findUnique({ where: { id: user.id } })

      pubsub.publish(`${TYPING_INDICATOR}_${roomId}`, {
        typingIndicator: {
          userId: user.id,
          userName: userObj.name,
          isTyping
        }
      })

      return true
    },
  },

  Subscription: {
    messageSent: {
      subscribe: (_, { roomId }) => pubsub.asyncIterator([`${MESSAGE_SENT}_${roomId}`])
    },

    userJoined: {
      subscribe: (_, { roomId }) => pubsub.asyncIterator([`${USER_JOINED}_${roomId}`])
    },

    userLeft: {
      subscribe: (_, { roomId }) => pubsub.asyncIterator([`${USER_LEFT}_${roomId}`])
    },

    typingIndicator: {
      subscribe: (_, { roomId }) => pubsub.asyncIterator([`${TYPING_INDICATOR}_${roomId}`])
    },

    whiteboardUpdate: {
      subscribe: (_, { roomId }) => pubsub.asyncIterator([`${WHITEBOARD_UPDATE}_${roomId}`])
    },

    documentUpdate: {
      subscribe: (_, { roomId }) => pubsub.asyncIterator([`${DOCUMENT_UPDATE}_${roomId}`])
    },

    activeSpeaker: {
      subscribe: (_, { roomId }) => pubsub.asyncIterator([`${ACTIVE_SPEAKER}_${roomId}`])
    },
  },

  Room: {
    participants: async (parent) => {
      const participants = await prisma.participant.findMany({
        where: {
          roomId: parent.id,
          isActive: true
        },
        include: { user: true }
      })
      return participants.map(p => p.user)
    }
  },

  Message: {
    reactions: async (parent) => {
      return await prisma.reaction.findMany({
        where: { messageId: parent.id },
        include: { user: true }
      })
    }
  },

  Document: {
    author: async (parent) => {
      if (!parent.authorId) {
        // If no author, get room creator
        const room = await prisma.room.findUnique({
          where: { id: parent.roomId },
          include: { createdBy: true }
        })
        return room?.createdBy || null
      }
      return await prisma.user.findUnique({
        where: { id: parent.authorId }
      })
    },
    edits: async (parent) => {
      return await prisma.documentEdit.findMany({
        where: { documentId: parent.id },
        include: { user: true },
        orderBy: { timestamp: 'desc' },
        take: 10
      })
    }
  }
}
