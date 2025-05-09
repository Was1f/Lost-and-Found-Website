import mongoose from 'mongoose';

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

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;