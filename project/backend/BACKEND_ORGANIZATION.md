# Backend Organization Guide

## 📁 Folder Structure

```
backend/
├── config/                    # Configuration files
│   ├── constants.js          # Event names, JWT config, server config
│   └── database.js           # Prisma & PubSub singleton instances
│
├── utils/                     # Utility functions
│   └── auth.js               # Authentication helpers (hash, compare, tokens)
│
├── resolvers/                 # GraphQL resolvers (organized by feature)
│   ├── index.js              # Main resolver export (combines all)
│   ├── queries.js            # All Query resolvers
│   ├── subscriptions.js      # All Subscription resolvers
│   ├── fieldResolvers.js     # Field resolvers (Room, Participant, Document)
│   │
│   └── mutations/             # Mutation resolvers by feature
│       ├── auth.js           # signup, login, password reset
│       ├── room.js           # createRoom, joinRoom, leaveRoom
│       ├── message.js        # sendMessage, reactions
│       ├── document.js       # createDocument, updateDocument
│       ├── realtime.js       # updateVideoState, setTyping
│       └── media.js          # whiteboard, recordings, transcripts
│
├── schema/                    # GraphQL schema
│   ├── typeDefs.js           # Type definitions
│   └── resolvers.js          # OLD FILE (replaced by resolvers/)
│
├── prisma/                    # Database
│   └── schema.prisma         # Database schema
│
└── server.js                  # Main server file
```

---

## 🗂️ File Breakdown

### `/config/constants.js`
**Purpose:** Centralized configuration constants

**Exports:**
- `EVENTS` - PubSub event names (MESSAGE_SENT, USER_JOINED, etc.)
- `JWT_CONFIG` - JWT secret, expiration times
- `SERVER_CONFIG` - Port, GraphQL path

**Why:** Single source of truth for all constants

---

### `/config/database.js`
**Purpose:** Singleton instances for Prisma & PubSub

**Exports:**
- `prisma` - Prisma Client instance
- `pubsub` - GraphQL PubSub instance
- `getPrisma()` - Get or create Prisma instance
- `getPubSub()` - Get or create PubSub instance

**Why:** Prevents multiple database connections

---

### `/utils/auth.js`
**Purpose:** Authentication utility functions

**Functions:**
- `hashPassword(password)` - Hash password with bcrypt
- `comparePassword(password, hash)` - Verify password
- `generateToken(user)` - Create JWT token
- `generateResetToken(user)` - Create password reset token
- `verifyToken(token)` - Verify JWT token
- `getUserFromToken(token)` - Extract user from JWT

**Why:** Reusable auth logic across resolvers

---

### `/resolvers/mutations/auth.js`
**Purpose:** Authentication mutations

**Resolvers:**
- `signup` - Create new user account
- `login` - Authenticate user
- `requestPasswordReset` - Send reset email
- `resetPassword` - Update password with token
- `updateUserStatus` - Change online/offline status

**Used in:** Login, signup, forgot password pages

---

### `/resolvers/mutations/room.js`
**Purpose:** Meeting room management

**Resolvers:**
- `createRoom` - Create new meeting room
- `updateRoom` - Edit room details
- `deleteRoom` - Remove room (creator only)
- `joinRoom` - Join meeting (publishes USER_JOINED)
- `leaveRoom` - Leave meeting (publishes USER_LEFT)

**Used in:** Meetings page, dashboard

---

### `/resolvers/mutations/message.js`
**Purpose:** Chat messaging

**Resolvers:**
- `sendMessage` - Send text/image/file message
- `addReaction` - Add emoji reaction
- `removeReaction` - Remove emoji reaction

**Publishes:** MESSAGE_SENT event

**Used in:** RealChatPanel component

---

### `/resolvers/mutations/document.js`
**Purpose:** Collaborative documents

**Resolvers:**
- `createDocument` - Create document (standalone or in room)
- `updateDocument` - Edit document content (tracks history)
- `deleteDocument` - Remove document (creator only)

**Publishes:** DOCUMENT_UPDATE event

**Used in:** Documents page, CollaborativeEditor

---

### `/resolvers/mutations/realtime.js`
**Purpose:** Real-time features

**Resolvers:**
- `updateVideoState` - Update mute/video/screen share/speaking
- `setTyping` - Broadcast typing indicator

**Publishes:** 
- VIDEO_STATE_CHANGED
- TYPING_INDICATOR

**Used in:** RealVideoRoom, chat components

---

### `/resolvers/mutations/media.js`
**Purpose:** Media & whiteboard features

**Resolvers:**
- `addWhiteboardStroke` - Add drawing stroke
- `clearWhiteboard` - Clear all strokes
- `createRecording` - Save meeting recording
- `deleteRecording` - Remove recording
- `generateTranscript` - Create/update transcript

**Used in:** Whiteboard, recordings

---

### `/resolvers/queries.js`
**Purpose:** All GraphQL queries

**Resolvers:**
- `currentUser` - Get authenticated user
- `user(id)` - Get user by ID
- `users` - Get all users
- `room(id)` - Get room with full details
- `rooms` - Get all rooms
- `messages(roomId)` - Get chat messages (paginated)
- `document(roomId)` - Get document with edit history
- `documents` - Get all documents
- `recordings(roomId)` - Get room recordings
- `transcript(roomId)` - Get room transcript

