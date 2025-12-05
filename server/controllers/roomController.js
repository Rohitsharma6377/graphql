const { Room, Session, Message } = require('../models');
const { v4: uuidv4 } = require('uuid');

// @desc    Create a new room
// @route   POST /api/rooms
// @access  Private
exports.createRoom = async (req, res) => {
  try {
    const { name, type, password, maxParticipants, settings, scheduledTime } = req.body;

    // Generate unique room ID
    const roomId = uuidv4().slice(0, 10);

    const room = await Room.create({
      roomId,
      name,
      host: req.user._id,
      type: type || 'public',
      password: password || '',
      maxParticipants: maxParticipants || 100,
      settings: settings || {},
      scheduledTime: scheduledTime || null
    });

    // Add host as first participant
    room.participants.push({
      user: req.user._id,
      role: 'host',
      joinedAt: Date.now()
    });

    await room.save();

    // Update user stats
    req.user.stats.totalMeetingsHosted += 1;
    await req.user.save();

    const populatedRoom = await Room.findById(room._id)
      .populate('host', 'name email avatar')
      .populate('participants.user', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: populatedRoom
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating room',
      error: error.message
    });
  }
};

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Private
exports.getRooms = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const { type, status } = req.query;

    let filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;

    // Only show public rooms or rooms user is part of
    filter.$or = [
      { type: 'public' },
      { host: req.user._id },
      { 'participants.user': req.user._id }
    ];

    const rooms = await Room.find(filter)
      .populate('host', 'name email avatar')
      .populate('participants.user', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Room.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        rooms,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching rooms',
      error: error.message
    });
  }
};

// @desc    Get single room
// @route   GET /api/rooms/:roomId
// @access  Private
exports.getRoom = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId })
      .populate('host', 'name email avatar')
      .populate('participants.user', 'name email avatar isOnline');

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.status(200).json({
      success: true,
      data: room
    });
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching room',
      error: error.message
    });
  }
};

// @desc    Join room
// @route   POST /api/rooms/:roomId/join
// @access  Private
exports.joinRoom = async (req, res) => {
  try {
    const { password } = req.body;
    const room = await Room.findOne({ roomId: req.params.roomId });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if room is full
    if (room.participants.length >= room.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Room is full'
      });
    }

    // Check password for private rooms
    if (room.type === 'private' && room.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password'
      });
    }

    // Check if user already in room
    const alreadyJoined = room.participants.some(
      p => p.user.toString() === req.user._id.toString()
    );

    if (alreadyJoined) {
      return res.status(400).json({
        success: false,
        message: 'You are already in this room'
      });
    }

    // Add participant
    room.participants.push({
      user: req.user._id,
      role: 'participant',
      joinedAt: Date.now()
    });

    // Update room status
    if (room.status === 'waiting') {
      room.status = 'active';
      room.startedAt = Date.now();
    }

    await room.save();

    // Create session
    await Session.create({
      user: req.user._id,
      room: room._id,
      events: [{ type: 'joined', timestamp: Date.now() }]
    });

    // Update user stats
    req.user.stats.totalMeetingsJoined += 1;
    await req.user.save();

    const populatedRoom = await Room.findById(room._id)
      .populate('host', 'name email avatar')
      .populate('participants.user', 'name email avatar isOnline');

    res.status(200).json({
      success: true,
      message: 'Joined room successfully',
      data: populatedRoom
    });
  } catch (error) {
    console.error('Join room error:', error);
    res.status(500).json({
      success: false,
      message: 'Error joining room',
      error: error.message
    });
  }
};

// @desc    Leave room
// @route   POST /api/rooms/:roomId/leave
// @access  Private
exports.leaveRoom = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Remove participant
    room.participants = room.participants.filter(
      p => p.user.toString() !== req.user._id.toString()
    );

    // End room if no participants left
    if (room.participants.length === 0) {
      room.status = 'ended';
      room.endedAt = Date.now();
      room.duration = Math.floor((room.endedAt - room.startedAt) / 1000);
    }

    await room.save();

    // Update session
    const session = await Session.findOne({
      user: req.user._id,
      room: room._id,
      leftAt: null
    });

    if (session) {
      session.leftAt = Date.now();
      session.duration = Math.floor((session.leftAt - session.joinedAt) / 1000);
      session.events.push({ type: 'left', timestamp: Date.now() });
      await session.save();

      // Update user total minutes
      req.user.stats.totalMinutes += Math.floor(session.duration / 60);
      await req.user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Left room successfully'
    });
  } catch (error) {
    console.error('Leave room error:', error);
    res.status(500).json({
      success: false,
      message: 'Error leaving room',
      error: error.message
    });
  }
};

// @desc    Update room settings
// @route   PUT /api/rooms/:roomId/settings
// @access  Private (Host only)
exports.updateRoomSettings = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if user is host
    if (room.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only host can update room settings'
      });
    }

    const { settings } = req.body;
    room.settings = { ...room.settings, ...settings };
    await room.save();

    res.status(200).json({
      success: true,
      message: 'Room settings updated successfully',
      data: room
    });
  } catch (error) {
    console.error('Update room settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating room settings',
      error: error.message
    });
  }
};

// @desc    End room
// @route   POST /api/rooms/:roomId/end
// @access  Private (Host only)
exports.endRoom = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if user is host
    if (room.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only host can end the room'
      });
    }

    room.status = 'ended';
    room.endedAt = Date.now();
    room.duration = Math.floor((room.endedAt - room.startedAt) / 1000);
    await room.save();

    // Update all active sessions
    await Session.updateMany(
      { room: room._id, leftAt: null },
      {
        leftAt: Date.now(),
        $push: { events: { type: 'left', timestamp: Date.now() } }
      }
    );

    res.status(200).json({
      success: true,
      message: 'Room ended successfully',
      data: room
    });
  } catch (error) {
    console.error('End room error:', error);
    res.status(500).json({
      success: false,
      message: 'Error ending room',
      error: error.message
    });
  }
};

// @desc    Get room messages
// @route   GET /api/rooms/:roomId/messages
// @access  Private
exports.getRoomMessages = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ room: room._id })
      .populate('sender', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Message.countDocuments({ room: room._id });

    res.status(200).json({
      success: true,
      data: {
        messages: messages.reverse(),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get room messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: error.message
    });
  }
};

// @desc    Update participant media status
// @route   PUT /api/rooms/:roomId/participants/:userId/media
// @access  Private
exports.updateParticipantMedia = async (req, res) => {
  try {
    const { isAudioOn, isVideoOn, isScreenSharing } = req.body;
    const room = await Room.findOne({ roomId: req.params.roomId });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    const participant = room.participants.find(
      p => p.user.toString() === req.params.userId
    );

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found'
      });
    }

    // Update media status
    if (isAudioOn !== undefined) participant.isAudioOn = isAudioOn;
    if (isVideoOn !== undefined) participant.isVideoOn = isVideoOn;
    if (isScreenSharing !== undefined) participant.isScreenSharing = isScreenSharing;

    await room.save();

    res.status(200).json({
      success: true,
      message: 'Media status updated',
      data: room
    });
  } catch (error) {
    console.error('Update participant media error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating media status',
      error: error.message
    });
  }
};
