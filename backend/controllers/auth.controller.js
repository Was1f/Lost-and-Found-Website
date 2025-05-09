import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

// ========================
// Sign-up Controller
// ========================
export const signupController = async (req, res) => {
  const { username, email, password, studentId } = req.body;

  if (!email || !password || !username || !studentId) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }, { studentId }]
    });
    
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ message: 'Username already in use' });
      }
      if (existingUser.studentId === studentId) {
        return res.status(400).json({ message: 'Student ID already registered' });
      }
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user with status 'active'
    const newUser = new User({
      username,
      email,
      password, // Password will be hashed by pre-save hook
      studentId,
      status: 'active', // Default status is active
    });

    // Save user to the database
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully', success: true });
  } catch (error) {
    console.error('Error in signup:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ========================
// Login Controller
// ========================
export const loginController = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user is banned
    if (user.status === 'banned') {
      return res.status(403).json({ 
        message: 'Your account has been banned. Please contact support.',
        banned: true 
      });
    }

    // Compare the entered password with the stored hashed password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'supersecretkey', // Fallback secret for dev
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { 
        id: user._id,
        email: user.email, 
        username: user.username,
        status: user.status
      },
    });

  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};