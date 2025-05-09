import express from 'express';
import Post from '../models/post.model.js';
import { protect } from '../middleware/auth.js'; // Protect middleware to ensure user is logged in
import multer from 'multer';
import path from 'path';
import PostHistory from '../models/PostHistory.js';
import { updateUserPoints } from '../controllers/leaderboard.controller.js'; // Import the points function
import Match from '../models/match.model.js';
import stringSimilarity from 'string-similarity';
import User from '../models/user.model.js';

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

// FIXED: Automatic archive check BEFORE serving recent posts
// This ensures posts are automatically archived when the recent posts endpoint is called
async function checkAndArchiveOldPosts() {
  try {
    console.log('Running automatic archive check...');
    
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
    
    // Find posts older than 15 days that are still active
    const postsToArchive = await Post.find({
      createdAt: { $lt: fifteenDaysAgo },
      resolutionStatus: 'Active',
      isArchived: false
    });
    
    console.log(`Found ${postsToArchive.length} posts to automatically archive`);
    
    // Update these posts to be archived and marked as unresolved
    for (const post of postsToArchive) {
      console.log(`Auto-archiving post: ${post._id} (${post.title})`);
      
      post.isArchived = true;
      post.resolutionStatus = 'Unresolved';
      await post.save();
      
      // Add to history
      try {
        const history = new PostHistory({
          postId: post._id,
          title: post.title,
          description: post.description,
          status: post.status,
          location: post.location,
          image: post.image,
          changeType: 'archive',
          systemGenerated: true
        });
        
        await history.save();
        console.log(`History record created for auto-archived post ${post._id}`);
      } catch (historyError) {
        console.error(`Error creating history for post ${post._id}:`, historyError);
      }
    }
    
    return postsToArchive.length;
  } catch (error) {
    console.error("Error in automatic archive check:", error);
    return 0;
  }
}

// Route to get recent posts (e.g., 5 most recent posts)
router.get('/recent', async (req, res) => {
  try {
    console.log("Fetching recent posts...");
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('user', 'username email')
      .exec();
    res.json(posts);
  } catch (error) {
    console.error("Error fetching recent posts:", error);
    res.status(500).json({ message: "Error fetching recent posts" });
  }
});

// New route to get archived posts
router.get('/archived', async (req, res) => {
  try {
    const archivedPosts = await Post.find({
      isArchived: true
    })
    .sort({ createdAt: -1 })
    .populate('user', 'email')
    .exec();
    
    res.json(archivedPosts);
  } catch (error) {
    console.error("Error fetching archived posts:", error);
    res.status(500).json({ message: "Error fetching archived posts" });
  }
});

// Cron job endpoint to check and archive old posts
// This can be called by a scheduler, but archive check is now automatic with recent posts
router.post('/check-archive', async (req, res) => {
  try {
    console.log('Starting manual archive check process...');
    
    const archivedCount = await checkAndArchiveOldPosts();
    
    res.json({ 
      message: `${archivedCount} posts have been archived`,
      archivedCount: archivedCount
    });
  } catch (error) {
    console.error("Error in archive check process:", error);
    res.status(500).json({ 
      message: "Error processing archives",
      errorDetails: error.message
    });
  }
});

// Admin route to mark posts as resolved/unresolved
router.put('/:id/resolution', protect, async (req, res) => {
  try {
    const { resolutionStatus, resolutionNote } = req.body;
    
    if (!['Resolved', 'Unresolved'].includes(resolutionStatus)) {
      return res.status(400).json({ message: 'Invalid resolution status' });
    }
    
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Save current version to history
    const history = new PostHistory({
      postId: post._id,
      title: post.title,
      description: post.description,
      status: post.status,
      location: post.location,
      image: post.image,
      updatedBy: req.user._id,
      changeType: 'resolution-update',
    });
    await history.save();
    
    // Update post resolution status
    post.resolutionStatus = resolutionStatus;
    post.resolvedAt = new Date();
    post.resolvedBy = req.user._id;
    post.isArchived = true;
    
    if (resolutionNote) {
      post.resolutionNote = resolutionNote;
    }
    
    await post.save();
    
    res.json({ 
      message: `Post marked as ${resolutionStatus}`, 
      post 
    });
  } catch (error) {
    console.error("Error updating resolution status:", error);
    res.status(500).json({ message: "Error updating resolution status" });
  }
});

