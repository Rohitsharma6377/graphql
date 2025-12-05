const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { User, Room, Message, Session } = require('../models');

let io;

// Initialize Socket.IO
const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.id})`);

    // Update user status
    updateUserStatus(socket.user._id, true, socket.id);

    // Join user to their personal room
    socket.join(`user:${socket.user._id}`);

    // Handle room joining
    socket.on('join-room', async (data) => {
      try {
        const { roomId } = data;
        const room = await Room.findOne({ roomId });

        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        // Join socket room
        socket.join(`room:${roomId}`);
        socket.currentRoom = roomId;

        // Notify others in the room
        socket.to(`room:${roomId}`).emit('user-joined', {
          userId: socket.user._id.toString(),
          user: {
            id: socket.user._id,
            name: socket.user.name,
            email: socket.user.email,
            avatar: socket.user.avatar
          },
          socketId: socket.id
        });

        // Send current participants to the new user
        const participants = room.participants.map(p => ({
          userId: p.user.toString(),
          role: p.role,
          isAudioOn: p.isAudioOn,
          isVideoOn: p.isVideoOn,
          isScreenSharing: p.isScreenSharing
        }));

        socket.emit('room-joined', {
          roomId,
          participants
        });

        console.log(`${socket.user.name} joined room: ${roomId}`);
      } catch (error) {
        console.error('Join room error:', error);
        socket.emit('error', { message: 'Error joining room' });
      }
    });

    // WebRTC Signaling - Offer
    socket.on('offer', (data) => {
      const { to, offer, roomId } = data;
      socket.to(`room:${roomId}`).emit('offer', {
        from: socket.user._id.toString(),
        fromSocketId: socket.id,
        offer,
        user: {
          id: socket.user._id,
          name: socket.user.name,
          email: socket.user.email,
          avatar: socket.user.avatar
        }
      });
    });

    // WebRTC Signaling - Answer
    socket.on('answer', (data) => {
      const { to, answer, roomId } = data;
      socket.to(`room:${roomId}`).emit('answer', {
        from: socket.user._id.toString(),
        fromSocketId: socket.id,
        answer
      });
    });

    // WebRTC Signaling - ICE Candidate
    socket.on('ice-candidate', (data) => {
      const { to, candidate, roomId } = data;
      socket.to(`room:${roomId}`).emit('ice-candidate', {
        from: socket.user._id.toString(),
        fromSocketId: socket.id,
        candidate
      });
    });

    // Chat message
    socket.on('chat-message', async (data) => {
      try {
        const { roomId, content, type, isPrivate, recipientId } = data;
        
        const room = await Room.findOne({ roomId });
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        // Save message to database
        const message = await Message.create({
          room: room._id,
          sender: socket.user._id,
          content,
          type: type || 'text',
          isPrivate: isPrivate || false,
          recipientId: recipientId || null
        });

        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'name email avatar');

        // Send to specific user or broadcast to room
        if (isPrivate && recipientId) {
          io.to(`user:${recipientId}`).emit('chat-message', populatedMessage);
          socket.emit('chat-message', populatedMessage);
        } else {
          io.to(`room:${roomId}`).emit('chat-message', populatedMessage);
        }
      } catch (error) {
        console.error('Chat message error:', error);
        socket.emit('error', { message: 'Error sending message' });
      }
    });

    // Media toggle events
    socket.on('toggle-audio', async (data) => {
      const { roomId, isAudioOn } = data;
      
      socket.to(`room:${roomId}`).emit('user-audio-toggled', {
        userId: socket.user._id.toString(),
        isAudioOn
      });

      // Update in database
      await updateParticipantMedia(roomId, socket.user._id, { isAudioOn });
    });

    socket.on('toggle-video', async (data) => {
      const { roomId, isVideoOn } = data;
      
      socket.to(`room:${roomId}`).emit('user-video-toggled', {
        userId: socket.user._id.toString(),
        isVideoOn
      });

      await updateParticipantMedia(roomId, socket.user._id, { isVideoOn });
    });

    socket.on('toggle-screen-share', async (data) => {
      const { roomId, isScreenSharing } = data;
      
      socket.to(`room:${roomId}`).emit('user-screen-share-toggled', {
        userId: socket.user._id.toString(),
        isScreenSharing
      });

      await updateParticipantMedia(roomId, socket.user._id, { isScreenSharing });
    });

    // Emoji/Reaction
    socket.on('send-emoji', (data) => {
      const { roomId, emoji } = data;
      socket.to(`room:${roomId}`).emit('emoji-received', {
        userId: socket.user._id.toString(),
        userName: socket.user.name,
        emoji
      });
    });

    // Whiteboard events
    socket.on('whiteboard-draw', (data) => {
      const { roomId, drawData } = data;
      socket.to(`room:${roomId}`).emit('whiteboard-draw', {
        userId: socket.user._id.toString(),
        drawData
      });
    });

    socket.on('whiteboard-clear', (data) => {
      const { roomId } = data;
      socket.to(`room:${roomId}`).emit('whiteboard-clear');
    });

    // Recording events
    socket.on('start-recording', (data) => {
      const { roomId } = data;
      socket.to(`room:${roomId}`).emit('recording-started', {
        userId: socket.user._id.toString()
      });
    });

    socket.on('stop-recording', (data) => {
      const { roomId } = data;
      socket.to(`room:${roomId}`).emit('recording-stopped', {
        userId: socket.user._id.toString()
      });
    });

    // Participant management
    socket.on('kick-participant', async (data) => {
      const { roomId, userId } = data;
      
      // Check if requester is host
      const room = await Room.findOne({ roomId });
      if (room && room.host.toString() === socket.user._id.toString()) {
        io.to(`user:${userId}`).emit('kicked-from-room', { roomId });
      }
    });

    socket.on('mute-participant', (data) => {
      const { roomId, userId } = data;
      io.to(`user:${userId}`).emit('force-muted', { roomId });
    });

    // Leave room
    socket.on('leave-room', async (data) => {
      try {
        const { roomId } = data;
        
        socket.leave(`room:${roomId}`);
        socket.currentRoom = null;

        socket.to(`room:${roomId}`).emit('user-left', {
          userId: socket.user._id.toString()
        });

        console.log(`${socket.user.name} left room: ${roomId}`);
      } catch (error) {
        console.error('Leave room error:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.user.name} (${socket.id})`);

      // Update user status
      await updateUserStatus(socket.user._id, false, '');

      // Notify room if user was in one
      if (socket.currentRoom) {
        socket.to(`room:${socket.currentRoom}`).emit('user-left', {
          userId: socket.user._id.toString()
        });
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  console.log('Socket.IO initialized');
};

// Helper function to update user status
const updateUserStatus = async (userId, isOnline, socketId) => {
  try {
    await User.findByIdAndUpdate(userId, {
      isOnline,
      socketId,
      lastSeen: Date.now()
    });
  } catch (error) {
    console.error('Update user status error:', error);
  }
};

// Helper function to update participant media
const updateParticipantMedia = async (roomId, userId, updates) => {
  try {
    const room = await Room.findOne({ roomId });
    if (!room) return;

    const participant = room.participants.find(
      p => p.user.toString() === userId.toString()
    );

    if (participant) {
      Object.assign(participant, updates);
      await room.save();
    }
  } catch (error) {
    console.error('Update participant media error:', error);
  }
};

// Emit event to specific user
const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

// Emit event to room
const emitToRoom = (roomId, event, data) => {
  if (io) {
    io.to(`room:${roomId}`).emit(event, data);
  }
};

// Get online users count
const getOnlineUsersCount = () => {
  if (io) {
    return io.sockets.sockets.size;
  }
  return 0;
};

module.exports = {
  initializeSocket,
  emitToUser,
  emitToRoom,
  getOnlineUsersCount
};
