# Backend API - Complete Reference

This document provides a comprehensive overview of all backend GraphQL queries, mutations, and subscriptions implemented in the AI Video Collaboration Platform.

## 🔐 Authentication

### Mutations
- **`signup(email, name, password)`** - Create new user account
- **`login(email, password)`** - Authenticate and get JWT token
- **`requestPasswordReset(email)`** - Request password reset token
- **`resetPassword(token, newPassword)`** - Reset password with token
- **`updateUserStatus(status)`** - Update user online status

### Response Type: AuthPayload
```graphql
{
  token: String!
  user: User!
}
```

---

## 👤 User Management

### Queries
- **`currentUser`** - Get authenticated user's profile
- **`user(id)`** - Get specific user by ID
- **`users`** - Get all users

### User Fields
```graphql
{
  id: ID!
  email: String!
  name: String!
  avatar: String
  status: String
  createdAt: String!
  rooms: [RoomParticipant!]!
  documents: [Document!]!
}
```

---

## 🎥 Room Management

### Queries
- **`room(id)`** - Get specific room with full details
- **`rooms`** - Get all available rooms

### Mutations
- **`createRoom(name, description?)`** - Create new meeting room
- **`updateRoom(id, name?, description?)`** - Update room details
- **`deleteRoom(id)`** - Delete a room (creator only)
- **`joinRoom(roomId)`** - Join a meeting room
- **`leaveRoom(roomId)`** - Leave a meeting room

### Room Fields
```graphql
{
  id: ID!
  name: String!
  description: String
  createdAt: String!
  createdBy: User!
  participants: [RoomParticipant!]!
  messages: [Message!]!
  document: Document
  recordings: [Recording!]!
  transcript: Transcript
  whiteboardStrokes: [WhiteboardStroke!]!
}
```

---

## 💬 Chat & Messaging

### Queries
- **`messages(roomId, limit?, offset?)`** - Get room messages with pagination

### Mutations
- **`sendMessage(input: SendMessageInput!)`** - Send message with file support
  ```graphql
  input SendMessageInput {
    roomId: ID!
    content: String!
    type: String        # "text", "image", "file"
    metadata: String    # JSON string for file metadata
  }
  ```
- **`addReaction(messageId, emoji)`** - Add emoji reaction to message
- **`removeReaction(messageId, emoji)`** - Remove emoji reaction

### Message Fields
```graphql
{
  id: ID!
  content: String!
  type: String
  metadata: String
  sender: User!
  room: Room!
  createdAt: String!
  reactions: [Reaction!]!
}
```

### Subscriptions
- **`messageSent(roomId)`** - Real-time message updates

---

## 📄 Document Collaboration

### Queries
- **`document(roomId)`** - Get room's collaborative document
- **`documents`** - Get all documents

### Mutations
- **`createDocument(input: CreateDocumentInput!)`** - Create document
  ```graphql
  input CreateDocumentInput {
    name: String!
    content: String!
    roomId: ID          # Optional: creates standalone if omitted
  }
  ```
- **`updateDocument(roomId, content)`** - Update document with edit history
- **`deleteDocument(id)`** - Delete document (creator only)

### Document Fields
```graphql
{
  id: ID!
  name: String!
  content: String!
  roomId: String
  authorId: String
  author: User          # Falls back to room creator
  room: Room
  edits: [DocumentEdit!]!
  createdAt: String!
  updatedAt: String!
}
```

### DocumentEdit Fields
```graphql
{
  id: ID!
  content: String!
  timestamp: String!
  user: User!
}
```

### Subscriptions
- **`documentUpdate(roomId)`** - Real-time document changes

---

## 🎬 Recordings

### Queries
- **`recordings(roomId)`** - Get all recordings for a room

### Mutations
- **`createRecording(roomId, url, duration, size)`** - Save meeting recording
  - `url`: Cloudinary URL
  - `duration`: Recording length in seconds
  - `size`: File size in bytes
- **`deleteRecording(id)`** - Delete recording (creator only)

### Recording Fields
```graphql
{
  id: ID!
  url: String!
  duration: Int!
  size: Int!
  room: Room!
  createdAt: String!
}
```

---

## 📝 Transcripts

### Queries
- **`transcript(roomId)`** - Get room transcript

### Mutations
- **`generateTranscript(roomId, content)`** - Create/update transcript
  - Uses `upsert` - creates new or updates existing

### Transcript Fields
```graphql
{
  id: ID!
  content: String!
  room: Room!
  createdAt: String!
  updatedAt: String!
}
```

---

## 🎨 Whiteboard

### Mutations
- **`addWhiteboardStroke(roomId, points, color, width, tool?)`** - Add drawing stroke
- **`clearWhiteboard(roomId)`** - Clear all strokes

