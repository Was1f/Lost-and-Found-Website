import express from "express";
import Post from "../models/post.model.js";
import Report from "../models/report.model.js";

const router = express.Router();

// Note: This route assumes that access control is handled at a higher level
// Only administrators should have access to these routes

// Get all posts (admin view)
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username email") // Get user info
      .sort({ createdAt: -1 }); // Newest first
    
    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get a single post by ID
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("user", "username email");
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    res.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete a post by ID and update associated reports (admin only)
router.delete("/:id", async (req, res) => {
  try {
    const postId = req.params.id;
    
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    // Delete the post
    await Post.findByIdAndDelete(postId);
    
    // Find all reports related to this post and update them
    await Report.updateMany(
      { postId: postId },
      { 
        $set: { 
          status: "Resolved", 
          adminResponse: req.body.adminResponse || "Post has been removed by an administrator." 
        } 
      }
    );
    
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
router.put("/:id", async (req, res) => {
  try {
    const { status, title, description, location } = req.body;
    
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    // Update allowed fields
    if (status) post.status = status;
    if (title) post.title = title;
    if (description) post.description = description;
    if (location) post.location = location;
    
    await post.save();
    
    res.json(post);
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;