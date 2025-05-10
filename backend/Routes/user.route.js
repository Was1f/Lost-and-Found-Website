import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';  // Use JWT for creating a token
import User from '../models/user.model.js'; // Import User model
import Post from '../models/post.model.js';
import { protect } from '../middleware/auth.js';
import mongoose from 'mongoose';
const router = express.Router();

// Sign-up route
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ success: false, message: 'User already exists' });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save new user
    const newUser = new User({
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    // Compare the password with the hashed one
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    // Create and send a JWT token
    const token = jwt.sign(
      { userId: user._id },  // Payload: user ID
      process.env.JWT_SECRET,  // Secret key from .env
      { expiresIn: '1h' }  // Token expiration time (1 hour)
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: "supersecretkey",  // Send the JWT token
      user: { email: user.email },  // Optionally send user details (e.g. email)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// // Route to get all bookmarked posts
// router.get('/bookmarks', protect, async (req, res) => {
//   try {
//     // Get user
//     const user = await User.findById(req.user._id);
    
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
    
//     // If no bookmarks, return empty array
//     if (!user.bookmarks || user.bookmarks.length === 0) {
//       return res.json([]);
//     }
    
//     // No need to convert IDs - MongoDB can work with the original format
//     // Get all bookmarked posts
//     const bookmarkedPosts = await Post.find({
//       _id: { $in: user.bookmarks }
//     }).populate('user', 'email username profilePic');

//     res.status(200).json(bookmarkedPosts);
//   } catch (error) {
//     console.error('Error fetching bookmarks:', error.message);
//     console.error(error.stack);
//     res.status(500).json({ message: 'Error fetching bookmarks', error: error.message });
//   }
// });

// // Route to bookmark a post
// router.post('/bookmark/:postId', protect, async (req, res) => {
//   try {
//     const postId = req.params.postId;
    
//     // Check if post exists
//     const post = await Post.findById(postId);
//     if (!post) {
//       return res.status(404).json({ message: 'Post not found' });
//     }
    
//     // Get user
//     const user = await User.findById(req.user._id);
//      if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
    
//    // Check if post is already bookmarked - compare as strings
//     const alreadyBookmarked = user.bookmarks.some(id => id.toString() === postId.toString());
//     if (alreadyBookmarked) {
//       return res.status(400).json({ message: 'Post already bookmarked' });
//     }

    
//     user.bookmarks.push(mongoose.Types.ObjectId(postId));
    
//     // Initialize bookmarks array if it doesn't exist
//     if (!user.bookmarks) {
//       user.bookmarks = [];
//     }
    
//     // Add post to bookmarks
//     user.bookmarks.push(post._id);
//     await user.save();
    
//     res.status(200).json({ message: 'Post bookmarked successfully', bookmarks: user.bookmarks });
//   } catch (error) {
//     console.error('Error bookmarking post:', error);
//     res.status(500).json({ message: 'Error bookmarking post' });
//   }
// });

// // Route to remove a bookmark
// router.delete('/bookmark/:postId', protect, async (req, res) => {
//   try {
//     const postId = req.params.postId;
    
//     // Get user
//     const user = await User.findById(req.user._id);
//      if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
//       // Check if user has bookmarks
//     const hasBookmark = user.bookmarks && user.bookmarks.some(id => id.toString() === postId.toString());
//     if (!hasBookmark) {
//       return res.status(400).json({ message: 'Post not bookmarked' });
//     }
    
//     // Remove post from bookmarks
//     user.bookmarks = user.bookmarks.filter(id => id.toString() !== postId);
//     await user.save();
    
//     res.status(200).json({ message: 'Bookmark removed successfully', bookmarks: user.bookmarks });
//   } catch (error) {
//     console.error('Error removing bookmark:', error);
//     res.status(500).json({ message: 'Error removing bookmark' });
//   }
// });

// // Route to check if a post is bookmarked
// router.get('/is-bookmarked/:postId', protect, async (req, res) => {
//   try {
//     const postId = req.params.postId;
//     const user = await User.findById(req.user._id);
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
    
//     // Compare IDs as strings
//     const isBookmarked = user.bookmarks && user.bookmarks.some(id => id.toString() === postId.toString());
    
//     res.status(200).json({ isBookmarked });
//   } catch (error) {
//     console.error('Error checking bookmark status:', error);
//     res.status(500).json({ message: 'Error checking bookmark status' });
//   }
// });

//leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    // Find all users, sorted by points in descending order
    // For testing, we're not filtering by points > 0 yet
    const users = await User.find()
      .select('username email bio profilePic coverPic studentId isVerified points')
      .sort({ points: -1 })
      .limit(100); // Limit to top 100 users for performance
    
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Error fetching leaderboard', error: error.message });
  }
});

//edit user profile route:
router.put('/:id', async (req, res) => {
  try {
    const updates = {
      username: req.body.username,
      bio: req.body.bio,
      profilePicUrl: req.body.profilePicUrl,
      coverPicUrl: req.body.coverPicUrl,
    };

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


// Get user profile by ID (for viewing other users' profiles)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('username email bio profilePic coverPic studentId isVerified points');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});
export default router;
