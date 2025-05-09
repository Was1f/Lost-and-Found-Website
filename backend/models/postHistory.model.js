import mongoose from 'mongoose';
import BaseModel from './base.model.js';

const postHistorySchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['lost', 'found'],
    required: true
  },
  location: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  updatedByUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedByAdmin: {
    type: Boolean,
    default: false
  },
  changeType: {
    type: String,
    enum: ['resolution-update', 'status-change', 'content-update'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // This will add createdAt and updatedAt fields automatically
});

// Check if the model exists before creating it
const PostHistoryModel = mongoose.models.PostHistory || mongoose.model('PostHistory', postHistorySchema);

// Create PostHistory class that extends BaseModel
class PostHistory extends BaseModel {
  constructor() {
    super(PostHistoryModel);
  }

  // Add custom methods for PostHistory
  async findByPostId(postId) {
    return await this.find({ postId });
  }

  async findByChangeType(changeType) {
    return await this.find({ changeType });
  }

  async findByAdminUpdate() {
    return await this.find({ updatedByAdmin: true });
  }

  async findByUserUpdate(userId) {
    return await this.find({ updatedByUser: userId });
  }
}

export default new PostHistory(); 