import mongoose from 'mongoose';
import BaseModel from './base.model.js';

const matchSchema = new mongoose.Schema({
  lostPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  foundPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  similarity: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const MatchModel = mongoose.model('Match', matchSchema);

// Create Match class that extends BaseModel
class Match extends BaseModel {
  constructor() {
    super(MatchModel);
  }

  // Add match-specific methods
  async findByLostPost(lostPostId) {
    return await this.find({ lostPost: lostPostId });
  }

  async findByFoundPost(foundPostId) {
    return await this.find({ foundPost: foundPostId });
  }

  async findHighSimilarityMatches(threshold = 0.8) {
    return await this.find({ similarity: { $gte: threshold } });
  }

  async findMatchesByDateRange(startDate, endDate) {
    return await this.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    });
  }
}

export default new Match(); 