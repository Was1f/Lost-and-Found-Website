import mongoose from 'mongoose';
import BaseModel from './base.model.js';

const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Reference to User model
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },  // Image URL or path to the image
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['lost', 'found'], default: 'lost' },  // 'lost' or 'found'
  location: { type: String, required: true },
  
  // New fields for archiving system
  resolutionStatus: { 
    type: String, 
    enum: ['Active', 'Resolved', 'Unresolved'], 
    default: 'Active' 
  },
  isArchived: { 
    type: Boolean, 
    default: false 
  },
  resolvedAt: { 
    type: Date, 
    default: null 
  },
  resolvedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: null
  },
  resolutionNote: { 
    type: String, 
    default: '' 
  }
},
{ timestamps: true }
);

const PostModel = mongoose.model('Post', postSchema);

// Create Post class that extends BaseModel
class Post extends BaseModel {
  constructor() {
    super(PostModel);
  }

  // Add post-specific methods
  async findByUser(userId) {
    return await this.find({ user: userId });
  }

  async findActivePosts() {
    return await this.find({ resolutionStatus: 'Active', isArchived: false });
  }

  async findLostPosts() {
    return await this.find({ status: 'lost', resolutionStatus: 'Active' });
  }

  async findFoundPosts() {
    return await this.find({ status: 'found', resolutionStatus: 'Active' });
  }

  async findResolvedPosts() {
    return await this.find({ resolutionStatus: 'Resolved' });
  }

  async resolvePost(postId, resolvedBy, resolutionNote) {
    return await this.updateById(postId, {
      resolutionStatus: 'Resolved',
      resolvedAt: new Date(),
      resolvedBy,
      resolutionNote
    });
  }

  async archivePost(postId) {
    return await this.updateById(postId, { isArchived: true });
  }
}

export default new Post();