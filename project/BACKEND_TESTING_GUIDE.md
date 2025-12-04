# 🚀 Complete Backend Testing Guide

This guide will help you test all backend features of the AI Video Collaboration Platform.

## 📋 Prerequisites

1. ✅ Backend server running on http://localhost:4000/graphql
2. ✅ Frontend server running on http://localhost:3000
3. ✅ Database updated with latest schema (already done)
4. ✅ Cloudinary account configured (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in .env.local)

---

## 🧪 Testing Checklist

### 1. Authentication ✅

**Test Signup:**
```graphql
mutation {
  signup(
    email: "test@example.com"
    name: "Test User"
    password: "password123"
  ) {
    token
    user {
      id
      name
      email
    }
  }
}
```

**Test Login:**
```graphql
mutation {
  login(
    email: "test@example.com"
    password: "password123"
  ) {
    token
    user {
      id
      name
    }
  }
}
```

**Frontend Test:**
- Navigate to http://localhost:3000/auth/login
- Create account or login
- Verify redirect to dashboard

---

### 2. Room Management ✅

**Create Room:**
```graphql
mutation {
  createRoom(
    name: "Test Meeting Room"
    description: "Testing backend features"
  ) {
    id
    name
    createdBy {
      name
    }
  }
}
```

**Get All Rooms:**
```graphql
query {
  rooms {
    id
    name
    participants {
      user {
        name
      }
    }
  }
}
```

**Frontend Test:**
- Go to http://localhost:3000/meetings
- Click "Create Room" button
- Verify room appears in list
- Join a room and check participants

---

### 3. Real-time Chat ✅

**Send Text Message:**
```graphql
mutation {
  sendMessage(input: {
    roomId: "your-room-id"
    content: "Hello World!"
    type: "text"
  }) {
    id
    content
    sender {
      name
    }
  }
}
```

**Send Message with File Metadata:**
```graphql
mutation {
  sendMessage(input: {
    roomId: "your-room-id"
    content: "https://res.cloudinary.com/.../file.pdf"
    type: "file"
    metadata: "{\"filename\":\"document.pdf\",\"size\":1024000,\"format\":\"pdf\"}"
  }) {
    id
    content
    metadata
  }
}
```

**Subscribe to Messages:**
```graphql
subscription {
  messageSent(roomId: "your-room-id") {
    id
    content
    sender {
      name
    }
  }
}
```

**Frontend Test:**
- Join a meeting room
- Send a text message in chat
- Upload an image (tests Cloudinary + metadata)
- Upload a file
- Add emoji reactions
- Open in two browser windows to see real-time updates

---

### 4. Document Collaboration ✅

**Create Standalone Document:**
```graphql
mutation {
  createDocument(input: {
    name: "Project Proposal"
    content: "https://cloudinary.com/doc.pdf"
  }) {
    id
    name
    author {
      name
    }
  }
}
```

**Create Room Document:**
```graphql
mutation {
  createDocument(input: {
    name: "Meeting Notes"
    content: "Initial content..."
    roomId: "your-room-id"
  }) {
    id
    name
    room {
      name
    }
  }
}
```

**Update Document:**
```graphql
mutation {
  updateDocument(
    roomId: "your-room-id"
    content: "Updated content with changes..."
  ) {
    id
    content
    updatedAt
  }
}
```

**Get Document with Edit History:**
```graphql
query {
  document(roomId: "your-room-id") {
    id
    content
    author {
      name
    }
    edits {
      user {
        name
      }
      timestamp
    }
  }
}
```

**Frontend Test:**
- Go to http://localhost:3000/documents
- Click "Upload Document"
- Select a file (PDF, DOC, etc.)
- Verify upload to Cloudinary
- Check document appears in list
- Download document from Cloudinary CDN

---

### 5. Recordings ✅

**Create Recording:**
```graphql
mutation {
  createRecording(
    roomId: "your-room-id"
    url: "https://cloudinary.com/video/recording.mp4"
    duration: 3600
    size: 50000000
  ) {
    id
    url
    duration
    size
  }
}
```

**Get Room Recordings:**
```graphql
query {
  recordings(roomId: "your-room-id") {
    id
    url
    duration
    size
    createdAt
  }
}
```

**Delete Recording:**
```graphql
mutation {
  deleteRecording(id: "recording-id")
}
```

**Frontend Test:**
- Can be integrated later with WebRTC recording
- For now, test via GraphQL Playground

---

### 6. Transcripts ✅

**Generate Transcript:**
```graphql
mutation {
  generateTranscript(
    roomId: "your-room-id"
    content: "This is a test transcript of the meeting. Speaker 1: Hello everyone..."
  ) {
    id
    content
    createdAt
  }
}
```

**Get Transcript:**
```graphql
query {
  transcript(roomId: "your-room-id") {
    id
    content
    updatedAt
  }
}
```

**Frontend Test:**
- Can be integrated later with speech-to-text API
- For now, test via GraphQL Playground

---

### 7. Whiteboard ✅

**Add Stroke:**
```graphql
mutation {
  addWhiteboardStroke(
    roomId: "your-room-id"
    points: "[[10,20],[15,25],[20,30]]"
    color: "#FF5733"
    width: 3
    tool: "pen"
  ) {
    id
    color
    width
  }
}
```

**Clear Whiteboard:**
```graphql
mutation {
  clearWhiteboard(roomId: "your-room-id")
}
```

**Subscribe to Updates:**
```graphql
subscription {
  whiteboardUpdate(roomId: "your-room-id") {
    action
    stroke {
      color
      width
    }
  }
}
```

**Frontend Test:**
- In meeting room, click "Whiteboard" button
- Draw with mouse/touch
- Test different colors and tools
- Clear whiteboard
- Open in two windows to see real-time sync

