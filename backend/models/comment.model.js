import mongoose from 'mongoose';
import BaseModel from './base.model.js';

const commentSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,   // Which post the comment belongs to
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // Not required to allow admin comments
  },
  isAdmin: {
    type: Boolean,
    default: false,   // Flag to indicate if it's an admin comment
  },
  botName: {
    type: String,
    default: null,    // Name to display for automated bot comments
  },
  text: {
    type: String,
    required: true,   // Comment text
    trim: true,
  },
  parentCommentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',  // Reference to the parent comment (null for main comments)
    default: null,   // Null for top-level comments, set for replies
  },
  isRemoved: {
    type: Boolean,
    default: false,  // Flag to indicate if it's been removed by admin
  },
  createdAt: {
    type: Date,
    default: Date.now,  // When the comment was created
  },
  updatedAt: {
    type: Date,
    default: Date.now,  // When the comment was last updated
  },
});

const CommentModel = mongoose.model('Comment', commentSchema);

// Create Comment class that extends BaseModel
class Comment extends BaseModel {
  constructor() {
    super(CommentModel);
  }

  // Add comment-specific methods
  async findByPost(postId) {
    return await this.find({ postId, isRemoved: false });
  }

  async findByUser(userId) {
    return await this.find({ userId, isRemoved: false });
  }

  async findTopLevelComments(postId) {
    return await this.find({ 
      postId, 
      parentCommentId: null,
      isRemoved: false 
    });
  }

  async findReplies(commentId) {
    return await this.find({ 
      parentCommentId: commentId,
      isRemoved: false 
    });
  }

  async removeComment(commentId) {
    return await this.updateById(commentId, { 
      isRemoved: true,
      text: '[Removed]',
      updatedAt: new Date()
    });
  }

  async updateComment(commentId, text) {
    return await this.updateById(commentId, { 
      text,
      updatedAt: new Date()
    });
  }
}

export default new Comment();