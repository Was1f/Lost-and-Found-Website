import { useState, useEffect } from "react";
import { Box, Flex,IconButton, Heading, Radio, RadioGroup, FormControl, FormLabel, Textarea, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Text, Image, VStack, Input, Button, Badge,HStack,Tooltip,useToast } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaBookmark, FaRegBookmark } from 'react-icons/fa'; 

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


      {/* Comments Section */}
      <Box mt={10}>
        <Heading as="h3" size="lg" mb={4}>
          Comments
        </Heading>

        {/* Comment Input */}
        <Box display="flex" mb={4}>
          <Input
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            mr={2}
          />
          <Button colorScheme="blue" onClick={handleCommentSubmit}>
            Comment
          </Button>
        </Box>

        {/* List of Comments */}
        <VStack align="start" spacing={3}>
          {comments.length > 0 ? (
            comments.map((comment) => (
              <Box
                key={comment._id}
                bg="gray.100"
                p={3}
                rounded="md"
                w="100%"
              >
                <Text fontWeight="bold" fontSize="sm" mb={1}>
                  {comment.userId?.email || "Anonymous"} {/* populated user email */}
                </Text>
                <Text fontSize="sm">{comment.text}</Text>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  {new Date(comment.createdAt).toLocaleString()}
                </Text>

                {/* Reply Button */}
                <Button
                  colorScheme="blue"
                  size="sm"
                  mt={2}
                  onClick={() => setSelectedCommentId(comment._id)} // Set comment ID to reply to
                >
                  Reply
                </Button>

                {/* Replies Section */}
                {comment._doc?.replies && comment._doc.replies.length > 0 ? (
                  <Box mt={3} ml={6}>
                    {comment._doc.replies.map((reply) => (
                      <Box key={reply._id} bg="gray.200" p={3} rounded="md" mb={2}>
                        <Text fontWeight="bold" fontSize="sm" mb={1}>
                          {reply.userId?.email || "Anonymous"}
                        </Text>
                        <Text fontSize="sm">{reply.text}</Text>
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          {new Date(reply.createdAt).toLocaleString()}
                        </Text>
                      </Box>
                    ))}
                  </Box>
                ) : comment.replies && comment.replies.length > 0 ? (
                  <Box mt={3} ml={6}>
                    {comment.replies.map((reply) => (
                      <Box key={reply._id} bg="gray.200" p={3} rounded="md" mb={2}>
                        <Text fontWeight="bold" fontSize="sm" mb={1}>
                          {reply.userId?.email || "Admin"}
                        </Text>
                        <Text fontSize="sm">{reply.text}</Text>
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          {new Date(reply.createdAt).toLocaleString()}
                        </Text>
                      </Box>
                    ))}
                  </Box>
                ) : null}

                {/* Reply Input */}
                {selectedCommentId === comment._id && (
                  <Box display="flex" mt={3}>
                    <Input
                      placeholder="Write a reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      mr={2}
                    />
                    <Button colorScheme="blue" onClick={handleReplySubmit}>
                      Reply
                    </Button>
                  </Box>
                )}

              </Box>
            ))
          ) : (
            <Text>No comments yet. Be the first!</Text>
          )}
        </VStack>
      </Box>
    </Box>
  );
};

export default PostDetailsPage;