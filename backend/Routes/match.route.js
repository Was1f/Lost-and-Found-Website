import express from 'express';
import { runMatching, getAllMatches } from '../controllers/match.controller.js';
import { adminAuth } from '../middleware/adminAuthMiddleware.js';

const router = express.Router();

// Run matching (admin only)
router.post('/run', adminAuth, runMatching);
// Get all matches (admin only)
router.get('/', adminAuth, getAllMatches);

export default router; 