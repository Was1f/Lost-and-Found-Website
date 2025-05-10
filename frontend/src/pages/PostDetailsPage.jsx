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
import { FaBookmark, FaRegBookmark, FaMapMarkerAlt, FaUser, FaClock, FaFlag, FaComment, FaHandshake } from 'react-icons/fa';
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
  const [isClaimModalOpen, setClaimModalOpen] = useState(false);
  const [reportType, setReportType] = useState('');
  const [description, setDescription] = useState('');
  const [claimDescription, setClaimDescription] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);  
  const toast = useToast(); 
  const token = localStorage.getItem("authToken");
  const [isAdmin, setIsAdmin] = useState(false);
  const [commentUserProfiles, setCommentUserProfiles] = useState({});

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

        // Fetch full user profiles for all unique user IDs in comments and replies
        const userIds = new Set();
        commentsRes.data.forEach(comment => {
          if (comment.userId?._id) userIds.add(comment.userId._id);
          if (comment.replies) {
            comment.replies.forEach(reply => {
              if (reply.userId?._id) userIds.add(reply.userId._id);
            });
          }
        });
        const profilePromises = Array.from(userIds).map(userId =>
          axios.get(`http://localhost:5000/api/userprofile/${userId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          })
            .then(res => [userId, res.data])
            .catch(() => [userId, null])
        );
        const results = await Promise.all(profilePromises);
        setCommentUserProfiles(Object.fromEntries(results));
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

// Robust isAdmin logic with debug log
useEffect(() => {
  if (token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const payload = JSON.parse(jsonPayload);
      console.log('Decoded email for admin check:', payload.email); // Debug log
      if (payload.email && payload.email.trim().toLowerCase() === 'zidan@gmail.com') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      setIsAdmin(false);
    }
  } else if (localStorage.getItem('adminToken')) {
    setIsAdmin(true);
  } else {
    setIsAdmin(false);
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

  const handleClaimSubmit = async () => {
    if (!claimDescription) {
      alert("Please provide a description for your claim");
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/reports',
        {
          postId: id,
          reportType: 'Item Claim',
          description: claimDescription
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data);
      setClaimModalOpen(false);
      alert('Your claim has been submitted!');
    } catch (error) {
      console.error('Error submitting claim:', error);
      alert('Failed to submit claim');
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
      <Box p={8}>
        <SlideFade in={true} offsetY="20px">
          <Flex justify="space-between" align="center" mb={6}>
            <Heading 
              as="h1" 
              size="2xl" 
              bgGradient="linear(to-r, blue.400, blue.600)"
              bgClip="text"
              fontWeight="extrabold"
              lineHeight="1.2"
            >
              {post.title}
            </Heading>
            
            {/* Bookmark Button with Tooltip - only for non-admins */}
            {!isAdmin && (
              <Tooltip 
                label={isBookmarked ? "Remove bookmark" : "Add to bookmarks"}
                placement="left"
                hasArrow
              >
                <Button
                  onClick={toggleBookmark}
                  colorScheme={isBookmarked ? "blue" : "gray"}
                  variant={isBookmarked ? "solid" : "outline"}
                  size="lg"
                  leftIcon={isBookmarked ? <FaBookmark /> : <FaRegBookmark />}
                  borderRadius="full"
                  px={6}
                  transition="all 0.3s ease"
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "lg",
                    bg: isBookmarked ? "blue.500" : "gray.50",
                    borderColor: isBookmarked ? "blue.500" : "gray.300"
                  }}
                  _active={{
                    transform: "scale(0.95)"
                  }}
                  bg={isBookmarked ? "blue.400" : "white"}
                  color={isBookmarked ? "white" : "gray.600"}
                  fontWeight="semibold"
                  letterSpacing="wide"
                  textTransform="uppercase"
                  fontSize="sm"
                  borderWidth="2px"
                  borderColor={isBookmarked ? "blue.400" : "gray.200"}
                >
                  {isBookmarked ? "Bookmarked" : "Bookmark"}
                </Button>
              </Tooltip>
            )}
          </Flex>

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

          {/* Action Buttons */}
          <HStack spacing={4} mb={6}>
            <Button 
              onClick={() => setClaimModalOpen(true)} 
              colorScheme="green" 
              variant="outline"
              leftIcon={<FaHandshake />}
              _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
              transition="all 0.3s"
            >
              Claim Item
            </Button>
            <Button 
              onClick={() => setReportModalOpen(true)} 
              colorScheme="blue" 
              variant="outline"
              leftIcon={<FaFlag />}
              _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
              transition="all 0.3s"
            >
              Report Post
            </Button>
          </HStack>
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
                          name={commentUserProfiles[comment.userId?._id]?.username || comment.userId?.email || "Anonymous"}
                          src={commentUserProfiles[comment.userId?._id]?.profilePic ? `http://localhost:5000/${commentUserProfiles[comment.userId._id].profilePic}` : undefined}
                        />
                        <Box>
                          <Text fontWeight="bold" fontSize="md">
                            {commentUserProfiles[comment.userId?._id]?.username || comment.userId?.email || "Anonymous"}
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
                                  name={commentUserProfiles[reply.userId?._id]?.username || reply.userId?.email || "Anonymous"}
                                  src={commentUserProfiles[reply.userId?._id]?.profilePic ? `http://localhost:5000/${commentUserProfiles[reply.userId._id].profilePic}` : undefined}
                                />
                                <Box>
                                  <Text fontWeight="bold" fontSize="sm">
                                    {commentUserProfiles[reply.userId?._id]?.username || reply.userId?.email || "Anonymous"}
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

      {/* Claim Modal */}
      <Modal 
        isOpen={isClaimModalOpen} 
        onClose={() => setClaimModalOpen(false)}
        size="xl"
        isCentered
      >
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent maxW="800px" mx={4}>
          <ModalHeader fontSize="2xl" pb={4}>Claim Item</ModalHeader>
          <ModalBody pb={6}>
            <FormControl isRequired>
              <FormLabel fontSize="lg" mb={3}>Why do you think this item belongs to you?</FormLabel>
              <Textarea
                placeholder="Please describe why you believe this item belongs to you..."
                value={claimDescription}
                onChange={(e) => setClaimDescription(e.target.value)}
                _focus={{ borderColor: "green.500", boxShadow: "0 0 0 1px var(--chakra-colors-green-500)" }}
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
              onClick={() => setClaimModalOpen(false)}
              size="lg"
            >
              Cancel
            </Button>
            <Button 
              colorScheme="green" 
              onClick={handleClaimSubmit}
              _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
              transition="all 0.3s"
              size="lg"
            >
              Submit Claim
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default PostDetailsPage;