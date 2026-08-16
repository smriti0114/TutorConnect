import express from 'express';
import { Notification } from '../models/Notification.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Get Notifications for Current User
router.get('/', requireAuth, async (req, res) => {
  try {
    const list = await Notification.find({ recipientUserId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark Read
router.put('/:id/read', requireAuth, async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif) {
      return res.status(404).json({ error: 'Notification not found.' });
    }

    if (notif.recipientUserId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Permission denied.' });
    }

    notif.read = true;
    await notif.save();
    res.json({ message: 'Notification marked as read.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
