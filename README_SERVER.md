# 📹 Complete Zoom-Like Video Call System

> **A production-ready video calling platform built with Node.js, Express, Socket.IO, MongoDB, and Zustand**

---

## 🎯 What Is This?

A **complete backend system** for building Zoom-like video calling applications with:
- ✅ REST API (25+ endpoints)
- ✅ Socket.IO signaling server
- ✅ MongoDB database
- ✅ JWT authentication
- ✅ Role-based admin panel
- ✅ Zustand state management
- ✅ WebRTC support
- ✅ Real-time chat
- ✅ Screen sharing
- ✅ Full documentation

---

## ⚡ Quick Start (2 minutes)

### 1. Setup Everything
```powershell
.\setup.ps1
```

### 2. Start Backend
```powershell
cd server
npm run dev
```

### 3. Start Frontend (new terminal)
```powershell
cd ZoomChat
npm run dev
```

### 4. Login
- **URL:** http://localhost:3000
- **Admin:** admin@example.com / Admin@123
- **User:** john@example.com / password123

---

## 📚 Documentation

| File | Description |
|------|-------------|
| **[START_HERE.md](START_HERE.md)** | 👈 **Start here!** Complete setup guide with code examples |
| **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** | Quick commands and API reference |
| **[server/README.md](server/README.md)** | Complete API documentation |
| **[server/ARCHITECTURE.md](server/ARCHITECTURE.md)** | System architecture and design |
| **[SYSTEM_COMPLETE.md](SYSTEM_COMPLETE.md)** | Feature summary and overview |

---

## 🚀 Features

### Backend (Node.js + Express + Socket.IO)

**Authentication:**
- User registration & login
- JWT token authentication
- Password hashing (bcrypt)
- Role-based access control
- Profile management

**Admin Panel:**
- User management (CRUD)
- Role assignment (admin/moderator/user)
- Account type management (free/premium/enterprise)
- Ban/unban users
- Room monitoring
- System statistics
- Activity logs

**Room Management:**
- Create public/private/scheduled rooms
- Password-protected rooms
- Join/leave functionality
- Participant management
- Room settings control
- Chat history
- Media state tracking

**Video Calling:**
- WebRTC signaling (offer/answer/ICE)
- Audio/video toggle
- Screen sharing
- Real-time synchronization
- Connection quality monitoring

**Real-time Features:**
- Live chat messaging
- Private messages (DM)
- Emoji reactions
- Whiteboard collaboration
- Participant updates
- Kick/mute functionality

### Frontend (Zustand State Management)

**State Stores:**
- Authentication store
- Room & participants store
- WebRTC & media store
- UI state store

**Service Utilities:**
- REST API client
- Socket.IO client wrapper
- Auto-reconnection
- Event handling

---

## 📁 Project Structure

```
├── server/                  # Backend server
│   ├── controllers/         # Business logic
│   ├── models/             # Database schemas
│   ├── routes/             # API endpoints
│   ├── middleware/         # Auth, validation, errors
│   ├── socket/             # Socket.IO server
│   ├── utils/              # Helper functions
│   ├── config/             # Configuration
│   ├── server.js           # Main server file
│   ├── seed.js             # Database seeder
│   └── README.md           # API documentation
│
├── ZoomChat/               # Frontend application
│   └── src/
│       ├── stores/         # Zustand state management
│       └── lib/            # API & Socket clients
│
├── setup.ps1               # Automated setup script
├── START_HERE.md           # Quick start guide
└── README.md               # This file
```

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register     - Register new user
POST   /api/auth/login        - Login user
POST   /api/auth/logout       - Logout user
GET    /api/auth/me           - Get current user
PUT    /api/auth/update       - Update profile
```

### Rooms
```
POST   /api/rooms                - Create room
GET    /api/rooms                - Get all rooms
GET    /api/rooms/:roomId        - Get room details
POST   /api/rooms/:roomId/join   - Join room
POST   /api/rooms/:roomId/leave  - Leave room
```

### Admin
```
GET    /api/admin/stats          - Dashboard statistics
GET    /api/admin/users          - Get all users
PUT    /api/admin/users/:id/role - Update user role
PUT    /api/admin/users/:id/status - Ban/unban user
GET    /api/admin/rooms          - Get all rooms
```

**Full API documentation:** [server/README.md](server/README.md)

---

## 🔌 Socket.IO Events

### Client → Server
```javascript
join-room              // Join a video room
leave-room             // Leave a room
offer                  // Send WebRTC offer
answer                 // Send WebRTC answer
ice-candidate          // Send ICE candidate
chat-message           // Send chat message
toggle-audio           // Toggle audio on/off
toggle-video           // Toggle video on/off
toggle-screen-share    // Toggle screen sharing
send-emoji             // Send emoji reaction
```

### Server → Client
```javascript
user-joined            // New user joined
user-left              // User left room
offer                  // Received WebRTC offer
answer                 // Received WebRTC answer
ice-candidate          // Received ICE candidate
chat-message           // New chat message
user-audio-toggled     // User toggled audio
user-video-toggled     // User toggled video
emoji-received         // Emoji reaction
```

---

## 💻 Usage Examples

### Authentication
```javascript
import apiClient from '@/lib/api';
import { useAuthStore } from '@/stores';

