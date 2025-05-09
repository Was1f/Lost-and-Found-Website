import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  lostPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  foundPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  similarity: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Match = mongoose.model('Match', matchSchema);
export default Match; 