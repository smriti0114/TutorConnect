import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema({
  dayOfWeek: {
    type: String,
    required: true,
  },
  timeSlots: [{
    type: String,
  }],
}, { _id: false });

const teacherProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  specialtyActivityIds: [{
    type: String, // E.g., 'act-guitar', 'act-piano'
  }],
  bio: {
    type: String,
    required: true,
  },
  experience: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    default: 5.0,
  },
  availability: [availabilitySchema],
}, { timestamps: true });

export const TeacherProfile = mongoose.model('TeacherProfile', teacherProfileSchema);
