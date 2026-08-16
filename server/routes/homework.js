import express from 'express';
import { Homework } from '../models/Homework.js';
import { Child } from '../models/Child.js';
import { Notification } from '../models/Notification.js';
import { requireAuth, requireTeacher } from '../middleware/auth.js';

const router = express.Router();

// Get Homework (filtered by role)
router.get('/', requireAuth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'parent') {
      const children = await Child.find({ parentId: req.user.id });
      const childIds = children.map(c => c._id);
      query = { childId: { $in: childIds } };
    } else if (req.user.role === 'teacher') {
      query = { teacherId: req.user.id };
    }

    const list = await Homework.find(query)
      .populate('childId', 'name age')
      .populate('activityId', 'name')
      .populate('classSessionId', 'date startTime');
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Assign Homework (Teacher only)
router.post('/', requireAuth, requireTeacher, async (req, res) => {
  let { classSessionId, childId, activityId, description, dueDate } = req.body;
  try {
    if (!childId || !description || !dueDate) {
      return res.status(400).json({ error: 'childId, description, and dueDate are required.' });
    }

    // Auto lookup session details if missing
    if (!classSessionId || !activityId) {
      const ClassSession = (await import('../models/ClassSession.js')).ClassSession;
      const session = await ClassSession.findOne({
        teacherId: req.user.id,
        childId,
      }).sort({ date: -1 });

      if (session) {
        if (!classSessionId) classSessionId = session._id;
        if (!activityId) activityId = session.activityId;
      } else {
        const Activity = (await import('../models/Activity.js')).Activity;
        const act = await Activity.findOne();
        if (act) {
          if (!activityId) activityId = act._id;
        }
        
        const stub = await ClassSession.findOne();
        if (stub) {
          if (!classSessionId) classSessionId = stub._id;
        }
      }
    }

    if (!classSessionId || !activityId) {
      return res.status(400).json({ error: 'Class session or activity mapping could not be found to associate this homework.' });
    }

    const newHw = new Homework({
      classSessionId,
      teacherId: req.user.id,
      childId,
      activityId,
      description,
      dueDate,
      status: 'pending',
    });

    const saved = await newHw.save();

    // Notify Parent
    const child = await Child.findById(childId);
    if (child) {
      const notif = new Notification({
        recipientUserId: child.parentId,
        type: 'homework',
        title: 'New Homework Assigned',
        message: `Your child ${child.name} has a new homework task due on ${dueDate}.`,
      });
      await notif.save();
    }

    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Complete Homework (Parent only)
router.put('/:id/complete', requireAuth, async (req, res) => {
  const { submissionNotes, attachmentName } = req.body;
  try {
    const hw = await Homework.findById(req.id || req.params.id).populate('childId');
    if (!hw) {
      return res.status(404).json({ error: 'Homework not found.' });
    }

    // Auth check: parent must own child
    if (req.user.role !== 'admin' && hw.childId.parentId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Permission denied.' });
    }

    hw.status = 'done';
    hw.submissionNotes = submissionNotes || '';
    hw.attachmentName = attachmentName || '';
    const saved = await hw.save();

    // Notify Teacher
    const notif = new Notification({
      recipientUserId: hw.teacherId,
      type: 'homework',
      title: 'Homework Completed',
      message: `${hw.childId.name} marked their homework as complete.`,
    });
    await notif.save();

    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
