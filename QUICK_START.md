# Quick Start Guide - Video Call System

## 🚀 Quick Setup (5 minutes)

### 1. Install Dependencies

```powershell
# Navigate to server folder
cd server

# Install server dependencies
npm install

# Go back and install frontend dependencies
cd ../ZoomChat
npm install
```

### 2. Setup MongoDB

```powershell
# Start MongoDB (if not running)
net start MongoDB

# Or install MongoDB from: https://www.mongodb.com/try/download/community
```

### 3. Configure Server

```powershell
# Server already has .env file configured
# Default settings:
# - PORT: 5000
# - MongoDB: mongodb://localhost:27017/zoom-video-call
# - Admin: admin@example.com / Admin@123
```

### 4. Seed Database

```powershell
cd server
npm run seed
```

**You'll see:**
```
✅ Database seeded successfully!

Login credentials:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Admin:
  Email: admin@example.com
  Password: Admin@123

Sample Users:
  John Doe: john@example.com / password123
  Jane Smith: jane@example.com / password123
  Bob Wilson: bob@example.com / password123
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 5. Start Server

```powershell
# Development mode (auto-reload)
npm run dev

# Or production mode
npm start
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

### 6. Configure Frontend

```powershell
cd ../ZoomChat

# Create .env.local if not exists
# Add this line:
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 7. Start Frontend

```powershell
npm run dev
```

**Open:** http://localhost:3000

## 🎯 Test the System

### Test Authentication
1. Go to http://localhost:3000
2. Register a new user or login with:
   - Email: `john@example.com`
   - Password: `password123`

### Test Video Call
1. Create a new room
2. Copy the room ID
3. Open another browser/incognito window
4. Login with different user
5. Join the room using the room ID
6. Test audio/video/screen sharing

### Test Admin Panel
1. Login with admin credentials:
   - Email: `admin@example.com`
   - Password: `Admin@123`
2. Access admin dashboard
3. View users, rooms, statistics

## 📡 API Testing

### Test with Postman/Thunder Client

**Register User:**
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

**Login:**
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

**Create Room:**
```http
POST http://localhost:5000/api/rooms
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "My Test Room",
  "type": "public",
  "maxParticipants": 50
}
```

**Get Rooms:**
```http
GET http://localhost:5000/api/rooms
Authorization: Bearer YOUR_TOKEN_HERE
```

## 🔧 Common Issues

### MongoDB not starting
```powershell
# Check if MongoDB is installed
mongod --version

# Start MongoDB service
net start MongoDB
```

### Port already in use
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

### Dependencies issues
```powershell
# Clear cache and reinstall
rm -r node_modules
rm package-lock.json
npm install
```

## 📚 Features Overview

### ✅ Complete Features

1. **Authentication System**
   - Register/Login/Logout
   - JWT tokens
   - Password hashing
   - Role-based access

2. **Video Calling**
   - WebRTC peer connections
   - Audio/Video toggle
   - Screen sharing
   - Real-time signaling

3. **Room Management**
   - Create/Join/Leave rooms
   - Public/Private rooms
   - Password protection
   - Participant management

4. **Chat System**
   - Real-time messaging
   - Private messages
   - Emoji support
   - File sharing ready

5. **Admin Panel**
   - User management
   - Room monitoring
   - System statistics
   - Role assignment

6. **Real-time Features**
   - Socket.IO integration
   - Live participant updates
   - Connection status
   - Quality monitoring

## 🎨 Frontend Integration

### Using Zustand Stores

```javascript
import { useAuthStore, useRoomStore, useCallStore } from '@/stores';

// In your component
const { user, token, isAuthenticated } = useAuthStore();
const { currentRoom, participants, messages } = useRoomStore();
const { isAudioOn, isVideoOn, toggleAudio } = useCallStore();
```

### Using Socket Service

```javascript
import socketService from '@/lib/socket';

// Connect
const { token } = useAuthStore.getState();
socketService.connect(token);

// Join room
socketService.joinRoom(roomId);

// Send message
socketService.sendMessage(roomId, 'Hello!');
```

### Using API Client

```javascript
import apiClient from '@/lib/api';

// Login
const { data } = await apiClient.auth.login({
  email: 'user@example.com',
  password: 'password'
});

// Create room
const room = await apiClient.rooms.create({
  name: 'My Room',
  type: 'public'
});
```

## 🚀 Next Steps

1. **Customize the UI** - Update components in `ZoomChat/src/components`
2. **Add Features** - Extend controllers in `server/controllers`
3. **Configure Production** - Update `.env` for production
4. **Deploy** - Use PM2, Docker, or cloud services

## 📞 Support

- Check `server/README.md` for detailed API docs
- Review code comments for implementation details
- Test with provided credentials

## 🎉 You're Ready!

Your complete video calling system is now running with:
- ✅ Backend API on port 5000
- ✅ Socket.IO signaling server
- ✅ MongoDB database
- ✅ Admin panel
- ✅ Zustand state management
- ✅ Full authentication system

Start building your Zoom-like application! 🚀
