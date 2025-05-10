import express from 'express';
import { protect } from '../middleware/auth.js'; // Protect middleware to ensure the user is logged in
import Report from '../models/report.model.js';

const router = express.Router();

// POST: Create a new report
router.post('/', protect, async (req, res) => {
  const { postId, reportType, description } = req.body;
  const userId = req.user._id;  // Get user ID from JWT token

  if (!postId || !reportType || !description) {
    return res.status(400).json({ message: 'Post ID, report type, and description are required' });
  }

  try {
    const report = await Report.create({
      postId,
      userId,
      reportType,
      description,
    });

    res.status(201).json({ message: 'Report submitted successfully', report });
  } catch (error) {
    console.error('Error submitting report:', error);
    res.status(500).json({ message: 'Server error while submitting report' });
  }
});

// GET: Fetch reports for a specific post
router.get('/me', protect, async (req, res) => {
    try {
      // Correctly filter by userId, not postId
      const reports = await Report.find({ userId: req.user._id })  // Ensure it's filtering by userId
        .populate('postId', 'title')  // Optionally populate the post title
        .sort({ createdAt: -1 });  // Sort by the most recent reports
  
      res.json(reports);  // Return the reports data
    } catch (error) {
      console.error('Error fetching reports:', error);
      res.status(500).json({ message: 'Error fetching reports' });
    }
  });

// PUT:ADMIN marks the report as resolved and adds a response (optional)
router.put('/:reportId', protect, async (req, res) => {
  const { adminResponse, status } = req.body;

  try {
    const report = await Report.findById(req.params.reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const updatedReport = await Report.updateById(req.params.reportId, {
      status: status || 'Resolved',
      ...(adminResponse && { adminResponse }),
      updatedAt: Date.now()
    });

    res.json({ message: 'Report updated successfully', report: updatedReport });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ message: 'Error updating report' });
  }
});

export default router;