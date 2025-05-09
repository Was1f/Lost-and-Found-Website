import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';  // bcryptjs to hash passwords

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
  status: {
    type: String,
    enum: ['active', 'banned'],
    default: 'active'  // Default to active when user signs up
  }
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

const User = mongoose.model('User', userSchema);
export default User;