import express from 'express';
import User from '../models/user.model.js';
import Post from '../models/post.model.js';
import { protect } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve('uploads'));  // Save images to 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // Unique filename with extension
  },
});

const upload = multer({ storage });

// Get user profile by ID or 'me'
const getUserById = async (req, res) => {
  try {
    // Handle special case for 'me'
    const userId = req.params.userId === 'me' ? req.user._id : req.params.userId;

    // Use findById for getting user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's posts using find
    const posts = await Post.find({ user: userId })
      .sort({ createdAt: -1 })
      .exec();

    // Return the user data directly since frontend expects it at the top level
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      profilePic: user.profilePic,
      coverPic: user.coverPic,
      studentId: user.studentId,
      isVerified: user.isVerified,
      points: user.points,
      createdAt: user.createdAt,
      posts: posts
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
};

// Update user profile
router.put('/:userId', protect, upload.fields([
  { name: 'profilePic', maxCount: 1 },
  { name: 'coverPic', maxCount: 1 }
]), async (req, res) => {
  try {
    // Resolve 'me' to the actual user ID
    const userId = req.params.userId === 'me' ? req.user._id.toString() : req.params.userId;

    // Check if user is updating their own profile
    if (userId !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this profile' });
    }

    const { username, bio } = req.body;
    const updateData = {};

    if (username) updateData.username = username;
    if (bio !== undefined) updateData.bio = bio;

    if (req.files) {
      if (req.files.profilePic) {
        updateData.profilePic = `uploads/${req.files.profilePic[0].filename}`;
      }
      if (req.files.coverPic) {
        updateData.coverPic = `uploads/${req.files.coverPic[0].filename}`;
      }
    }

    const updatedUser = await User.updateById(userId, updateData);

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Public route - Get any user's profile by ID or 'me'
router.get('/:userId', protect, getUserById);

export default router;