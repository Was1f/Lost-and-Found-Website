import express from "express";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";

import { connectDB } from "./config/db.js";
// import productRoutes from "./Routes/product.route.js";
import authRoutes from "./Routes/auth.route.js";  // Import auth routes
//import userRoutes from "./Routes/user.route.js";  // Import user routes 
import postRoutes from './Routes/post.route.js';
import adminRoutes from "./Routes/admin.route.js"; // 👈 Import Admin Routes
import commentRoutes from './Routes/comment.route.js';
import userProfileRoutes from './Routes/userprofile.route.js';
import leaderboardRoutes from './Routes/leaderboard.route.js';

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
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/admin", adminRoutes); // 👈 Admin routes here
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/comments', commentRoutes);
app.use('/api/userprofile', userProfileRoutes);
app.use('/api/leaderboard', leaderboardRoutes)
// Base API Check
app.get("/", (req, res) => {
  res.send("API is running...");
});

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


