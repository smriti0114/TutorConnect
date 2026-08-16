import mongoose from 'mongoose';

const childSchema = new mongoose.Schema({
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  age: {
    type: Number,
    required: true,
    min: 3,
    max: 18,
  },
  avatar: {
    type: String,
    default: '',
  },
  notes: {
    type: String,
    default: '',
  },
  active: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

export const Child = mongoose.model('Child', childSchema);
