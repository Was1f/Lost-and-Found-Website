import express from 'express';
import Post from '../models/post.model.js';
import { protect } from '../middleware/auth.js'; // Protect middleware to ensure user is logged in
import multer from 'multer';
import path from 'path';
import PostHistory from '../models/PostHistory.js';

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
    console.log('Fetching recent posts...');
    
    // FIXED: Run automatic archive check BEFORE getting recent posts
    // This ensures any posts that should be archived are archived before we query
    const archivedCount = await checkAndArchiveOldPosts();
    if (archivedCount > 0) {
      console.log(`Automatically archived ${archivedCount} old posts`);
    }
    
    // Get only non-archived posts
    const posts = await Post.find({ 
      isArchived: false 
    })
    .sort({ createdAt: -1 })
    .populate('user', 'email')
    .exec();
    
    console.log(`Returning ${posts.length} non-archived posts`);
    res.json(posts); // Send posts to frontend
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
    // FIXED: Also run the archive check before showing user posts
    // This ensures all posts that should be archived are archived
    await checkAndArchiveOldPosts();
    
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

    const { title, description, status, location} = req.body;

    const newPost = new Post({
      user: req.user.id,  // User ID will come from the token (JWT)
      title,
      description,
      image: `/uploads/${req.file.filename}`,
      location,
      status,
      resolutionStatus: 'Active',
      isArchived: false
    });

    await newPost.save();
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


// Route to delete a post
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if user owns this post
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this post' });
    }
    
    // Save to history before deletion (if you want to keep history)
    const history = new PostHistory({
      postId: post._id,
      title: post.title,
      description: post.description,
      status: post.status,
      location: post.location,
      image: post.image,
      updatedBy: req.user._id,
      changeType: 'delete',
    });
    await history.save();
    
    // Delete the post
    await Post.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Error deleting post' });
  }
});

export default router;