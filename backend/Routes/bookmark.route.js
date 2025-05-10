import express from 'express';
import User from '../models/user.model.js';
import Post from '../models/post.model.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Route to get all bookmarked posts
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Use the new wrapper method
    const user = await User.findByIdWithPopulatedBookmarks(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // If no bookmarks, return empty array
    if (!user.bookmarks || user.bookmarks.length === 0) {
      return res.json([]);
    }
    
    res.status(200).json(user.bookmarks);
  } catch (error) {
    console.error('Error fetching bookmarks:', error.message);
    console.error(error.stack);
    res.status(500).json({ message: 'Error fetching bookmarks', error: error.message });
  }
});

// Route to bookmark a post
router.post('/:postId', protect, async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user._id;
    
    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Use the new wrapper method
    const user = await User.addBookmark(userId, postId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.bookmarks.includes(postId)) {
      return res.status(200).json({ 
        message: 'Post bookmarked successfully', 
        bookmarks: user.bookmarks 
      });
    } else {
      return res.status(400).json({ message: 'Post already bookmarked' });
    }
  } catch (error) {
    console.error('Error bookmarking post:', error);
    res.status(500).json({ message: 'Error bookmarking post', error: error.message });
  }
});

// Route to remove a bookmark
router.delete('/:postId', protect, async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user._id;
    
    // Use the new wrapper method
    const user = await User.removeBookmark(userId, postId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ 
      message: 'Bookmark removed successfully', 
      bookmarks: user.bookmarks 
    });
  } catch (error) {
    console.error('Error removing bookmark:', error);
    res.status(500).json({ 
      message: 'Error removing bookmark', 
      error: error.message 
    });
  }
});

// Route to check if a post is bookmarked
router.get('/status/:postId', protect, async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user._id;
    
    // Use the new wrapper method
    const isBookmarked = await User.isPostBookmarked(userId, postId);
    
    res.status(200).json({ isBookmarked });
  } catch (error) {
    console.error('Error checking bookmark status:', error);
    res.status(500).json({ 
      message: 'Error checking bookmark status', 
      error: error.message 
    });
  }
});

export default router;