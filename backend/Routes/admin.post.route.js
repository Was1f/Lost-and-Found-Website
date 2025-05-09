import express from "express";
import Post from "../models/post.model.js";
import Report from "../models/report.model.js";
import PostHistory from "../models/postHistory.model.js";
import User from "../models/user.model.js";
import { adminAuth } from "../middleware/adminAuthmiddleware.js";

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

    // If post is being resolved and a user is specified, update their points
    if (resolutionStatus === 'Resolved' && resolvedBy) {
      const user = await User.getModel().findById(resolvedBy);
      if (user) {
        // Add 10 points to the user's current points
        const currentPoints = user.points || 0;
        await User.getModel().findByIdAndUpdate(resolvedBy, {
          points: currentPoints + 10
        });
      }
    }
    
    // Create and save history record using PostHistory model
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
    
    // Update post resolution status
    const updatedPost = await Post.getModel().findByIdAndUpdate(
      req.params.id,
      {
        resolutionStatus,
        resolutionNote,
        resolvedBy: resolutionStatus === 'Resolved' ? resolvedBy : null,
        resolvedAt: resolutionStatus === 'Resolved' ? (resolvedAt || new Date()) : null,
        isArchived: resolutionStatus === 'Resolved'
      },
      { new: true }
    ).populate('user', 'email username');
    
    res.json({ 
      message: `Post marked as ${resolutionStatus}${resolutionStatus === 'Resolved' ? ' and user awarded 10 points' : ''}`, 
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

export default router;