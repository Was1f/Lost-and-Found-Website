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
    const report = new Report({
      postId,
      userId,
      reportType,
      description,
    });

    await report.save();
    res.status(201).json({ message: 'Report submitted successfully', report });
  } catch (error) {
    console.error('Error submitting report:', error);
    res.status(500).json({ message: 'Server error while submitting report' });
  }
});

// GET: Fetch reports for a specific post
router.get('/:postId', async (req, res) => {
  try {
    const reports = await Report.find({ postId: req.params.postId })
      .populate('userId', 'email')  // Populate user details for who reported
      .sort({ createdAt: -1 });  // Sort by newest reports first

    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Error fetching reports' });
  }
});

// PUT:ADMIN marks the report as resolved and adds a response
router.put('/:reportId', protect, async (req, res) => {
  const { adminResponse } = req.body;

  if (!adminResponse) {
    return res.status(400).json({ message: 'Admin response is required' });
  }

  try {
    const report = await Report.findById(req.params.reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.status = 'Resolved';
    report.adminResponse = adminResponse;
    report.updatedAt = Date.now();

    await report.save();

    res.json({ message: 'Report resolved successfully', report });
  } catch (error) {
    console.error('Error resolving report:', error);
    res.status(500).json({ message: 'Error resolving report' });
  }
});

export default router;