---

### 8. Typing Indicators ✅

**Set Typing:**
```graphql
mutation {
  setTyping(roomId: "your-room-id", isTyping: true)
}
```

**Subscribe to Typing:**
```graphql
subscription {
  typingIndicator(roomId: "your-room-id") {
    userId
    userName
    isTyping
  }
}
```

**Frontend Test:**
- In chat panel, start typing
- Should see "[User] is typing..." in another window

---

### 9. User Presence ✅

**Join Room:**
```graphql
mutation {
  joinRoom(roomId: "your-room-id") {
    id
    participants {
      user {
        name
        status
      }
    }
  }
}
```

**Subscribe to Join Events:**
```graphql
subscription {
  userJoined(roomId: "your-room-id") {
    id
    name
    avatar
  }
}
```

**Subscribe to Leave Events:**
```graphql
subscription {
  userLeft(roomId: "your-room-id") {
    id
    name
  }
}
```

**Frontend Test:**
- Join a meeting room
- Check participant list updates
- Leave room
- Open in two windows to see real-time presence

---

### 10. Reactions ✅

**Add Reaction:**
```graphql
mutation {
  addReaction(messageId: "message-id", emoji: "👍")
}
```

**Remove Reaction:**
```graphql
mutation {
  removeReaction(messageId: "message-id", emoji: "👍")
}
```

**Frontend Test:**
- In chat, hover over a message
- Click an emoji to add reaction
- Click again to remove
- See reactions from other users

---

## 🎯 End-to-End Testing Scenarios

### Scenario 1: Complete Meeting Flow
1. User A creates room → ✅ Room appears in meetings list
2. User B joins room → ✅ Both see each other in participants
3. User A sends message → ✅ User B receives in real-time
4. User B uploads image → ✅ Image appears in chat with Cloudinary URL
5. User A adds reaction → ✅ Reaction appears on message
6. User A updates document → ✅ User B sees changes with edit history

### Scenario 2: Document Workflow
1. User creates standalone document → ✅ Document in documents list
2. User uploads file to Cloudinary → ✅ File URL stored
3. User views document list → ✅ Shows all documents with authors
4. User deletes own document → ✅ Document removed
5. User tries to delete other's document → ❌ Authorization error

### Scenario 3: Real-time Collaboration
1. Two users join same room → ✅ Both online
2. User A types message → ✅ User B sees typing indicator
3. User A sends message → ✅ Instant delivery via subscription
4. User B draws on whiteboard → ✅ User A sees strokes in real-time
5. User A leaves room → ✅ User B notified via subscription

---

## 🐛 Common Issues & Solutions

### Issue: "Not authenticated" error
**Solution:** Add JWT token to Authorization header:
```javascript
{
  "Authorization": "Bearer your-jwt-token-here"
}
```

### Issue: Cloudinary upload fails
**Solution:** Check environment variables:
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

### Issue: Subscription not receiving updates
**Solution:** 
- Check WebSocket connection at ws://localhost:4000/graphql
- Verify roomId matches in subscription and mutation
- Check browser console for errors

### Issue: "Field not found" GraphQL error
**Solution:** 
- Restart backend server: `cd backend; npm start`
- Clear Apollo cache in browser DevTools

---

## 📊 Testing Tools

### GraphQL Playground
- URL: http://localhost:4000/graphql
- Features: Query testing, schema exploration, subscription testing
- Auth: Add header `{"Authorization": "Bearer <token>"}`

### Browser DevTools
- Network tab: Check GraphQL requests
- Console: See real-time subscription events
- Application tab: View localStorage (auth token)

### Multiple Browser Windows
- Test real-time features
- Simulate multiple users
- Verify presence and subscriptions

---

## ✅ Feature Coverage

| Feature | Backend | Frontend | Real-time | Cloudinary |
|---------|---------|----------|-----------|------------|
| Authentication | ✅ | ✅ | - | - |
| Room Management | ✅ | ✅ | ✅ | - |
| Chat Messages | ✅ | ✅ | ✅ | ✅ |
| Documents | ✅ | ✅ | ✅ | ✅ |
| Recordings | ✅ | 🔄 | - | ✅ |
| Transcripts | ✅ | 🔄 | - | - |
| Whiteboard | ✅ | ✅ | ✅ | - |
| Typing Indicators | ✅ | 🔄 | ✅ | - |
| User Presence | ✅ | ✅ | ✅ | - |
| Reactions | ✅ | ✅ | - | - |
| Video/Audio | - | ✅ | - | - |

**Legend:**
- ✅ Fully implemented
- 🔄 Backend ready, frontend integration pending
- - Not applicable

---

## 🎉 Next Steps

1. **Test Core Features:**
   - Create account
   - Create room
   - Send messages
   - Upload documents

2. **Test Real-time:**
   - Open two browser windows
   - Test subscriptions
   - Verify instant updates

3. **Test File Uploads:**
   - Configure Cloudinary
   - Upload images in chat
   - Upload documents

4. **Test Authorization:**
   - Try deleting other's documents
   - Try joining as different users
   - Verify access control

5. **Advanced Integration:**
   - Add recording upload after meetings
   - Integrate transcript generation
   - Enhance whiteboard tools

---

## 📚 Documentation References

- **Backend API Complete**: `BACKEND_API_COMPLETE.md`
- **Real Implementation Guide**: `REAL_IMPLEMENTATION_GUIDE.md`
- **Quick Reference**: `QUICK_REFERENCE.md`
- **GraphQL Schema**: `backend/schema/typeDefs.js`
- **Resolvers**: `backend/schema/resolvers.js`

---

**Status: All backend features implemented and ready for testing! 🚀**
