import express from 'express';
import Comment from '../models/comment.model.js';
import { protect } from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = express.Router();

// POST a comment to a post
router.post('/:postId', protect, async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ message: 'Comment text is required' });
  }

  try {
    // Validate postId as a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.postId)) {
      return res.status(400).json({ message: 'Invalid postId format' });
    }

    const comment = new Comment({
      postId: req.params.postId,
      userId: req.user._id,
      text,
    });

    await comment.save();

    res.status(201).json({ message: 'Comment added successfully', comment });
  } catch (error) {
    console.error('Error posting comment:', error);
    res.status(500).json({ message: 'Server error posting comment' });
  }
});

// Make sure this route is mounted BEFORE the /:postId route to prevent conflicts
// POST a reply to a comment - Fixed route with better path distinction
router.post('/comments/reply', protect, async (req, res) => {
  const { text, parentCommentId, postId } = req.body;
  
  console.log("Received data for reply:", { text, parentCommentId, postId });

  if (!text || !parentCommentId || !postId) {
    return res.status(400).json({ message: 'Text, parent comment ID, and post ID are required' });
  }

  // Validate ObjectIds
  try {
    // Validate postId
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'Invalid postId format' });
    }
    
    // Validate parentCommentId
    if (!mongoose.Types.ObjectId.isValid(parentCommentId)) {
      return res.status(400).json({ message: 'Invalid parentCommentId format' });
    }

    // Check if the parent comment exists
    const parentComment = await Comment.findById(parentCommentId);
    if (!parentComment) {
      console.log("Parent comment not found:", parentCommentId);
      return res.status(404).json({ message: 'Parent comment not found' });
    }

    console.log("Parent comment found:", parentComment);
    
    // Create the reply (which will reference the parent comment)
    const reply = new Comment({
      postId: postId, // Use the postId from request body
      userId: req.user._id,
      text,
      parentCommentId, // Link the reply to the parent comment
    });

    await reply.save();

    res.status(201).json({ message: 'Reply added successfully', reply });
  } catch (error) {
    console.error('Error posting reply:', error);
    res.status(500).json({ message: 'Server error posting reply', error: error.message });
  }
});

// GET all comments for a post with their replies
router.get('/:postId', async (req, res) => {
  try {
    // Validate postId as a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.postId)) {
      return res.status(400).json({ message: 'Invalid postId format' });
    }
    
    const comments = await Comment.find({ 
      postId: req.params.postId, 
      parentCommentId: null // Fetch top-level comments
    })
      .populate('userId', 'email') // Populate user's email
      .sort({ createdAt: -1 }); // Latest comments first

    // For each main comment, fetch its replies
    for (let comment of comments) {
      // Create a replies array if it doesn't exist
      if (!comment._doc) {
        comment._doc = {...comment._doc};
      }
      
      comment._doc.replies = await Comment.find({ parentCommentId: comment._id })
        .populate('userId', 'email')
        .sort({ createdAt: 1 }); // Oldest replies first
    }

    res.json(comments); // Return comments and their replies
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Server error fetching comments', error: error.message });
  }
});

export default router;