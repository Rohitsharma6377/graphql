const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

let wss;
const rooms = new Map(); // roomId -> Set of clients
const userSockets = new Map(); // userId -> WebSocket

// Initialize WebSocket server
const initializeWebSocket = (server) => {
  wss = new WebSocket.Server({ server, path: '/' });

  wss.on('connection', async (ws, req) => {
    console.log('📡 New WebSocket connection');
    
    ws.isAlive = true;
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        const { type, ...payload } = data;

        console.log('📨 WebSocket message:', type, payload);

        // Handle different message types
        switch (type) {
          case 'auth':
            await handleAuth(ws, payload);
            break;
          
          case 'join-room':
            await handleJoinRoom(ws, payload);
            break;
          
          case 'leave-room':
            await handleLeaveRoom(ws, payload);
            break;
          
          case 'offer':
          case 'answer':
          case 'ice-candidate':
            handleWebRTCSignal(ws, type, payload);
            break;
          
          case 'chat-message':
            handleChatMessage(ws, payload);
            break;
          
          case 'media-state-changed':
            handleMediaState(ws, payload);
            break;
          
          default:
            console.log('⚠️ Unknown message type:', type);
        }
      } catch (error) {
        console.error('❌ Error handling WebSocket message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: error.message
        }));
      }
    });

    ws.on('close', () => {
      console.log('🔌 WebSocket disconnected');
      handleDisconnect(ws);
    });

    ws.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
    });
  });

  // Heartbeat to detect broken connections
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        handleDisconnect(ws);
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });

  console.log('✅ WebSocket server initialized');
};

// Handle authentication
async function handleAuth(ws, { token }) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new Error('User not found');
    }

    ws.user = user;
    ws.userId = user._id.toString();
    userSockets.set(ws.userId, ws);

    console.log(`✅ User authenticated: ${user.name} (${ws.userId})`);

    ws.send(JSON.stringify({
      type: 'authenticated',
      userId: ws.userId,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    }));
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Authentication failed'
    }));
    ws.close();
  }
}

// Handle join room
async function handleJoinRoom(ws, { roomId, userId, username }) {
  console.log(`\n🚪 === JOIN ROOM REQUEST ===`);
  console.log(`Room ID: ${roomId}`);
  console.log(`User ID: ${userId}`);
  console.log(`Username: ${username}`);
  console.log(`Authenticated: ${!!ws.user}`);
  console.log(`Current WS User: ${ws.user?.name}`);
  
  if (!ws.user) {
    console.log('❌ User not authenticated when joining room');
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Not authenticated'
    }));
    return;
  }

  ws.roomId = roomId;

  // Add to room
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set());
    console.log(`🆕 Created new room: ${roomId}`);
  }
  
  const roomBefore = rooms.get(roomId).size;
  rooms.get(roomId).add(ws);
  const roomAfter = rooms.get(roomId).size;

  console.log(`👤 ${ws.user.name} (${ws.userId}) joined room: ${roomId}`);
  console.log(`📊 Room ${roomId} size: ${roomBefore} -> ${roomAfter} participants`);

  // Get existing participants
  const participants = Array.from(rooms.get(roomId))
    .filter(client => client !== ws && client.user)
    .map(client => ({
      userId: client.userId,
      username: client.user.name,
      isVideoOn: true,
      isAudioOn: true
    }));

  console.log(`📋 Existing participants (${participants.length}):`, participants.map(p => p.username));

  // Send room-joined confirmation to the new user
  const roomJoinedMessage = {
    type: 'room-joined',
    roomId,
    participants
  };
  console.log(`✉️ Sending room-joined to ${ws.user.name}:`, roomJoinedMessage);
  ws.send(JSON.stringify(roomJoinedMessage));

  // Notify others in the room
  const otherParticipants = rooms.get(roomId).size - 1;
  console.log(`📢 Broadcasting user-joined to ${otherParticipants} other participants`);
  
  const userJoinedMessage = {
    type: 'user-joined',
    userId: ws.userId,
    user: {
      id: ws.user._id,
      name: ws.user.name,
      email: ws.user.email,
      avatar: ws.user.avatar
    }
  };
  console.log(`📤 Broadcasting message:`, userJoinedMessage);
  broadcastToRoom(roomId, userJoinedMessage, ws);
  console.log(`✅ === JOIN ROOM COMPLETE ===\n`);
}

// Handle leave room
async function handleLeaveRoom(ws, { roomId, userId }) {
  if (!ws.roomId) return;

  const room = rooms.get(ws.roomId);
  if (room) {
    room.delete(ws);
    
    // Notify others
    broadcastToRoom(ws.roomId, {
      type: 'user-left',
      userId: ws.userId
    }, ws);

    // Clean up empty rooms
    if (room.size === 0) {
      rooms.delete(ws.roomId);
    }
  }

  console.log(`👋 ${ws.user?.name} left room: ${ws.roomId}`);
  ws.roomId = null;
}

// Handle WebRTC signaling
function handleWebRTCSignal(ws, type, payload) {
  const { roomId, to, from, ...data } = payload;

  // Find target user's socket
  const targetSocket = userSockets.get(to);
  
  if (targetSocket && targetSocket.readyState === WebSocket.OPEN) {
    targetSocket.send(JSON.stringify({
      type,
      from: ws.userId,
      ...data
    }));
    console.log(`📤 Forwarded ${type} from ${ws.userId} to ${to}`);
  } else {
    console.warn(`⚠️ Target user ${to} not found or disconnected`);
  }
}

// Handle chat message
function handleChatMessage(ws, payload) {
  console.log(`\n💬 === CHAT MESSAGE ===`);
  console.log(`From: ${ws.user?.name} (${ws.userId})`);
  console.log(`Room: ${ws.roomId}`);
  console.log(`Message:`, payload);
  
  if (!ws.roomId) {
    console.log('❌ No room ID');
    return;
  }

  const message = {
    type: 'chat-message',
    userId: ws.userId,
    username: ws.user.name,
    ...payload
  };
  
  console.log(`📢 Broadcasting to room ${ws.roomId}`);
  // Broadcast to ALL users in room (including sender for consistency)
  broadcastToRoom(ws.roomId, message);
  console.log(`✅ === CHAT MESSAGE SENT ===\n`);
}

// Handle media state change
function handleMediaState(ws, payload) {
  if (!ws.roomId) return;

  broadcastToRoom(ws.roomId, {
    type: 'media-state-changed',
    ...payload
  }, ws);
}

// Handle disconnect
function handleDisconnect(ws) {
  if (ws.userId) {
    userSockets.delete(ws.userId);
  }
  
  if (ws.roomId) {
    handleLeaveRoom(ws, { roomId: ws.roomId, userId: ws.userId });
  }
}

// Broadcast to all users in a room except sender
function broadcastToRoom(roomId, message, excludeWs = null) {
  const room = rooms.get(roomId);
  if (!room) return;

  const messageStr = JSON.stringify(message);
  
  room.forEach(client => {
    if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
      client.send(messageStr);
    }
  });
}

module.exports = { initializeWebSocket };
