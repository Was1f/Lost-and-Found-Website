import express from "express";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";  // Make sure cors is imported after other necessary imports

import { connectDB } from "./config/db.js";
// import productRoutes from "./Routes/product.route.js";
import authRoutes from "./Routes/auth.route.js";  // Import auth routes
//import userRoutes from "./Routes/user.route.js";  // Import user routes
import profileRoutes from "./Routes/profile.route.js"; 
import postRoutes from './Routes/post.route.js';
import commentRoutes from './Routes/comment.route.js';

dotenv.config();

const app = express();  // Initialize app first

// Enable CORS after initializing app
app.use(cors({
  origin: 'http://localhost:5173'  // Allow only requests from localhost:5173
}));

const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

app.use(express.json()); // allows us to accept JSON data in the req.body
app.use('/api/posts', postRoutes); //create post api
app.use('/uploads', express.static(path.join(path.resolve(), 'uploads')));
// Add the authentication routes
app.use("/api/auth", authRoutes);  // Add this line for the authentication routes
app.use("/api/profile", profileRoutes);
app.use('/api/comments', commentRoutes);

// app.use("/api/products", productRoutes);
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Serve frontend assets in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}

app.listen(PORT, async () => {
  await connectDB(); // Ensure MongoDB connection before starting the server
  console.log("Server started at http://localhost:" + PORT);
});
