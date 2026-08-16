import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { TeacherProfile } from '../models/TeacherProfile.js';
import { Child } from '../models/Child.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Register Parent or Teacher (Admin blocked)
router.post('/register', async (req, res) => {
  const { name, email, password, phone, role, childName, childAge } = req.body;

  try {
    if (!name || !email || !password || !phone || !role) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    if (role === 'admin') {
      return res.status(403).json({ error: 'Admin registration is blocked.' });
    }

    if (!['parent', 'teacher'].includes(role)) {
      return res.status(400).json({ error: 'Invalid user role selected.' });
    }

    // Check duplicate
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
    });
    const savedUser = await newUser.save();

    // If teacher, create default TeacherProfile
    if (role === 'teacher') {
      const { bio, experience, specialtyActivityIds } = req.body;
      const defaultProfile = new TeacherProfile({
        userId: savedUser._id,
        specialtyActivityIds: specialtyActivityIds || [],
        bio: bio || 'No bio added yet.',
        experience: experience || 'New teacher account',
        availability: [
          { dayOfWeek: 'Monday', timeSlots: ['16:00', '17:00'] },
          { dayOfWeek: 'Wednesday', timeSlots: ['16:00', '17:00'] }
        ]
      });
      await defaultProfile.save();
    }

    // If parent, optionally seed default child profile if provided
    if (role === 'parent') {
      const defaultChild = new Child({
        parentId: savedUser._id,
        name: childName || `${name}'s Child`,
        age: childAge ? Number(childAge) : 8,
        avatar: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=150',
        notes: 'Enjoys learning new skills!',
      });
      await defaultChild.save();
    }

    res.status(201).json({ message: 'Registration successful.' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error during registration.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user || !user.active) {
      return res.status(400).json({ error: 'Invalid credentials or inactive account.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    // Sign JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error during login.' });
  }
});

// Get Current User Profile
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all users (Admin only)
router.get('/list', requireAuth, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new user by Admin (Admin only)
router.post('/admin-create', requireAuth, requireAdmin, async (req, res) => {
  const { name, email, password, phone, role } = req.body;
  try {
    if (!name || !email || !password || !phone || !role) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ error: 'User account already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
    });
    const saved = await newUser.save();

    if (role === 'teacher') {
      const defaultProfile = new TeacherProfile({
        userId: saved._id,
        specialtyActivityIds: [],
        bio: 'No bio added yet.',
        experience: 'New teacher account',
        availability: [
          { dayOfWeek: 'Monday', timeSlots: ['16:00', '17:00'] },
          { dayOfWeek: 'Wednesday', timeSlots: ['16:00', '17:00'] }
        ]
      });
      await defaultProfile.save();
    }

    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle user active status (Admin only)
router.put('/:id/toggle-active', requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    user.active = !user.active;
    await user.save();
    res.json({ message: 'User active status updated.', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user details (Admin only)
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { name, email, phone, password } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    res.json({ message: 'User details updated.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
