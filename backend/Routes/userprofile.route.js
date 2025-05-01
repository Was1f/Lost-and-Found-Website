import express from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/userprofile.controller.js';
import { protect } from '../middleware/auth.js'; // Your existing JWT middleware

const router = express.Router();



// GET user profile
router.get('/me', protect, getUserProfile);

// UPDATE user profile
router.put('/update', protect, updateUserProfile);

export default router;
