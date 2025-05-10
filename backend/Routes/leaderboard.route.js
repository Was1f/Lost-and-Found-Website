import express from 'express';
import { getLeaderboard } from '../controllers/leaderboard.controller.js';
import { protect } from '../middleware/auth.js';
import User from '../models/user.model.js';

const router = express.Router();

// Get leaderboard
router.get('/', async (req, res) => {
  try {
    const users = await User.find()
      .select('username email points studentId isVerified')
      .sort({ points: -1 })
      .limit(100);
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
});

export default router;