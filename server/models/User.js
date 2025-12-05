const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator', 'premium'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'banned'],
    default: 'active'
  },
  accountType: {
    type: String,
    enum: ['free', 'premium', 'enterprise'],
    default: 'free'
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  socketId: {
    type: String,
    default: ''
  },
  settings: {
    notifications: {
      type: Boolean,
      default: true
    },
    soundEffects: {
      type: Boolean,
      default: true
    },
    autoJoinAudio: {
      type: Boolean,
      default: false
    },
    autoJoinVideo: {
      type: Boolean,
      default: false
    }
  },
  stats: {
    totalMeetingsHosted: {
      type: Number,
      default: 0
    },
    totalMeetingsJoined: {
      type: Number,
      default: 0
    },
    totalMinutes: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
