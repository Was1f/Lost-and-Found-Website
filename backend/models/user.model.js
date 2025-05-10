import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';  // bcryptjs to hash passwords
import BaseModel from './base.model.js';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  coverPic: {
    type: String,
    default: ""
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  studentId: {
    type: String,
    required: true,
    unique: true,
    match: /^\d{8}$/ // Ensure it's an 8-digit number
  },
  bio: {
     type: String,
     default: "" 
  },
  profilePic: {
     type: String,
      default: ""
  },
  points: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'banned'],
    default: 'active'  // Default to active when user signs up
  },
   // Added bookmarks field to store post IDs
  bookmarks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    default: []
  }]
  
});

// Hash the password before saving to DB
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);  // Create salt with 10 rounds
  this.password = await bcrypt.hash(this.password, salt);  // Hash the password
  next();
});

// Compare passwords during login
userSchema.methods.matchPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

const UserModel = mongoose.model('User', userSchema);

// Create User class that extends BaseModel
class User extends BaseModel {
  constructor() {
    super(UserModel);
  }

  // Add user-specific methods
  async findByEmail(email) {
    return await this.findOne({ email: email.toLowerCase() });
  }

  async findByUsername(username) {
    return await this.findOne({ username });
  }

  async findByStudentId(studentId) {
    return await this.findOne({ studentId });
  }

  async findActiveUsers() {
    return await this.find({ status: 'active' });
  }

  async updatePoints(userId, points) {
    return await this.updateById(userId, { $inc: { points } });
  }

  // Bookmark-related methods
  async findByIdWithPopulatedBookmarks(userId) {
    try {
      return await this.model.findById(userId).populate({
        path: 'bookmarks',
        populate: {
          path: 'user',
          select: 'email username profilePic'
        }
      });
    } catch (error) {
      console.error('Error in findByIdWithPopulatedBookmarks:', error);
      throw error;
    }
  }

  async addBookmark(userId, postId) {
    try {
      const user = await this.model.findById(userId);
      if (!user) return null;

      if (!user.bookmarks.includes(postId)) {
        user.bookmarks.push(postId);
        await user.save();
      }
      return user;
    } catch (error) {
      console.error('Error in addBookmark:', error);
      throw error;
    }
  }

  async removeBookmark(userId, postId) {
    try {
      const user = await this.model.findById(userId);
      if (!user) return null;

      const bookmarkIndex = user.bookmarks.findIndex(
        bookmark => bookmark.toString() === postId
      );

      if (bookmarkIndex !== -1) {
        user.bookmarks.splice(bookmarkIndex, 1);
        await user.save();
      }
      return user;
    } catch (error) {
      console.error('Error in removeBookmark:', error);
      throw error;
    }
  }

  async isPostBookmarked(userId, postId) {
    try {
      const user = await this.model.findById(userId);
      if (!user) return false;

      return user.bookmarks.some(
        bookmark => bookmark.toString() === postId
      );
    } catch (error) {
      console.error('Error in isPostBookmarked:', error);
      throw error;
    }
  }
}

// Create and export a single instance
const userInstance = new User();
export default userInstance;