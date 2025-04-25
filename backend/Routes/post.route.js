import express from 'express';
import Post from '../models/post.model.js';
import { protect } from '../middleware/auth.js'; // Protect middleware to ensure user is logged in
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve('uploads'));  // Save images to 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // Unique filename with extension
  },
});

const upload = multer({ storage });

const router = express.Router();

// Route to get recent posts (e.g., 5 most recent posts)
router.get('/recent', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).populate('user', 'email').exec();
    console.log(posts);  // Add this log to check the posts
    res.json(posts); // Send posts to frontend

  } catch (error) {
    console.error("Error fetching recent posts:", error);
    res.status(500).json({ message: "Error fetching recent posts" });
  }
});

// Create a new post
router.post('/create', protect, upload.single('image'), async (req, res) => {
  try {
    console.log("✅ File received:", req.file);
    console.log("✅ Body received:", req.body);
    console.log("✅ User ID:", req.user?.id);

    const { title, description, image, status, location} = req.body;

    const newPost = new Post({
      user: req.user.id,  // User ID will come from the token (JWT)
      title,
      description,
      image: `/uploads/${req.file.filename}`,
      location,
      status
    });

    await newPost.save();
    res.status(201).json({ message: 'Post created successfully', post: newPost });
  } catch (error) {
    res.status(500).json({ message: 'Error creating post', error: error.message });
  }
});

export default router;
