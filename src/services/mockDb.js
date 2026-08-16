// Storage keys
const STORAGE_KEYS = {
  USERS: 'tutoring_users',
  CHILDREN: 'tutoring_children',
  TEACHERS: 'tutoring_teachers',
  ACTIVITIES: 'tutoring_activities',
  ENROLLMENTS: 'tutoring_enrollments',
  CLASSES: 'tutoring_classes',
  HOMEWORK: 'tutoring_homework',
  PAYMENTS: 'tutoring_payments',
  NOTIFICATIONS: 'tutoring_notifications',
};

// Initial Seed Data
const defaultUsers = [
  {
    id: 'u-parent',
    name: 'Sarah Parker',
    role: 'parent',
    email: 'parent@example.com',
    phone: '555-0199',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    active: true,
    password: 'Demo123!',
  },
  {
    id: 'u-teacher1',
    name: 'Mr. Alex Carter',
    role: 'teacher',
    email: 'teacher@example.com',
    phone: '555-0122',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    active: true,
    password: 'Demo123!',
  },
  {
    id: 'u-teacher2',
    name: 'Ms. Clara Bow',
    role: 'teacher',
    email: 'clara@example.com',
    phone: '555-0143',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    active: true,
    password: 'Demo123!',
  },
  {
    id: 'u-teacher3',
    name: 'Mr. Marcus Sterling',
    role: 'teacher',
    email: 'marcus@example.com',
    phone: '555-0167',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    active: true,
    password: 'Demo123!',
  },
  {
    id: 'u-admin',
    name: 'Platform Director',
    role: 'admin',
    email: 'admin@example.com',
    phone: '555-0100',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    active: true,
    password: 'Demo123!',
  },
];

const defaultChildren = [
  {
    id: 'c-leo',
    parentId: 'u-parent',
    name: 'Leo Parker',
    age: 9,
    avatar: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=150',
    notes: 'Leo learns quickly but can lose focus after 45 minutes. Loves classical rock.',
    active: true,
  },
  {
    id: 'c-maya',
    parentId: 'u-parent',
    name: 'Maya Parker',
    age: 6,
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    notes: 'Maya is shy at first. Responds very well to positive reinforcement and visual sticker charts.',
    active: true,
  },
];

const defaultActivities = [
  { id: 'act-guitar', name: 'Guitar', description: 'One-on-one guitar sessions covering basic chords, fingerpicking, and children\'s favorite songs.', iconName: 'Music', pricePerClass: 40, active: true },
  { id: 'act-piano', name: 'Piano', description: 'Classical and modern piano tutoring. Focuses on scales, note reading, and rhythm coordination.', iconName: 'Activity', pricePerClass: 45, active: true },
  { id: 'act-violin', name: 'Violin', description: 'Introductory and intermediate violin classes. Teaches bow hold, posture, and intonation.', iconName: 'Heart', pricePerClass: 50, active: true },
  { id: 'act-vocals', name: 'Vocals', description: 'Fun vocal warm-ups, breathing techniques, pitch control, and song performances.', iconName: 'Mic', pricePerClass: 40, active: true },
  { id: 'act-dance', name: 'Dance', description: 'Energetic sessions in basic ballet, contemporary, or hip hop, focusing on rhythm and flow.', iconName: 'Footprints', pricePerClass: 35, active: true },
  { id: 'act-drawing', name: 'Drawing & Sketching', description: 'Creative art tutoring. Teaches coloring, perspective, cartooning, and basic sketching.', iconName: 'Palette', pricePerClass: 30, active: true },
];

