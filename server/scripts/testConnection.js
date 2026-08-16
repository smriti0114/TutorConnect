import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { Child } from '../models/Child.js';
import { TeacherProfile } from '../models/TeacherProfile.js';
import { Activity } from '../models/Activity.js';
import { ClassSession } from '../models/ClassSession.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function check() {
  console.log('Connecting to database...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected!');

  const usersCount = await User.countDocuments();
  const childrenCount = await Child.countDocuments();
  const teachersCount = await TeacherProfile.countDocuments();
  const activitiesCount = await Activity.countDocuments();
  const classesCount = await ClassSession.countDocuments();

  console.log('--- Collection counts ---');
  console.log('Users:', usersCount);
  console.log('Children:', childrenCount);
  console.log('Teacher Profiles:', teachersCount);
  console.log('Activities:', activitiesCount);
  console.log('Class Sessions:', classesCount);

  // Retrieve one user to verify details
  const parentUser = await User.findOne({ email: 'parent@example.com' });
  console.log('Seeded Parent User found:', parentUser ? parentUser.name : 'No');

  await mongoose.disconnect();
}

check().catch(console.error);
