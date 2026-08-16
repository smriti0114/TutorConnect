import mongoose from 'mongoose';

const homeworkSchema = new mongoose.Schema({
  classSessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClassSession',
    required: true,
    index: true,
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  childId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Child',
    required: true,
  },
  activityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  dueDate: {
    type: String, // YYYY-MM-DD
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'done'],
    default: 'pending',
  },
  submissionNotes: {
    type: String,
    default: '',
  },
  attachmentName: {
    type: String,
    default: '',
  },
}, { timestamps: true });

export const Homework = mongoose.model('Homework', homeworkSchema);
