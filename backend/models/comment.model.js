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
    required: true,   // Which user wrote the comment
  },
  text: {
    type: String,
    required: true,   // Comment text
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,  // When the comment was created
  },
});

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
