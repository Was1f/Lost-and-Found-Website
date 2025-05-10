import { useState, useEffect } from "react";
import { 
  Box, 
  Flex, 
  IconButton, 
  Heading, 
  Radio, 
  RadioGroup, 
  FormControl, 
  FormLabel, 
  Textarea, 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  useDisclosure, 
  Text, 
  Image, 
  VStack, 
  Input, 
  Button, 
  Badge,
  HStack,
  Tooltip,
  useToast,
  Container,
  Icon,
  useColorModeValue,
  Avatar,
  ScaleFade,
  Fade,
  SlideFade 
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaBookmark, FaRegBookmark, FaMapMarkerAlt, FaUser, FaClock, FaFlag, FaComment } from 'react-icons/fa';
import './CommentSection.css';
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const PostDetailsPage = () => {
  const { id } = useParams(); // Get the post ID from URL
  const navigate = useNavigate();
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
    return (
      <Flex justify="center" align="center" minH="60vh">
        <Text fontSize="xl" color="gray.500">Loading post details...</Text>
      </Flex>
    );
  }

  return (
    <Container maxW="6xl" py={8}>
      <ScaleFade initialScale={0.9} in={true}>
        <Box 
          bg={useColorModeValue("white", "gray.800")}
          borderRadius="xl"
          boxShadow="xl"
          overflow="hidden"
          mb={8}
        >
          {/* Post Image with Hover Effect */}
          <Box position="relative" overflow="hidden">
            <Image
              src={`http://localhost:5000${post.image}`}
              alt={post.title}
              width="100%"
              maxHeight="500px"
              objectFit="cover"
              transition="transform 0.3s ease"
              _hover={{ transform: "scale(1.02)" }}
            />
            <Badge
              position="absolute"
              top={4}
              right={4}
              colorScheme={post.status === "lost" ? "red" : "green"}
              fontSize="md"
              px={4}
              py={2}
              borderRadius="full"
              textTransform="uppercase"
              fontWeight="bold"
              boxShadow="lg"
            >
              {post.status.toUpperCase()}
            </Badge>
          </Box>

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
          {/* Post Content */}
          <Box p={8}>
            <SlideFade in={true} offsetY="20px">
              <Heading 
                as="h1" 
                size="2xl" 
                mb={6}
                bgGradient="linear(to-r, blue.400, blue.600)"
                bgClip="text"
                fontWeight="extrabold"
                lineHeight="1.2"
                pb={2}
              >
                {post.title}
              </Heading>

              <Text 
                fontSize="lg" 
                color={useColorModeValue("gray.700", "gray.300")} 
                mb={8}
                lineHeight="1.8"
              >
                {post.description}
              </Text>

              <HStack spacing={8} mb={8} wrap="wrap">
                <Tooltip label="Location">
                  <HStack 
                    color="blue.500"
                    transition="all 0.3s"
                    _hover={{ transform: "translateX(5px)" }}
                  >
                    <Icon as={FaMapMarkerAlt} />
                    <Text fontWeight="medium">{post.location}</Text>
                  </HStack>
                </Tooltip>

                <Tooltip label="Posted By">
                  <HStack 
                    color="gray.500"
                    transition="all 0.3s"
                    _hover={{ transform: "translateX(5px)" }}
                  >
                    <Icon as={FaUser} />
                    <Text>{post.user?.email || "Anonymous"}</Text>
                  </HStack>
                </Tooltip>

                <Tooltip label="Posted On">
                  <HStack 
                    color="gray.500"
                    transition="all 0.3s"
                    _hover={{ transform: "translateX(5px)" }}
                  >
                    <Icon as={FaClock} />
                    <Text>{new Date(post.createdAt).toLocaleString()}</Text>
                  </HStack>
                </Tooltip>
              </HStack>

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

              <Button
                leftIcon={<FaFlag />}
                colorScheme="blue"
                variant="outline"
                onClick={() => setReportModalOpen(true)}
                mb={8}
                _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                transition="all 0.3s"
              >
                Report Post
              </Button>
            </SlideFade>
          </Box>
        </Box>

        {/* Comments Section */}
        <Fade in={true}>
          <Box 
            bg={useColorModeValue("white", "gray.800")}
            borderRadius="xl"
            boxShadow="xl"
            p={8}
          >
            <Heading 
              as="h2" 
              size="xl" 
              mb={6}
              display="flex"
              alignItems="center"
              gap={3}
            >
              <Icon as={FaComment} color="blue.500" />
              Comments
            </Heading>

            {/* Comment Input */}
            <Box 
              mb={8}
              p={4}
              bg={useColorModeValue("gray.50", "gray.700")}
              borderRadius="lg"
            >
              <Input
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                mb={4}
                size="lg"
                bg={useColorModeValue("white", "gray.600")}
                _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
              />
              <Button 
                colorScheme="blue"
                onClick={handleCommentSubmit}
                _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                transition="all 0.3s"
              >
                Post Comment
              </Button>
            </Box>

            {/* Comments List */}
            <VStack spacing={4} align="stretch">
              {comments.length > 0 ? (
                comments.map((comment, index) => (
                  <MotionBox
                    key={comment._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Box
                      bg={useColorModeValue("gray.50", "gray.700")}
                      p={4}
                      borderRadius="lg"
                      _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
                      transition="all 0.3s"
                    >
                      <HStack mb={3}>
                        <Avatar 
                          size="md" 
                          name={comment.userId?.email || "Anonymous"}
                          src={comment.userId?.profilePic ? `http://localhost:5000${comment.userId.profilePic}` : undefined}
                        />
                        <Box>
                          <Text fontWeight="bold" fontSize="md">
                            {comment.userId?.email || "Anonymous"}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            {new Date(comment.createdAt).toLocaleString()}
                          </Text>
                        </Box>
                      </HStack>

                      <Text 
                        fontSize="md" 
                        mb={4} 
                        lineHeight="1.6"
                        fontStyle={comment.isRemoved ? "italic" : "normal"}
                        color={comment.isRemoved ? "red.500" : "inherit"}
                      >
                        {comment.text}
                      </Text>

                      {/* Only show reply button if comment is not removed */}
                      {!comment.isRemoved && (
                        <Button
                          size="md"
                          variant="ghost"
                          colorScheme="blue"
                          onClick={() => setSelectedCommentId(comment._id)}
                          _hover={{ transform: "translateX(5px)" }}
                          transition="all 0.3s"
                        >
                          Reply
                        </Button>
                      )}

                      {/* Replies Section */}
                      {comment.replies && comment.replies.length > 0 && (
                        <Box mt={4} ml={8}>
                          {comment.replies.map((reply) => (
                            <Box
                              key={reply._id}
                              bg={useColorModeValue("gray.100", "gray.600")}
                              p={4}
                              borderRadius="md"
                              mb={3}
                            >
                              <HStack mb={3}>
                                <Avatar 
                                  size="sm" 
                                  name={reply.userId?.email || "Anonymous"}
                                  src={reply.userId?.profilePic ? `http://localhost:5000${reply.userId.profilePic}` : undefined}
                                />
                                <Box>
                                  <Text fontWeight="bold" fontSize="sm">
                                    {reply.userId?.email || "Anonymous"}
                                  </Text>
                                  <Text fontSize="xs" color="gray.500">
                                    {new Date(reply.createdAt).toLocaleString()}
                                  </Text>
                                </Box>
                              </HStack>
                              <Text 
                                fontSize="sm" 
                                lineHeight="1.6"
                                fontStyle={reply.isRemoved ? "italic" : "normal"}
                                color={reply.isRemoved ? "red.500" : "inherit"}
                              >
                                {reply.text}
                              </Text>
                            </Box>
                          ))}
                        </Box>
                      )}

                      {/* Reply Input */}
                      {selectedCommentId === comment._id && (
                        <Box mt={4} ml={8}>
                          <Input
                            placeholder="Write a reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            mb={3}
                            size="md"
                            fontSize="sm"
                          />
                          <Button
                            size="md"
                            colorScheme="blue"
                            onClick={handleReplySubmit}
                            _hover={{ transform: "translateY(-2px)" }}
                            transition="all 0.3s"
                          >
                            Post Reply
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </MotionBox>
                ))
              ) : (
                <Text 
                  textAlign="center" 
                  color="gray.500"
                  py={8}
                >
                  No comments yet. Be the first to comment!
                </Text>
              )}
            </VStack>
          </Box>
        </Fade>
      </ScaleFade>

      {/* Report Modal */}
      <Modal 
        isOpen={isReportModalOpen} 
        onClose={() => setReportModalOpen(false)}
        size="xl"
        isCentered
      >
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent maxW="800px" mx={4}>
          <ModalHeader fontSize="2xl" pb={4}>Report Post</ModalHeader>
          <ModalBody pb={6}>
            <FormControl isRequired mb={6}>
              <FormLabel fontSize="lg" mb={3}>Report Type</FormLabel>
              <RadioGroup onChange={setReportType} value={reportType}>
                <VStack align="start" spacing={4}>
                  <Radio value="False Information" size="lg">False Information</Radio>
                  <Radio value="Hate Speech" size="lg">Hate Speech</Radio>
                  <Radio value="Spam" size="lg">Spam</Radio>
                  <Radio value="Irrelevant Content" size="lg">Irrelevant Content</Radio>
                  <Radio value="Others" size="lg">Others</Radio>
                </VStack>
              </RadioGroup>
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="lg" mb={3}>Description</FormLabel>
              <Textarea
                placeholder="Please describe the issue in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
                size="lg"
                minH="200px"
                fontSize="md"
              />
            </FormControl>
          </ModalBody>

          <ModalFooter pt={4} pb={6}>
            <Button 
              variant="ghost" 
              mr={4} 
              onClick={() => setReportModalOpen(false)}
              size="lg"
            >
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleReportSubmit}
              _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
              transition="all 0.3s"
              size="lg"
            >
              Submit Report
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default PostDetailsPage;