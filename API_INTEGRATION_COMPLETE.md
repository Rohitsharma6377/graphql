# 🚀 Complete API Integration Guide

## ✅ All APIs Are Now Integrated!

Your HeartShare video calling application now has complete backend integration with Zustand state management.

---

## 📋 What's Been Integrated

### 1. **Authentication System** ✅
- ✅ Login page (`/auth/login`) - Uses `authStore.login()`
- ✅ Register page (`/auth/register`) - Uses `authStore.register()`
- ✅ Automatic role-based redirect (Admin → `/admin`, User → `/chat`)
- ✅ JWT token management with localStorage persistence
- ✅ Protected routes with authentication checks

### 2. **Admin Panel** ✅
- ✅ Dashboard (`/admin`) - Uses `adminStore.fetchStats()`
- ✅ Users Management (`/admin/users`) - Full CRUD operations
  - View all users with pagination
  - Update user roles (user, moderator, admin)
  - Update account types (free, premium, enterprise)
  - Ban/unban users
  - Delete users
- ✅ Rooms Management (`/admin/rooms`) - Room monitoring
  - View all active rooms
  - Delete rooms
  - Real-time updates (auto-refresh every 5s)
- ✅ Role-based access control (admin only)

### 3. **Room Management** ✅
- ✅ Create rooms - Uses `roomStore.createRoom()`
- ✅ Join rooms - Uses `roomStore.joinRoom()`
- ✅ Fetch available rooms - Uses `roomStore.fetchRooms()`
- ✅ Room history tracking
- ✅ Real-time participant updates

### 4. **State Management** ✅
- ✅ **authStore** - User authentication & profile
- ✅ **roomStore** - Room & participant management
- ✅ **adminStore** - Admin panel operations
- ✅ **callStore** - WebRTC & media controls
- ✅ **uiStore** - Interface state

---

## 🎯 Quick Start

### Step 1: Install Dependencies

```powershell
# Backend
cd server
npm install

# Frontend
cd ..\ZoomChat
npm install
```

### Step 2: Setup Environment Variables

**Backend** (`server/.env`):
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/heartshare
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=30d
CORS_ORIGIN=http://localhost:3000
```

**Frontend** (`ZoomChat/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### Step 3: Start MongoDB

```powershell
# Make sure MongoDB is running
mongod
```

### Step 4: Seed Database (Optional)

```powershell
cd server
node seed.js
```

**Default Admin Account:**
- Email: `admin@example.com`
- Password: `Admin@123`

### Step 5: Start Backend Server

```powershell
cd server
npm run dev
```

Server will start at: `http://localhost:5000`

### Step 6: Start Frontend

```powershell
cd ZoomChat
npm run dev
```

Frontend will start at: `http://localhost:3000`

---

## 🔑 Authentication Flow

### Login
```typescript
import { useAuthStore } from '@/stores';

function LoginComponent() {
  const { login, loading, error } = useAuthStore();

  const handleLogin = async () => {
    try {
      await login({ 
        email: 'user@example.com', 
        password: 'password123' 
      });
      // Automatic redirect based on role
    } catch (err) {
      console.error('Login failed:', err);
    }
  };
}
```

### Register
```typescript
const { register, loading, error } = useAuthStore();

await register({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123'
});
```

### Logout
```typescript
const { logoutUser } = useAuthStore();

await logoutUser();
```

---

## 🏠 Room Management Flow

### Create Room
```typescript
import { useRoomStore } from '@/stores';

function CreateRoomComponent() {
  const { createRoom, loading } = useRoomStore();

  const handleCreate = async () => {
    try {
      const room = await createRoom({
        name: 'My Video Room',
        type: 'public',
        maxParticipants: 50,
        settings: {
          allowChat: true,
          allowScreenShare: true,
          waitingRoom: false
        }
      });
      
      // Navigate to room
      router.push(`/room/${room._id}`);
    } catch (err) {
      console.error('Failed to create room:', err);
    }
  };
}
```

### Join Room
```typescript
const { joinRoom, currentRoom } = useRoomStore();

await joinRoom('room-id-123', 'optional-password');
console.log('Joined room:', currentRoom);
```

