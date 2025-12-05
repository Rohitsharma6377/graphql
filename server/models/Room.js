const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Please provide a room name'],
    trim: true
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['public', 'private', 'scheduled'],
    default: 'public'
  },
  password: {
    type: String,
    default: ''
  },
  maxParticipants: {
    type: Number,
    default: 100
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['host', 'moderator', 'participant'],
      default: 'participant'
    },
    isAudioOn: {
      type: Boolean,
      default: false
    },
    isVideoOn: {
      type: Boolean,
      default: false
    },
    isScreenSharing: {
      type: Boolean,
      default: false
    }
  }],
  settings: {
    allowChat: {
      type: Boolean,
      default: true
    },
    allowScreenShare: {
      type: Boolean,
      default: true
    },
    allowRecording: {
      type: Boolean,
      default: true
    },
    waitingRoom: {
      type: Boolean,
      default: false
    },
    muteOnEntry: {
      type: Boolean,
      default: false
    },
    requireApproval: {
      type: Boolean,
      default: false
    }
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'ended'],
    default: 'waiting'
  },
  scheduledTime: {
    type: Date,
    default: null
  },
  startedAt: {
    type: Date,
    default: null
  },
  endedAt: {
    type: Date,
    default: null
  },
  duration: {
    type: Number,
    default: 0
  },
  recording: {
    isRecording: {
      type: Boolean,
      default: false
    },
    recordingUrl: {
      type: String,
      default: ''
    },
    startedAt: {
      type: Date,
      default: null
    }
  }
}, {
  timestamps: true
});

// Index for faster queries
roomSchema.index({ roomId: 1 });
roomSchema.index({ host: 1 });
roomSchema.index({ status: 1 });

module.exports = mongoose.model('Room', roomSchema);
