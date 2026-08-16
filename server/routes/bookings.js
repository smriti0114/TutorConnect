import express from 'express';
import { ClassSession } from '../models/ClassSession.js';
import { TeacherProfile } from '../models/TeacherProfile.js';
import { Child } from '../models/Child.js';
import { Activity } from '../models/Activity.js';
import { Payment } from '../models/Payment.js';
import { Notification } from '../models/Notification.js';
import { requireAuth, requireParent, requireAdmin, requireAssociatedUser } from '../middleware/auth.js';

const router = express.Router();

// Helper to calculate end time
const getEndTime = (startTime) => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const endHours = hours + 1;
  return `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Helper check helper: date format / past dates validation
const isPastDate = (dateString, timeString) => {
  const bookingDateTime = new Date(`${dateString}T${timeString}`);
  return bookingDateTime.getTime() < Date.now();
};

// Create Booking Request
router.post('/', requireAuth, requireParent, async (req, res) => {
  const { childId, teacherId, activityId, date, startTime } = req.body;
  const parentId = req.user.id;

  try {
    if (!childId || !teacherId || !activityId || !date || !startTime) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // 1. Verify child belongs to parent
    const child = await Child.findById(childId);
    if (!child || child.parentId.toString() !== parentId || !child.active) {
      return res.status(400).json({ error: 'Selected child profile is invalid.' });
    }

    // 2. Validate activity
    const activity = await Activity.findById(activityId);
    if (!activity || !activity.active) {
      return res.status(400).json({ error: 'Selected activity is invalid or deactivated.' });
    }

    // 3. Validate teacher specialty
    const teacherProfile = await TeacherProfile.findOne({ userId: teacherId });
    if (!teacherProfile || !teacherProfile.specialtyActivityIds.includes(activity.name.toLowerCase())) {
      // Note: we support both lower case and ID strings. Let's make sure it matches
      const teaches = teacherProfile && (
        teacherProfile.specialtyActivityIds.includes(activityId) ||
        teacherProfile.specialtyActivityIds.includes(`act-${activity.name.toLowerCase()}`) ||
        teacherProfile.specialtyActivityIds.includes(activity.name.toLowerCase())
      );
      if (!teaches) {
        return res.status(400).json({ error: 'Selected teacher does not specialize in this activity.' });
      }
    }

    // 4. Validate future bookings
    if (isPastDate(date, startTime)) {
      return res.status(400).json({ error: 'Cannot book a class in the past.' });
    }

    const endTime = getEndTime(startTime);

    // 5. Child double-booking check
    const childConflicts = await ClassSession.find({
      childId,
      date,
      startTime,
      bookingStatus: { $ne: 'rejected' },
      status: { $ne: 'canceled' },
    });
    if (childConflicts.length > 0) {
      return res.status(400).json({ error: 'This child is already scheduled for another class at this time.' });
    }

    // 6. Teacher double-booking check
    const teacherConflicts = await ClassSession.find({
      teacherId,
      date,
      startTime,
      bookingStatus: { $ne: 'rejected' },
      status: { $ne: 'canceled' },
    });
    if (teacherConflicts.length > 0) {
      return res.status(400).json({ error: 'Teacher is already booked for another class at this slot.' });
    }

    // 7. Save booking
    const newSession = new ClassSession({
      teacherId,
      childId,
      activityId,
      date,
      startTime,
      endTime,
      bookingStatus: 'pending',
    });

    const saved = await newSession.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Bookings (Filtered by role)
router.get('/', requireAuth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'parent') {
      // Find parent's children first
      const children = await Child.find({ parentId: req.user.id });
      const childIds = children.map(c => c._id);
      query = { childId: { $in: childIds } };
    } else if (req.user.role === 'teacher') {
      query = { teacherId: req.user.id };
    }

    const bookings = await ClassSession.find(query)
      .populate('childId', 'name age avatar notes parentId')
      .populate('teacherId', 'name email phone')
      .populate('activityId', 'name description pricePerClass');

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Approve Booking
router.put('/:id/approve', requireAuth, requireAdmin, async (req, res) => {
  try {
    const session = await ClassSession.findById(req.params.id)
      .populate('childId')
      .populate('activityId');
    if (!session) {
      return res.status(404).json({ error: 'Class session not found.' });
    }

    // Child double-booking check
    const childConflicts = await ClassSession.find({
      _id: { $ne: session._id },
      childId: session.childId._id,
      date: session.date,
      startTime: session.startTime,
      bookingStatus: 'approved',
      status: { $ne: 'canceled' },
    });
    if (childConflicts.length > 0) {
      return res.status(400).json({ error: 'This child is already scheduled for another approved class at this time.' });
    }

    // Teacher double-booking check
    const teacherConflicts = await ClassSession.find({
      _id: { $ne: session._id },
      teacherId: session.teacherId,
      date: session.date,
      startTime: session.startTime,
      bookingStatus: 'approved',
      status: { $ne: 'canceled' },
    });
    if (teacherConflicts.length > 0) {
      return res.status(400).json({ error: 'You are already scheduled for another approved class at this time.' });
    }

    session.bookingStatus = 'approved';
    await session.save();

    // Create payment invoice
    const price = session.activityId ? session.activityId.pricePerClass : 40;
    const dueDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // due 5 days

    const existingPayment = await Payment.findOne({ classSessionId: session._id });
    if (!existingPayment) {
      const newPayment = new Payment({
        childId: session.childId._id,
        parentId: session.childId.parentId,
        classSessionId: session._id,
        amount: price,
        dueDate,
        status: 'pending',
      });
      await newPayment.save();
    }

    // Notify Parent
    const notif = new Notification({
      recipientUserId: session.childId.parentId,
      type: 'class',
      title: 'Booking Approved',
      message: `Your booking request for ${session.childId.name} on ${session.date} has been approved.`,
    });
    await notif.save();

    res.json({ message: 'Booking approved successfully.', session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Reject Booking
router.put('/:id/reject', requireAuth, requireAdmin, async (req, res) => {
  try {
    const session = await ClassSession.findById(req.params.id).populate('childId');
    if (!session) {
      return res.status(404).json({ error: 'Class session not found.' });
    }

    session.bookingStatus = 'rejected';
    await session.save();

    // Notify Parent
    const notif = new Notification({
      recipientUserId: session.childId.parentId,
      type: 'class',
      title: 'Booking Rejected',
      message: `Your booking request for ${session.childId.name} on ${session.date} was rejected.`,
    });
    await notif.save();

    res.json({ message: 'Booking rejected successfully.', session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Reschedule Booking
router.put('/:id/reschedule', requireAuth, requireAdmin, async (req, res) => {
  const { date, startTime } = req.body;
  try {
    if (!date || !startTime) {
      return res.status(400).json({ error: 'Date and startTime are required.' });
    }

    const session = await ClassSession.findById(req.params.id).populate('childId');
    if (!session) {
      return res.status(404).json({ error: 'Class session not found.' });
    }

    const endTime = getEndTime(startTime);

    // Child double-booking check
    const childConflicts = await ClassSession.find({
      _id: { $ne: session._id },
      childId: session.childId._id,
      date,
      startTime,
      bookingStatus: 'approved',
      status: { $ne: 'canceled' },
    });
    if (childConflicts.length > 0) {
      return res.status(400).json({ error: 'This child is already scheduled for another approved class at this time.' });
    }

    // Teacher double-booking check
    const teacherConflicts = await ClassSession.find({
      _id: { $ne: session._id },
      teacherId: session.teacherId,
      date,
      startTime,
      bookingStatus: 'approved',
      status: { $ne: 'canceled' },
    });
    if (teacherConflicts.length > 0) {
      return res.status(400).json({ error: 'You are already scheduled for another approved class at this time.' });
    }

    session.date = date;
    session.startTime = startTime;
    session.endTime = endTime;
    session.bookingStatus = 'approved';
    session.status = 'rescheduled';
    await session.save();

    // Notify Parent
    const notif = new Notification({
      recipientUserId: session.childId.parentId,
      type: 'class',
      title: 'Booking Rescheduled',
      message: `Your class for ${session.childId.name} has been rescheduled by the admin to ${date} at ${startTime}.`,
    });
    await notif.save();

    res.json({ message: 'Booking rescheduled and approved.', session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Reassign Teacher
router.put('/:id/reassign', requireAuth, requireAdmin, async (req, res) => {
  const { teacherId } = req.body;
  try {
    if (!teacherId) {
      return res.status(400).json({ error: 'teacherId is required.' });
    }

    const session = await ClassSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Class session not found.' });
    }

    // Teacher double-booking check for new teacher
    const conflicts = await ClassSession.find({
      _id: { $ne: session._id },
      teacherId,
      date: session.date,
      startTime: session.startTime,
      bookingStatus: 'approved',
      status: { $ne: 'canceled' },
    });
    if (conflicts.length > 0) {
      return res.status(400).json({ error: 'The selected teacher has a schedule conflict at this time.' });
    }

    session.teacherId = teacherId;
    await session.save();

    // Notify Teacher
    const notif = new Notification({
      recipientUserId: teacherId,
      type: 'class',
      title: 'New Class Reassigned',
      message: `An administrator reassigned you a class on ${session.date}.`,
    });
    await notif.save();

    res.json({ message: 'Teacher reassigned successfully.', session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Teacher log attendance / notes
router.put('/:id/log', requireAuth, async (req, res) => {
  const { status, teacherNotes, parentFeedback, ratingByParent } = req.body;
  try {
    const session = await ClassSession.findById(req.params.id).populate('childId');
    if (!session) {
      return res.status(404).json({ error: 'Class session not found.' });
    }

    // Teacher restriction: must be assigned teacher, or admin
    if (req.user.role !== 'admin' && session.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Permission denied: Not the assigned teacher.' });
    }

    if (status) session.status = status;
    if (teacherNotes !== undefined) session.teacherNotes = teacherNotes;
    if (parentFeedback !== undefined) session.parentFeedback = parentFeedback;
    if (ratingByParent !== undefined) session.ratingByParent = Number(ratingByParent);

    const saved = await session.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
