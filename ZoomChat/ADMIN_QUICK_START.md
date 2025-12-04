# Quick Start Guide for Admin Panel

## 🚀 Quick Setup (5 minutes)

### 1. Install MongoDB
```bash
# Download and install from:
https://www.mongodb.com/try/download/community

# Or use Chocolatey (Windows):
choco install mongodb
```

### 2. Start MongoDB
```bash
# Create data directory
mkdir C:\data\db

# Start MongoDB
mongod --dbpath C:\data\db
```

### 3. Install Dependencies
```bash
cd ZoomChat
npm install mongoose
```

### 4. Configure Environment
```bash
# Copy example env file
copy .env.example .env.local

# Edit .env.local and set:
MONGODB_URI=mongodb://localhost:27017/heartshare
```

### 5. Run the Application
```bash
npm run dev
```

### 6. Access Admin Panel
```
http://localhost:3000/admin
```

## 📱 Admin Panel Features

### Dashboard
- View total users, premium users, active rooms
- See revenue and new user statistics
- Quick access to all admin functions

### Users Management
- View all registered users
- Change roles (User → Premium → Admin)
- Ban/unban users
- View user coins and status

### Rooms Management
- Monitor all active video chat rooms
- See participants in each room
- Force close any room
- Auto-refresh every 5 seconds

### System Settings
- Toggle advertisements on/off
- Set premium subscription price
- Configure max participants for free users
- Set default coin rewards

## 🔑 Default Credentials

For development, the admin panel is accessible without authentication.

**⚠️ IMPORTANT**: In production, you MUST:
1. Implement proper authentication (NextAuth recommended)
2. Store admin role in database
3. Validate role on every request
4. Enable HTTPS
5. Add CSRF protection

## 📊 API Endpoints

All admin APIs are under `/api/admin/`:

```
GET  /api/admin/stats           - Overall statistics
GET  /api/admin/users           - All users
PATCH /api/admin/user/[id]/role - Update user role
PATCH /api/admin/user/[id]/ban  - Ban/unban user
GET  /api/admin/rooms           - Active rooms
PATCH /api/admin/room/[id]/close - Force close room
GET  /api/admin/settings        - Get settings
PATCH /api/admin/settings       - Update settings
```

## 🎨 UI Components

Located in `src/components/admin/`:
- `AdminSidebar.tsx` - Navigation sidebar
- `AdminCard.tsx` - Statistics cards
- `UsersTable.tsx` - Users management table
- `RoomsTable.tsx` - Rooms monitoring table
- `SettingsForm.tsx` - Settings configuration form

## 🗄️ Database Models

Located in `src/models/`:
- `User.ts` - User accounts with roles
- `Room.ts` - Video chat rooms
- `AdminSettings.ts` - System-wide settings

## 🔒 Security

Current implementation is for **DEVELOPMENT ONLY**.

For production:
1. Enable authentication in `middleware.ts`
2. Uncomment role validation
3. Add JWT token verification
4. Use secure session management
5. Enable rate limiting
6. Add audit logging

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Make sure MongoDB is running:
mongod --dbpath C:\data\db
```

### Port Already in Use
```bash
# Check what's using port 3000:
netstat -ano | findstr :3000

# Kill the process or use different port:
PORT=3001 npm run dev
```

### Cannot Access Admin Panel
1. Check if server is running
2. Clear browser cache
3. Check console for errors
4. Verify MongoDB is running

## 📚 Full Documentation

See `ADMIN_PANEL_DOCS.md` for complete documentation including:
- Detailed API reference
- Security best practices
- Socket.IO integration
- Production deployment guide
- Future enhancement roadmap
