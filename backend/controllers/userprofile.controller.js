import User from '../models/user.model.js';

// GET: /api/userprofile/me
export const getUserProfile = async (req, res) => {
  try {
    const user = req.user; // Already populated by the protect middleware
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({
      id: user._id,
      email: user.email,
      username: user.username,
      bio: user.bio,
      profilePic: user.profilePic,
      coverPic: user.coverPic,
      createdAt: user.createdAt,
      studentId: user.studentId,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      points: user.points
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

// PUT: /api/userprofile/update
export const updateUserProfile = async (req, res) => {
  try {
    const user = req.user; // Already populated by the protect middleware
    const { username, bio } = req.body;

    // Update text fields if provided
    if (username) user.username = username;
    if (bio !== undefined) user.bio = bio;
    
    // Update profile picture if uploaded
    if (req.files && req.files.profilePic) {
      user.profilePic = `uploads/${req.files.profilePic[0].filename}`;
    }
    
    // Update cover picture if uploaded
    if (req.files && req.files.coverPic) {
      user.coverPic = `uploads/${req.files.coverPic[0].filename}`;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        username: updatedUser.username,
        bio: updatedUser.bio,
        profilePic: updatedUser.profilePic,
        coverPic: updatedUser.coverPic,
        studentId: updatedUser.studentId,
        isVerified: updatedUser.isVerified,
        points: updatedUser.points,
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find the user by ID
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return only public information
    res.status(200).json({
      id: user._id,
      username: user.username,
      bio: user.bio,
      profilePic: user.profilePic,
      coverPic: user.coverPic,
      isVerified: user.isVerified,
      points: user.points,
      createdAt: user.createdAt
      // Don't include email or other private information
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }
};