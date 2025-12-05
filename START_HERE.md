# 🚀 START HERE - Complete Setup Instructions

## ⚡ Super Quick Start (5 Minutes)

### Prerequisites Check
- ✅ Node.js installed? Run: `node --version` (need v16+)
- ✅ MongoDB installed? Run: `mongod --version`
- ✅ Both installed? Continue below! 👇

### Option 1: Automated Setup (Recommended)

```powershell
# Run this ONE command from the root folder:
.\setup.ps1
```

This will:
- ✅ Install all server dependencies
- ✅ Install all frontend dependencies  
- ✅ Start MongoDB
- ✅ Seed the database with sample data
- ✅ Configure environment files
- ✅ Show you default credentials

### Option 2: Manual Setup

```powershell
# 1. Install server dependencies
cd server
npm install

# 2. Start MongoDB
net start MongoDB

# 3. Seed database
npm run seed

# 4. Install frontend dependencies
cd ../ZoomChat
npm install

# 5. Create frontend .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local
```

## 🎯 Running the Application

### Terminal 1 - Start Backend Server

```powershell
cd server
npm run dev
```

**You'll see:**
```
╔═══════════════════════════════════════╗
║   Video Call Server Running           ║
║   Port: 5000                          ║
║   Environment: development            ║
║   Socket.IO: Enabled                  ║
╚═══════════════════════════════════════╝

MongoDB Connected: localhost:27017
Socket.IO initialized
```

### Terminal 2 - Start Frontend

```powershell
cd ZoomChat
npm run dev
```

**Open:** http://localhost:3000

## 🔐 Login Credentials

### Admin Access
```
Email: admin@example.com
Password: Admin@123
```

**Admin Can:**
- View all users and rooms
- Manage user roles (admin, moderator, user)
- Manage account types (free, premium, enterprise)
- Ban/unban users
- Delete users and rooms
- View system statistics
- Access system logs

### Sample Users
```
User 1: john@example.com / password123 (Free User)
User 2: jane@example.com / password123 (Premium User)
User 3: bob@example.com / password123 (Moderator)
```

## 🧪 Testing the System

### Test 1: Authentication

**Register New User:**
```powershell
curl -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"name\":\"Test User\",\"email\":\"test@test.com\",\"password\":\"password123\"}'
```

**Login:**
```powershell
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@test.com\",\"password\":\"password123\"}'
```

### Test 2: Create Room

```powershell
# Replace YOUR_TOKEN with the token from login response
curl -X POST http://localhost:5000/api/rooms `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -d '{\"name\":\"Test Room\",\"type\":\"public\"}'
```

### Test 3: Join Video Call

1. **Create a room** in Browser 1
2. **Copy the room ID**
3. **Open Browser 2** (or incognito mode)
4. **Login with different user**
5. **Join the room** using room ID
6. **Enable audio/video**
7. **Test screen sharing**
8. **Send chat messages**

## 📚 What's Included

### Backend Server (`server/` folder)

**Complete REST API:**
- ✅ 7 Authentication endpoints
- ✅ 9 Room management endpoints
- ✅ 10 Admin panel endpoints
- ✅ JWT authentication
- ✅ Role-based access control

**Socket.IO Signaling Server:**
- ✅ WebRTC signaling (offer/answer/ICE)
- ✅ Real-time chat
- ✅ Media toggle sync
- ✅ Whiteboard collaboration
- ✅ Emoji reactions
- ✅ Participant management

**Database Models:**
- ✅ User (with roles & account types)
- ✅ Room (with participants & settings)
- ✅ Message (chat & private DM)
- ✅ Session (tracking & analytics)

### Frontend Integration (`ZoomChat/src/` folder)

**Zustand Stores:**
- ✅ `authStore.js` - Authentication state
- ✅ `roomStore.js` - Rooms & participants
- ✅ `callStore.js` - WebRTC & media
- ✅ `uiStore.js` - UI state

**Service Utilities:**
- ✅ `lib/socket.js` - Socket.IO client wrapper
- ✅ `lib/api.js` - REST API client

## 🎨 Using in Your Components

### Example 1: Authentication

```javascript
'use client';
import { useAuthStore } from '@/stores';
import apiClient from '@/lib/api';

export default function LoginForm() {
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLogin = async (email, password) => {
    try {
      const { data } = await apiClient.auth.login({ email, password });
      setAuth(data.user, data.token);
      // Redirect to dashboard
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleLogin(e.target.email.value, e.target.password.value);
    }}>
      <input name="email" type="email" placeholder="Email" />
      <input name="password" type="password" placeholder="Password" />
      <button type="submit">Login</button>
    </form>
  );
}
```

### Example 2: Create Room

```javascript
'use client';
import { useRoomStore } from '@/stores';
import apiClient from '@/lib/api';

export default function CreateRoomButton() {
  const addRoom = useRoomStore((state) => state.addRoom);

  const createRoom = async () => {
    try {
      const { data } = await apiClient.rooms.create({
        name: 'My Meeting',
        type: 'public',
        maxParticipants: 50
      });
      addRoom(data);
      // Navigate to room
    } catch (error) {
      console.error('Create room failed:', error);
    }
  };

  return <button onClick={createRoom}>Create Room</button>;
}
```

### Example 3: Video Call Component

```javascript
'use client';
import { useEffect } from 'react';
import { useAuthStore, useCallStore } from '@/stores';
import socketService from '@/lib/socket';

