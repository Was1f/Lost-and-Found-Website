import express from 'express';
import { adminLoginController } from '../controllers/admin.controller.js';
import { adminAuth } from '../middleware/adminAuthmiddleware.js';
import User from '../models/user.model.js';
import Post from '../models/post.model.js';
import Comment from '../models/comment.model.js';

const router = express.Router();

// ------------------- ADMIN LOGIN -------------------
router.post('/login', adminLoginController);

// ------------------- POSTS MANAGEMENT -------------------

// Fetch all posts (only accessible to admin)
router.get('/posts', adminAuth, async (req, res) => {
  try {
    const posts = await Post.getModel()
      .find()
      .populate('user', 'email')
      .sort({ createdAt: -1 })
      .exec();
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Error fetching posts', error: error.message });
  }
});

// Delete a post (admin only)
router.delete('/posts/:id', adminAuth, async (req, res) => {
  try {
    const post = await Post.getModel()
      .findById(req.params.id)
      .exec();
      
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await Post.deleteById(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Error deleting post', error: error.message });
  }
});

// ------------------- COMMENTS MANAGEMENT -------------------

// Fetch all comments (admin only)
router.get('/comments', adminAuth, async (req, res) => {
  try {
    const comments = await Comment.getModel()
      .find()
      .populate('userId', 'email')
      .populate('postId', 'title')
      .sort({ createdAt: -1 })
      .exec();
    res.status(200).json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Error fetching comments', error: error.message });
  }
});

// Delete a comment (admin only)
router.delete('/comments/:id', adminAuth, async (req, res) => {
  try {
    const comment = await Comment.getModel()
      .findById(req.params.id)
      .exec();
      
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    await Comment.deleteById(req.params.id);
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Error deleting comment', error: error.message });
  }
});

// ------------------- USERS MANAGEMENT -------------------

// Fetch all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.getModel()
      .find()
      .select('email username studentId status createdAt')
      .sort({ createdAt: -1 })
      .exec();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Update user status
router.put('/users/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.getModel()
      .findById(req.params.id)
      .exec();
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedUser = await User.updateById(req.params.id, { status });
    res.json({ message: 'User status updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Error updating user status', error: error.message });
  }
});

// Delete a user
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.getModel()
      .findById(req.params.id)
      .exec();
      
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.deleteById(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

export default router;