### Fetch Available Rooms
```typescript
const { fetchRooms, rooms, pagination } = useRoomStore();

await fetchRooms({ 
  page: 1, 
  limit: 20, 
  type: 'public',
  status: 'active' 
});

console.log('Rooms:', rooms);
console.log('Total:', pagination.total);
```

---

## 👑 Admin Panel Operations

### Fetch Dashboard Stats
```typescript
import { useAdminStore } from '@/stores';

function AdminDashboard() {
  const { stats, fetchStats } = useAdminStore();

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div>
      <h1>Total Users: {stats?.overview.totalUsers}</h1>
      <h2>Active Users: {stats?.overview.activeUsers}</h2>
      <h2>Total Rooms: {stats?.overview.totalRooms}</h2>
    </div>
  );
}
```

### Manage Users
```typescript
const { 
  users, 
  fetchUsers, 
  updateUserRole, 
  updateUserAccountType,
  banUser, 
  unbanUser,
  deleteUser 
} = useAdminStore();

// Fetch users
await fetchUsers({ page: 1, limit: 20, role: 'user' });

// Update user role
await updateUserRole('user-id', 'moderator');

// Update account type
await updateUserAccountType('user-id', 'premium');

// Ban user
await banUser('user-id');

// Unban user
await unbanUser('user-id');

// Delete user
await deleteUser('user-id');
```

### Manage Rooms
```typescript
const { rooms, fetchRooms, deleteRoom } = useAdminStore();

// Fetch all rooms
await fetchRooms({ page: 1, limit: 20, status: 'active' });

// Delete room
await deleteRoom('room-id');
```

---

## 🔗 API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatedetails` - Update profile
- `PUT /api/auth/updatepassword` - Change password
- `PUT /api/auth/updatesettings` - Update settings

### Rooms
- `POST /api/rooms` - Create room
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/:id` - Get room by ID
- `POST /api/rooms/:id/join` - Join room
- `POST /api/rooms/:id/leave` - Leave room
- `PUT /api/rooms/:id/settings` - Update room settings
- `POST /api/rooms/:id/end` - End room
- `GET /api/rooms/:id/messages` - Get room messages
- `PUT /api/rooms/:id/participant/:userId/media` - Update participant media

### Admin (Protected - Admin Only)
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get user details
- `PUT /api/admin/users/:id/role` - Update user role
- `PUT /api/admin/users/:id/account-type` - Update account type
- `PUT /api/admin/users/:id/status` - Ban/unban user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/rooms` - Get all rooms
- `DELETE /api/admin/rooms/:id` - Delete room
- `GET /api/admin/logs` - Get system logs

---

## 🔌 Socket.IO Events

### Client → Server
- `join-room` - Join a room
- `leave-room` - Leave a room
- `offer` - Send WebRTC offer
- `answer` - Send WebRTC answer
- `ice-candidate` - Send ICE candidate
- `chat-message` - Send chat message
- `toggle-audio` - Toggle audio state
- `toggle-video` - Toggle video state
- `screen-share-started` - Screen share started
- `screen-share-stopped` - Screen share stopped
- `emoji` - Send emoji reaction
- `whiteboard-draw` - Whiteboard drawing
- `kick-participant` - Kick participant (host only)

### Server → Client
- `user-connected` - New user joined
- `user-disconnected` - User left
- `offer` - Receive WebRTC offer
- `answer` - Receive WebRTC answer
- `ice-candidate` - Receive ICE candidate
- `chat-message` - Receive chat message
- `participant-audio-toggled` - Audio state changed
- `participant-video-toggled` - Video state changed
- `screen-share-started` - Screen share started
- `screen-share-stopped` - Screen share stopped
- `emoji` - Receive emoji reaction
- `whiteboard-draw` - Whiteboard drawing received
- `you-were-kicked` - You were kicked from room

---

## 📁 File Structure

