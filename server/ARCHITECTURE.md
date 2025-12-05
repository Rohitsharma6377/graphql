# Video Call System - Architecture & Features

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Zustand    │  │  Socket.IO   │  │   WebRTC     │ │
│  │   Stores     │  │   Client     │  │   Manager    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/WS
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  BACKEND (Node.js/Express)              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  REST API    │  │  Socket.IO   │  │     JWT      │ │
│  │  Routes      │  │   Server     │  │     Auth     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Controllers  │  │  Middleware  │  │   Models     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                            │
                            │ Mongoose
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    DATABASE (MongoDB)                    │
│     Users │ Rooms │ Messages │ Sessions                 │
└─────────────────────────────────────────────────────────┘
```

## 📁 Server Folder Structure

```
server/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── adminController.js   # Admin panel logic
│   ├── roomController.js    # Room management logic
│   └── index.js            # Export all controllers
├── middleware/
│   ├── auth.js             # JWT & role verification
│   ├── error.js            # Error handling
│   ├── validator.js        # Input validation
│   └── index.js            # Export middleware
├── models/
│   ├── User.js             # User schema
│   ├── Room.js             # Room schema
│   ├── Message.js          # Message schema
│   ├── Session.js          # Session schema
│   └── index.js            # Export models
├── routes/
│   ├── auth.js             # Auth routes
│   ├── admin.js            # Admin routes
│   ├── rooms.js            # Room routes
│   └── index.js            # Mount all routes
├── socket/
│   └── index.js            # Socket.IO server
├── utils/
│   ├── auth.js             # Auth utilities
│   ├── helpers.js          # Helper functions
│   └── index.js            # Export utils
├── .env                     # Environment variables
├── .env.example            # Example env file
├── .gitignore              # Git ignore
├── package.json            # Dependencies
├── server.js               # Main server file
├── seed.js                 # Database seeder
└── README.md               # Documentation
```

## 🎯 Key Features Implemented

### 1. Authentication & Authorization ✅

**Files:**
- `controllers/authController.js`
- `middleware/auth.js`
- `models/User.js`

**Features:**
- User registration with validation
- Login with JWT tokens
- Password hashing with bcrypt
- Role-based access (admin, moderator, user)
- Account types (free, premium, enterprise)
- User status management (active, inactive, banned)
- Profile updates
- Password change
- Settings management

**API Endpoints:**
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
PUT    /api/auth/update
PUT    /api/auth/update-password
PUT    /api/auth/settings
```

### 2. Admin Panel ✅

**Files:**
- `controllers/adminController.js`
- `routes/admin.js`

**Features:**
- Dashboard statistics (users, rooms, sessions)
- User management (CRUD)
- Role assignment
- Account type management
- Ban/unban users
- Room monitoring
- System logs
- Analytics

**API Endpoints:**
```
GET    /api/admin/stats
GET    /api/admin/logs
GET    /api/admin/users
GET    /api/admin/users/:id
PUT    /api/admin/users/:id/role
PUT    /api/admin/users/:id/account-type
PUT    /api/admin/users/:id/status
DELETE /api/admin/users/:id
GET    /api/admin/rooms
DELETE /api/admin/rooms/:id
```

### 3. Room Management ✅

**Files:**
- `controllers/roomController.js`
- `models/Room.js`

**Features:**
- Create rooms (public/private/scheduled)
- Join/leave rooms
- Password protection
- Participant management
- Room settings
- End room
- Chat messages
- Media state tracking

**API Endpoints:**
```
POST   /api/rooms
GET    /api/rooms
GET    /api/rooms/:roomId
POST   /api/rooms/:roomId/join
POST   /api/rooms/:roomId/leave
PUT    /api/rooms/:roomId/settings
POST   /api/rooms/:roomId/end
GET    /api/rooms/:roomId/messages
PUT    /api/rooms/:roomId/participants/:userId/media
```

### 4. Socket.IO Signaling Server ✅

**Files:**
- `socket/index.js`

**Features:**
- WebRTC signaling (offer/answer/ICE)
- Real-time room events
- Chat messaging
- Media toggle events
- Emoji reactions
- Whiteboard sync
- Participant management
- Kick/mute functionality
- Connection management

**Socket Events:**
```javascript
// Client → Server
join-room, leave-room, offer, answer, ice-candidate
chat-message, toggle-audio, toggle-video, toggle-screen-share
send-emoji, whiteboard-draw, whiteboard-clear
kick-participant, mute-participant

// Server → Client
user-joined, user-left, offer, answer, ice-candidate
chat-message, user-audio-toggled, user-video-toggled
emoji-received, whiteboard-draw, kicked-from-room, force-muted
```

### 5. Frontend Integration ✅

