# 🎯 Zustand Stores - Complete API Integration Guide

## 📦 Available Stores

All stores are now fully integrated with the backend API:

```javascript
import { 
  useAuthStore,      // Authentication & User Management
  useRoomStore,      // Room & Participant Management  
  useCallStore,      // WebRTC & Media Controls
  useUIStore,        // UI State Management
  useAdminStore      // Admin Panel Operations
} from '@/stores';
```

---

## 🔐 Auth Store (`useAuthStore`)

### State
```javascript
const {
  user,              // Current user object
  token,             // JWT token
  isAuthenticated,   // Boolean auth status
  loading,           // Loading state
  error              // Error message
} = useAuthStore();
```

### Actions

#### Register New User
```javascript
const register = useAuthStore((state) => state.register);

try {
  const data = await register({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123'
  });
  console.log('Registered:', data.user);
  // User is automatically logged in
} catch (error) {
  console.error('Registration failed:', error.message);
}
```

#### Login
```javascript
const login = useAuthStore((state) => state.login);

try {
  const data = await login({
    email: 'john@example.com',
    password: 'password123'
  });
  console.log('Logged in:', data.user);
} catch (error) {
  console.error('Login failed:', error.message);
}
```

#### Logout
```javascript
const logoutUser = useAuthStore((state) => state.logoutUser);

await logoutUser();
// User is cleared from store
```

#### Fetch Current User
```javascript
const fetchUser = useAuthStore((state) => state.fetchUser);

try {
  const user = await fetchUser();
  console.log('Current user:', user);
} catch (error) {
  console.error('Failed to fetch user:', error.message);
}
```

#### Update Profile
```javascript
const updateProfile = useAuthStore((state) => state.updateProfile);

try {
  const updatedUser = await updateProfile({
    name: 'Jane Doe',
    avatar: 'https://example.com/avatar.jpg'
  });
  console.log('Profile updated:', updatedUser);
} catch (error) {
  console.error('Update failed:', error.message);
}
```

#### Change Password
```javascript
const changePassword = useAuthStore((state) => state.changePassword);

try {
  await changePassword({
    currentPassword: 'oldpass123',
    newPassword: 'newpass123'
  });
  console.log('Password changed successfully');
} catch (error) {
  console.error('Password change failed:', error.message);
}
```

#### Update Settings
```javascript
const updateSettings = useAuthStore((state) => state.updateSettings);

try {
  await updateSettings({
    notifications: true,
    autoJoinAudio: false,
    autoJoinVideo: true
  });
  console.log('Settings updated');
} catch (error) {
  console.error('Settings update failed:', error.message);
}
```

---

## 🏠 Room Store (`useRoomStore`)

### State
```javascript
const {
  currentRoom,       // Active room object
  rooms,             // Array of all rooms
  participants,      // Array of participants
  messages,          // Array of messages
  loading,           // Loading state
  error,             // Error message
  pagination         // Pagination info
} = useRoomStore();
```

### Actions

#### Create Room
```javascript
const createRoom = useRoomStore((state) => state.createRoom);

try {
  const room = await createRoom({
    name: 'Team Meeting',
    type: 'private',        // 'public', 'private', 'scheduled'
    password: 'secret123',
    maxParticipants: 50,
    settings: {
      allowChat: true,
      allowScreenShare: true,
      waitingRoom: false
    }
  });
  console.log('Room created:', room);
} catch (error) {
  console.error('Failed to create room:', error.message);
}
```

#### Fetch All Rooms
```javascript
const fetchRooms = useRoomStore((state) => state.fetchRooms);

try {
  const data = await fetchRooms({
    page: 1,
    limit: 20,
    type: 'public',
    status: 'active'
  });
  console.log('Rooms:', data.rooms);
  console.log('Total:', data.pagination.total);
} catch (error) {
  console.error('Failed to fetch rooms:', error.message);
}
```

#### Fetch Single Room
```javascript
const fetchRoom = useRoomStore((state) => state.fetchRoom);

try {
  const room = await fetchRoom('room-id-123');
  console.log('Room details:', room);
  console.log('Participants:', room.participants);
} catch (error) {
  console.error('Failed to fetch room:', error.message);
}
```

#### Join Room
```javascript
const joinRoom = useRoomStore((state) => state.joinRoom);

try {
  const room = await joinRoom('room-id-123', 'password-if-needed');
  console.log('Joined room:', room);
  // currentRoom and participants are automatically set
} catch (error) {
  console.error('Failed to join room:', error.message);
}
```

#### Leave Room
```javascript
const leaveRoomAPI = useRoomStore((state) => state.leaveRoomAPI);

try {
  await leaveRoomAPI('room-id-123');
  console.log('Left room successfully');
  // currentRoom and participants are cleared
} catch (error) {
  console.error('Failed to leave room:', error.message);
}
```

