import express from "express";
import Post from "../models/post.model.js";
import Report from "../models/report.model.js";
import PostHistory from "../models/postHistory.model.js";
import User from "../models/user.model.js";
import { adminAuth } from "../middleware/adminAuthmiddleware.js";
import Match from "../models/match.model.js";
import Comment from "../models/comment.model.js";
import stringSimilarity from "string-similarity";

const router = express.Router();

// Note: This route assumes that access control is handled at a higher level
// Only administrators should have access to these routes

// Get all posts (admin view)
router.get("/", adminAuth, async (req, res) => {
  try {
    const posts = await Post.getModel()
      .find()
      .populate("user", "username email")
      .sort({ createdAt: -1 })
      .exec();
    
    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get a single post by ID
router.get("/:id", adminAuth, async (req, res) => {
  try {
    const post = await Post.getModel()
      .findById(req.params.id)
      .populate("user", "username email")
      .exec();
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    res.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update post resolution status (admin only)
router.put("/:id/resolution", adminAuth, async (req, res) => {
  try {
    const { resolutionStatus, resolutionNote, resolvedBy, resolvedAt } = req.body;
    
    if (!['Active', 'Resolved', 'Unresolved'].includes(resolutionStatus)) {
      return res.status(400).json({ message: 'Invalid resolution status' });
    }
    
    const post = await Post.getModel()
      .findById(req.params.id)
      .exec();
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Only try to update points if we're resolving and have a valid user
    if (resolutionStatus === 'Resolved' && resolvedBy) {
      try {
        // First check if user exists
        const userExists = await User.getModel().findById(resolvedBy);
        if (!userExists) {
          return res.status(400).json({ message: 'User not found for awarding points' });
        }
        
        // Then update points using the model method
        await User.updatePoints(resolvedBy, 10);
        console.log(`Successfully awarded 10 points to user ${resolvedBy}`);
      } catch (pointsError) {
        console.error("Error updating user points:", pointsError);
        // Don't return error, continue with post update
      }
    }
    
    // Create and save history record using PostHistory model
    try {
      const historyData = {
        postId: post._id,
        title: post.title,
        description: post.description,
        status: post.status,
        location: post.location,
        image: post.image,
        updatedByAdmin: true,
        changeType: 'resolution-update'
      };
      
      const postHistory = new PostHistory();
      await postHistory.create(historyData);
    } catch (historyError) {
      console.error("Error creating post history:", historyError);
      // Don't return error, continue with post update
    }
    
    // Update post resolution status
    const updatedPost = await Post.getModel().findByIdAndUpdate(
      req.params.id,
      {
        resolutionStatus,
        resolutionNote,
        resolvedBy: resolutionStatus === 'Resolved' && resolvedBy ? resolvedBy : null,
        resolvedAt: resolutionStatus === 'Resolved' ? (resolvedAt || new Date()) : null,
        isArchived: resolutionStatus === 'Resolved'
      },
      { new: true }
    ).populate('user', 'email username');
    
    res.json({ 
      message: `Post marked as ${resolutionStatus}${(resolutionStatus === 'Resolved' && resolvedBy) ? ' and user awarded 10 points' : ''}`, 
      post: updatedPost
    });
  } catch (error) {
    console.error("Error updating resolution status:", error);
    res.status(500).json({ message: "Error updating resolution status", error: error.message });
  }
});

// Delete a post by ID and update associated reports (admin only)
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const postId = req.params.id;
    
    const post = await Post.getModel()
      .findById(postId)
      .exec();
      
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    // Delete the post
    await Post.deleteById(postId);
    
    // Find all reports related to this post and update them
    await Report.getModel()
      .updateMany(
        { postId: postId },
        { 
          $set: { 
            status: "Resolved", 
            adminResponse: req.body.adminResponse || "Post has been removed by an administrator." 
          } 
        }
      )
      .exec();
    
    res.json({ 
      message: "Post deleted successfully",
      postId: postId
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update post status (lost/found) by admin
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const { status, title, description, location } = req.body;
    
    const post = await Post.getModel()
      .findById(req.params.id)
      .exec();
      
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    const updatedPost = await Post.updateById(req.params.id, {
      ...(status && { status }),
      ...(title && { title }),
      ...(description && { description }),
      ...(location && { location })
    });
    
    res.json(updatedPost);
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Run matching for a specific post (admin only)
router.post("/:id/run-matching", adminAuth, async (req, res) => {
  try {
    const postId = req.params.id;
    
    // Find the post
    const post = await Post.getModel()
      .findById(postId)
      .exec();
      
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Find potential matches
    const otherType = post.status === 'lost' ? 'found' : 'lost';
    const otherPosts = await Post.getModel().find({ 
      status: otherType,
      resolutionStatus: 'Active',
      isArchived: false
    });
    
    console.log(`Found ${otherPosts.length} ${otherType} posts to compare against for post ${postId}`);
    
    let matches = [];
    
    // Compare with other posts
    for (const other of otherPosts) {
      const textA = `${post.title} ${post.description} ${post.location}`;
      const textB = `${other.title} ${other.description} ${other.location}`;
      const similarity = stringSimilarity.compareTwoStrings(textA, textB);
      
      console.log(`Comparing post ${postId} with post ${other._id}: similarity = ${similarity}`);
      
      if (similarity >= 0.3) {
        const exists = post.status === 'lost'
          ? await Match.getModel().findOne({ lostPost: post._id, foundPost: other._id })
          : await Match.getModel().findOne({ lostPost: other._id, foundPost: post._id });
          
        if (!exists) {
          console.log(`Creating new match with similarity ${similarity}`);
          
          const matchData = {
            lostPost: post.status === 'lost' ? post._id : other._id,
            foundPost: post.status === 'found' ? post._id : other._id,
            similarity
          };
          
          const match = await Match.getModel().create(matchData);
          matches.push(match);
          
          // Add automatic comments on both posts about the potential match
          try {
            // Calculate percent match for display
            const percentMatch = Math.round(similarity * 100);
            
            // Create comment on the current post
            const commentOnCurrentPost = await Comment.getModel().create({
              postId: post._id,
              text: `🔄 AUTOMATIC MATCH DETECTED (${percentMatch}% similarity): We found a potential ${otherType} item that matches this ${post.status} item. Please check: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/post/${other._id}`,
              isAdmin: true
            });
            
            // Create comment on the other post
            const commentOnOtherPost = await Comment.getModel().create({
              postId: other._id,
              text: `🔄 AUTOMATIC MATCH DETECTED (${percentMatch}% similarity): We found a potential ${post.status} item that matches this ${other.status} item. Please check: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/post/${post._id}`,
              isAdmin: true
            });
            
            console.log(`Added automatic match comments to posts ${post._id} and ${other._id}`);
          } catch (commentError) {
            console.error('Error adding automatic match comments:', commentError);
            // Don't fail the matching if comments can't be added
          }
        } else {
          console.log('Match already exists, skipping');
        }
      }
    }
    
    res.json({ 
      message: `Found ${matches.length} new matches for post.`,
      matches 
    });
  } catch (error) {
    console.error("Error running matching for post:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;