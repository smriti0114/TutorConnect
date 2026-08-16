import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Import models
import { User } from '../models/User.js';
import { Child } from '../models/Child.js';
import { TeacherProfile } from '../models/TeacherProfile.js';
import { Activity } from '../models/Activity.js';
import { ClassSession } from '../models/ClassSession.js';
import { Homework } from '../models/Homework.js';
import { Payment } from '../models/Payment.js';
import { Notification } from '../models/Notification.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tutorconnect';

async function seed() {
  console.log('Seeding database...');
  await mongoose.connect(MONGODB_URI);

  // Clear existing collections
  await User.deleteMany({});
  await Child.deleteMany({});
  await TeacherProfile.deleteMany({});
  await Activity.deleteMany({});
  await ClassSession.deleteMany({});
  await Homework.deleteMany({});
  await Payment.deleteMany({});
  await Notification.deleteMany({});
  console.log('Cleared existing database collections.');

  // 1. Hash passwords
  const hashedPassword = await bcrypt.hash('Demo123!', 10);

  // 2. Create Users
  const users = [
    {
      name: 'Jane Doe',
      email: 'parent@example.com',
      password: hashedPassword,
      phone: '555-0192',
      role: 'parent',
    },
    {
      name: 'Alex Carter',
      email: 'teacher@example.com',
      password: hashedPassword,
      phone: '555-0283',
      role: 'teacher',
    },
    {
      name: 'Clara Bow',
      email: 'teacher2@example.com',
      password: hashedPassword,
      phone: '555-0284',
      role: 'teacher',
    },
    {
      name: 'Marcus Sterling',
      email: 'teacher3@example.com',
      password: hashedPassword,
      phone: '555-0285',
      role: 'teacher',
    },
    {
      name: 'Admin Chief',
      email: 'admin@example.com',
      password: hashedPassword,
      phone: '555-0000',
      role: 'admin',
    }
  ];
  const savedUsers = await User.insertMany(users);
  console.log('Created Users.');

  const parent = savedUsers.find(u => u.role === 'parent');
  const teacher1 = savedUsers.find(u => u.email === 'teacher@example.com');
  const teacher2 = savedUsers.find(u => u.email === 'teacher2@example.com');
  const teacher3 = savedUsers.find(u => u.email === 'teacher3@example.com');

  // 3. Create Children
  const children = [
    {
      parentId: parent._id,
      name: 'Leo Parker',
      age: 10,
      avatar: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=150',
      notes: 'Leo is very energetic and learns visual patterns quickly.',
    },
    {
      parentId: parent._id,
      name: 'Maya Parker',
      age: 7,
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      notes: 'Maya is slightly shy. She responds well to encouraging stars and stickers.',
    }
  ];
  const savedChildren = await Child.insertMany(children);
  console.log('Created Children.');

  const leo = savedChildren.find(c => c.name === 'Leo Parker');
  const maya = savedChildren.find(c => c.name === 'Maya Parker');

  // 4. Create Activities
  const activities = [
    { name: 'Guitar', description: 'Learn basic acoustic and electric guitar chords, notes, and music theories.', pricePerClass: 40 },
    { name: 'Piano', description: 'Classical and modern keyboard training focusing on posture, sight reading, and finger coordination.', pricePerClass: 45 },
    { name: 'Violin', description: 'Violin training starting from bow techniques, scales, to playing solo masterpieces.', pricePerClass: 50 },
    { name: 'Vocals', description: 'Pitch correction, vocal registers expansion, breathing exercises, and stage presence coaching.', pricePerClass: 35 },
    { name: 'Dance', description: 'Fun choreography covering hip-hop, contemporary, and ballet basics.', pricePerClass: 30 },
    { name: 'Drawing', description: 'Pencil shading, watercolor, and digital illustration skills for young creative minds.', pricePerClass: 25 },
  ];
  const savedActivities = await Activity.insertMany(activities);
  console.log('Created Activities.');

  const guitar = savedActivities.find(a => a.name === 'Guitar');
  const piano = savedActivities.find(a => a.name === 'Piano');
  const violin = savedActivities.find(a => a.name === 'Violin');
  const vocals = savedActivities.find(a => a.name === 'Vocals');
  const dance = savedActivities.find(a => a.name === 'Dance');
  const drawing = savedActivities.find(a => a.name === 'Drawing');

  // 5. Create Teacher Profiles
  const teacherProfiles = [
    {
      userId: teacher1._id,
      specialtyActivityIds: [guitar.name.toLowerCase(), piano.name.toLowerCase()],
      bio: 'Alex is an experienced instrumentalist who has toured internationally with classical ensembles. He enjoys teaching children fundamentals of rhythm.',
      experience: '8 years teaching',
      rating: 4.9,
      availability: [
        { dayOfWeek: 'Monday', timeSlots: ['14:00', '15:00', '16:00', '17:00'] },
        { dayOfWeek: 'Wednesday', timeSlots: ['15:00', '16:00', '17:00', '18:00'] },
        { dayOfWeek: 'Friday', timeSlots: ['14:00', '15:00', '16:00'] },
      ]
    },
    {
      userId: teacher2._id,
      specialtyActivityIds: [vocals.name.toLowerCase(), dance.name.toLowerCase()],
      bio: 'Clara is a Broadway-trained performer with a passion for helping children find their voice and express themselves through song and dance.',
      experience: '5 years teaching',
      rating: 4.8,
      availability: [
        { dayOfWeek: 'Tuesday', timeSlots: ['15:00', '16:00', '17:00'] },
        { dayOfWeek: 'Thursday', timeSlots: ['15:00', '16:00', '17:00', '18:00'] },
      ]
    },
    {
      userId: teacher3._id,
      specialtyActivityIds: [violin.name.toLowerCase(), drawing.name.toLowerCase()],
      bio: 'Marcus teaches classical violin and fine arts. He believes that artistic discipline builds focus and creative spatial awareness.',
      experience: '10 years teaching',
      rating: 5.0,
      availability: [
        { dayOfWeek: 'Monday', timeSlots: ['16:00', '17:00', '18:00'] },
        { dayOfWeek: 'Wednesday', timeSlots: ['16:00', '17:00', '18:00'] },
        { dayOfWeek: 'Saturday', timeSlots: ['10:00', '11:00', '12:00'] },
      ]
    }
  ];
  await TeacherProfile.insertMany(teacherProfiles);
  console.log('Created Teacher Profiles.');

  // Helper date format YYYY-MM-DD
  const getRelativeDateString = (offsetDays) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  // 6. Create Class Sessions (Bookings)
  const classes = [
    {
      enrollmentId: 'enr-1',
      teacherId: teacher1._id,
      childId: leo._id,
      activityId: guitar._id,
      date: getRelativeDateString(-7), // 7 days ago
      startTime: '16:00',
      endTime: '17:00',
      status: 'completed',
      bookingStatus: 'approved',
      teacherNotes: 'Leo did fantastic today! We learned the C major chord. He practiced diligently. For next week, please make sure he practices transition between G and C.',
      parentFeedback: 'Leo loved the class and had fun learning the chords!',
      ratingByParent: 5,
    },
    {
      enrollmentId: 'enr-1',
      teacherId: teacher1._id,
      childId: leo._id,
      activityId: guitar._id,
      date: getRelativeDateString(1), // tomorrow
      startTime: '16:00',
      endTime: '17:00',
      status: 'upcoming',
      bookingStatus: 'approved',
    },
    {
      enrollmentId: 'enr-2',
      teacherId: teacher3._id,
      childId: leo._id,
      activityId: drawing._id,
      date: getRelativeDateString(-7),
      startTime: '18:00',
      endTime: '19:00',
      status: 'completed',
      bookingStatus: 'approved',
      teacherNotes: 'Leo learned about basic shading spheres and cones. Excellent spatial awareness!',
      parentFeedback: 'Fascinating lesson!',
      ratingByParent: 5,
    },
    {
      enrollmentId: 'enr-2',
      teacherId: teacher3._id,
      childId: leo._id,
      activityId: drawing._id,
      date: getRelativeDateString(1),
      startTime: '18:00',
      endTime: '19:00',
      status: 'upcoming',
      bookingStatus: 'approved',
    },
    {
      enrollmentId: 'enr-3',
      teacherId: teacher1._id,
      childId: maya._id,
      activityId: piano._id,
      date: getRelativeDateString(-3),
      startTime: '15:00',
      endTime: '16:00',
      status: 'completed',
      bookingStatus: 'approved',
      teacherNotes: 'Maya is picking up note reading quickly. We played Hot Cross Buns! Please encourage her to play with her right hand curved.',
      parentFeedback: 'Maya was so excited to play a song!',
      ratingByParent: 5,
    },
    {
      enrollmentId: 'enr-3',
      teacherId: teacher1._id,
      childId: maya._id,
      activityId: piano._id,
      date: getRelativeDateString(3),
      startTime: '15:00',
      endTime: '16:00',
      status: 'upcoming',
      bookingStatus: 'approved',
    },
    {
      enrollmentId: 'enr-vocals-maya',
      teacherId: teacher1._id,
      childId: leo._id,
      activityId: vocals._id,
      date: getRelativeDateString(4),
      startTime: '15:00',
      endTime: '16:00',
      status: 'upcoming',
      bookingStatus: 'pending',
    }
  ];
  const savedClasses = await ClassSession.insertMany(classes);
  console.log('Created Class Sessions.');

  const class1 = savedClasses[0];
  const class2 = savedClasses[1];
  const class3 = savedClasses[2];
  const class5 = savedClasses[4];

  // 7. Create Homework
  const homeworks = [
    {
      classSessionId: class1._id,
      teacherId: teacher1._id,
      childId: leo._id,
      activityId: guitar._id,
      description: 'Practice switching between C major and G major chord shapes 20 times daily.',
      dueDate: getRelativeDateString(-2),
      status: 'done',
      submissionNotes: 'Leo did this every afternoon. The changes are much smoother now!',
      attachmentName: 'leo_guitar_video.mp4',
    },
    {
      classSessionId: class2._id,
      teacherId: teacher1._id,
      childId: leo._id,
      activityId: guitar._id,
      description: 'Practice the first 4 bars of Ode to Joy in standard tempo.',
      dueDate: getRelativeDateString(3),
      status: 'pending',
    },
    {
      classSessionId: class3._id,
      teacherId: teacher3._id,
      childId: leo._id,
      activityId: drawing._id,
      description: 'Complete the sphere shading drawing sheet.',
      dueDate: getRelativeDateString(-2),
      status: 'done',
      submissionNotes: 'We finished the shading and uploaded the scan.',
      attachmentName: 'leo_shading_practice.jpg',
    }
  ];
  await Homework.insertMany(homeworks);
  console.log('Created Homework records.');

  // 8. Create Payments
  const payments = [
    {
      childId: leo._id,
      parentId: parent._id,
      classSessionId: class1._id,
      amount: 40,
      dueDate: getRelativeDateString(-2),
      status: 'paid',
      paymentDate: getRelativeDateString(-3),
      paymentMethod: 'stripe',
      paymentReference: 'ch_3M2hG1E98gV01c2',
    },
    {
      childId: leo._id,
      parentId: parent._id,
      classSessionId: class3._id,
      amount: 25,
      dueDate: getRelativeDateString(-2),
      status: 'paid',
      paymentDate: getRelativeDateString(-3),
      paymentMethod: 'cash',
      paymentReference: 'admin-manual-cash-receipt',
    },
    {
      childId: maya._id,
      parentId: parent._id,
      classSessionId: class5._id,
      amount: 45,
      dueDate: getRelativeDateString(-1),
      status: 'paid',
      paymentDate: getRelativeDateString(-1),
      paymentMethod: 'cash',
      paymentReference: 'manual-cash-paid-at-desk',
    },
    {
      childId: leo._id,
      parentId: parent._id,
      classSessionId: class2._id,
      amount: 40,
      dueDate: getRelativeDateString(5),
      status: 'pending',
    }
  ];
  await Payment.insertMany(payments);
  console.log('Created Payment records.');

  // 9. Create Notifications
  const notifications = [
    {
      recipientUserId: parent._id,
      type: 'payment',
      title: 'Tuition Invoice Generated',
      message: 'A new invoice of $40 is generated for Leo\'s Guitar class on ' + getRelativeDateString(1),
      read: false,
    },
    {
      recipientUserId: parent._id,
      type: 'class',
      title: 'Booking Confirmed',
      message: 'Your lesson booking request for Maya\'s Piano class on ' + getRelativeDateString(3) + ' has been approved.',
      read: true,
    },
    {
      recipientUserId: teacher1._id,
      type: 'class',
      title: 'New Booking Request',
      message: 'Leo Parker has requested a Vocals lesson for ' + getRelativeDateString(4),
      read: false,
    }
  ];
  await Notification.insertMany(notifications);
  console.log('Created Notification alerts.');

  await mongoose.disconnect();
  console.log('Database seeding successfully finished.');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
