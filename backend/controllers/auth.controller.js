import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

// ========================
// Sign-up Controller
// ========================
export const signupController = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log('Email:', email);
    console.log('Hashed Password:', hashedPassword);

    // Create new user with status 'active'
    const newUser = new User({
      email,
      password: hashedPassword,
      status: 'active', // ✅ New users will have active status by default
    });

    // Save user to the database
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully', success: true });
  } catch (error) {
    console.error('Error in signup:', error);
    res.status(500).json({ message: 'Server error', error });
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

    console.log('User:', user);

    // ✅ Ban Check First: before matching password
    if (!user.status || user.status.toLowerCase() === 'banned') {
      return res.status(403).json({ message: 'Your account has been banned. Please contact support.' });
    }

    // Compare the entered password with the stored hashed password
    const isMatch = await user.matchPassword(password, user.password);
    console.log('Password Match:', isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { email: user.email },
    });

  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};
