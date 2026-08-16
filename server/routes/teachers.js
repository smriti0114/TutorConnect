import express from 'express';
import { TeacherProfile } from '../models/TeacherProfile.js';
import { requireAuth, requireTeacher } from '../middleware/auth.js';

const router = express.Router();

// List all teachers (populated)
router.get('/', requireAuth, async (req, res) => {
  try {
    const teachers = await TeacherProfile.find()
      .populate('userId', 'name email phone active');
    
    // Format to match old client schema expectation
    const formatted = teachers.map(t => ({
      id: t._id,
      userId: t.userId ? t.userId._id : null,
      name: t.userId ? t.userId.name : 'Unknown Tutor',
      email: t.userId ? t.userId.email : '',
      phone: t.userId ? t.userId.phone : '',
      active: t.userId ? t.userId.active : false,
      specialtyActivityIds: t.specialtyActivityIds,
      bio: t.bio,
      experience: t.experience,
      rating: t.rating,
      availability: t.availability || [],
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Logged-in Teacher's Profile (Teacher only)
router.get('/me', requireAuth, requireTeacher, async (req, res) => {
  try {
    const profile = await TeacherProfile.findOne({ userId: req.user.id })
      .populate('userId', 'name email phone active');
    if (!profile) {
      return res.status(404).json({ error: 'Teacher profile not found.' });
    }
    res.json({
      id: profile._id,
      userId: profile.userId._id,
      name: profile.userId.name,
      email: profile.userId.email,
      phone: profile.userId.phone,
      active: profile.userId.active,
      specialtyActivityIds: profile.specialtyActivityIds,
      bio: profile.bio,
      experience: profile.experience,
      rating: profile.rating,
      availability: profile.availability || [],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Teacher Profile & Availability (Teacher only)
router.put('/profile', requireAuth, requireTeacher, async (req, res) => {
  const { specialtyActivityIds, bio, experience, availability } = req.body;
  try {
    const profile = await TeacherProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ error: 'Teacher profile not found.' });
    }

    if (specialtyActivityIds !== undefined) profile.specialtyActivityIds = specialtyActivityIds;
    if (bio !== undefined) profile.bio = bio;
    if (experience !== undefined) profile.experience = experience;
    if (availability !== undefined) profile.availability = availability;

    const saved = await profile.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
