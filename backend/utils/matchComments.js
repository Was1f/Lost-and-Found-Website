import Comment from '../models/comment.model.js';

/**
 * Adds automated comment notifications to both matched posts
 * 
 * @param {Object} lostPost - The lost post object
 * @param {Object} foundPost - The found post object 
 * @param {Number} similarity - The similarity score (between 0 and 1)
 * @param {Boolean} isAdminVerified - Whether this is admin verified or auto-matched
 * @returns {Promise<Array>} - Array containing the created comments
 */
export const addMatchComments = async (lostPost, foundPost, similarity, isAdminVerified = false) => {
  try {
    // Calculate percent match for display
    const percentMatch = Math.round(similarity * 100);
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    // Determine prefix based on whether admin verified or auto-matched
    const prefix = isAdminVerified 
      ? `🎯 ADMIN VERIFIED MATCH (${percentMatch}% similarity)`
      : `🔄 AUTOMATIC MATCH DETECTED (${percentMatch}% similarity)`;
    
    // Create comment on the lost post
    const commentOnLostPost = await Comment.create({
      postId: lostPost._id,
      text: `${prefix}: We found a potential FOUND item that matches your lost item.\n\n👉 Please check: ${baseUrl}/post/${foundPost._id}\n\n${isAdminVerified ? 'An admin has verified this match. Please contact the finder to coordinate item return.' : 'This automated message is generated when our system finds items that might be related.'}`,
      isAdmin: true
    });
    
    // Create comment on the found post
    const commentOnFoundPost = await Comment.create({
      postId: foundPost._id,
      text: `${prefix}: We found a potential LOST item that matches your found item.\n\n👉 Please check: ${baseUrl}/post/${lostPost._id}\n\n${isAdminVerified ? 'An admin has verified this match. Please contact the owner to coordinate item return.' : 'This automated message is generated when our system finds items that might be related.'}`,
      isAdmin: true
    });
    
    console.log(`Added ${isAdminVerified ? 'admin verified' : 'automatic'} match comments to posts ${lostPost._id} and ${foundPost._id}`);
    
    return [commentOnLostPost, commentOnFoundPost];
  } catch (error) {
    console.error('Error adding match comments:', error);
    throw error;
  }
};

export default {
  addMatchComments
}; 