import express from 'express';
import Comment from '../models/comment.model.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// POST a comment to a post
router.post('/:postId', protect, async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ message: 'Comment text is required' });
  }

  try {
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

// GET all comments for a post
router.get('/:postId', async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId })
      .populate('userId', 'email') // Optional: Populate user's email
      .sort({ createdAt: -1 }); // Latest comments first

    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Server error fetching comments' });
  }
});

export default router;
