// 1. Fix userprofile.controller.js - ensure consistent property names

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
      profilePic: user.profilePic || user.profilePicUrl, // Support both field names
      coverPic: user.coverPic || user.coverPicUrl, // Support both field names
      createdAt: user.createdAt,
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
    const { username, bio, profilePic, coverPic } = req.body;

    // Update fields if provided
    if (username) user.username = username;
    if (bio !== undefined) user.bio = bio;
    if (profilePic) {
      // Update both field names to ensure compatibility
      user.profilePic = profilePic;
      user.profilePicUrl = profilePic;
    }
    if (coverPic) {
      // Update both field names to ensure compatibility
      user.coverPic = coverPic;
      user.coverPicUrl = coverPic;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        username: updatedUser.username,
        bio: updatedUser.bio,
        profilePic: updatedUser.profilePic || updatedUser.profilePicUrl,
        coverPic: updatedUser.coverPic || updatedUser.coverPicUrl,
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

// 2. Fix middleware/auth.js - Handle both JWT payload formats

export const protect = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]; // Get token from header
      
      // Add a secret fallback in case process.env.JWT_SECRET is not set
      const secret = process.env.JWT_SECRET || 'secret';
      const decoded = jwt.verify(token, secret);
      
      // Handle different JWT payload formats
      const userId = decoded.id || decoded.userId;
      
      if (!userId) {
        console.error('Invalid token payload:', decoded);
        return res.status(401).json({ message: 'Invalid token format' });
      }
      
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      req.user = user;
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// 3. Ensure login controller returns user ID consistently

export const loginController = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare the entered password with the stored hashed password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token with consistent payload
    const token = jwt.sign(
      { id: user._id }, // Use consistent key 'id'
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { 
        id: user._id, // Include user ID in response
        email: user.email 
      },
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};