import express from "express";
import { getProfile, updateProfile } from "../controllers/profile.controller.js";

const router = express.Router();

// GET /api/profile/:id
router.get("/:id", getProfile);

// PUT /api/profile/:id
router.put("/:id", updateProfile);

export default router;
