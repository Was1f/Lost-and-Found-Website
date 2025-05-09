import mongoose from 'mongoose';
import BaseModel from './base.model.js';

const reportSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reportType: {
    type: String,
    enum: ['False Information', 'Hate Speech', 'Spam', 'Irrelevant Content', 'Others'],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Resolved'],
    default: 'Pending',
  },
  adminResponse: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const ReportModel = mongoose.model('Report', reportSchema);

// Create Report class that extends BaseModel
class Report extends BaseModel {
  constructor() {
    super(ReportModel);
  }

  // Add report-specific methods
  async findByPost(postId) {
    return await this.find({ postId });
  }

  async findByUser(userId) {
    return await this.find({ userId });
  }

  async findPendingReports() {
    return await this.find({ status: 'Pending' });
  }

  async findResolvedReports() {
    return await this.find({ status: 'Resolved' });
  }

  async resolveReport(reportId, adminResponse) {
    return await this.updateById(reportId, {
      status: 'Resolved',
      adminResponse,
      updatedAt: new Date()
    });
  }

  async findByReportType(reportType) {
    return await this.find({ reportType });
  }
}

export default new Report();