**Zustand Stores:**
- `authStore.js` - Authentication state
- `roomStore.js` - Room & participants state
- `callStore.js` - WebRTC & media state
- `uiStore.js` - UI state management

**Services:**
- `socket.js` - Socket.IO client wrapper
- `api.js` - REST API client

## 🔐 Security Features

1. **Password Security**
   - bcrypt hashing (10 rounds)
   - No plain text storage
   - Password validation

2. **JWT Authentication**
   - Token-based auth
   - Automatic expiration
   - Refresh capability

3. **Authorization**
   - Role-based access control
   - Account type restrictions
   - Route protection

4. **Input Validation**
   - express-validator
   - Schema validation
   - XSS prevention

5. **CORS**
   - Configured origins
   - Credential support
   - Method restrictions

## 📊 Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: Enum ['user', 'admin', 'moderator'],
  accountType: Enum ['free', 'premium', 'enterprise'],
  status: Enum ['active', 'inactive', 'banned'],
  isOnline: Boolean,
  socketId: String,
  settings: Object,
  stats: Object
}
```

### Room Model
```javascript
{
  roomId: String (unique),
  name: String,
  host: ObjectId (User),
  type: Enum ['public', 'private', 'scheduled'],
  password: String,
  maxParticipants: Number,
  participants: Array,
  settings: Object,
  status: Enum ['waiting', 'active', 'ended'],
  scheduledTime: Date,
  duration: Number
}
```

### Message Model
```javascript
{
  room: ObjectId (Room),
  sender: ObjectId (User),
  content: String,
  type: Enum ['text', 'file', 'emoji', 'system'],
  isPrivate: Boolean,
  recipientId: ObjectId (User)
}
```

### Session Model
```javascript
{
  user: ObjectId (User),
  room: ObjectId (Room),
  joinedAt: Date,
  leftAt: Date,
  duration: Number,
  quality: Object,
  events: Array
}
```

## 🚀 Performance Optimizations

1. **Database Indexing**
   - User email (unique)
   - Room roomId (unique)
   - Message room + createdAt
   - Session user + room

2. **Pagination**
   - All list endpoints paginated
   - Configurable page size
   - Total count included

3. **Query Optimization**
   - Populate only needed fields
   - Projection for large documents
   - Aggregation pipelines

4. **Connection Pooling**
   - Mongoose connection pool
   - Socket.IO connection management

## 📝 Environment Variables

```env
PORT=5000                                    # Server port
MONGODB_URI=mongodb://localhost:27017/db    # MongoDB connection
JWT_SECRET=secret-key                       # JWT signing key
JWT_EXPIRE=7d                               # Token expiration
NODE_ENV=development                        # Environment
ADMIN_EMAIL=admin@example.com              # Admin email
ADMIN_PASSWORD=Admin@123                   # Admin password
CLIENT_URL=http://localhost:3000           # Frontend URL
```

## 🧪 Testing the System

### 1. Test Authentication
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
```

### 2. Test Room Creation
```bash
curl -X POST http://localhost:5000/api/rooms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"Test Room","type":"public"}'
```

### 3. Test Socket.IO
```javascript
const socket = io('http://localhost:5000', {
  auth: { token: 'YOUR_TOKEN' }
});

socket.on('connect', () => {
  console.log('Connected!');
  socket.emit('join-room', { roomId: 'room-id' });
});
```

## 🎨 Customization Guide

### Add New API Endpoint

1. Create controller function in `controllers/`
2. Add route in `routes/`
3. Add validation if needed
4. Update README documentation

### Add New Socket Event

1. Add event handler in `socket/index.js`
2. Update client in `ZoomChat/src/lib/socket.js`
3. Document the event

### Add New Database Model

1. Create model in `models/`
2. Export from `models/index.js`
3. Create controller if needed
4. Add routes

## 📦 Production Deployment

### Using PM2
```bash
npm install -g pm2
pm2 start server.js --name video-call-server
pm2 save
pm2 startup
```

### Using Docker
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Environment Setup
- Set NODE_ENV=production
- Use strong JWT_SECRET
- Configure MongoDB Atlas
- Set up SSL/TLS
- Configure firewall
- Enable rate limiting

## 🎯 Future Enhancements

- [ ] File upload for avatars
- [ ] Video recording storage
- [ ] Email notifications
- [ ] Payment integration
- [ ] Analytics dashboard
- [ ] Mobile app support
- [ ] AI features (noise cancellation, background blur)
- [ ] End-to-end encryption
- [ ] Breakout rooms
- [ ] Polls and Q&A

## 📞 Support & Documentation

- **Server Docs:** `server/README.md`
- **Quick Start:** `QUICK_START.md`
- **API Reference:** See server README
- **Socket Events:** See socket/index.js

---

**Built with:** Node.js, Express, Socket.IO, MongoDB, Mongoose, JWT, bcrypt, Zustand

**License:** MIT
