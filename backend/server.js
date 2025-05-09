import express from "express";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import cron from 'node-cron';
import { connectDB } from "./config/db.js";
import axios from 'axios';
// import productRoutes from "./Routes/product.route.js";
import authRoutes from "./Routes/auth.route.js";  // Import auth routes
//import userRoutes from "./Routes/user.route.js";  // Import user routes 
import postRoutes from './Routes/post.route.js';
import adminRoutes from "./Routes/admin.route.js"; // 👈 Import Admin Routes
import commentRoutes from './Routes/comment.route.js';
import userProfileRoutes from './Routes/userprofile.route.js';
import matchRoutes from './Routes/match.route.js';

// import reportRoutes from './Routes/report.route.js';
import adminReportRoutes from "./Routes/admin.report.route.js";
import postHistoryRoutes from "./Routes/postHistory.route.js";
import adminPostRoutes from "./Routes/admin.post.route.js";
import leaderboardRoutes from './Routes/leaderboard.route.js';

import reportRoutes from './Routes/report.route.js';
dotenv.config();

const app = express(); // Initialize app

const PORT = process.env.PORT || 5000;
const __dirname = path.resolve(); // __dirname workaround for ES modules

// Middlewares
app.use(cors({
  origin: 'http://localhost:5173', // Frontend port
}));
app.use(express.json()); // Parse JSON bodies

// API Routes
app.use("/api/admin/reports", adminReportRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/admin", adminRoutes); // 👈 Admin routes here
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/comments', commentRoutes);
app.use('/api/userprofile', userProfileRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/posthistory', postHistoryRoutes);
app.use("/api/admin/posts", adminPostRoutes);

// app.use('/api/posthistory', postRoutes);  // Ensure that this is pointing to the right route

app.use('/api/leaderboard', leaderboardRoutes)

// Base API Check
app.get("/", (req, res) => {
  res.send("API is running...");
});



// Add this to your main server file (e.g., server.js or app.js)



// Schedule archive check to run at midnight every day
cron.schedule('0 0 * * *', async () => {
  console.log('Running scheduled archive check...');
  
  try {
    // Call the archive endpoint
    const response = await axios.post('http://localhost:5000/api/posts/check-archive');
    
    console.log(`Archive check complete: ${response.data.message}`);
    console.log(`${response.data.archivedPosts.length} posts archived`);
    
    // Optional: You can log detailed information about archived posts
    if (response.data.archivedPosts.length > 0) {
      response.data.archivedPosts.forEach(post => {
        console.log(`Archived post: ${post.title} (ID: ${post._id})`);
      });
    }
  } catch (error) {
    console.error('Error running scheduled archive check:', error.message);
  }
});

console.log('Archive scheduler initialized');

// Note: To run this job from an external process instead of your Node server,
// create a separate script that runs the API call and set it up with your
// server's cron system or a task scheduler.

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}

// Start server
app.listen(PORT, async () => {
  await connectDB(); // MongoDB connected before server starts
  console.log(`Server started at http://localhost:${PORT}`);
});


