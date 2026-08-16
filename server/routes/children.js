import express from 'express';
import { Child } from '../models/Child.js';
import { requireAuth, requireParent } from '../middleware/auth.js';

const router = express.Router();

// Get Children (based on role)
router.get('/', requireAuth, async (req, res) => {
  try {
    if (req.user.role === 'parent') {
      const children = await Child.find({ parentId: req.user.id, active: true });
      return res.json(children);
    } else {
      // Admin/Teacher can fetch all active children
      const children = await Child.find({ active: true });
      return res.json(children);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Child by ID
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const child = await Child.findById(req.params.id)
      .populate('parentId', 'name email phone');
    if (!child) {
      return res.status(404).json({ error: 'Child profile not found.' });
    }
    res.json(child);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Child (Parent only)
router.post('/', requireAuth, requireParent, async (req, res) => {
  const { name, age, avatar, notes } = req.body;
  try {
    if (!name || !age) {
      return res.status(400).json({ error: 'Name and Age are required.' });
    }

    const newChild = new Child({
      parentId: req.user.id,
      name,
      age: Number(age),
      avatar: avatar || 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=150',
      notes: notes || '',
    });

    const saved = await newChild.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit Child
router.put('/:id', requireAuth, async (req, res) => {
  const { name, age, avatar, notes } = req.body;
  try {
    const child = await Child.findById(req.params.id);
    if (!child) {
      return res.status(404).json({ error: 'Child profile not found.' });
    }

    // Authorization: Owner or Admin
    if (req.user.role !== 'admin' && child.parentId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Permission denied: Cannot edit child of another parent.' });
    }

    if (name) child.name = name;
    if (age) child.age = Number(age);
    if (avatar !== undefined) child.avatar = avatar;
    if (notes !== undefined) child.notes = notes;

    const saved = await child.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Deactivate Child
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const child = await Child.findById(req.params.id);
    if (!child) {
      return res.status(404).json({ error: 'Child profile not found.' });
    }

    // Authorization: Owner or Admin
    if (req.user.role !== 'admin' && child.parentId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Permission denied: Cannot modify child of another parent.' });
    }

    child.active = false;
    await child.save();
    res.json({ message: 'Child profile deactivated.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
