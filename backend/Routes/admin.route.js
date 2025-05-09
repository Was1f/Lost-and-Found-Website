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
    const posts = await Post.find().populate('user', 'email').populate('resolvedBy', 'email username');
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

// Update post resolution status
router.put('/post/resolution/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  const { resolutionStatus, resolvedBy, resolutionNote, resolvedAt, isArchived } = req.body;
  
  try {
    // Get the previous state of the post to check if points need to be awarded
    const previousPost = await Post.findById(id);
    if (!previousPost) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Update the post with resolution information
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      {
        resolutionStatus,
        resolvedBy: resolvedBy || null,
        resolutionNote: resolutionNote || '',
        resolvedAt: resolvedAt || (resolutionStatus === 'Resolved' ? new Date() : null),
        isArchived: isArchived || resolutionStatus === 'Resolved' // Automatically archive if resolved
      },
      { new: true }
    ).populate('user', 'email').populate('resolvedBy', 'email username');

    // Award points to the resolvedBy user if status is Resolved and either:
    // 1. The status changed from something else to Resolved
    // 2. The resolvedBy user changed
    const shouldAwardPoints = 
      resolutionStatus === 'Resolved' && 
      resolvedBy && 
      (previousPost.resolutionStatus !== 'Resolved' || 
       (!previousPost.resolvedBy || previousPost.resolvedBy.toString() !== resolvedBy));
    
    if (shouldAwardPoints) {
      // Award 10 points to the user who resolved the post
      await User.findByIdAndUpdate(
        resolvedBy,
        { $inc: { points: 10 } }, // Increment points by 10
        { new: true }
      );
    }

    res.status(200).json({ 
      message: 'Post resolution updated successfully',
      post: updatedPost,
      pointsAwarded: shouldAwardPoints ? 10 : 0
    });
  } catch (error) {
    console.error('Error updating post resolution:', error);
    res.status(500).json({ message: 'Error updating post resolution', error: error.message });
  }
});

// ------------------- COMMENTS MANAGEMENT -------------------

// Get all comments for a post
router.get('/comments/:postId', adminAuth, async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ postId })
      .populate('userId', 'username email')
      .sort({ createdAt: -1 });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments', error });
  }
});

// Add a comment as admin
router.post('/comment', adminAuth, async (req, res) => {
  try {
    const { postId, text, parentCommentId } = req.body;
    
    // Create an admin comment
    const newComment = new Comment({
      postId,
      isAdmin: true, // Mark as admin comment
      text,
      parentCommentId: parentCommentId || null,
    });
    
    await newComment.save();
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Admin comment error:', error);
    res.status(500).json({ message: 'Error adding comment', error: error.message });
  }
});

// Delete/Remove a comment (marks as removed)
router.delete('/comment/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Instead of deleting, mark as removed
    const updatedComment = await Comment.findByIdAndUpdate(
      id, 
      { 
        isRemoved: true,
        text: "This comment has been removed by admin for violating community guidelines."
      },
      { new: true }
    );
    
    if (!updatedComment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // For any replies, also mark them as removed
    await Comment.updateMany(
      { parentCommentId: id },
      { 
        isRemoved: true,
        text: "This comment has been removed by admin for violating community guidelines."
      }
    );
    
    res.status(200).json({ 
      message: 'Comment and its replies have been removed', 
      comment: updatedComment 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error removing comment', error: error.message });
  }
});

// ------------------- USERS MANAGEMENT -------------------

// Fetch users with filtering, sorting, and pagination
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { 
      status, 
      search, 
      sort = 'createdAt', 
      order = 'desc',
      page = 1,
      limit = 100 // Increased limit to get more users for dropdown
    } = req.query;
    
    // Build query
    const query = {};
    
    // Status filter
    if (status && ['active', 'banned'].includes(status)) {
      query.status = status;
    }
    
    // Search functionality
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { username: searchRegex },
        { email: searchRegex },
        { studentId: searchRegex },
        { bio: searchRegex }
      ];
    }
    
    // Count total results for pagination
    const total = await User.countDocuments(query);
    
    // Execute query with sorting and pagination
    const users = await User.find(query)
      .select('email username studentId profilePic status createdAt bio points')
      .sort({ [sort]: order === 'asc' ? 1 : -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));
    
    res.status(200).json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Get user activity and detailed profile
router.get('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user's post count
    const postsCount = await Post.countDocuments({ user: req.params.id });
    
    // Get user's comment count
    const commentsCount = await Comment.countDocuments({ userId: req.params.id });
    
    res.status(200).json({
      user,
      stats: {
        postsCount,
        commentsCount
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user details', error: error.message });
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
    // Find the user first to check current status
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Toggle the status between 'active' and 'banned'
    const newStatus = user.status === 'banned' ? 'active' : 'banned';
    
    // Update the user status
    const updatedUser = await User.findByIdAndUpdate(
      id, 
      { status: newStatus },
      { new: true }
    );
    
    res.status(200).json({ 
      message: newStatus === 'banned' ? 'User banned successfully' : 'User activated successfully',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user status', error: error.message });
  }
});

export default router;