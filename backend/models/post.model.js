import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Reference to User model
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },  // Image URL or path to the image
  createdAt: { type: Date, default: Date.now },
  status: { type: String, default: 'lost' },  // 'lost' or 'found'
});

const Post = mongoose.model('Post', postSchema);

export default Post;
