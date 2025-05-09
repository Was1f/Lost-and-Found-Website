import express from 'express';
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Sign-up Route
router.post('/signup', async (req, res) => {
  const { email, password, username, bio, profilePicUrl, coverPicUrl, studentId } = req.body;

  if (!email || !password || !studentId) {
    return res.status(400).json({ message: 'Please provide email, student ID and password' });
  }

  // Validate student ID format (8 digits)
  if (!/^\d{8}$/.test(studentId)) {
    return res.status(400).json({ message: 'Student ID must be an 8-digit number' });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Check if student ID already exists
    const existingStudentId = await User.findOne({ studentId });
    if (existingStudentId) {
      return res.status(400).json({ message: 'User with this Student ID already exists' });
    }

    // Create a new user using the wrapper
    const newUser = await User.create({
      email,
      password, // The pre-save hook will hash this password
      username,
      bio,
      profilePicUrl,
      coverPicUrl,
      studentId,
      isVerified: false
    });

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error('Error signing up:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare the entered password with the stored hashed password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check if user is banned
    if (user.status === 'banned') {
      return res.status(403).json({ message: 'banned' });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' }  // Extended token expiry to 30 days
    );

    // Send success response with user details
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        studentId: user.studentId,
        status: user.status,
        isVerified: user.isVerified
      }
    });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