export default function VideoCall({ roomId }) {
  const { token } = useAuthStore();
  const { isAudioOn, isVideoOn, toggleAudio, toggleVideo } = useCallStore();

  useEffect(() => {
    // Connect socket
    socketService.connect(token);
    
    // Join room
    socketService.joinRoom(roomId);

    return () => {
      socketService.leaveRoom(roomId);
    };
  }, [roomId, token]);

  return (
    <div>
      <video id="localVideo" autoPlay muted />
      <button onClick={() => {
        toggleAudio();
        socketService.toggleAudio(roomId, !isAudioOn);
      }}>
        {isAudioOn ? 'Mute' : 'Unmute'}
      </button>
      <button onClick={() => {
        toggleVideo();
        socketService.toggleVideo(roomId, !isVideoOn);
      }}>
        {isVideoOn ? 'Stop Video' : 'Start Video'}
      </button>
    </div>
  );
}
```

## 📖 API Reference

### Authentication APIs

```javascript
// Register
await apiClient.auth.register({ name, email, password });

// Login
await apiClient.auth.login({ email, password });

// Get current user
await apiClient.auth.getMe();

// Update profile
await apiClient.auth.updateProfile({ name, avatar });

// Change password
await apiClient.auth.updatePassword({ currentPassword, newPassword });

// Logout
await apiClient.auth.logout();
```

### Room APIs

```javascript
// Create room
await apiClient.rooms.create({ name, type, password, maxParticipants });

// Get all rooms
await apiClient.rooms.getAll({ page: 1, limit: 20 });

// Get room details
await apiClient.rooms.getById(roomId);

// Join room
await apiClient.rooms.join(roomId, password);

// Leave room
await apiClient.rooms.leave(roomId);

// Get room messages
await apiClient.rooms.getMessages(roomId, { page: 1, limit: 50 });
```

### Admin APIs

```javascript
// Get dashboard stats
await apiClient.admin.getStats();

// Get all users
await apiClient.admin.getUsers({ page: 1, limit: 20, role: 'user' });

// Update user role
await apiClient.admin.updateUserRole(userId, 'moderator');

// Ban user
await apiClient.admin.updateUserStatus(userId, 'banned');

// Get system logs
await apiClient.admin.getLogs({ page: 1, limit: 50 });
```

## 🔌 Socket.IO Events

### Emit Events (Client → Server)

```javascript
// Join room
socketService.joinRoom(roomId);

// Send chat message
socketService.sendMessage(roomId, 'Hello everyone!');

// Toggle audio
socketService.toggleAudio(roomId, true);

// Send emoji
socketService.sendEmoji(roomId, '👍');

// WebRTC signaling
socketService.sendOffer(userId, offer, roomId);
socketService.sendAnswer(userId, answer, roomId);
socketService.sendIceCandidate(userId, candidate, roomId);
```

### Listen to Events (Server → Client)

```javascript
// Listen for new users
window.addEventListener('custom-event', (e) => {
  // Handle event
});

// Or use the built-in store updates
// Events automatically update Zustand stores
```

## 🗂️ File Structure Overview

```
server/
├── controllers/        # Business logic
├── models/            # Database schemas
├── routes/            # API endpoints
├── middleware/        # Auth, validation, error handling
├── socket/            # Socket.IO server
├── utils/             # Helper functions
├── config/            # Configuration
└── server.js          # Main entry point

ZoomChat/src/
├── stores/            # Zustand state management
├── lib/               # API & Socket clients
└── components/        # Your React components
```

## 🎯 Common Tasks

### Add New API Endpoint

1. Create function in `server/controllers/yourController.js`
2. Add route in `server/routes/yourRoute.js`
3. Add to API client in `ZoomChat/src/lib/api.js`

### Add New Socket Event

1. Add handler in `server/socket/index.js`
2. Add method in `ZoomChat/src/lib/socket.js`
3. Update store if needed

### Add New Database Model

1. Create schema in `server/models/YourModel.js`
2. Export from `server/models/index.js`
3. Use in controllers

## 📞 Support & Documentation

- **📄 API Documentation:** `server/README.md`
- **🏗️ Architecture Guide:** `server/ARCHITECTURE.md`
- **✅ Implementation Status:** `IMPLEMENTATION_COMPLETE.md`
- **⚡ This Guide:** `START_HERE.md`

## 🎉 You're All Set!

Your complete video calling system is ready with:

✅ **Backend:** Node.js + Express + Socket.IO + MongoDB
✅ **Authentication:** JWT with role-based access
✅ **Admin Panel:** Full user & room management
✅ **Video Calling:** WebRTC signaling ready
✅ **Real-time:** Socket.IO for instant updates
✅ **State Management:** Zustand stores configured
✅ **Documentation:** Complete guides & examples

**Start building your Zoom-like application now!** 🚀

---

**Need help?** Check the documentation files listed above or review the code comments.
