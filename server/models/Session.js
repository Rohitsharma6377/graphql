const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  leftAt: {
    type: Date,
    default: null
  },
  duration: {
    type: Number,
    default: 0
  },
  quality: {
    avgBitrate: {
      type: Number,
      default: 0
    },
    avgLatency: {
      type: Number,
      default: 0
    },
    packetsLost: {
      type: Number,
      default: 0
    }
  },
  events: [{
    type: {
      type: String,
      enum: ['joined', 'left', 'muted', 'unmuted', 'video-on', 'video-off', 'screen-share-started', 'screen-share-stopped']
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

sessionSchema.index({ user: 1, room: 1 });
sessionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Session', sessionSchema);