// Login
const { data } = await apiClient.auth.login({
  email: 'user@example.com',
  password: 'password'
});
useAuthStore.getState().setAuth(data.user, data.token);
```

### Create & Join Room
```javascript
// Create
const room = await apiClient.rooms.create({
  name: 'Team Meeting',
  type: 'private',
  password: 'secret123'
});

// Join
await apiClient.rooms.join(room.roomId, 'secret123');
```

### Socket.IO
```javascript
import socketService from '@/lib/socket';

// Connect
socketService.connect(token);

// Join room
socketService.joinRoom(roomId);

// Send message
socketService.sendMessage(roomId, 'Hello everyone!');
```

---

## 🔐 Default Credentials

After running setup, use these credentials:

**Admin Account:**
```
Email: admin@example.com
Password: Admin@123
```

**Sample Users:**
```
john@example.com / password123 (Free User)
jane@example.com / password123 (Premium User)
bob@example.com / password123 (Moderator)
```

---

## 🛠️ Tech Stack

**Backend:**
- Node.js - JavaScript runtime
- Express.js - Web framework
- Socket.IO - Real-time communication
- MongoDB - NoSQL database
- Mongoose - MongoDB ODM
- JWT - Authentication
- bcryptjs - Password hashing

**Frontend:**
- Next.js - React framework
- Zustand - State management
- Socket.IO Client - Real-time client
- Fetch API - HTTP requests

---

## 📊 Database Models

**User Model:**
- Authentication (email, password, role)
- Profile (name, avatar, settings)
- Account type (free, premium, enterprise)
- Status (active, inactive, banned)
- Statistics (meetings hosted/joined)

**Room Model:**
- Room details (ID, name, type)
- Host and participants
- Settings (chat, screen share, recording)
- Status (waiting, active, ended)
- Duration tracking

**Message Model:**
- Chat messages
- Private messages (DM)
- File sharing support
- Emoji support

**Session Model:**
- User activity tracking
- Connection quality metrics
- Event history
- Analytics data

---

## 🔒 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Role-based authorization
- ✅ Input validation
- ✅ CORS configuration
- ✅ XSS prevention
- ✅ Account banning
- ✅ Protected routes

---

## 📈 What You Get

- ✅ **35+ files** of production-ready code
- ✅ **5,000+ lines** of well-documented code
- ✅ **25+ API endpoints** fully functional
- ✅ **20+ Socket events** for real-time features
- ✅ **4 database models** with indexing
- ✅ **4 Zustand stores** for state management
- ✅ **Complete documentation** with examples
- ✅ **Automated setup** scripts
- ✅ **Database seeder** with sample data

---

## 🎯 Common Tasks

**Start MongoDB:**
```powershell
net start MongoDB
```

**Seed Database:**
```powershell
cd server
npm run seed
```

**Check Server Health:**
```
http://localhost:5000/health
```

**View API Docs:**
```
http://localhost:5000/
```

---

## 📞 Support

- **Getting Started:** Read [START_HERE.md](START_HERE.md)
- **API Reference:** Check [server/README.md](server/README.md)
- **Architecture:** See [server/ARCHITECTURE.md](server/ARCHITECTURE.md)
- **Quick Reference:** View [QUICK_REFERENCE.md](QUICK_REFERENCE.md)

---

## 🎉 Next Steps

1. ✅ Run `.\setup.ps1` to install everything
2. ✅ Start the backend server
3. ✅ Start the frontend application
4. ✅ Login with default credentials
5. ✅ Create your first room
6. ✅ Start building your UI
7. ✅ Customize features as needed

---

## 📄 License

MIT License - Use this for personal or commercial projects

---

## 🌟 Features Summary

| Feature | Status |
|---------|--------|
| User Registration | ✅ |
| Login/Logout | ✅ |
| JWT Authentication | ✅ |
| Role-Based Access | ✅ |
| Admin Panel | ✅ |
| Room Management | ✅ |
| Video Call Signaling | ✅ |
| Real-time Chat | ✅ |
| Screen Sharing | ✅ |
| Whiteboard | ✅ |
| Emoji Reactions | ✅ |
| Private Messages | ✅ |
| Recording Support | ✅ |
| User Management | ✅ |
| MongoDB Database | ✅ |
| Socket.IO Integration | ✅ |
| Zustand Stores | ✅ |
| Complete Documentation | ✅ |

---

**🚀 Your complete video calling system is ready to use!**

Start building your Zoom-like application today! 🎊

---

**Made with ❤️ using Node.js, Express, Socket.IO, MongoDB, and Zustand**
