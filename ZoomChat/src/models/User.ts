import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: null,
  },
  bio: {
    type: String,
    default: '',
    maxlength: 500,
  },
  role: {
    type: String,
    enum: ['user', 'premium', 'admin'],
    default: 'user',
  },
  banned: {
    type: Boolean,
    default: false,
  },
  coins: {
    type: Number,
    default: 100,
  },
  roomHistory: [{
    roomId: String,
    participants: [String],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    duration: Number,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Update timestamp on save
userSchema.pre('save', function(this: any) {
  this.updatedAt = new Date()
  return Promise.resolve()
})

export default mongoose.models.User || mongoose.model('User', userSchema)
