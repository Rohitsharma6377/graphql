# Video Call Server - Complete Backend System

A comprehensive Node.js backend for Zoom-like video calling with Express, Socket.IO, and MongoDB.

## 🚀 Features

### Authentication & Authorization
- ✅ User registration and login
- ✅ JWT-based authentication
- ✅ Role-based access control (Admin, Moderator, User)
- ✅ Account types (Free, Premium, Enterprise)
- ✅ User status management (Active, Inactive, Banned)

### Admin Panel
- ✅ Complete dashboard with statistics
- ✅ User management (CRUD operations)
- ✅ Role management
- ✅ Account type management
- ✅ Room management
- ✅ System logs and analytics
- ✅ Ban/unban users

### Room Management
- ✅ Create public/private/scheduled rooms
- ✅ Join/leave rooms
- ✅ Room password protection
- ✅ Participant management
- ✅ Room settings control
- ✅ End room functionality

### Video Calling Features
- ✅ WebRTC signaling server
- ✅ Audio/video toggle
- ✅ Screen sharing
- ✅ Real-time chat
- ✅ Private messaging
- ✅ Emoji reactions
- ✅ Whiteboard collaboration
- ✅ Recording support
- ✅ Participant media controls

### Real-time Communication
- ✅ Socket.IO integration
- ✅ WebRTC peer-to-peer connections
- ✅ ICE candidate exchange
- ✅ Offer/Answer signaling
- ✅ Connection quality monitoring

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Setup

1. **Install Dependencies**
```bash
cd server
npm install
```

2. **Configure Environment**
```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env with your configuration
# Important: Change JWT_SECRET in production!
```

3. **Start MongoDB**
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

4. **Seed Database (Optional)**
```bash
npm run seed
```

5. **Start Server**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📚 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/register` | Register new user | Public |
| POST | `/login` | Login user | Public |
| POST | `/logout` | Logout user | Private |
| GET | `/me` | Get current user | Private |
| PUT | `/update` | Update profile | Private |
| PUT | `/update-password` | Change password | Private |
| PUT | `/settings` | Update settings | Private |

### Room Routes (`/api/rooms`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/` | Create room | Private |
| GET | `/` | Get all rooms | Private |
| GET | `/:roomId` | Get room details | Private |
| POST | `/:roomId/join` | Join room | Private |
| POST | `/:roomId/leave` | Leave room | Private |
| PUT | `/:roomId/settings` | Update settings | Host only |
| POST | `/:roomId/end` | End room | Host only |
| GET | `/:roomId/messages` | Get messages | Private |
| PUT | `/:roomId/participants/:userId/media` | Update media status | Private |

### Admin Routes (`/api/admin`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/stats` | Dashboard stats | Admin |
| GET | `/logs` | System logs | Admin |
| GET | `/users` | Get all users | Admin |
| GET | `/users/:id` | Get user details | Admin |
| PUT | `/users/:id/role` | Update user role | Admin |
| PUT | `/users/:id/account-type` | Update account type | Admin |
| PUT | `/users/:id/status` | Ban/unban user | Admin |
| DELETE | `/users/:id` | Delete user | Admin |
| GET | `/rooms` | Get all rooms | Admin |
| DELETE | `/rooms/:id` | Delete room | Admin |

## 🔌 Socket.IO Events

### Client → Server

| Event | Data | Description |
|-------|------|-------------|
| `join-room` | `{ roomId }` | Join a room |
| `leave-room` | `{ roomId }` | Leave a room |
| `offer` | `{ to, offer, roomId }` | Send WebRTC offer |
| `answer` | `{ to, answer, roomId }` | Send WebRTC answer |
| `ice-candidate` | `{ to, candidate, roomId }` | Send ICE candidate |
| `chat-message` | `{ roomId, content, type }` | Send chat message |
| `toggle-audio` | `{ roomId, isAudioOn }` | Toggle audio |
| `toggle-video` | `{ roomId, isVideoOn }` | Toggle video |
| `toggle-screen-share` | `{ roomId, isScreenSharing }` | Toggle screen share |
| `send-emoji` | `{ roomId, emoji }` | Send emoji reaction |
| `whiteboard-draw` | `{ roomId, drawData }` | Draw on whiteboard |