const defaultTeachers = [
  {
    id: 'tp-1',
    userId: 'u-teacher1',
    specialtyActivityIds: ['act-guitar', 'act-piano', 'act-vocals'],
    bio: 'Alex is a professional multi-instrumentalist who has been teaching children for over 7 years. He focuses on making learning fun and engaging through custom-tailored song choices.',
    experience: '7 years teaching music',
    rating: 4.9,
    availability: [
      { dayOfWeek: 'Monday', timeSlots: ['14:00', '15:00', '16:00', '17:00'] },
      { dayOfWeek: 'Wednesday', timeSlots: ['15:00', '16:00', '17:00', '18:00'] },
      { dayOfWeek: 'Friday', timeSlots: ['14:00', '15:00', '16:00'] },
    ],
  },
  {
    id: 'tp-2',
    userId: 'u-teacher2',
    specialtyActivityIds: ['act-vocals', 'act-dance'],
    bio: 'Clara is a Broadway-trained performer with a passion for helping children find their voice and express themselves through dance and song.',
    experience: '5 years teaching vocals & dance',
    rating: 4.8,
    availability: [
      { dayOfWeek: 'Tuesday', timeSlots: ['15:00', '16:00', '17:00'] },
      { dayOfWeek: 'Thursday', timeSlots: ['15:00', '16:00', '17:00', '18:00'] },
    ],
  },
  {
    id: 'tp-3',
    userId: 'u-teacher3',
    specialtyActivityIds: ['act-violin', 'act-drawing'],
    bio: 'Marcus teaches classical violin and fine arts. He believes that artistic discipline builds focus and creativity in young minds.',
    experience: '10 years teaching',
    rating: 5.0,
    availability: [
      { dayOfWeek: 'Monday', timeSlots: ['16:00', '17:00', '18:00'] },
      { dayOfWeek: 'Wednesday', timeSlots: ['16:00', '17:00', '18:00'] },
      { dayOfWeek: 'Saturday', timeSlots: ['10:00', '11:00', '12:00', '14:00'] },
    ],
  },
];

const defaultEnrollments = [
  {
    id: 'enr-1',
    childId: 'c-leo',
    activityId: 'act-guitar',
    teacherId: 'u-teacher1',
    schedule: 'Mondays at 4:00 PM',
    status: 'active',
  },
  {
    id: 'enr-2',
    childId: 'c-leo',
    activityId: 'act-drawing',
    teacherId: 'u-teacher3',
    schedule: 'Mondays at 6:00 PM',
    status: 'active',
  },
  {
    id: 'enr-3',
    childId: 'c-maya',
    activityId: 'act-piano',
    teacherId: 'u-teacher1',
    schedule: 'Wednesdays at 3:00 PM',
    status: 'active',
  },
];

// Helper to construct dates relative to today
const getRelativeDateString = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

