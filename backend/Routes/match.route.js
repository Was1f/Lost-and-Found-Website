import express from 'express';
import Match from '../models/match.model.js';
import { adminAuth } from '../middleware/adminAuthmiddleware.js';
import stringSimilarity from 'string-similarity';
import Post from '../models/post.model.js';

const router = express.Router();

// Apply adminAuth middleware to all routes in this router
router.use(adminAuth);

// Run matching (admin only)
router.post('/run', async (req, res) => {
  try {
    // Get all active lost and found posts
    const lostPosts = await Post.find({ status: 'lost', resolutionStatus: 'Active' });
    const foundPosts = await Post.find({ status: 'found', resolutionStatus: 'Active' });

    let matches = [];

    // Compare each lost post with each found post
    for (const lost of lostPosts) {
      for (const found of foundPosts) {
        const textA = `${lost.title} ${lost.description} ${lost.location}`;
        const textB = `${found.title} ${found.description} ${found.location}`;
        const similarity = stringSimilarity.compareTwoStrings(textA, textB);

        if (similarity >= 0.3) {
          // Check if match already exists
          const exists = await Match.findOne({
            lostPost: lost._id,
            foundPost: found._id
          });

          if (!exists) {
            const match = await Match.create({
              lostPost: lost._id,
              foundPost: found._id,
              similarity
            });
            matches.push(match);
          }
        }
      }
    }

    res.json({ message: 'Matching completed', matches });
  } catch (error) {
    console.error('Error running matching:', error);
    res.status(500).json({ message: 'Error running matching' });
  }
});

// Get all matches (admin only)
router.get('/', async (req, res) => {
  try {
    const matches = await Match.find()
      .populate('lostPost', 'title description location image createdAt')
      .populate('foundPost', 'title description location image createdAt')
      .sort({ similarity: -1 });

    res.json(matches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ message: 'Error fetching matches' });
  }
});

// Delete a match
router.delete('/:id', async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    await Match.deleteById(req.params.id);
    res.json({ message: 'Match deleted successfully' });
  } catch (error) {
    console.error('Error deleting match:', error);
    res.status(500).json({ message: 'Error deleting match' });
  }
});

export default router; 