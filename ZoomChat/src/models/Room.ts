import mongoose from 'mongoose'

const participantSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['host', 'speaker', 'viewer'],
    default: 'viewer',
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
})

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  participants: [participantSchema],
  active: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

roomSchema.pre('save', function (this: any) {
  this.updatedAt = new Date()
  return Promise.resolve()
})

export default mongoose.models.Room || mongoose.model('Room', roomSchema)
