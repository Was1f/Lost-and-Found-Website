import mongoose from 'mongoose';
import BaseModel from './base.model.js';

// Schema for Post History (stores previous versions of posts)
const postHistorySchema = new mongoose.Schema({
    
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,  // Reference to the post being updated
  },
  title: String,
  description: String,
  status: String,
  location: String,
  image: String,
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // The user who made the edit
    required: function() {
      // Only require updatedBy for user-initiated actions
      return this.changeType === 'update' || this.changeType === 'delete';
    }
  },
  changeDate: {
    type: Date,
    default: Date.now,  // Automatically sets the current date and time when the record is created
  },
  changeType: {
    type: String,
    enum: ['update', 'delete', 'archive', 'resolution-update'],  // Added archive and resolution-update
    required: true,
  },
  systemGenerated: {
    type: Boolean,
    default: false,  // Flag to indicate if this was a system action or user action
  }
});

const PostHistoryModel = mongoose.model('PostHistory', postHistorySchema);

// Create PostHistory class that extends BaseModel
class PostHistory extends BaseModel {
  constructor() {
    super(PostHistoryModel);
  }

  // Add PostHistory-specific methods
  async findByPost(postId) {
    return await this.find({ postId });
  }

  async findByUser(userId) {
    return await this.find({ updatedBy: userId });
  }

  async findByChangeType(changeType) {
    return await this.find({ changeType });
  }

  async findSystemGenerated() {
    return await this.find({ systemGenerated: true });
  }

  async findUserGenerated() {
    return await this.find({ systemGenerated: false });
  }

  async findByDateRange(startDate, endDate) {
    return await this.find({
      changeDate: {
        $gte: startDate,
        $lte: endDate
      }
    });
  }

  async getLatestChange(postId) {
    return await this.findOne({ postId }).sort({ changeDate: -1 });
  }

  // Additional useful methods
  async getPostHistory(postId, limit = 10) {
    return await this.find({ postId })
      .sort({ changeDate: -1 })
      .limit(limit);
  }

  async getRecentChanges(limit = 20) {
    return await this.find()
      .sort({ changeDate: -1 })
      .limit(limit);
  }

  async getChangesByType(postId, changeType) {
    return await this.find({ 
      postId, 
      changeType 
    }).sort({ changeDate: -1 });
  }

  async getSystemGeneratedChanges(postId) {
    return await this.find({ 
      postId, 
      systemGenerated: true 
    }).sort({ changeDate: -1 });
  }

  async getUserGeneratedChanges(postId) {
    return await this.find({ 
      postId, 
      systemGenerated: false 
    }).sort({ changeDate: -1 });
  }
}

export default new PostHistory();