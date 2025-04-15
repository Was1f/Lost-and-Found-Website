import express from "express";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";  // Make sure cors is imported after other necessary imports

import { connectDB } from "./config/db.js";
import productRoutes from "./Routes/product.route.js";
import authRoutes from "./Routes/auth.route.js";  // Import auth routes

dotenv.config();

const app = express();  // Initialize app first

// Enable CORS after initializing app
app.use(cors({
  origin: 'http://localhost:5173'  // Allow only requests from localhost:5173
}));

const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

app.use(express.json()); // allows us to accept JSON data in the req.body

// Add the authentication routes
app.use("/api/auth", authRoutes);  // Add this line for the authentication routes

app.use("/api/products", productRoutes);

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
