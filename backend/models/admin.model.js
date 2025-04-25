import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';  // bcryptjs to hash passwords

const adminSchema = new mongoose.Schema({
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
  bio: {
     type: String,
     default: "" 
  },
  profilePicUrl: {
     type: String,
     default: ""
  },
  role: {
    type: String,
    default: "admin", // Default role is admin, can be expanded for different admin roles if needed
  },
});

// Hash the password before saving to DB
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);  // Create salt with 10 rounds
  this.password = await bcrypt.hash(this.password, salt);  // Hash the password
  next();
});

// Compare passwords during login
adminSchema.methods.matchPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Create the model for admins
const Admin = mongoose.model('Admin', adminSchema, 'admins'); // "admins" collection
export default Admin;