// Route to fetch posts made by the logged-in user
router.get('/user', protect, async (req, res) => {
  try {
    await checkAndArchiveOldPosts();
    
    const userPosts = await Post.find({ user: req.user._id })
      .populate('user', 'email')
      .exec();

    if (!userPosts) {
      return res.status(404).json({ message: 'No posts found for this user' });
    }

    res.json(userPosts);
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

    const { title, description, status, location } = req.body;

    // Create post using the model directly
    const newPost = await Post.create({
      user: req.user.id,
      title,
      description,
      image: `/uploads/${req.file.filename}`,
      location,
      status,
      resolutionStatus: 'Active',
      isArchived: false
    });

    // --- Auto-matching logic ---
    let matches = [];
    if (newPost.status === 'lost' || newPost.status === 'found') {
      const otherType = newPost.status === 'lost' ? 'found' : 'lost';
      const otherPosts = await Post.find({ status: otherType });
      
      for (const other of otherPosts) {
        const textA = `${newPost.title} ${newPost.description} ${newPost.location}`;
        const textB = `${other.title} ${other.description} ${other.location}`;
        const similarity = stringSimilarity.compareTwoStrings(textA, textB);
        
        if (similarity >= 0.3) {
          const exists = newPost.status === 'lost'
            ? await Match.findOne({ lostPost: newPost._id, foundPost: other._id })
            : await Match.findOne({ lostPost: other._id, foundPost: newPost._id });
            
          if (!exists) {
            const match = await Match.create({
              lostPost: newPost.status === 'lost' ? newPost._id : other._id,
              foundPost: newPost.status === 'found' ? newPost._id : other._id,
              similarity
            });
            matches.push(match);
          }
        }
      }
    }

    // Add 5 points to user if they posted a found item
    if (status === 'found') {
      await User.updatePoints(req.user.id, 5);
    }

    res.status(201).json({ 
      message: 'Post created successfully', 
      post: newPost,
      matches 
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: 'Error creating post', error: error.message });
  }
});

// Route to get a post by its ID
router.get('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ message: 'Error fetching post' });
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
    const history = await PostHistory.create({
      postId: post._id,
      title: post.title,
      description: post.description,
      status: post.status,
      location: post.location,
      image: post.image,
      updatedBy: req.user._id,
      changeType: 'update',
    });

    // Check if status is changing and handle points adjustment
    if (status && post.status !== status) {
      if (post.status === 'lost' && status === 'found') {
        await User.updatePoints(req.user._id, 5);
      } else if (post.status === 'found' && status === 'lost') {
        await User.updatePoints(req.user._id, -5);
      }
    }

    // Update post fields
    const updatedPost = await Post.updateById(req.params.id, {
      ...(title && { title }),
      ...(description && { description }),
      ...(status && { status }),
      ...(location && { location }),
      ...(req.file && { image: `/uploads/${req.file.filename}` })
    });

    res.json({ message: 'Post updated successfully', post: updatedPost });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Error updating post' });
  }
});

// Route to delete a post
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this post' });
    }
    
    // Save to history before deletion
    await PostHistory.create({
      postId: post._id,
      title: post.title,
      description: post.description,
      status: post.status,
      location: post.location,
      image: post.image,
      updatedBy: req.user._id,
      changeType: 'delete',
    });
    
    // Delete the post
    await Post.deleteById(req.params.id);
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Error deleting post' });
  }
});

export default router;