import { gql } from '@apollo/client'

// User Queries
export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    currentUser {
      id
      name
      email
      avatar
      createdAt
    }
  }
`

export const GET_USER_BY_ID = gql`
  query GetUserById($id: ID!) {
    user(id: $id) {
      id
      name
      email
      avatar
      status
    }
  }
`

// Room Queries
export const GET_ROOMS = gql`
  query GetRooms {
    rooms {
      id
      name
      description
      createdBy {
        id
        name
        avatar
      }
      participants {
        id
        name
        avatar
      }
      createdAt
      isActive
    }
  }
`

export const GET_ROOM = gql`
  query GetRoom($id: ID!) {
    room(id: $id) {
      id
      name
      description
      createdBy {
        id
        name
        avatar
      }
      participants {
        id
        name
        avatar
        status
      }
      messages {
        id
        content
        sender {
          id
          name
          avatar
        }
        createdAt
      }
      createdAt
      isActive
    }
  }
`

// Message Queries
export const GET_MESSAGES = gql`
  query GetMessages($roomId: ID!, $limit: Int, $offset: Int) {
    messages(roomId: $roomId, limit: $limit, offset: $offset) {
      id
      content
      type
      sender {
        id
        name
        avatar
      }
      roomId
      createdAt
      reactions {
        emoji
        userId
      }
    }
  }
`

// Document Queries
export const GET_DOCUMENT = gql`
  query GetDocument($roomId: ID!) {
    document(roomId: $roomId) {
      id
      roomId
      content
      updatedAt
    }
  }
`

// Mutations
export const CREATE_ROOM = gql`
  mutation CreateRoom($name: String!, $description: String) {
    createRoom(name: $name, description: $description) {
      id
      name
      description
      createdAt
    }
  }
`

export const JOIN_ROOM = gql`
  mutation JoinRoom($roomId: ID!) {
    joinRoom(roomId: $roomId) {
      id
      participants {
        id
        name
        avatar
      }
    }
  }
`

export const LEAVE_ROOM = gql`
  mutation LeaveRoom($roomId: ID!) {
    leaveRoom(roomId: $roomId)
  }
`

export const SEND_MESSAGE = gql`
  mutation SendMessage($roomId: ID!, $content: String!, $type: String) {
    sendMessage(roomId: $roomId, content: $content, type: $type) {
      id
      content
      type
      sender {
        id
        name
        avatar
      }
      createdAt
    }
  }
`

export const UPDATE_DOCUMENT = gql`
  mutation UpdateDocument($roomId: ID!, $content: String!) {
    updateDocument(roomId: $roomId, content: $content) {
      id
      content
      updatedAt
    }
  }
`

export const ADD_REACTION = gql`
  mutation AddReaction($messageId: ID!, $emoji: String!) {
    addReaction(messageId: $messageId, emoji: $emoji) {
      id
      reactions {
        emoji
        userId
      }
    }
  }
`

export const UPDATE_USER_STATUS = gql`
  mutation UpdateUserStatus($status: String!) {
    updateUserStatus(status: $status) {
      id
      status
    }
  }
`

// Subscriptions
export const MESSAGE_SENT = gql`
  subscription MessageSent($roomId: ID!) {
    messageSent(roomId: $roomId) {
      id
      content
      type
      sender {
        id
        name
        avatar
      }
      roomId
      createdAt
    }
  }
`

export const USER_JOINED = gql`
  subscription UserJoined($roomId: ID!) {
    userJoined(roomId: $roomId) {
      id
      name
      avatar
      status
    }
  }
`

export const USER_LEFT = gql`
  subscription UserLeft($roomId: ID!) {
    userLeft(roomId: $roomId) {
      id
      name
    }
  }
`

export const TYPING_INDICATOR = gql`
  subscription TypingIndicator($roomId: ID!) {
    typingIndicator(roomId: $roomId) {
      userId
      userName
      isTyping
    }
  }
`

export const WHITEBOARD_UPDATE = gql`
  subscription WhiteboardUpdate($roomId: ID!) {
    whiteboardUpdate(roomId: $roomId) {
      roomId
      stroke {
        id
        points
        color
        width
      }
      action
    }
  }
`

export const DOCUMENT_UPDATE = gql`
  subscription DocumentUpdate($roomId: ID!) {
    documentUpdate(roomId: $roomId) {
      roomId
      content
      userId
      timestamp
    }
  }
`

export const ACTIVE_SPEAKER = gql`
  subscription ActiveSpeaker($roomId: ID!) {
    activeSpeaker(roomId: $roomId) {
      roomId
      userId
      isSpeaking
    }
  }
`
