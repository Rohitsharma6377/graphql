# 🎯 Admin Panel Documentation

## Overview
Complete admin panel for managing users, rooms, and system settings in HeartShare video chat application.

## Features

### ✅ Dashboard (`/admin`)
- Total users count
- Premium users statistics
- Active rooms monitoring
- Banned users tracking
- Revenue from premium subscriptions
- New users in last 7 days
- Quick action links

### 👥 Users Management (`/admin/users`)
- View all users with details
- Change user roles (User / Premium / Admin)
- Ban/Unban users
- View user coins
- Sort and filter users
- Real-time updates

### 🎥 Rooms Management (`/admin/rooms`)
- View all active rooms
- See room participants count
- Force close any room
- View room details
- Auto-refresh every 5 seconds

### ⚙️ System Settings (`/admin/settings`)
- Toggle advertisements
- Set premium pricing
- Configure max participants for free users
- Set default coin rewards
- Save settings globally

## API Endpoints

### Stats
```
GET /api/admin/stats
```
Returns overall system statistics

### Users
```
GET /api/admin/users
```
Get all users with statistics

```
PATCH /api/admin/user/[id]/role
Body: { role: "user" | "premium" | "admin" }
```
Update user role

```
PATCH /api/admin/user/[id]/ban
Body: { banned: boolean }
```
Ban or unban a user

### Rooms
```
GET /api/admin/rooms
```
Get all active rooms

```
GET /api/admin/room/[roomId]
```
Get specific room details

```
PATCH /api/admin/room/[roomId]/close
```
Force close a room

### Settings
```
GET /api/admin/settings
```
Get current settings

```
PATCH /api/admin/settings
Body: { adsEnabled, premiumPrice, maxParticipantsFree, defaultCoinReward }
```
Update system settings

## Database Models

### User
```typescript
{
  name: string
  email: string
  password: string
  avatar?: string
  role: 'user' | 'premium' | 'admin'
  banned: boolean
  coins: number
  createdAt: Date
}
```

### Room
```typescript
{
  roomId: string
  host: ObjectId (User)
  participants: [{
    userId: ObjectId (User)
    role: 'host' | 'speaker' | 'viewer'
    joinedAt: Date
  }]
  active: boolean
  createdAt: Date
  updatedAt: Date
}
```

### AdminSettings
```typescript
{
  adsEnabled: boolean
  premiumPrice: number
  maxParticipantsFree: number
  defaultCoinReward: number
  updatedAt: Date
}
```

## Setup Instructions

### 1. Install MongoDB
```bash
# Windows (using Chocolatey)
choco install mongodb

# Or download from https://www.mongodb.com/try/download/community
```

### 2. Start MongoDB
```bash
mongod --dbpath C:\data\db
```

### 3. Install Mongoose
```bash
npm install mongoose
```

### 4. Configure Environment
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
MONGODB_URI=mongodb://localhost:27017/heartshare
```

### 5. Access Admin Panel
```
http://localhost:3000/admin
```

## Security Notes

### 🔒 Production Checklist
- [ ] Enable proper authentication (NextAuth recommended)
- [ ] Add JWT token validation in middleware
- [ ] Verify admin role from database, not cookies
- [ ] Add CSRF protection
- [ ] Rate limit admin API endpoints
- [ ] Enable HTTPS
- [ ] Use environment variables for secrets
- [ ] Add audit logging for admin actions

### Current Implementation
⚠️ **Development Mode**: The current middleware allows access for testing. In production:

1. Implement proper authentication:
```typescript
// middleware.ts
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const token = await getToken({ req })
    
    if (!token || token.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }
}
```

2. Store admin role in database
3. Validate on every request

## Socket.IO Integration

### Admin Events
```typescript
// Server emits when room changes
io.emit('admin-room-update', { roomId, action: 'join' | 'leave' })

// Listen in admin panel
socket.on('admin-room-update', () => {
  fetchRooms() // Refresh room list
})
```

### Force Close Room
```typescript
// Admin closes room
PATCH /api/admin/room/[roomId]/close

// Server broadcasts
io.to(roomId).emit('force-end-room', {
  message: 'Room has been closed by admin'
})
```

## Usage Examples

### Change User Role
1. Go to `/admin/users`
2. Find user in table
3. Use role dropdown
4. Automatic save on change

### Ban a User
1. Go to `/admin/users`
2. Find user
3. Click "Ban" button
4. User immediately banned

### Close a Room
1. Go to `/admin/rooms`
2. Find active room
3. Click "Close" button
4. Confirm action
5. All participants disconnected

### Update Settings
1. Go to `/admin/settings`
2. Modify any field
3. Click "Save Settings"
4. Settings applied globally

## Theming

Admin panel uses the same pink-to-blue gradient theme as the main app:
- `from-pink-50 to-sky-50` - Background
- `from-pink-200 to-sky-200` - Sidebar
- `bg-gradient-heartshare` - Buttons and accents

## Future Enhancements

- [ ] User activity logs
- [ ] Advanced analytics and charts
- [ ] Bulk user operations
- [ ] Email notifications for admin actions
- [ ] Export data (CSV, JSON)
- [ ] Real-time monitoring dashboard
- [ ] WebSocket connections viewer
- [ ] Bandwidth usage statistics
- [ ] Payment integration (Stripe)
- [ ] Content moderation tools