```
ZoomChat/
├── src/
│   ├── app/
│   │   ├── auth/
│   │   │   ├── login/page.tsx        ✅ Integrated
│   │   │   └── register/page.tsx     ✅ Integrated
│   │   ├── admin/
│   │   │   ├── page.tsx              ✅ Integrated (Dashboard)
│   │   │   ├── users/page.tsx        ✅ Integrated (Users Management)
│   │   │   └── rooms/page.tsx        ✅ Integrated (Rooms Management)
│   │   ├── chat/page.tsx             ✅ Integrated (Room Creation/Join)
│   │   └── room/[roomId]/page.tsx    ⏳ Ready for integration
│   ├── stores/
│   │   ├── authStore.js              ✅ Complete
│   │   ├── roomStore.js              ✅ Complete
│   │   ├── adminStore.js             ✅ Complete
│   │   ├── callStore.js              ✅ Complete
│   │   ├── uiStore.js                ✅ Complete
│   │   └── index.js                  ✅ Complete
│   ├── lib/
│   │   └── api.js                    ✅ Complete (REST API client)
│   └── config/
│       └── api.js                    ✅ Complete (API configuration)

server/
├── controllers/
│   ├── authController.js             ✅ Complete
│   ├── adminController.js            ✅ Complete
│   └── roomController.js             ✅ Complete
├── routes/
│   ├── auth.js                       ✅ Complete
│   ├── admin.js                      ✅ Complete
│   └── rooms.js                      ✅ Complete
├── models/
│   ├── User.js                       ✅ Complete
│   ├── Room.js                       ✅ Complete
│   ├── Message.js                    ✅ Complete
│   └── Session.js                    ✅ Complete
├── socket/
│   └── index.js                      ✅ Complete (Socket.IO server)
└── server.js                         ✅ Complete (Main server)
```

---

## 🧪 Testing the Integration

### 1. Test Authentication
```bash
# Terminal 1 - Start backend
cd server
npm run dev

# Terminal 2 - Start frontend
cd ZoomChat
npm run dev
```

- Visit `http://localhost:3000/auth/register`
- Create a new account
- Should redirect to `/chat` after registration
- Logout and login again

### 2. Test Admin Panel
- Login with admin account:
  - Email: `admin@example.com`
  - Password: `Admin@123`
- Should redirect to `/admin`
- Check dashboard stats
- Navigate to Users page - view/edit users
- Navigate to Rooms page - view active rooms

### 3. Test Room Creation
- Login as regular user
- Go to `/chat`
- Click "Create Room"
- Enter room name
- Should create room and redirect to `/room/:id`

### 4. Test Room Join
- Open two browser windows
- Window 1: Create a room
- Window 2: Join the same room using room ID
- Both users should see each other

---

## 🐛 Common Issues & Solutions

### Issue: Cannot connect to backend
**Solution:** Check that backend is running on port 5000
```powershell
cd server
npm run dev
```

### Issue: MongoDB connection failed
**Solution:** Ensure MongoDB is running
```powershell
mongod
```

### Issue: CORS errors
**Solution:** Check `.env` file in server:
```env
CORS_ORIGIN=http://localhost:3000
```

### Issue: 401 Unauthorized
**Solution:** Token may be expired or invalid. Logout and login again.

### Issue: Admin routes not accessible
**Solution:** Ensure user has admin role. Use seeded admin account or update user role in MongoDB.

---

## 📚 Additional Resources

- **ZUSTAND_GUIDE.md** - Complete Zustand stores documentation
- **BACKEND_API_COMPLETE.md** - Backend API reference
- **COMPLETE_GUIDE.md** - Full system documentation

---

## 🎉 Success!

Your application now has:
- ✅ Complete authentication system
- ✅ Admin panel with full CRUD operations
- ✅ Room management with real-time updates
- ✅ Zustand state management integrated
- ✅ Backend API fully connected
- ✅ Socket.IO real-time communication ready
- ✅ Role-based access control
- ✅ JWT token authentication

**Next Steps:**
1. Start both servers (backend & frontend)
2. Test authentication flow
3. Test admin panel operations
4. Create and join rooms
5. Build out the video calling features in `/room/[roomId]` page

Happy coding! 💕
