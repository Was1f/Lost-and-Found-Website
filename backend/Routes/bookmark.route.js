import express from 'express';
import User from '../models/user.model.js';
import Post from '../models/post.model.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Route to get all bookmarked posts
router.get('/', protect, async (req, res) => {
  try {
    // Get user from auth middleware
    const userId = req.user._id;
    
    // Find user and populate bookmarks
     const user = await User.findById(userId).populate('bookmarks'); // Using populate to fetch full post data
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // If no bookmarks, return empty array
    if (!user.bookmarks || user.bookmarks.length === 0) {
      return res.json([]);
    }
    
    // Get all bookmarked posts
    const bookmarkedPosts = await Post.find({
      _id: { $in: user.bookmarks }
    }).populate('user', 'email username profilePic');

    res.status(200).json(bookmarkedPosts);
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
    
    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Corrected: Check if the post is already bookmarked before adding
    if (!user.bookmarks.includes(postId)) {
      user.bookmarks.push(postId); // Add postId to bookmarks
      await user.save(); // Save the updated user document
      return res.status(200).json({ message: 'Post bookmarked successfully', bookmarks: user.bookmarks });
    } else {
      return res.status(400).json({ message: 'Post already bookmarked' }); // Handle the case if already bookmarked
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
    
    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user has bookmarks
    if (!user.bookmarks) {
      return res.status(400).json({ message: 'No bookmarks found' });
    }
    
    // Check if post is bookmarked
    const bookmarkIndex = user.bookmarks.findIndex(
      bookmark => bookmark.toString() === postId
    );
    
    if (bookmarkIndex === -1) {
      return res.status(400).json({ message: 'Post not bookmarked' });
    }
    
    // Remove post from bookmarks
    user.bookmarks.splice(bookmarkIndex, 1);
    await user.save();
    
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
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const isBookmarked = user.bookmarks && user.bookmarks.some(
      bookmark => bookmark.toString() === postId
    );
    
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