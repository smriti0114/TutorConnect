import mongoose from 'mongoose';

const classSessionSchema = new mongoose.Schema({
  enrollmentId: {
    type: String,
    default: '',
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  childId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Child',
    required: true,
    index: true,
  },
  activityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
    required: true,
    index: true,
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true,
  },
  startTime: {
    type: String, // HH:MM
    required: true,
  },
  endTime: {
    type: String, // HH:MM
    required: true,
  },
  status: {
    type: String,
    enum: ['upcoming', 'completed', 'canceled', 'rescheduled'],
    default: 'upcoming',
  },
  bookingStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  teacherNotes: {
    type: String,
    default: '',
  },
  parentFeedback: {
    type: String,
    default: '',
  },
  ratingByParent: {
    type: Number,
    min: 1,
    max: 5,
  },
}, { timestamps: true });

export const ClassSession = mongoose.model('ClassSession', classSessionSchema);
