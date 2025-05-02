import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Sign-up Route
router.post('/signup', async (req, res) => {
  const { email, password,username,bio,profilePicUrl,coverPicUrl,studentId } = req.body;

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
    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = new User({ 
      email, 
      //password: hashedPassword,   password is being hashed twice here 
      password,
      username,
      bio,
      profilePicUrl,
      coverPicUrl,
      studentId,
      isVerified: false
    });

    // Save the user to the database
    await newUser.save();

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

    // **Banned User Check**
    if (user.status === 'banned') {
      return res.status(403).json({ message: 'banned' });  // Send 'banned' message
    }

    // ✅ Generate JWT Token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'secret',  // Secret key for signing JWT
      { expiresIn: '1h' }  // Token expiry
    );

    // Send success response if password matches
    res.status(200).json({ message: 'Login successful', token, user: { email: user.email } });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
