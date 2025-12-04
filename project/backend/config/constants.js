// Event names for PubSub subscriptions
export const EVENTS = {
  MESSAGE_SENT: 'MESSAGE_SENT',
  USER_JOINED: 'USER_JOINED',
  USER_LEFT: 'USER_LEFT',
  TYPING_INDICATOR: 'TYPING_INDICATOR',
  WHITEBOARD_UPDATE: 'WHITEBOARD_UPDATE',
  DOCUMENT_UPDATE: 'DOCUMENT_UPDATE',
  ACTIVE_SPEAKER: 'ACTIVE_SPEAKER',
  VIDEO_STATE_CHANGED: 'VIDEO_STATE_CHANGED',
}

// JWT configuration
export const JWT_CONFIG = {
  SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  EXPIRES_IN: '7d',
  RESET_TOKEN_EXPIRES: '1h',
}

// Server configuration
export const SERVER_CONFIG = {
  PORT: process.env.PORT || 4000,
  GRAPHQL_PATH: '/graphql',
}
