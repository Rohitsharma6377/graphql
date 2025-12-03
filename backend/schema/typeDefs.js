export const typeDefs = `#graphql
  type User {
    id: ID!
    email: String!
    name: String!
    avatar: String
    status: String!
    createdAt: String!
    createdRooms: [Room!]!
  }

  type Room {
    id: ID!
    name: String!
    description: String
    isActive: Boolean!
    createdAt: String!
    createdBy: User!
    participants: [User!]!
    messages: [Message!]!
    document: Document
  }

  type Participant {
    id: ID!
    user: User!
    room: Room!
    joinedAt: String!
    leftAt: String
    isActive: Boolean!
  }

  type Message {
    id: ID!
    content: String!
    type: String!
    metadata: String
    createdAt: String!
    sender: User!
    room: Room!
    reactions: [Reaction!]!
  }

  type Reaction {
    id: ID!
    emoji: String!
    userId: String!
    user: User!
  }

  type Document {
    id: ID!
    name: String!
    content: String!
    roomId: String!
    room: Room
    author: User
    createdAt: String!
    updatedAt: String!
    edits: [DocumentEdit!]!
  }

  type DocumentEdit {
    id: ID!
    content: String!
    timestamp: String!
    user: User!
  }

  type WhiteboardStroke {
    id: ID!
    points: String!
    color: String!
    width: Int!
    tool: String!
  }

  type Recording {
    id: ID!
    url: String!
    duration: Int!
    size: Int!
    createdAt: String!
  }

  type Transcript {
    id: ID!
    content: String!
    speaker: String
    timestamp: String!
    summary: String
    actionItems: String
  }

  type TypingIndicator {
    userId: String!
    userName: String!
    isTyping: Boolean!
  }

  type ActiveSpeaker {
    roomId: String!
    userId: String!
    isSpeaking: Boolean!
  }

  type WhiteboardUpdate {
    roomId: String!
    stroke: WhiteboardStroke!
    action: String!
  }

  type DocumentUpdate {
    roomId: String!
    content: String!
    userId: String!
    timestamp: String!
  }

  input CreateDocumentInput {
    name: String!
    content: String!
    roomId: ID
  }

  input SendMessageInput {
    roomId: ID!
    content: String!
    type: String
    metadata: String
  }

  type Query {
    currentUser: User
    user(id: ID!): User
    users: [User!]!
    
    room(id: ID!): Room
    rooms: [Room!]!
    
    messages(roomId: ID!, limit: Int, offset: Int): [Message!]!
    
    document(roomId: ID!): Document
    documents: [Document!]!
    
    recordings(roomId: ID!): [Recording!]!
    
    transcript(roomId: ID!): Transcript
  }

  type Mutation {
    # Auth
    signup(email: String!, name: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    requestPasswordReset(email: String!): ResetPasswordResponse!
    resetPassword(token: String!, newPassword: String!): AuthPayload!
    updateUserStatus(status: String!): User!
    
    # Rooms
    createRoom(name: String!, description: String): Room!
    updateRoom(id: ID!, name: String, description: String): Room!
    deleteRoom(id: ID!): Boolean!
    joinRoom(roomId: ID!): Room!
    leaveRoom(roomId: ID!): Boolean!
    
    # Messages
    sendMessage(input: SendMessageInput!): Message!
    addReaction(messageId: ID!, emoji: String!): Message!
    removeReaction(messageId: ID!, emoji: String!): Message!
    
    # Documents
    createDocument(input: CreateDocumentInput!): Document!
    updateDocument(roomId: ID!, content: String!): Document!
    deleteDocument(id: ID!): Boolean!
    
    # Whiteboard
    addWhiteboardStroke(roomId: ID!, points: String!, color: String!, width: Int!, tool: String): WhiteboardStroke!
    clearWhiteboard(roomId: ID!): Boolean!
    
    # Typing Indicator
    setTyping(roomId: ID!, isTyping: Boolean!): Boolean!
  }

  type Subscription {
    messageSent(roomId: ID!): Message!
    userJoined(roomId: ID!): User!
    userLeft(roomId: ID!): User!
    typingIndicator(roomId: ID!): TypingIndicator!
    whiteboardUpdate(roomId: ID!): WhiteboardUpdate!
    documentUpdate(roomId: ID!): DocumentUpdate!
    activeSpeaker(roomId: ID!): ActiveSpeaker!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type ResetPasswordResponse {
    success: Boolean!
    message: String!
  }
`