#### Update Room Settings
```javascript
const updateRoomSettings = useRoomStore((state) => state.updateRoomSettings);

try {
  const room = await updateRoomSettings('room-id-123', {
    allowChat: false,
    allowScreenShare: true,
    muteOnEntry: true
  });
  console.log('Settings updated:', room);
} catch (error) {
  console.error('Failed to update settings:', error.message);
}
```

#### End Room
```javascript
const endRoom = useRoomStore((state) => state.endRoom);

try {
  await endRoom('room-id-123');
  console.log('Room ended');
  // Room status updated to 'ended'
} catch (error) {
  console.error('Failed to end room:', error.message);
}
```

#### Fetch Messages
```javascript
const fetchMessages = useRoomStore((state) => state.fetchMessages);

try {
  const data = await fetchMessages('room-id-123', {
    page: 1,
    limit: 50
  });
  console.log('Messages:', data.messages);
} catch (error) {
  console.error('Failed to fetch messages:', error.message);
}
```

#### Update Participant Media
```javascript
const updateParticipantMedia = useRoomStore((state) => state.updateParticipantMedia);

try {
  await updateParticipantMedia('room-id-123', 'user-id-456', {
    isAudioOn: true,
    isVideoOn: false,
    isScreenSharing: false
  });
  console.log('Participant media updated');
} catch (error) {
  console.error('Failed to update media:', error.message);
}
```

---

## 📹 Call Store (`useCallStore`)

### State
```javascript
const {
  localStream,       // Local media stream
  localAudioTrack,   // Local audio track
  localVideoTrack,   // Local video track
  screenStream,      // Screen share stream
  isAudioOn,         // Audio state
  isVideoOn,         // Video state
  isScreenSharing,   // Screen share state
  peerConnections,   // Peer connections object
  remoteStreams,     // Remote streams object
  isInCall,          // Call state
  callQuality        // Connection quality
} = useCallStore();
```

### Actions
```javascript
const {
  setLocalStream,
  toggleAudio,
  toggleVideo,
  setScreenSharing,
  addPeerConnection,
  addRemoteStream,
  cleanup
} = useCallStore();

// Toggle audio
toggleAudio();

// Toggle video
toggleVideo();

// Cleanup on unmount
cleanup();
```

---

## 🎨 UI Store (`useUIStore`)

### State
```javascript
const {
  isSidebarOpen,
  isChatOpen,
  isParticipantsOpen,
  notifications,
  theme,
  layout
} = useUIStore();
```

### Actions
```javascript
const {
  toggleSidebar,
  toggleChat,
  addNotification,
  setTheme,
  setLayout
} = useUIStore();

// Add notification
addNotification({
  type: 'success',
  message: 'Room created successfully!'
});

// Change theme
setTheme('dark');

// Change layout
setLayout('speaker'); // 'grid', 'speaker', 'gallery'
```

---

## 👑 Admin Store (`useAdminStore`)

### State
```javascript
const {
  stats,              // Dashboard statistics
  users,              // Array of users
  rooms,              // Array of rooms
  logs,               // System logs
  selectedUser,       // Selected user details
  loading,
  error,
  usersPagination,
  roomsPagination,
  logsPagination
} = useAdminStore();
```

### Actions

#### Fetch Dashboard Stats
```javascript
const fetchStats = useAdminStore((state) => state.fetchStats);

try {
  const stats = await fetchStats();
  console.log('Total users:', stats.overview.totalUsers);
  console.log('Active users:', stats.overview.activeUsers);
  console.log('Total rooms:', stats.overview.totalRooms);
} catch (error) {
  console.error('Failed to fetch stats:', error.message);
}
```

#### Fetch Users
```javascript
const fetchUsers = useAdminStore((state) => state.fetchUsers);

try {
  const data = await fetchUsers({
    page: 1,
    limit: 20,
    role: 'user',        // Filter by role
    status: 'active',    // Filter by status
    search: 'john'       // Search query
  });
  console.log('Users:', data.users);
  console.log('Total:', data.pagination.total);
} catch (error) {
  console.error('Failed to fetch users:', error.message);
}
```

#### Fetch Single User
```javascript
const fetchUser = useAdminStore((state) => state.fetchUser);

try {
  const userData = await fetchUser('user-id-123');
  console.log('User:', userData.user);
  console.log('Sessions:', userData.sessions);
} catch (error) {
  console.error('Failed to fetch user:', error.message);
}
```

#### Update User Role
```javascript
const updateUserRole = useAdminStore((state) => state.updateUserRole);

try {
  await updateUserRole('user-id-123', 'moderator');
  // Options: 'user', 'moderator', 'admin'
  console.log('Role updated');
} catch (error) {
  console.error('Failed to update role:', error.message);
}
```

