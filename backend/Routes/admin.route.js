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

// Fetch all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find({}, 'email username studentId status createdAt'); // Get necessary fields
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