const defaultClasses = [
  // Leo Guitar: Past and Future
  {
    id: 'cls-1',
    enrollmentId: 'enr-1',
    teacherId: 'u-teacher1',
    childId: 'c-leo',
    activityId: 'act-guitar',
    date: getRelativeDateString(-7), // 1 week ago
    startTime: '16:00',
    endTime: '17:00',
    status: 'completed',
    bookingStatus: 'approved',
    teacherNotes: 'Leo did fantastic today! We learned the C major chord. He practiced diligently. For next week, please make sure he practices transition between G and C.',
    parentFeedback: 'Leo loved the class and had fun learning the chords!',
    ratingByParent: 5,
  },
  {
    id: 'cls-2',
    enrollmentId: 'enr-1',
    teacherId: 'u-teacher1',
    childId: 'c-leo',
    activityId: 'act-guitar',
    date: getRelativeDateString(1), // Tomorrow
    startTime: '16:00',
    endTime: '17:00',
    status: 'upcoming',
    bookingStatus: 'approved',
  },
  {
    id: 'cls-3',
    enrollmentId: 'enr-1',
    teacherId: 'u-teacher1',
    childId: 'c-leo',
    activityId: 'act-guitar',
    date: getRelativeDateString(8), // 8 days from now
    startTime: '16:00',
    endTime: '17:00',
    status: 'upcoming',
    bookingStatus: 'approved',
  },
  
  // Leo Drawing: Past and Future
  {
    id: 'cls-4',
    enrollmentId: 'enr-2',
    teacherId: 'u-teacher3',
    childId: 'c-leo',
    activityId: 'act-drawing',
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
    id: 'cls-5',
    enrollmentId: 'enr-2',
    teacherId: 'u-teacher3',
    childId: 'c-leo',
    activityId: 'act-drawing',
    date: getRelativeDateString(1),
    startTime: '18:00',
    endTime: '19:00',
    status: 'upcoming',
    bookingStatus: 'approved',
  },

  // Maya Piano: Past and Future
  {
    id: 'cls-6',
    enrollmentId: 'enr-3',
    teacherId: 'u-teacher1',
    childId: 'c-maya',
    activityId: 'act-piano',
    date: getRelativeDateString(-3), // 3 days ago
    startTime: '15:00',
    endTime: '16:00',
    status: 'completed',
    bookingStatus: 'approved',
    teacherNotes: 'Maya is picking up note reading quickly. We played Hot Cross Buns! Please encourage her to play with her right hand curved.',
    parentFeedback: 'Maya was so excited to play a song!',
    ratingByParent: 5,
  },
  {
    id: 'cls-7',
    enrollmentId: 'enr-3',
    teacherId: 'u-teacher1',
    childId: 'c-maya',
    activityId: 'act-piano',
    date: getRelativeDateString(3), // 3 days from now
    startTime: '15:00',
    endTime: '16:00',
    status: 'upcoming',
    bookingStatus: 'approved',
  },
  
  // Booking request (pending)
  {
    id: 'cls-pending-booking',
    teacherId: 'u-teacher1',
    childId: 'c-leo',
    activityId: 'act-vocals',
    date: getRelativeDateString(4),
    startTime: '15:00',
    endTime: '16:00',
    status: 'upcoming',
    bookingStatus: 'pending',
  }
];

const defaultHomework = [
  {
    id: 'hw-1',
    classSessionId: 'cls-1',
    teacherId: 'u-teacher1',
    childId: 'c-leo',
    activityId: 'act-guitar',
    description: 'Practice transitioning between G major and C major chords for 10 minutes every day. Keep wrist straight.',
    dueDate: getRelativeDateString(-2),
    status: 'done',
    completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    submissionNotes: 'Practiced 5 days! Transitioning is faster now.',
  },
  {
    id: 'hw-2',
    classSessionId: 'cls-5',
    teacherId: 'u-teacher3',
    childId: 'c-leo',
    activityId: 'act-drawing',
    description: 'Sketch a fruit basket containing an apple, a banana, and an orange. Work on smooth shadows.',
    dueDate: getRelativeDateString(5),
    status: 'pending',
  },
  {
    id: 'hw-3',
    classSessionId: 'cls-6',
    teacherId: 'u-teacher1',
    childId: 'c-maya',
    activityId: 'act-piano',
    description: 'Play Hot Cross Buns 5 times with curved fingers. Record video if possible.',
    dueDate: getRelativeDateString(2),
    status: 'pending',
  },
];

const defaultPayments = [
  {
    id: 'pay-1',
    childId: 'c-leo',
    parentId: 'u-parent',
    enrollmentId: 'enr-1',
    amount: 160, // 4 classes of Guitar
    dueDate: getRelativeDateString(-5),
    status: 'paid',
    paymentDate: getRelativeDateString(-6),
    paymentMethod: 'card',
    reference: 'TXN-98218-GP',
  },
  {
    id: 'pay-2',
    childId: 'c-leo',
    parentId: 'u-parent',
    enrollmentId: 'enr-2',
    amount: 120, // 4 classes of Drawing
    dueDate: getRelativeDateString(5),
    status: 'pending',
  },
  {
    id: 'pay-3',
    childId: 'c-maya',
    parentId: 'u-parent',
    enrollmentId: 'enr-3',
    amount: 180, // 4 classes of Piano
    dueDate: getRelativeDateString(-12),
    status: 'overdue',
  },
];

