import express from 'express';
import { adminLoginController } from '../controllers/admin.controller.js';
import { adminAuth } from '../middleware/adminAuthMiddleware.js';
import User from '../models/user.model.js';
import Post from '../models/post.model.js';

const router = express.Router();

// ------------------- ADMIN LOGIN -------------------
router.post('/login', adminLoginController);

// ------------------- POSTS MANAGEMENT -------------------

// Fetch all posts (only accessible to admin)
router.get('/posts', adminAuth, async (req, res) => {
  try {
    const posts = await Post.find().populate('user', 'email');  // Populate user email
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts', error });
  }
});

// Delete a post
router.delete('/post/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const deletedPost = await Post.findByIdAndDelete(id);
    if (!deletedPost) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post', error });
  }
});

// ------------------- USERS MANAGEMENT -------------------

// Fetch all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find({}, 'email status createdAt'); // Only get necessary fields
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
});

// Delete a user
router.delete('/user/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  try {
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error });
  }
});

// Ban a user
router.put('/user/ban/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByIdAndUpdate(id, { status: 'banned' });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User banned successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error banning user', error });
  }
});

export default router;
