import express from 'express';
import { adminLoginController } from '../controllers/admin.controller.js';
import { adminAuth } from '../middleware/adminAuthmiddleware.js';
import User from '../models/user.model.js';
import Post from '../models/post.model.js';
import Comment from '../models/comment.model.js';
import PostHistory from '../models/postHistory.model.js';

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
    const { postId } = req.query;
    const query = postId ? { postId } : {};
    
    const comments = await Comment.getModel()
      .find(query)
      .populate('userId', 'email username')
      .populate('postId', 'title')
      .sort({ createdAt: -1 })
      .exec();
    res.status(200).json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Error fetching comments', error: error.message });
  }
});

// Add admin comment
router.post('/comments', adminAuth, async (req, res) => {
  try {
    const { postId, text } = req.body;

    if (!postId || !text) {
      return res.status(400).json({ message: 'Post ID and comment text are required' });
    }

    const comment = await Comment.getModel().create({
      postId,
      text,
      isAdmin: true,
      // userId is not required for admin comments
    });

    // Populate the comment with post details
    await comment.populate('postId', 'title');

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error adding admin comment:', error);
    res.status(500).json({ message: 'Error adding admin comment', error: error.message });
  }
});

// Add admin reply to a comment
router.post('/comments/reply', adminAuth, async (req, res) => {
  try {
    const { postId, text, parentCommentId } = req.body;

    if (!postId || !text || !parentCommentId) {
      return res.status(400).json({ 
        message: 'Post ID, comment text, and parent comment ID are required' 
      });
    }

    const comment = await Comment.getModel().create({
      postId,
      text,
      parentCommentId,
      isAdmin: true,
      // userId is not required for admin comments
    });

    // Populate the comment with post and parent comment details
    await comment.populate('postId', 'title');
    await comment.populate('parentCommentId', 'text');

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error adding admin reply:', error);
    res.status(500).json({ message: 'Error adding admin reply', error: error.message });
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

// Fetch users with filtering, sorting, and pagination
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      sort = 'createdAt', 
      order = 'desc',
      status,
      search 
    } = req.query;

    // Build query
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.getModel().countDocuments(query);
    const pages = Math.ceil(total / parseInt(limit));

    // Get users with pagination and sorting
    const users = await User.getModel()
      .find(query)
      .select('email username studentId status createdAt')
      .sort({ [sort]: order === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .exec();

    res.status(200).json({
      users,
      pagination: {
        total,
        pages,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
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

// Get single user details with stats
router.get('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.getModel()
      .findById(req.params.id)
      .select('-password') // Exclude password
      .exec();
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's post count
    const postsCount = await Post.getModel()
      .countDocuments({ user: req.params.id })
      .exec();

    // Get user's comment count
    const commentsCount = await Comment.getModel()
      .countDocuments({ userId: req.params.id })
      .exec();

    res.json({
      user,
      stats: {
        postsCount,
        commentsCount
      }
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Error fetching user details', error: error.message });
  }
});

export default router;