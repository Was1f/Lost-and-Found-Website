import express from 'express';
import PostHistory from '../models/PostHistory.js';  // Import PostHistory model
import User from '../models/user.model.js';  // Import User model to populate the updatedBy field

const router = express.Router();

// Route to get all post histories
router.get('/all', async (req, res) => {
  try {
    // Find all post histories and populate the 'updatedBy' field with 'username' from the User model
    const histories = await PostHistory.find()
      .populate({
        path: 'updatedBy',
        select: 'username profilePic email studentId',  // Include more fields that might be useful
        model: User
      })
      .sort({ changeDate: -1 })  // Sort by change date (newest first)
      .lean()  // Convert to plain JS objects for better performance
      .exec();

    // Map through the results to ensure username is accessible even if population failed
    const processedHistories = histories.map(history => {
      // If updatedBy exists but username doesn't, try to provide a fallback
      if (history.updatedBy && !history.updatedBy.username) {
        return {
          ...history,
          updatedBy: {
            ...history.updatedBy,
            username: "Unknown User"  // Provide a default
          }
        };
      }
      return history;
    });

    res.json(processedHistories);  // Return processed histories
  } catch (err) {
    console.error("Error fetching post history:", err);
    res.status(500).json({ message: err.message });
  }
});

// Route to get post history based on search query (e.g., title or description)
router.get('/search', async (req, res) => {
  const searchTerm = req.query.searchTerm || '';

  try {
    // Find post histories based on search term (title, description, or status)
    const histories = await PostHistory.find({
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { status: { $regex: searchTerm, $options: 'i' } },
      ]
    })
    .populate({
      path: 'updatedBy',
      select: 'username profilePic email',
      model: User
    })
    .sort({ changeDate: -1 })
    .lean()
    .exec();

    // Process results as above
    const processedHistories = histories.map(history => {
      if (history.updatedBy && !history.updatedBy.username) {
        return {
          ...history,
          updatedBy: {
            ...history.updatedBy,
            username: "Unknown User"
          }
        };
      }
      return history;
    });

    res.json(processedHistories);
  } catch (err) {
    console.error("Error searching post history:", err);
    res.status(500).json({ message: err.message });
  }
});

// Route to delete selected post histories
router.delete('/delete', async (req, res) => {
  const { postIds } = req.body;  // Array of post IDs to delete
  if (!postIds || postIds.length === 0) {
    return res.status(400).json({ message: "No post IDs provided." });
  }

  try {
    // Delete posts with matching IDs
    const result = await PostHistory.deleteMany({ _id: { $in: postIds } });
    
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
      error: err.message 
    });
  }
});

export default router;