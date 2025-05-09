import Post from '../models/post.model.js';
import Match from '../models/match.model.js';
import stringSimilarity from 'string-similarity';

// Helper: Calculate similarity between two posts
function calculateSimilarity(lost, found) {
  // Combine title, description, and location for both
  const lostText = `${lost.title} ${lost.description} ${lost.location}`;
  const foundText = `${found.title} ${found.description} ${found.location}`;
  return stringSimilarity.compareTwoStrings(lostText, foundText);
}

// Run matching for all lost/found posts and store results
export const runMatching = async (req, res) => {
  try {
    // Get all lost and found posts
    const lostPosts = await Post.find({ status: 'lost' });
    const foundPosts = await Post.find({ status: 'found' });
    let matches = [];

    // For each lost post, find matching found posts
    for (const lost of lostPosts) {
      for (const found of foundPosts) {
        const similarity = calculateSimilarity(lost, found);
        if (similarity >= 0.3) {
          // Check if match already exists
          const exists = await Match.findOne({ lostPost: lost._id, foundPost: found._id });
          if (!exists) {
            const match = new Match({ lostPost: lost._id, foundPost: found._id, similarity });
            await match.save();
            matches.push(match);
          }
        }
      }
    }
    res.status(200).json({ message: 'Matching complete', matches });
  } catch (error) {
    res.status(500).json({ message: 'Error running matching', error });
  }
};

// Get all matches (admin only)
export const getAllMatches = async (req, res) => {
  try {
    const matches = await Match.find()
      .populate('lostPost')
      .populate('foundPost')
      .sort({ similarity: -1, createdAt: -1 });
    res.status(200).json(matches);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching matches', error });
  }
}; 