#### Update Account Type
```javascript
const updateUserAccountType = useAdminStore((state) => state.updateUserAccountType);

try {
  await updateUserAccountType('user-id-123', 'premium');
  // Options: 'free', 'premium', 'enterprise'
  console.log('Account type updated');
} catch (error) {
  console.error('Failed to update account type:', error.message);
}
```

#### Ban/Unban User
```javascript
const banUser = useAdminStore((state) => state.banUser);
const unbanUser = useAdminStore((state) => state.unbanUser);

try {
  await banUser('user-id-123');
  console.log('User banned');
  
  // Later unban
  await unbanUser('user-id-123');
  console.log('User unbanned');
} catch (error) {
  console.error('Failed:', error.message);
}
```

#### Delete User
```javascript
const deleteUser = useAdminStore((state) => state.deleteUser);

try {
  await deleteUser('user-id-123');
  console.log('User deleted');
} catch (error) {
  console.error('Failed to delete user:', error.message);
}
```

#### Fetch Rooms (Admin)
```javascript
const fetchRooms = useAdminStore((state) => state.fetchRooms);

try {
  const data = await fetchRooms({
    page: 1,
    limit: 20,
    status: 'active',
    type: 'public'
  });
  console.log('Rooms:', data.rooms);
} catch (error) {
  console.error('Failed to fetch rooms:', error.message);
}
```

#### Delete Room
```javascript
const deleteRoom = useAdminStore((state) => state.deleteRoom);

try {
  await deleteRoom('room-id-123');
  console.log('Room deleted');
} catch (error) {
  console.error('Failed to delete room:', error.message);
}
```

#### Fetch System Logs
```javascript
const fetchLogs = useAdminStore((state) => state.fetchLogs);

try {
  const data = await fetchLogs({
    page: 1,
    limit: 50
  });
  console.log('Logs:', data.sessions);
} catch (error) {
  console.error('Failed to fetch logs:', error.message);
}
```

---

## 🎯 Complete Component Examples

### Login Component
```javascript
'use client';
import { useAuthStore } from '@/stores';
import { useState } from 'react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { login, loading, error } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ email, password });
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### Room List Component
```javascript
'use client';
import { useRoomStore } from '@/stores';
import { useEffect } from 'react';

export default function RoomList() {
  const { rooms, fetchRooms, loading, pagination } = useRoomStore();

  useEffect(() => {
    fetchRooms({ page: 1, limit: 20 });
  }, []);

  if (loading) return <div>Loading rooms...</div>;

  return (
    <div>
      <h2>Available Rooms ({pagination.total})</h2>
      <div className="grid">
        {rooms.map(room => (
          <div key={room._id} className="room-card">
            <h3>{room.name}</h3>
            <p>Type: {room.type}</p>
            <p>Participants: {room.participants.length}/{room.maxParticipants}</p>
            <p>Status: {room.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Admin Dashboard Component
```javascript
'use client';
import { useAdminStore } from '@/stores';
import { useEffect } from 'react';

export default function AdminDashboard() {
  const { stats, fetchStats, loading } = useAdminStore();

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <div>Loading stats...</div>;

  return (
    <div className="dashboard">
      <h1>Admin Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p>{stats?.overview.totalUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Active Users</h3>
          <p>{stats?.overview.activeUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Total Rooms</h3>
          <p>{stats?.overview.totalRooms}</p>
        </div>
        <div className="stat-card">
          <h3>Active Rooms</h3>
          <p>{stats?.overview.activeRooms}</p>
        </div>
      </div>
    </div>
  );
}
```

---

## 🚀 Best Practices

1. **Error Handling**
```javascript
try {
  await someAction();
} catch (error) {
  // Error is automatically set in store
  console.error(error);
}
```

2. **Loading States**
```javascript
const { loading } = useAuthStore();

if (loading) return <Spinner />;
```

3. **Pagination**
```javascript
const { pagination, fetchRooms } = useRoomStore();

const handleNextPage = () => {
  fetchRooms({ page: pagination.page + 1 });
};
```

4. **Cleanup**
```javascript
useEffect(() => {
  return () => {
    useCallStore.getState().cleanup();
  };
}, []);
```

---

## ✅ All APIs Are Now Integrated!

Every backend endpoint is accessible through Zustand stores:
- ✅ Authentication (register, login, logout, profile)
- ✅ Room management (create, join, leave, settings)
- ✅ Admin panel (users, rooms, stats, logs)
- ✅ Real-time features (via Socket.IO integration)
- ✅ Error handling and loading states
- ✅ Pagination support

**Start using the stores in your components now!** 🎉
