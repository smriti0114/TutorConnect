import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  pricePerClass: {
    type: Number,
    required: true,
    min: 0,
  },
  active: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

export const Activity = mongoose.model('Activity', activitySchema);