**Used in:** All pages and components

---

### `/resolvers/subscriptions.js`
**Purpose:** Real-time GraphQL subscriptions

**Subscriptions:**
- `messageSent` - New chat messages
- `userJoined` - User joins room
- `userLeft` - User leaves room
- `typingIndicator` - Someone is typing
- `whiteboardUpdate` - Drawing updates
- `documentUpdate` - Document changes
- `activeSpeaker` - Speaker detection
- `videoStateChanged` - Video/audio state changes

**Used in:** All real-time features

---

### `/resolvers/fieldResolvers.js`
**Purpose:** Custom field resolvers

**Resolvers:**
- `Room.inviteLink` - Generate meeting invite URL
- `Participant.videoState` - Get video/audio state
- `Document.author` - Get document author (fallback to room creator)
- `Document.edits` - Get last 10 edit history entries

**Why:** Compute fields dynamically

---

### `/resolvers/index.js`
**Purpose:** Combine all resolvers

**Exports:**
- `resolvers` - Complete resolver object for Apollo Server

**Structure:**
```javascript
{
  Query: { ...queries },
  Mutation: { 
    ...authMutations,
    ...roomMutations,
    ...messageMutations,
    ...documentMutations,
    ...realtimeMutations,
    ...mediaMutations
  },
  Subscription: { ...subscriptions },
  Room: { ...Room },
  Participant: { ...Participant },
  Document: { ...Document }
}
```

---

## 🔄 Data Flow Examples

### Creating a Room
1. **Frontend:** Calls `createRoom` mutation
2. **Backend:** `resolvers/mutations/room.js` → `createRoom()`
3. **Database:** Prisma creates room in SQLite
4. **Response:** Returns room with `inviteLink` field
5. **Field Resolver:** `Room.inviteLink` generates URL

### Joining a Meeting
1. **Frontend:** Calls `joinRoom` mutation
2. **Backend:** `resolvers/mutations/room.js` → `joinRoom()`
3. **Database:** Creates Participant record
4. **PubSub:** Publishes USER_JOINED event
5. **Subscription:** All connected clients receive update
6. **Frontend:** Updates participant list in UI

### Sending a Message
1. **Frontend:** Calls `sendMessage` mutation with input
2. **Backend:** `resolvers/mutations/message.js` → `sendMessage()`
3. **Database:** Creates Message record
4. **PubSub:** Publishes MESSAGE_SENT event
5. **Subscription:** Real-time delivery to all participants
6. **Frontend:** Message appears instantly in chat

### Video State Update
1. **Frontend:** User clicks mute button
2. **Component:** Calls `updateVideoState` mutation
3. **Backend:** `resolvers/mutations/realtime.js` → `updateVideoState()`
4. **Database:** Upserts VideoState record
5. **PubSub:** Publishes VIDEO_STATE_CHANGED event
6. **Subscription:** All participants receive update
7. **Frontend:** Muted icon shows on participant

---

## 🎯 Benefits of This Structure

### 1. Easy to Understand
- Each file has ONE purpose
- Clear naming (auth.js = authentication)
- Logical grouping (mutations/, queries.js)

### 2. Easy to Maintain
- Find code quickly (need auth? → auth.js)
- Change one feature without affecting others
- Test individual files

### 3. Easy to Scale
- Add new features = add new files
- Import only what you need
- No giant 700-line files

### 4. Easy to Debug
- Error in auth? Check auth.js
- Error in messages? Check message.js
- Stack traces point to specific files

### 5. Easy to Collaborate
- Multiple developers work on different files
- Fewer merge conflicts
- Clear code ownership

---

## 📖 How to Use

### Adding a New Feature

**Example: Add "Mark as Favorite Room"**

1. **Add to schema** (`schema/typeDefs.js`):
   ```graphql
   type Room {
     isFavorite: Boolean
   }
   
   type Mutation {
     toggleFavoriteRoom(roomId: ID!): Room
   }
   ```

2. **Create mutation file** (`resolvers/mutations/favorite.js`):
   ```javascript
   export const toggleFavoriteRoom = async (_, { roomId }, { user }) => {
     // Your logic here
   }
   
   export const favoriteMutations = { toggleFavoriteRoom }
   ```

3. **Import in index** (`resolvers/index.js`):
   ```javascript
   import { favoriteMutations } from './mutations/favorite.js'
   
   Mutation: {
     ...favoriteMutations,
   }
   ```

Done! Clean, organized, maintainable.

---

## 🚀 Quick Start

1. **Start server:**
   ```bash
   cd backend
   npm start
   ```

2. **Check health:**
   ```
   http://localhost:4000/health
   ```

3. **GraphQL Playground:**
   ```
   http://localhost:4000/graphql
   ```

4. **Test a query:**
   ```graphql
   query {
     rooms {
       id
       name
       inviteLink
     }
   }
   ```

---

## 📚 Related Docs

- **Schema:** See `schema/typeDefs.js` for all types
- **Database:** See `prisma/schema.prisma` for models
- **API Reference:** See `BACKEND_API_COMPLETE.md`
- **Testing:** See `BACKEND_TESTING_GUIDE.md`

---

**Status:** ✅ Fully organized and production-ready!
