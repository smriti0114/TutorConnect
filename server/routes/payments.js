import express from 'express';
import { Payment } from '../models/Payment.js';
import { Notification } from '../models/Notification.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get Payments
router.get('/', requireAuth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'parent') {
      query = { parentId: req.user.id };
    }

    const payments = await Payment.find(query)
      .populate('childId', 'name age avatar')
      .populate('parentId', 'name email phone')
      .populate({
        path: 'classSessionId',
        populate: [
          { path: 'teacherId', select: 'name email phone' },
          { path: 'activityId', select: 'name pricePerClass' }
        ]
      });

    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark Paid (Admin or Parent Owner)
router.put('/:id/mark-paid', requireAuth, async (req, res) => {
  const { paymentMethod, paymentReference, paymentDate } = req.body;
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment invoice not found.' });
    }

    // Auth check: Admin or Parent Owner
    if (req.user.role !== 'admin' && payment.parentId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Permission denied: Cannot mark payment for another parent.' });
    }

    payment.status = 'paid';
    payment.paymentDate = paymentDate || new Date().toISOString().split('T')[0];
    payment.paymentMethod = paymentMethod || 'stripe';
    payment.paymentReference = paymentReference || `REF-${Date.now()}`;
    const saved = await payment.save();

    // Notify Parent
    const notif = new Notification({
      recipientUserId: payment.parentId,
      type: 'payment',
      title: 'Receipt Confirmed',
      message: `Your payment of $${payment.amount} has been successfully verified (Ref: ${payment.paymentReference}).`,
    });
    await notif.save();

    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