### WhiteboardStroke Fields
```graphql
{
  id: ID!
  points: String!      # JSON array of coordinates
  color: String!
  width: Int!
  tool: String         # "pen", "highlighter", "eraser"
  createdAt: String!
}
```

### Subscriptions
- **`whiteboardUpdate(roomId)`** - Real-time drawing updates

---

## ⌨️ Typing Indicators

### Mutations
- **`setTyping(roomId, isTyping)`** - Broadcast typing status

### Subscriptions
- **`typingIndicator(roomId)`** - Real-time typing events
  ```graphql
  {
    userId: String!
    userName: String!
    isTyping: Boolean!
  }
  ```

---

## 👥 Presence System

### Subscriptions
- **`userJoined(roomId)`** - User joins room event
- **`userLeft(roomId)`** - User leaves room event

---

## 🔑 Authorization

All mutations require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Protected Actions
- **Creator Only**: deleteRoom, deleteDocument, deleteRecording
- **Authenticated**: All mutations, most queries
- **Public**: None (all endpoints require authentication)

---

## 📊 Database Models (Prisma)

### Core Models
1. **User** - User accounts and profiles
2. **Room** - Meeting rooms
3. **RoomParticipant** - User-room relationships
4. **Message** - Chat messages with reactions
5. **Document** - Collaborative documents
6. **DocumentEdit** - Edit history tracking
7. **Recording** - Meeting recordings
8. **Transcript** - Meeting transcripts
9. **WhiteboardStroke** - Drawing data
10. **PasswordResetToken** - Password reset tokens

---

## 🚀 Real-time Features

### WebSocket Subscriptions
All subscriptions use GraphQL-WS protocol:
- Connect to: `ws://localhost:4000/graphql`
- Protocol: `graphql-transport-ws`

### PubSub Topics
- `MESSAGE_SENT_${roomId}`
- `USER_JOINED_${roomId}`
- `USER_LEFT_${roomId}`
- `TYPING_INDICATOR_${roomId}`
- `WHITEBOARD_UPDATE_${roomId}`
- `DOCUMENT_UPDATE_${roomId}`

---

## 📁 File Uploads (Cloudinary)

### Supported in:
- **Messages**: `metadata` field stores file info
  ```json
  {
    "filename": "document.pdf",
    "size": 1024000,
    "format": "pdf"
  }
  ```
- **Documents**: `content` field stores Cloudinary URL
- **Recordings**: `url` field stores Cloudinary URL

### Upload Process
1. Frontend uploads to Cloudinary
2. Receives secure URL + metadata
3. Creates mutation with URL and metadata

---

## 🔧 Backend Configuration

### Environment Variables
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
PORT=4000
```

### Server Endpoints
- **GraphQL Playground**: http://localhost:4000/graphql
- **WebSocket**: ws://localhost:4000/graphql
- **Health Check**: http://localhost:4000/

---

## 📈 Performance Features

### Database Optimizations
- Indexed foreign keys
- Efficient `include` queries
- Pagination support on messages

### Real-time Optimizations
- Room-scoped subscriptions
- PubSub for minimal latency
- Selective field resolution

---

## 🎯 Usage Examples

### Creating a Document
```graphql
mutation {
  createDocument(input: {
    name: "Project Plan"
    content: "https://cloudinary.com/doc123.pdf"
    roomId: "room-123"
  }) {
    id
    name
    author {
      name
    }
  }
}
```

### Sending Message with Image
```graphql
mutation {
  sendMessage(input: {
    roomId: "room-123"
    content: "https://cloudinary.com/image.jpg"
    type: "image"
    metadata: "{\"filename\":\"photo.jpg\",\"size\":50000}"
  }) {
    id
    content
    sender {
      name
    }
  }
}
```

### Subscribing to Messages
```graphql
subscription {
  messageSent(roomId: "room-123") {
    id
    content
    sender {
      name
      avatar
    }
  }
}
```

---

## ✅ Complete Feature Checklist

- ✅ User authentication (signup, login, password reset)
- ✅ Room management (CRUD + join/leave)
- ✅ Real-time chat with reactions
- ✅ File uploads via Cloudinary
- ✅ Collaborative documents with edit history
- ✅ Meeting recordings
- ✅ Transcript generation
- ✅ Whiteboard collaboration
- ✅ Typing indicators
- ✅ User presence tracking
- ✅ Authorization checks
- ✅ Input types for clean mutations
- ✅ GraphQL subscriptions for real-time updates
- ✅ SQLite database with Prisma ORM

---

## 🎉 Status: **PRODUCTION READY**

All backend features are fully implemented and tested. The API supports all frontend functionality including:
- Video conferencing metadata
- Real-time chat with file sharing
- Document collaboration
- Recording management
- Transcript generation
- Whiteboard collaboration
- Complete CRUD operations
- Real-time subscriptions