const defaultNotifications = [
  {
    id: 'nt-1',
    recipientUserId: 'u-parent',
    type: 'payment',
    title: 'Payment Overdue',
    message: 'Your payment of $180 for Maya\'s Piano classes is overdue. Please complete it as soon as possible.',
    read: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'nt-2',
    recipientUserId: 'u-parent',
    type: 'homework',
    title: 'New Homework Assigned',
    message: 'Mr. Alex Carter assigned new homework for Maya: "Play Hot Cross Buns 5 times..."',
    read: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'nt-3',
    recipientUserId: 'u-teacher1',
    type: 'booking',
    title: 'New Booking Request',
    message: 'Sarah Parker requested a Vocals session for Leo on Friday.',
    read: false,
    createdAt: new Date(Date.now() - 1 * 12 * 60 * 60 * 1000).toISOString(),
  },
];

// LocalStorage Service Wrapper
export const mockDb = {
  // Generic Read/Write
  get(key, defaultValue) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  },

  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  // Initialize DB if empty
  initialize() {
    const existingUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    let needsReset = false;
    if (existingUsers) {
      try {
        const parsed = JSON.parse(existingUsers);
        const parentUser = parsed.find(u => u.id === 'u-parent');
        if (parentUser && !parentUser.password) {
          needsReset = true;
        }
      } catch (e) {
        needsReset = true;
      }
    }
    if (!existingUsers || needsReset) {
      localStorage.clear();
      this.set(STORAGE_KEYS.USERS, defaultUsers);
      this.set(STORAGE_KEYS.CHILDREN, defaultChildren);
      this.set(STORAGE_KEYS.ACTIVITIES, defaultActivities);
      this.set(STORAGE_KEYS.TEACHERS, defaultTeachers);
      this.set(STORAGE_KEYS.ENROLLMENTS, defaultEnrollments);
      this.set(STORAGE_KEYS.CLASSES, defaultClasses);
      this.set(STORAGE_KEYS.HOMEWORK, defaultHomework);
      this.set(STORAGE_KEYS.PAYMENTS, defaultPayments);
      this.set(STORAGE_KEYS.NOTIFICATIONS, defaultNotifications);
    }
  },

  reset() {
    localStorage.clear();
    this.initialize();
  },

  // Users
  getUsers() {
    return this.get(STORAGE_KEYS.USERS, []);
  },
  saveUsers(users) {
    this.set(STORAGE_KEYS.USERS, users);
  },

  // Children
  getChildren() {
    return this.get(STORAGE_KEYS.CHILDREN, []);
  },
  saveChildren(children) {
    this.set(STORAGE_KEYS.CHILDREN, children);
  },

  // Teachers
  getTeachers() {
    return this.get(STORAGE_KEYS.TEACHERS, []);
  },
  saveTeachers(teachers) {
    this.set(STORAGE_KEYS.TEACHERS, teachers);
  },

  // Activities
  getActivities() {
    return this.get(STORAGE_KEYS.ACTIVITIES, []);
  },
  saveActivities(activities) {
    this.set(STORAGE_KEYS.ACTIVITIES, activities);
  },

  // Enrollments
  getEnrollments() {
    return this.get(STORAGE_KEYS.ENROLLMENTS, []);
  },
  saveEnrollments(enrollments) {
    this.set(STORAGE_KEYS.ENROLLMENTS, enrollments);
  },

  // Classes
  getClasses() {
    return this.get(STORAGE_KEYS.CLASSES, []);
  },
  saveClasses(classes) {
    this.set(STORAGE_KEYS.CLASSES, classes);
  },

  // Homework
  getHomework() {
    return this.get(STORAGE_KEYS.HOMEWORK, []);
  },
  saveHomework(homework) {
    this.set(STORAGE_KEYS.HOMEWORK, homework);
  },

  // Payments
  getPayments() {
    return this.get(STORAGE_KEYS.PAYMENTS, []);
  },
  savePayments(payments) {
    this.set(STORAGE_KEYS.PAYMENTS, payments);
  },

  // Notifications
  getNotifications() {
    return this.get(STORAGE_KEYS.NOTIFICATIONS, []);
  },
  saveNotifications(notifications) {
    this.set(STORAGE_KEYS.NOTIFICATIONS, notifications);
  },

  // Helper operations

  // Auth helper
  validateUser(email, password) {
    const users = this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    return user || null;
  },

  // Add Notification
  addNotification(recipientUserId, type, title, message) {
    const notifications = this.getNotifications();
    const newNotif = {
      id: `nt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      recipientUserId,
      type,
      title,
      message,
      read: false,
      createdAt: new Date().toISOString(),
    };
    this.saveNotifications([newNotif, ...notifications]);
  },

  // Mark notification read
  markNotificationRead(id) {
    const notifications = this.getNotifications();
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    this.saveNotifications(updated);
  },

  // Book class request
  createBookingRequest(childId, parentId, teacherId, activityId, date, startTime) {
    const classes = this.getClasses();
    const children = this.getChildren();

    // 1. Validate that the child belongs to the logged-in parent
    const child = children.find(c => c.id === childId);
    if (!child || child.parentId !== parentId) {
      throw new Error('Selected child profile is invalid or does not belong to this parent.');
    }

    // 2. Validate that the teacher specializes in this activity
    const teachers = this.getTeachers();
    const teacherProfile = teachers.find(t => t.userId === teacherId);
    if (!teacherProfile || !teacherProfile.specialtyActivityIds.includes(activityId)) {
      throw new Error('Selected teacher does not specialize in this activity.');
    }

    // 3. Validate that the selected slot is not in the past
    const requestedDateTime = new Date(`${date}T${startTime}`).getTime();
    const currentDateTime = Date.now();
    if (requestedDateTime < currentDateTime) {
      throw new Error('Cannot book a class in the past.');
    }

    // 4. Validate that the child is not double-booked
    const childConflicts = classes.filter(c => 
      c.childId === childId &&
      c.date === date &&
      c.startTime === startTime &&
      c.bookingStatus !== 'rejected' &&
      c.status !== 'canceled'
    );
    if (childConflicts.length > 0) {
      throw new Error('This child is already scheduled for a class at this time.');
    }

    // 5. Validate that the teacher is not double-booked
    const teacherConflicts = classes.filter(c => 
      c.teacherId === teacherId && 
      c.date === date && 
      c.startTime === startTime && 
      c.bookingStatus !== 'rejected' &&
      c.status !== 'canceled'
    );
    if (teacherConflicts.length > 0) {
      throw new Error('Teacher is already booked or has a pending request for this time slot.');
    }

    // End time is always +1 hour
    const [hours, minutes] = startTime.split(':').map(Number);
    const endHours = hours + 1;
    const endTime = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    const newBooking = {
      id: `cls-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      teacherId,
      childId,
      activityId,
      date,
      startTime,
      endTime,
      status: 'upcoming',
      bookingStatus: 'pending',
    };

    this.saveClasses([...classes, newBooking]);

    // Send notifications to teacher and admin
    this.addNotification(
      teacherId,
      'booking',
      'New Booking Request Received',
      `You have a new booking request for ${startTime} on ${date}.`
    );

    const admins = this.getUsers().filter(u => u.role === 'admin');
    admins.forEach(adm => {
      this.addNotification(
        adm.id,
        'booking',
        'New Class Booking Request',
        `A new booking request needs review for teacher Alex Carter.`
      );
    });
  },

  // Approve booking request
  approveBooking(classId) {
    const currentUserStr = localStorage.getItem('tutoring_current_user');
    if (!currentUserStr) {
      throw new Error('Unauthorized operation: User session not found.');
    }
    const currentUser = JSON.parse(currentUserStr);
    if (currentUser.role !== 'admin') {
      throw new Error('Permission Denied: Only Administrators are authorized to perform this operation.');
    }

    const classes = this.getClasses();
    const session = classes.find(c => c.id === classId);
    if (!session) return;

    // Validate child conflicts
    const childConflicts = classes.filter(c => 
      c.id !== classId &&
      c.childId === session.childId &&
      c.date === session.date &&
      c.startTime === session.startTime &&
      c.bookingStatus === 'approved' &&
      c.status !== 'canceled'
    );
    if (childConflicts.length > 0) {
      throw new Error('This child is already scheduled for another approved class at this time.');
    }

    // Validate teacher conflicts
    const teacherConflicts = classes.filter(c => 
      c.id !== classId &&
      c.teacherId === session.teacherId && 
      c.date === session.date && 
      c.startTime === session.startTime && 
      c.bookingStatus === 'approved' &&
      c.status !== 'canceled'
    );
    if (teacherConflicts.length > 0) {
      throw new Error('You are already scheduled for another approved class at this time.');
    }

    session.bookingStatus = 'approved';
    this.saveClasses([...classes]);

    // Get parentId
    const children = this.getChildren();
    const child = children.find(ch => ch.id === session.childId);
    if (child) {
      this.addNotification(
        child.parentId,
        'class',
        'Booking Approved!',
        `Your class request for ${child.name} on ${session.date} has been approved.`
      );

      // Create a mock pending payment for this approved class
      const activities = this.getActivities();
      const activity = activities.find(a => a.id === session.activityId);
      const price = activity ? activity.pricePerClass : 40;

      const payments = this.getPayments();
      const newPayment = {
        id: `pay-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        childId: session.childId,
        parentId: child.parentId,
        classSessionId: session.id,
        amount: price,
        dueDate: getRelativeDateString(5), // due in 5 days
        status: 'pending',
      };
      this.savePayments([...payments, newPayment]);
      this.addNotification(
        child.parentId,
        'payment',
        'New Fee Pending',
        `A class booking has been approved. A pending payment of $${price} is due by ${newPayment.dueDate}.`
      );
    }
  },

  // Reject booking request
  rejectBooking(classId) {
    const currentUserStr = localStorage.getItem('tutoring_current_user');
    if (!currentUserStr) {
      throw new Error('Unauthorized operation: User session not found.');
    }
    const currentUser = JSON.parse(currentUserStr);
    if (currentUser.role !== 'admin') {
      throw new Error('Permission Denied: Only Administrators are authorized to perform this operation.');
    }

    const classes = this.getClasses();
    const session = classes.find(c => c.id === classId);
    if (!session) return;

    session.bookingStatus = 'rejected';
    this.saveClasses([...classes]);

    const children = this.getChildren();
    const child = children.find(ch => ch.id === session.childId);
    if (child) {
      this.addNotification(
        child.parentId,
        'class',
        'Booking Request Update',
        `Your class request for ${child.name} on ${session.date} was unfortunately declined by the teacher or administrator.`
      );
    }
  },

  // Reschedule class request
  rescheduleClass(classId, newDate, newStartTime) {
    const currentUserStr = localStorage.getItem('tutoring_current_user');
    if (!currentUserStr) {
      throw new Error('Unauthorized operation: User session not found.');
    }
    const currentUser = JSON.parse(currentUserStr);
    if (currentUser.role !== 'admin') {
      throw new Error('Permission Denied: Only Administrators are authorized to perform this operation.');
    }

    const classes = this.getClasses();
    const session = classes.find(c => c.id === classId);
    if (!session) return;

    // Validate child conflicts
    const childConflicts = classes.filter(c => 
      c.id !== classId &&
      c.childId === session.childId &&
      c.date === newDate &&
      c.startTime === newStartTime &&
      c.bookingStatus === 'approved' &&
      c.status !== 'canceled'
    );
    if (childConflicts.length > 0) {
      throw new Error('This child is already scheduled for another approved class at this time.');
    }

    // Validate teacher conflicts
    const teacherConflicts = classes.filter(c => 
      c.id !== classId &&
      c.teacherId === session.teacherId && 
      c.date === newDate && 
      c.startTime === newStartTime && 
      c.bookingStatus === 'approved' &&
      c.status !== 'canceled'
    );
    if (teacherConflicts.length > 0) {
      throw new Error('You are already scheduled for another approved class at this time.');
    }

    session.date = newDate;
    session.startTime = newStartTime;
    session.status = 'rescheduled';
    
    // Calculate new end time (+1 hour)
    const [hours, minutes] = newStartTime.split(':').map(Number);
    const endHours = hours + 1;
    session.endTime = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    this.saveClasses([...classes]);

    const children = this.getChildren();
    const child = children.find(ch => ch.id === session.childId);
    if (child) {
      this.addNotification(
        child.parentId,
        'class',
        'Class Rescheduled',
        `Your class for ${child.name} has been rescheduled to ${newDate} at ${newStartTime}.`
      );
    }
  },

  // Cancel class request
  cancelClass(classId) {
    const classes = this.getClasses();
    const session = classes.find(c => c.id === classId);
    if (!session) return;

    session.status = 'canceled';
    this.saveClasses([...classes]);

    const children = this.getChildren();
    const child = children.find(ch => ch.id === session.childId);
    if (child) {
      this.addNotification(
        child.parentId,
        'class',
        'Class Canceled',
        `The class session scheduled on ${session.date} has been canceled.`
      );
    }
  },

  // Mark attendance & add notes
  logClassAttendance(classId, status, notes) {
    const classes = this.getClasses();
    const session = classes.find(c => c.id === classId);
    if (!session) return;

    session.status = status;
    session.teacherNotes = notes;
    this.saveClasses([...classes]);

    if (status === 'completed') {
      const children = this.getChildren();
      const child = children.find(ch => ch.id === session.childId);
      if (child) {
        this.addNotification(
          child.parentId,
          'class',
          'Class Feedback Available',
          `Your tutor left notes on ${child.name}'s lesson today: "${notes.substring(0, 40)}..."`
        );
      }
    }
  },

  // Assign Homework
  assignHomework(teacherId, childId, classSessionId, description, dueDate) {
    const homeworks = this.getHomework();
    const classes = this.getClasses();
    const session = classes.find(c => c.id === classSessionId);
    const activityId = session ? session.activityId : undefined;

    const newHw = {
      id: `hw-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      classSessionId,
      teacherId,
      childId,
      activityId,
      description,
      dueDate,
      status: 'pending',
    };
    this.saveHomework([...homeworks, newHw]);

    const children = this.getChildren();
    const child = children.find(ch => ch.id === childId);
    if (child) {
      this.addNotification(
        child.parentId,
        'homework',
        'New Homework Assigned',
        `A new assignment is due for ${child.name} on ${dueDate}.`
      );
    }
  },

  // Mark homework completed
  submitHomework(hwId, notes, attachmentName) {
    const homeworks = this.getHomework();
    const hw = homeworks.find(h => h.id === hwId);
    if (!hw) return;

    hw.status = 'done';
    hw.completedAt = new Date().toISOString();
    hw.submissionNotes = notes;
    hw.attachmentName = attachmentName || 'uploaded_work.jpg';
    this.saveHomework([...homeworks]);

    this.addNotification(
      hw.teacherId,
      'homework',
      'Homework Completed',
      `Homework for student has been marked complete and is ready for review.`
    );
  },

  // Mark payment as paid (Admin action)
  markPaymentPaid(paymentId, method, reference, date) {
    const payments = this.getPayments();
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return;

    payment.status = 'paid';
    payment.paymentMethod = method;
    payment.reference = reference;
    payment.paymentDate = date;
    
    this.savePayments([...payments]);

    // Send notification to parent
    this.addNotification(
      payment.parentId,
      'payment',
      'Receipt Confirmed',
      `Payment of $${payment.amount} has been successfully recorded. Thank you!`
    );
  }
};
