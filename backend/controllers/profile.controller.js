    import User from "../models/user.model.js";

    // Get user profile by ID
    export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
    };

    // Update user profile
    export const updateProfile = async (req, res) => {
    try {
        const { name, bio, profilePicUrl } = req.body;
        const updated = await User.findByIdAndUpdate(
        req.params.id,
        { name, bio, profilePicUrl },
        { new: true, runValidators: true }
        ).select("-password");
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: "Failed to update", error });
    }
    };
