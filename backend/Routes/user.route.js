import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';  // Use JWT for creating a token
import User from '../models/user.model.js'; // Import User model

const router = express.Router();

// Sign-up route
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ success: false, message: 'User already exists' });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save new user
    const newUser = new User({
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    // Compare the password with the hashed one
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    // Create and send a JWT token
    const token = jwt.sign(
      { userId: user._id },  // Payload: user ID
      process.env.JWT_SECRET,  // Secret key from .env
      { expiresIn: '1h' }  // Token expiration time (1 hour)
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: "supersecretkey",  // Send the JWT token
      user: { email: user.email },  // Optionally send user details (e.g. email)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

//edit user profile route:
router.put('/:id', async (req, res) => {
  try {
    const updates = {
      username: req.body.username,
      bio: req.body.bio,
      profilePicUrl: req.body.profilePicUrl,
      coverPicUrl: req.body.coverPicUrl,
    };

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get('/leaderboard', async (req, res) => {
  try {
    // Find all users, sorted by points in descending order
    // For testing, we're not filtering by points > 0 yet
    const users = await User.find()
      .select('username email bio profilePic coverPic studentId isVerified points')
      .sort({ points: -1 })
      .limit(100); // Limit to top 100 users for performance
    
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Error fetching leaderboard', error: error.message });
  }
});

// Get user profile by ID (for viewing other users' profiles)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('username email bio profilePic coverPic studentId isVerified points');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});


export default router;
