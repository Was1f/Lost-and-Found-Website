import express from "express";
import Report from "../models/report.model.js";
import Post from "../models/post.model.js";
import { updateUserPoints } from "../controllers/leaderboard.controller.js";

const router = express.Router();

// Note: This route assumes that access control is handled at a higher level
// Only administrators should have access to these routes

// Get all reports with populated data
router.get("/", async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("postId", "title content image status location") // Get more comprehensive post info
      .populate("userId", "username email") // Get basic user info
      .sort({ createdAt: -1 }); // Newest first
    
    res.json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get a single report by ID
router.get("/:id", async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate("postId", "title content image status location")
      .populate("userId", "username email");
    
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    
    res.json(report);
  } catch (error) {
    console.error("Error fetching report:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update report status
router.put("/:id", async (req, res) => {
  try {
    const { status, adminResponse } = req.body;
    
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    const updatedReport = await Report.updateById(req.params.id, {
      status: status || report.status,
      ...(adminResponse && { adminResponse }),
      updatedAt: Date.now()
    });

    // If report is being resolved, add 5 points to the user who reported
    // But only if it's not a 'Claim Item' report
    if (status === "Resolved" && report.userId && report.reportType !== 'Claim Item') {
      await updateUserPoints(report.userId, 5);
    }

    res.json(updatedReport);
  } catch (error) {
    console.error("Error updating report:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete a report
router.delete("/:id", async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    await Report.deleteById(req.params.id);
    res.json({ message: "Report deleted successfully" });
  } catch (error) {
    console.error("Error deleting report:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;