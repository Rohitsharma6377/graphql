import { pubsub } from '../config/database.js'
import { EVENTS } from '../config/constants.js'

/**
 * Subscribe to new messages in a room
 */
const messageSent = {
  subscribe: (_, { roomId }) => pubsub.asyncIterator([`${EVENTS.MESSAGE_SENT}_${roomId}`]),
}

/**
 * Subscribe to user joined events
 */
const userJoined = {
  subscribe: (_, { roomId }) => pubsub.asyncIterator([`${EVENTS.USER_JOINED}_${roomId}`]),
}

/**
 * Subscribe to user left events
 */
const userLeft = {
  subscribe: (_, { roomId }) => pubsub.asyncIterator([`${EVENTS.USER_LEFT}_${roomId}`]),
}

/**
 * Subscribe to typing indicators
 */
const typingIndicator = {
  subscribe: (_, { roomId }) => pubsub.asyncIterator([`${EVENTS.TYPING_INDICATOR}_${roomId}`]),
}

/**
 * Subscribe to whiteboard updates
 */
const whiteboardUpdate = {
  subscribe: (_, { roomId }) => pubsub.asyncIterator([`${EVENTS.WHITEBOARD_UPDATE}_${roomId}`]),
}

/**
 * Subscribe to document updates
 */
const documentUpdate = {
  subscribe: (_, { roomId }) => pubsub.asyncIterator([`${EVENTS.DOCUMENT_UPDATE}_${roomId}`]),
}

/**
 * Subscribe to active speaker changes
 */
const activeSpeaker = {
  subscribe: (_, { roomId }) => pubsub.asyncIterator([`${EVENTS.ACTIVE_SPEAKER}_${roomId}`]),
}

/**
 * Subscribe to video state changes
 */
const videoStateChanged = {
  subscribe: (_, { roomId }) => pubsub.asyncIterator([`${EVENTS.VIDEO_STATE_CHANGED}_${roomId}`]),
}

export const subscriptions = {
  messageSent,
  userJoined,
  userLeft,
  typingIndicator,
  whiteboardUpdate,
  documentUpdate,
  activeSpeaker,
  videoStateChanged,
}
