import express from 'express';
import Post from '../models/post.model.js';
import { protect } from '../middleware/auth.js'; // Protect middleware to ensure user is logged in
import multer from 'multer';
import path from 'path';
import PostHistory from '../models/PostHistory.js';
import { updateUserPoints } from '../controllers/leaderboard.controller.js'; // Import the points function

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

// Route to fetch posts made by the logged-in user
router.get('/user', protect, async (req, res) => {
  try {
    const userPosts = await Post.find({ user: req.user._id })  // Use the user ID from the token
      .populate('user', 'email')
      .exec();

    if (!userPosts) {
      return res.status(404).json({ message: 'No posts found for this user' });
    }

    res.json(userPosts); // Send user's posts to frontend
  } catch (error) {
    console.error("Error fetching user posts:", error);
    res.status(500).json({ message: "Error fetching user posts" });
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
    // Add 5 points to user if they posted a found item
    if (status === 'found') {
      await updateUserPoints(req.user.id, 5);
    }  
    res.status(201).json({ message: 'Post created successfully', post: newPost });
  } catch (error) {
    res.status(500).json({ message: 'Error creating post', error: error.message });
  }
});

// Route to get a post by its ID
router.get('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);  // Fetch post by ID

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });  // If post not found, return 404
    }

    res.json(post);  // Return the post data
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ message: 'Error fetching post' });  // Handle errors
  }
});


// Route to update a post
router.put('/:id', protect, upload.single('image'), async (req, res) => {
  const { title, description, status, location } = req.body;

  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to edit this post' });
    }

    // Save current version to PostHistory
    const history = new PostHistory({
      postId: post._id,
      title: post.title,
      description: post.description,
      status: post.status,
      location: post.location,
      image: post.image,
      updatedBy: req.user._id,
      changeType: 'update',
    });
    await history.save();

        // Check if status is changing and handle points adjustment
    if (status && post.status !== status) {
      // If changing from lost to found - add 5 points
      if (post.status === 'lost' && status === 'found') {
        await updateUserPoints(req.user._id, 5);
        console.log(`✅ Added 5 points to user ${req.user._id} for changing post from lost to found`);
      }
      // If changing from found to lost - deduct 5 points
      else if (post.status === 'found' && status === 'lost') {
        await updateUserPoints(req.user._id, -5);
        console.log(`✅ Deducted 5 points from user ${req.user._id} for changing post from found to lost`);
      }
    }
    // ✅ Update actual post fields
   // Safely update only if fields are present
    if (title) post.title = title;
    if (description) post.description = description;
    if (status) post.status = status;
    if (location) post.location = location;
    
    if (req.file) {
      post.image = `/uploads/${req.file.filename}`;  // if new image is uploaded
    }

    await post.save(); // ✅ Save updated post

    res.json({ message: 'Post updated successfully', post });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Error updating post' });
  }
});


export default router;

