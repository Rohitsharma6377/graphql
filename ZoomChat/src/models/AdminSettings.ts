import mongoose from 'mongoose'

const adminSettingsSchema = new mongoose.Schema({
  adsEnabled: {
    type: Boolean,
    default: false,
  },
  premiumPrice: {
    type: Number,
    default: 9.99,
  },
  maxParticipantsFree: {
    type: Number,
    default: 2,
  },
  defaultCoinReward: {
    type: Number,
    default: 100,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

adminSettingsSchema.pre('save', function (this: any) {
  this.updatedAt = new Date()
  return Promise.resolve()
})

export default mongoose.models.AdminSettings || mongoose.model('AdminSettings', adminSettingsSchema)
