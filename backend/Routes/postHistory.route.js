import express from 'express';
import PostHistory from '../models/postHistory.model.js';
import { adminAuth } from '../middleware/adminAuthmiddleware.js';

const router = express.Router();

// Route to get all post histories (admin only)
router.get('/all', adminAuth, async (req, res) => {
  try {
    console.log('Fetching post history...');
    const histories = await PostHistory.getModel()
      .find()
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    console.log(`Found ${histories.length} history records`);
    res.json(histories);
  } catch (err) {
    console.error("Error fetching post history:", err);
    res.status(500).json({ 
      message: "Error fetching post history", 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Route to get post history based on search query (admin only)
router.get('/search', adminAuth, async (req, res) => {
  const searchTerm = req.query.searchTerm || '';

  try {
    const histories = await PostHistory.getModel()
      .find({
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { status: { $regex: searchTerm, $options: 'i' } },
        ]
      })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    res.json(histories);
  } catch (err) {
    console.error("Error searching post history:", err);
    res.status(500).json({ 
      message: "Error searching post history", 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Route to get history for a specific post (admin only)
router.get('/post/:postId', adminAuth, async (req, res) => {
  try {
    const histories = await PostHistory.getModel()
      .find({ postId: req.params.postId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    res.json(histories);
  } catch (err) {
    console.error("Error fetching post history:", err);
    res.status(500).json({ 
      message: "Error fetching post history", 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Route to delete selected post histories (admin only)
router.delete('/delete', adminAuth, async (req, res) => {
  const { postIds } = req.body;
  if (!postIds || postIds.length === 0) {
    return res.status(400).json({ message: "No post IDs provided." });
  }

  try {
    const result = await PostHistory.getModel().deleteMany({ _id: { $in: postIds } });
    
    if (result.deletedCount > 0) {
      res.json({ 
        success: true,
        message: `${result.deletedCount} posts deleted successfully` 
      });
    } else {
      res.status(404).json({ 
        success: false,
        message: "No posts found to delete" 
      });
    }
  } catch (err) {
    console.error("Error deleting posts:", err);
    res.status(500).json({ 
      success: false,
      message: "Error deleting posts", 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

export default router;