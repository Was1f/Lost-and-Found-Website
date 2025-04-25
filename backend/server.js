import express from "express";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";

import { connectDB } from "./config/db.js";
import authRoutes from "./Routes/auth.route.js";
import profileRoutes from "./Routes/profile.route.js";
import postRoutes from "./Routes/post.route.js";
import adminRoutes from "./Routes/admin.route.js"; // 👈 Import Admin Routes

dotenv.config(); // Load environment variables

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
app.use("/api/profile", profileRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/admin", adminRoutes); // 👈 Admin routes here
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
