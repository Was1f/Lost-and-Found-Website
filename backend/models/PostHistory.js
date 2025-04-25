import mongoose from 'mongoose';

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
    required: true,
  },
  changeDate: {
    type: Date,
    default: Date.now,  // Automatically sets the current date and time when the record is created
  },
  changeType: {
    type: String,
    enum: ['update', 'delete'],  // Track whether the post was updated or deleted
    required: true,
  },
});

const PostHistory = mongoose.model('PostHistory', postHistorySchema);

export default PostHistory;
