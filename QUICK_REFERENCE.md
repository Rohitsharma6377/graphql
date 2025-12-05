# 🚀 QUICK REFERENCE CARD

## ⚡ Start Commands

```powershell
# Setup (first time only)
.\setup.ps1

# Start backend
cd server && npm run dev

# Start frontend (new terminal)
cd ZoomChat && npm run dev
```

## 🔐 Default Login

```
Admin:    admin@example.com / Admin@123
User:     john@example.com / password123
```

## 📡 API Endpoints

```
Base URL: http://localhost:5000/api

Auth:     POST /auth/register
          POST /auth/login
          GET  /auth/me

Rooms:    POST /rooms
          GET  /rooms/:roomId
          POST /rooms/:roomId/join

Admin:    GET  /admin/stats
          GET  /admin/users
          PUT  /admin/users/:id/role
```

## 🔌 Socket.IO Events

```javascript
// Emit
socket.emit('join-room', { roomId })
socket.emit('chat-message', { roomId, content })
socket.emit('toggle-audio', { roomId, isAudioOn })

// Listen
socket.on('user-joined', (data) => {})
socket.on('chat-message', (message) => {})
socket.on('user-left', (data) => {})
```

## 💾 Zustand Stores

```javascript
import { useAuthStore, useRoomStore, useCallStore } from '@/stores';

// Auth
const { user, token } = useAuthStore();
const login = useAuthStore((s) => s.setAuth);

// Room
const { currentRoom, participants } = useRoomStore();
const joinRoom = useRoomStore((s) => s.setCurrentRoom);

// Call
const { isAudioOn, toggleAudio } = useCallStore();
```

## 🛠️ Service Usage

```javascript
import apiClient from '@/lib/api';
import socketService from '@/lib/socket';

// API
const data = await apiClient.auth.login({ email, password });
const room = await apiClient.rooms.create({ name, type });

// Socket
socketService.connect(token);
socketService.joinRoom(roomId);
socketService.sendMessage(roomId, 'Hello!');
```

## 📂 Important Files

```
server/server.js          - Main server
server/socket/index.js    - Socket.IO
server/controllers/       - Business logic
server/routes/            - API routes
server/models/            - DB schemas

ZoomChat/src/stores/      - State management
ZoomChat/src/lib/         - API & Socket clients
```

## 🎯 Common Tasks

**Create Room:**
```javascript
const room = await apiClient.rooms.create({
  name: 'Meeting',
  type: 'public',
  maxParticipants: 50
});
```

**Join Room:**
```javascript
await apiClient.rooms.join(roomId, password);
socketService.joinRoom(roomId);
```

**Toggle Media:**
```javascript
useCallStore.getState().toggleAudio();
socketService.toggleAudio(roomId, isAudioOn);
```

**Send Message:**
```javascript
socketService.sendMessage(roomId, 'Hello!');
```

## 📊 Database Collections

```
users       - User accounts
rooms       - Video call rooms
messages    - Chat messages
sessions    - Call sessions
```

## 🔧 Environment Variables

```env
# Server (.env)
PORT=5000
MONGODB_URI=mongodb://localhost:27017/zoom-video-call
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:3000

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 📚 Documentation Files

```
START_HERE.md              - Quick start guide
server/README.md           - API reference
server/ARCHITECTURE.md     - System design
SYSTEM_COMPLETE.md         - Feature summary
```

## 🐛 Troubleshooting

**MongoDB not starting:**
```powershell
net start MongoDB
```

**Port in use:**
```powershell
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**Dependencies:**
```powershell
cd server && npm install
cd ../ZoomChat && npm install
```

## ✅ Testing Checklist

- [ ] Backend running on :5000
- [ ] Frontend running on :3000
- [ ] MongoDB connected
- [ ] Can register user
- [ ] Can login
- [ ] Can create room
- [ ] Can join room
- [ ] Socket.IO connected

## 🎉 You're Ready!

Backend: http://localhost:5000
Frontend: http://localhost:3000
Admin: admin@example.com / Admin@123

Happy coding! 🚀
