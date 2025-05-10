import { useState, useEffect } from "react";
import { Box, Flex,IconButton, Heading, Radio, RadioGroup, FormControl, FormLabel, Textarea, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Text, Image, VStack, Input, Button, Badge,HStack,Tooltip,useToast } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaBookmark, FaRegBookmark } from 'react-icons/fa'; 
import './CommentSection.css';
const PostDetailsPage = () => {
  const { id } = useParams(); // Get the post ID from URL
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [selectedCommentId, setSelectedCommentId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [isReportModalOpen, setReportModalOpen] = useState(false);
  const [reportType, setReportType] = useState('');
  const [description, setDescription] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);  
  const toast = useToast(); 
  const token = localStorage.getItem("authToken");

  // Fetch post details and comments
  useEffect(() => {
    const fetchPostAndComments = async () => {
      try {
        const postRes = await axios.get(`http://localhost:5000/api/posts/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPost(postRes.data);

        const commentsRes = await axios.get(`http://localhost:5000/api/comments/${id}`);
        setComments(commentsRes.data);
      } catch (error) {
        console.error("Error fetching post or comments", error);
      }
    };

    fetchPostAndComments();
  }, [id, token]);


  // Fetch post details and bookmark status
  useEffect(() => {
    const fetchPostAndBookmarkStatus = async () => {
      try {
        // Fetch post details
        const postRes = await axios.get(`http://localhost:5000/api/posts/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPost(postRes.data);

        // Check if the post is bookmarked by the user
        checkBookmarkStatus(); // Call the checkBookmarkStatus function here to update the bookmark status
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    };

    fetchPostAndBookmarkStatus();
  }, [id, token]);

  
// In your PostDetailsPage.jsx file - Update checkBookmarkStatus function
const checkBookmarkStatus = async () => {
  try {
    if (!token) return;
    
    // Updated URL to use the new route
    const response = await axios.get(`http://localhost:5000/api/bookmarks/status/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    setIsBookmarked(response.data.isBookmarked);
  } catch (error) {
    console.error('Error checking bookmark status:', error);
  }
};

// Update toggleBookmark function
const toggleBookmark = async () => {
  try {
    if (!token) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to bookmark posts',
        status: 'warning',
        duration: 3000,
        isClosable: true
      });
      navigate('/login');
      return;
    }

    if (isBookmarked) {
      // Remove bookmark
      await axios.delete(`http://localhost:5000/api/bookmarks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setIsBookmarked(false);
      toast({
        title: 'Bookmark removed',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } else {
      // Add bookmark
      await axios.post(`http://localhost:5000/api/bookmarks/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setIsBookmarked(true);
      toast({
        title: 'Post bookmarked',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    toast({
      title: 'Error',
      description: 'Failed to update bookmark',
      status: 'error',
      duration: 5000,
      isClosable: true
    });
  }
};

  // Handle posting a new comment
  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return; // Prevent empty comments

    try {
      await axios.post(
        `http://localhost:5000/api/comments/${id}`,
        { text: newComment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNewComment(""); // Clear input

      // ✅ Refresh comments immediately after posting
      const updatedComments = await axios.get(`http://localhost:5000/api/comments/${id}`);
      setComments(updatedComments.data);
    } catch (error) {
      console.error("Error posting comment", error);
    }
  };
 
// Add this state at the top with other state variables
const [currentUserId, setCurrentUserId] = useState(null);

// Add this effect to decode the token and get the current user ID
useEffect(() => {
  if (token) {
    try {
      // Simple JWT decode to get the payload
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const payload = JSON.parse(jsonPayload);
      setCurrentUserId(payload.id);
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }
}, [token]);
  // Add this function for handling comment/reply deletion
const handleDeleteComment = async (commentId, isReply = false) => {
  if (!window.confirm("Are you sure you want to delete this comment?")) {
    return;
  }

  try {
    await axios.delete(`http://localhost:5000/api/comments/${commentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    toast({
      title: `${isReply ? "Reply" : "Comment"} deleted`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    // Refresh comments after deletion
    const updatedComments = await axios.get(`http://localhost:5000/api/comments/${id}`);
    setComments(updatedComments.data);
  } catch (error) {
    console.error("Error deleting comment:", error);
    toast({
      title: "Error",
      description: `Failed to delete ${isReply ? "reply" : "comment"}`,
      status: "error",
      duration: 5000,
      isClosable: true,
    });
  }
};

  // Handle posting a reply
  const handleReplySubmit = async () => {
    if (!replyText.trim()) return; // Prevent empty replies
    
    try {
      // Make sure the postId is being sent correctly as a valid MongoDB ObjectId
      const response = await axios.post(
        `http://localhost:5000/api/comments/comments/reply`, // Fixed route path to match backend
        { 
          text: replyText, 
          parentCommentId: selectedCommentId, 
          postId: id // This should be a valid MongoDB ObjectId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );
      
      console.log("Reply posted successfully:", response.data);
      
      setReplyText(""); // Clear input
      setSelectedCommentId(null); // Close reply input

      // ✅ Refresh comments with replies immediately after posting
      const updatedComments = await axios.get(`http://localhost:5000/api/comments/${id}`);
      setComments(updatedComments.data);
    } catch (error) {
      console.error("Error posting reply:", error.response?.data || error.message);
      alert(`Error posting reply: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleReportSubmit = async () => {
    if (!reportType || !description) {
      alert("Please provide a report type and description");
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/reports',  // API endpoint to submit the report
        {
          postId: id,  // Pass the post ID
          reportType,
          description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data);
      setReportModalOpen(false);  // Close the modal after submitting
      alert('Your report has been submitted!');
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report');
    }
  };

  if (!post) {
    return <Text>Loading...</Text>;
  }

  return (
    <Box maxW="4xl" mx="auto" mt={10} p={6} bg="white" boxShadow="md" rounded="md">
      {/* Post Image */}
      <Image
        src={`http://localhost:5000${post.image}`}
        alt={post.title}
        width="100%"
        maxHeight="500px"
        objectFit="cover"
        borderRadius="md"
        mb={6}
      />

      {/* Post Info */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
  <Heading as="h2" size="xl">
    {post.title}
  </Heading>
        
        {/* ADD THIS BOOKMARK BUTTON */}
        <Tooltip label={isBookmarked ? "Remove bookmark" : "Add to bookmarks"}>
          <IconButton
            aria-label={isBookmarked ? "Remove bookmark" : "Add to bookmarks"}
            icon={isBookmarked ? <FaBookmark /> : <FaRegBookmark />}
            onClick={toggleBookmark}
            colorScheme={isBookmarked ? "blue" : "gray"}
            variant="ghost"
            size="lg"
          />
        </Tooltip>
      </Box>

      <Badge colorScheme={post.status === "lost" ? "red" : "green"} fontSize="md" mb={4}>
        {post.status.toUpperCase()}
      </Badge>

      <Text fontSize="md" color="gray.700" mb={4}>
        {post.description}
      </Text>

      <Text fontSize="sm" color="gray.600" mb={2}>
        📍 Location: {post.location}
      </Text>

      <Text fontSize="sm" color="gray.600" mb={2}>
        📧 Posted By: {post.user?.email || "Unknown"}
      </Text>

      <Text fontSize="sm" color="gray.500" mb={6}>
        🕒 Posted On: {new Date(post.createdAt).toLocaleString()}
      </Text>

       {/* Report Post Button */}
       <HStack spacing={4} mb={6}>
        <Button 
          onClick={() => setReportModalOpen(true)} 
          colorScheme="blue" 
          variant="outline"
        >
          Report
        </Button>
        
        <Button
          onClick={toggleBookmark}
          colorScheme={isBookmarked ? "blue" : "gray"}
          leftIcon={isBookmarked ? <FaBookmark /> : <FaRegBookmark />}
        >
          {isBookmarked ? "Bookmarked" : "Bookmark"}
        </Button>
      </HStack>

      {/*  Report Modal */}
      {isReportModalOpen && (
        <Modal isOpen={isReportModalOpen} onClose={() => setReportModalOpen(false)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Report Post</ModalHeader>
            <ModalBody>
              <FormControl isRequired>
                <FormLabel>Report Type</FormLabel>
                <RadioGroup onChange={setReportType} value={reportType}>
                  <Radio value="False Information">False Information</Radio>
                  <Radio value="Hate Speech">Hate Speech</Radio>
                  <Radio value="Spam">Spam</Radio>
                  <Radio value="Irrelevant Content">Irrelevant Content</Radio>
                  <Radio value="Others">Others</Radio>
                </RadioGroup>
              </FormControl>

              {/* Always show the description input */}
              <FormControl mt={4} isRequired>
                <FormLabel>Description</FormLabel>
                <Textarea
                  placeholder="Please describe the issue"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <Button colorScheme="blue" onClick={handleReportSubmit}>
                Submit Report
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}


   {/* Comments Section - REPLACE your existing comments section with this */}
<div className="comments-section">
  <h3 className="comments-title">Comments</h3>

  {/* Comment Input */}
  <div className="comment-form">
    <input
      placeholder="Write a comment..."
      value={newComment}
      onChange={(e) => setNewComment(e.target.value)}
    />
    <button className="submit-btn" onClick={handleCommentSubmit}>
      Comment
    </button>
  </div>

  {/* List of Comments */}
  {comments.length > 0 ? (
    comments.map((comment) => (
      <div key={comment._id} className="comment-card">
        <div className="comment-header">
          <span className="comment-user">{comment.userId?.email || "Anonymous"}</span>
          <span className="comment-date">
            {new Date(comment.createdAt).toLocaleString()}
          </span>
        </div>
        
        <p className="comment-text">{comment.text}</p>
        
        <div className="comment-actions">
          <button 
            className="reply-btn"
            onClick={() => setSelectedCommentId(comment._id)}
          >
            Reply
          </button>
          
          {currentUserId && comment.userId?._id === currentUserId && (
            <button 
              className="delete-btn"
              onClick={() => handleDeleteComment(comment._id)}
            >
              Delete
            </button>
          )}
        </div>

        {/* Replies */}
        {((comment._doc?.replies && comment._doc.replies.length > 0) || 
          (comment.replies && comment.replies.length > 0)) && (
          <div className="replies-container">
            {/* Handle both reply data structures */}
            {comment._doc?.replies && comment._doc.replies.map((reply) => (
              <div key={reply._id} className="reply-card">
                <div className="comment-header">
                  <span className="comment-user">{reply.userId?.email || "Anonymous"}</span>
                  <span className="comment-date">
                    {new Date(reply.createdAt).toLocaleString()}
                  </span>
                </div>
                
                <p className="comment-text">{reply.text}</p>
                
                {currentUserId && reply.userId?._id === currentUserId && (
                  <div className="comment-actions">
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteComment(reply._id, true)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}

            {comment.replies && comment.replies.map((reply) => (
              <div key={reply._id} className="reply-card">
                <div className="comment-header">
                  <span className="comment-user">{reply.userId?.email || "Admin"}</span>
                  <span className="comment-date">
                    {new Date(reply.createdAt).toLocaleString()}
                  </span>
                </div>
                
                <p className="comment-text">{reply.text}</p>
                
                {currentUserId && reply.userId?._id === currentUserId && (
                  <div className="comment-actions">
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteComment(reply._id, true)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Reply Input */}
        {selectedCommentId === comment._id && (
          <div className="reply-form">
            <input
              placeholder="Write a reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <button className="submit-btn" onClick={handleReplySubmit}>
              Reply
            </button>
            <button className="cancel-btn" onClick={() => setSelectedCommentId(null)}>
              Cancel
            </button>
          </div>
        )}
      </div>
    ))
  ) : (
    <div className="no-comments">No comments yet. Be the first!</div>
  )}
</div>
    </Box>
  );
};

export default PostDetailsPage;