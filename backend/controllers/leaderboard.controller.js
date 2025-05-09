import User from '../models/user.model.js';

export const getLeaderboard = async (req, res) => {
  try {
    // Find all users with points > 0, sorted by points in descending order
    const users = await User.find({ points: { $gt: 0 } })
      .select('username profilePic bio studentId isVerified points email')
      .sort({ points: -1 })
      .limit(100); // Limit to top 100 users for performance
    
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Error fetching leaderboard', error: error.message });
  }
};

/**
 * Update a user's points
 * @param {string} userId - The ID of the user to update
 * @param {number} pointsToAdd - The number of points to add (can be negative to subtract)
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
export const updateUserPoints = async (userId, pointsToAdd) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      console.error(`User not found with ID: ${userId}`);
      return false;
    }
    
    // Initialize points if they don't exist
    if (user.points === undefined || user.points === null) {
      user.points = 0;
    }
    
    // Add points
    user.points += pointsToAdd;
    
    // Make sure points don't go below 0
    if (user.points < 0) {
      user.points = 0;
    }
    
    // Save the updated user
    await user.save();
    
    console.log(`Updated user points - User: ${user.email}, Points: ${user.points - pointsToAdd} → ${user.points}`);
    return true;
  } catch (error) {
    console.error('Error updating user points:', error);
    return false;
  }
};