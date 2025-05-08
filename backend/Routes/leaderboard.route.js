import express from 'express';
import { getLeaderboard } from '../controllers/leaderboard.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get leaderboard
router.get('/', getLeaderboard);

export default router;