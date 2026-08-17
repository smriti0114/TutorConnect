import express from 'express';
import { Activity } from '../models/Activity.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// List all active or inactive activities
router.get('/', async (req, res) => {
  try {
    const list = await Activity.find();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Activity (Admin only)
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const { name, description, pricePerClass } = req.body;
  try {
    if (!name || !description || pricePerClass === undefined) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const newActivity = new Activity({
      name,
      description,
      pricePerClass: Number(pricePerClass),
    });

    const saved = await newActivity.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit Activity (Admin only)
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { name, description, pricePerClass, active } = req.body;
  try {
    const act = await Activity.findById(req.params.id);
    if (!act) {
      return res.status(404).json({ error: 'Activity not found.' });
    }

    if (name) act.name = name;
    if (description) act.description = description;
    if (pricePerClass !== undefined) act.pricePerClass = Number(pricePerClass);
    if (active !== undefined) act.active = active;

    const saved = await act.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
