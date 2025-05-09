import mongoose from 'mongoose';

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

const Post = mongoose.model('Post', postSchema);

export default Post;