### Server → Client

| Event | Data | Description |
|-------|------|-------------|
| `user-joined` | `{ userId, user, socketId }` | User joined room |
| `user-left` | `{ userId }` | User left room |
| `offer` | `{ from, offer, user }` | Received WebRTC offer |
| `answer` | `{ from, answer }` | Received WebRTC answer |
| `ice-candidate` | `{ from, candidate }` | Received ICE candidate |
| `chat-message` | `{ message }` | New chat message |
| `user-audio-toggled` | `{ userId, isAudioOn }` | User toggled audio |
| `user-video-toggled` | `{ userId, isVideoOn }` | User toggled video |
| `user-screen-share-toggled` | `{ userId, isScreenSharing }` | User toggled screen share |
| `emoji-received` | `{ userId, userName, emoji }` | Emoji reaction |
| `kicked-from-room` | `{ roomId }` | Kicked by host |
| `force-muted` | `{ roomId }` | Muted by host |

## 🗄️ Database Models

### User Model
- Name, Email, Password (hashed)
- Role (user, admin, moderator)
- Account Type (free, premium, enterprise)
- Status (active, inactive, banned)
- Settings (notifications, audio/video preferences)
- Stats (meetings hosted/joined, total minutes)

### Room Model
- Room ID, Name, Host
- Type (public, private, scheduled)
- Participants with roles and media states
- Settings (chat, screen share, recording, etc.)
- Status (waiting, active, ended)
- Duration tracking

### Message Model
- Room reference
- Sender reference
- Content, Type (text, file, emoji, system)
- Private messaging support

### Session Model
- User and Room references
- Join/leave timestamps
- Duration
- Connection quality metrics
- Event history

## 🎯 Usage Examples

### Register & Login
```javascript
// Register
const response = await fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123'
  })
});

// Login
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'password123'
  })
});
```

### Create & Join Room
```javascript
// Create room
const response = await fetch('http://localhost:5000/api/rooms', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'Team Meeting',
    type: 'private',
    password: 'meeting123',
    maxParticipants: 50
  })
});

// Join room
const response = await fetch('http://localhost:5000/api/rooms/room-id/join', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    password: 'meeting123'
  })
});
```

### Socket.IO Connection
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token'
  }
});

// Join room
socket.emit('join-room', { roomId: 'room-id' });

// Listen for new users
socket.on('user-joined', (data) => {
  console.log('User joined:', data.user.name);
});

// Send WebRTC offer
socket.emit('offer', {
  to: 'user-id',
  offer: rtcOffer,
  roomId: 'room-id'
});
```

## 🔐 Security Features

- Password hashing with bcrypt
- JWT authentication
- Role-based access control
- Input validation
- CORS configuration
- Rate limiting ready
- SQL injection prevention (MongoDB)
- XSS protection

## 📊 Admin Panel Features

The admin panel provides:
- Real-time dashboard statistics
- User management (view, edit, delete, ban)
- Role assignment
- Account type management
- Room monitoring
- System logs
- Analytics and reports

## 🌟 Best Practices Implemented

- ✅ MVC architecture (Models, Controllers, Routes)
- ✅ Middleware pattern
- ✅ Error handling
- ✅ Input validation
- ✅ Environment configuration
- ✅ Database indexing
- ✅ Password security
- ✅ Token management
- ✅ RESTful API design
- ✅ Socket.IO namespacing
- ✅ Code organization

## 🚀 Production Deployment

### Environment Variables
```env
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=strong-random-secret-key
NODE_ENV=production
CLIENT_URL=https://your-frontend-domain.com
```

### PM2 Deployment
```bash
npm install -g pm2
pm2 start server.js --name video-call-server
pm2 save
pm2 startup
```

## 📝 Default Credentials

After running `npm run seed`:

**Admin:**
- Email: admin@example.com
- Password: Admin@123

**Sample Users:**
- john@example.com / password123
- jane@example.com / password123
- bob@example.com / password123

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Real-time:** Socket.IO
- **Authentication:** JWT (jsonwebtoken)
- **Security:** bcryptjs, cors
- **Validation:** express-validator
- **WebRTC:** Native browser APIs

## 📞 Support

For issues or questions, please create an issue in the repository.

## 📄 License

MIT License
