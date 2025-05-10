import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Heading,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Image,
  Text,
  Tooltip,
  useToast,
  IconButton,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Textarea,
  VStack,
  HStack,
  Divider,
  Badge,
  Select,
  Input,
  Container,
  Stack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Tag,
  Switch,
} from '@chakra-ui/react';
import { 
  DeleteIcon, 
  ArrowBackIcon, 
  ChatIcon, 
  AddIcon,
  CheckIcon,
  EditIcon,
  SettingsIcon,
  TimeIcon,
  StarIcon,
  SearchIcon
} from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';

const PostManagement = () => {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [adminComment, setAdminComment] = useState('');
  const [replyToId, setReplyToId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [users, setUsers] = useState([]);
  const [resolutionStatus, setResolutionStatus] = useState('Active');
  const [resolvedBy, setResolvedBy] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');
  const [resolvedDate, setResolvedDate] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'archived'
  
  const { 
    isOpen: isCommentsOpen, 
    onOpen: onCommentsOpen, 
    onClose: onCommentsClose 
  } = useDisclosure();
  
  const { 
    isOpen: isResolutionOpen, 
    onOpen: onResolutionOpen, 
    onClose: onResolutionClose 
  } = useDisclosure();
  
  const toast = useToast();
  const navigate = useNavigate();

  // Fetch posts function
  const fetchPosts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/posts', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data = await response.json();
      setPosts(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        isClosable: true,
      });
    }
  };

  // Fetch posts and users on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch posts
        await fetchPosts();
        
        // Fetch users for the dropdown
        const usersResponse = await fetch('http://localhost:5000/api/admin/users', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        });
        
        if (!usersResponse.ok) throw new Error('Failed to fetch users');
        const usersData = await usersResponse.json();
        setUsers(usersData.users || []);
      } catch (error) {
        toast({
          title: 'Error',
          description: error.message,
          status: 'error',
          isClosable: true,
        });
      }
    };

    fetchData();
  }, [toast]);

  // Filter posts based on selected filter
  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true;
    if (filter === 'active') return !post.isArchived;
    if (filter === 'archived') return post.isArchived;
    return true;
  });

  // Handle delete post
  const handleDeletePost = async (id) => {
    const confirm = window.confirm('Are you sure you want to delete this post?');
    if (!confirm) return;

    try {
      const response = await fetch(`http://localhost:5000/api/admin/posts/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete post');
      }

      const data = await response.json();
      toast({
        title: 'Post deleted',
        description: data.message,
        status: 'success',
        isClosable: true,
      });

      setPosts(posts.filter((post) => post._id !== id));
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        isClosable: true,
      });
    }
  };

  // Open resolution modal
  const openResolutionModal = (post) => {
    setSelectedPost(post);
    setResolutionStatus(post.resolutionStatus || 'Active');
    setResolvedBy(post.resolvedBy || '');
    setResolutionNote(post.resolutionNote || '');
    setResolvedDate(post.resolvedAt ? new Date(post.resolvedAt).toISOString().split('T')[0] : '');
    onResolutionOpen();
  };

  // Handle update resolution status
  const handleUpdateResolution = async () => {
    if (!selectedPost) {
      toast({
        title: "Error",
        description: "No post selected",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Validate required fields for resolved status
    if (resolutionStatus === 'Resolved' && !resolvedBy) {
      toast({
        title: "Missing Information",
        description: "Please select a user to award points to when marking a post as resolved",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/posts/${selectedPost._id}/resolution`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
          body: JSON.stringify({
            resolutionStatus,
            resolutionNote,
            resolvedBy: resolutionStatus === 'Resolved' ? resolvedBy : null,
            resolvedAt: resolutionStatus === 'Resolved' ? (resolvedDate || new Date().toISOString()) : null,
          }),
        }
      );

      const contentType = response.headers.get("content-type");
      let errorData;
      
      if (!response.ok) {
        if (contentType && contentType.includes("application/json")) {
          errorData = await response.json();
          throw new Error(errorData.message || "Failed to update resolution status");
        } else {
          throw new Error("Server error - Failed to update resolution status");
        }
      }

      const data = await response.json();
      toast({
        title: "Success",
        description: data.message,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Refresh the posts list
      fetchPosts();
      onResolutionClose();
    } catch (error) {
      console.error("Error updating resolution:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update resolution status",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Fetch comments for a post
  const fetchComments = async (postId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/comments?postId=${postId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch comments');
      }

      const data = await response.json();
      setComments(data);
      
      // Find the selected post details
      const post = posts.find(p => p._id === postId);
      setSelectedPost(post);
      
      onCommentsOpen();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch comments',
        status: 'error',
        isClosable: true,
      });
    }
  };

  // Handle adding an admin comment
  const handleAddAdminComment = async () => {
    if (!adminComment.trim()) return;
    
    try {
      const response = await fetch('http://localhost:5000/api/admin/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({
          postId: selectedPost._id,
          text: adminComment,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add comment');
      }

      const newComment = await response.json();
      
      // Update comments list
      setComments([newComment, ...comments]);
      setAdminComment('');
      
      toast({
        title: 'Comment added',
        description: 'Admin comment posted successfully',
        status: 'success',
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        isClosable: true,
      });
    }
  };

  // Handle reply to a comment
  const handleReply = async () => {
    if (!replyText.trim() || !replyToId) return;
    
    try {
      const response = await fetch('http://localhost:5000/api/admin/comments/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({
          postId: selectedPost._id,
          text: replyText,
          parentCommentId: replyToId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add reply');
      }

      const newReply = await response.json();
      
      // Update comments list
      setComments([newReply, ...comments]);
      setReplyToId(null);
      setReplyText('');
      
      toast({
        title: 'Reply added',
        description: 'Admin reply posted successfully',
        status: 'success',
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        isClosable: true,
      });
    }
  };

  // Handle delete comment
  const handleDeleteComment = async (id) => {
    const confirm = window.confirm('Are you sure you want to remove this comment?');
    if (!confirm) return;

    try {
      const response = await fetch(`http://localhost:5000/api/admin/comments/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove comment');
      }
      
      const data = await response.json();
      
      // Update the comments in state to reflect the change
      setComments(comments.map(comment => {
        if (comment._id === id) {
          return {
            ...comment,
            isRemoved: true,
            text: "This comment has been removed by admin for violating community guidelines."
          };
        } else if (comment.parentCommentId === id) {
          return {
            ...comment,
            isRemoved: true,
            text: "This comment has been removed by admin for violating community guidelines."
          };
        }
        return comment;
      }));
      
      toast({
        title: 'Comment removed',
        description: 'Comment has been removed for violating community guidelines',
        status: 'success',
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        isClosable: true,
      });
    }
  };

  // Run matching for a post to find potential matches
  const handleRunMatching = async (postId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/posts/${postId}/run-matching`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to run matching');
      }

      const data = await response.json();
      const matchCount = data.matches?.length || 0;
      
      toast({
        title: matchCount > 0 ? 'Matches found!' : 'No new matches',
        description: matchCount > 0 
          ? `Found ${matchCount} new matches. Automatic comments have been added to relevant posts.`
          : 'No new matches were found for this post.',
        status: matchCount > 0 ? 'success' : 'info',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        isClosable: true,
      });
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'lost': return 'red';
      case 'found': return 'green';
      default: return 'gray';
    }
  };

  // Get resolution status badge color
  const getResolutionBadgeColor = (status) => {
    switch (status) {
      case 'Active': return 'blue';
      case 'Resolved': return 'green';
      case 'Unresolved': return 'orange';
      default: return 'gray';
    }
  };

  return (
    <Container maxW="container.xl" p={0}>
      <Box p={8} bg="gray.50" minH="100vh" borderRadius="lg">
        <Heading as="h2" size="xl" textAlign="center" mb={6}>
          🗃️ Admin: Manage Lost & Found Posts
        </Heading>

        {/* Filter Tabs */}
        <Tabs variant="soft-rounded" colorScheme="blue" mb={6}>
          <TabList>
            <Tab onClick={() => setFilter('all')}>All Posts</Tab>
            <Tab onClick={() => setFilter('active')}>Active Posts</Tab>
            <Tab onClick={() => setFilter('archived')}>Archived Posts</Tab>
          </TabList>
        </Tabs>

        <Box overflowX="auto" bg="white" borderRadius="lg" boxShadow="lg" mb={8}>
          <Box bg="blue.50" py={4} px={6}>
            <Heading size="md">Posts ({filteredPosts.length})</Heading>
          </Box>
          <Box p={0}>
            <Table variant="striped" size="md">
              <Thead bg="gray.100">
                <Tr>
                  <Th>Image</Th>
                  <Th>Title</Th>
                  <Th>Description</Th>
                  <Th>Status</Th>
                  <Th>Resolution</Th>
                  <Th>User Email</Th>
                  <Th>Posted On</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredPosts.length === 0 ? (
                  <Tr>
                    <Td colSpan={8} textAlign="center" py={4}>
                      No posts found
                    </Td>
                  </Tr>
                ) : (
                  filteredPosts.map((post) => (
                    <Tr key={post._id} opacity={post.isArchived ? 0.7 : 1}>
                      <Td>
                        <Image
                          src={`http://localhost:5000${post.image}`}
                          alt="Post"
                          boxSize="60px"
                          objectFit="cover"
                          borderRadius="md"
                          fallbackSrc="https://via.placeholder.com/60"
                        />
                      </Td>
                      <Td>
                        <Text fontWeight="medium">{post.title}</Text>
                        <Text fontSize="xs" color="gray.500">
                          {post.location}
                        </Text>
                      </Td>
                      <Td maxW="200px">
                        <Tooltip label={post.description} hasArrow>
                          <Text isTruncated>{post.description}</Text>
                        </Tooltip>
                      </Td>
                      <Td>
                        <Badge 
                          colorScheme={getStatusBadgeColor(post.status)} 
                          px={2} 
                          py={1} 
                          borderRadius="full"
                        >
                          {post.status === 'found' ? '🟢 Found' : '🔴 Lost'}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge 
                          colorScheme={getResolutionBadgeColor(post.resolutionStatus)} 
                          px={2} 
                          py={1} 
                          borderRadius="full"
                        >
                          {post.resolutionStatus || 'Active'}
                        </Badge>
                        {post.isArchived && (
                          <Badge ml={2} colorScheme="purple">Archived</Badge>
                        )}
                      </Td>
                      <Td>
                        <Tooltip label={post.user?.email}>
                          <Text isTruncated maxW="150px">
                            {post.user?.email || 'Unknown'}
                          </Text>
                        </Tooltip>
                      </Td>
                      <Td>
                        {new Date(post.createdAt).toLocaleString('en-GB', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </Td>
                      <Td>
                        <HStack spacing={1}>
                          <IconButton
                            colorScheme="teal"
                            icon={<SettingsIcon />}
                            size="sm"
                            onClick={() => openResolutionModal(post)}
                            aria-label="Manage Resolution"
                            title="Manage Resolution"
                          />
                          <IconButton
                            colorScheme="blue"
                            icon={<ChatIcon />}
                            size="sm"
                            onClick={() => fetchComments(post._id)}
                            aria-label="View Comments"
                            title="View Comments"
                          />
                          <IconButton
                            colorScheme="purple"
                            icon={<SearchIcon />}
                            size="sm"
                            onClick={() => handleRunMatching(post._id)}
                            aria-label="Run Matching"
                            title="Find Potential Matches"
                          />
                          <IconButton
                            colorScheme="red"
                            icon={<DeleteIcon />}
                            size="sm"
                            onClick={() => handleDeletePost(post._id)}
                            aria-label="Delete Post"
                            title="Delete Post"
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </Box>
        </Box>

        {/* Back to Dashboard Button */}
        <Flex justify="center" mt={8}>
          <Button
            leftIcon={<ArrowBackIcon />}
            colorScheme="blue"
            variant="solid"
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </Flex>

        {/* Resolution Management Modal */}
        <Modal isOpen={isResolutionOpen} onClose={onResolutionClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader bg="teal.50" borderTopRadius="md">
              <HStack>
                <SettingsIcon color="teal.500" />
                <Text>Manage Resolution Status</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              {selectedPost && (
                <VStack spacing={4} align="stretch">
                  <Box>
                    <HStack mb={2}>
                      <Badge colorScheme={getStatusBadgeColor(selectedPost.status)} px={2} py={1}>
                        {selectedPost.status === 'found' ? 'Found' : 'Lost'}
                      </Badge>
                      <Text fontWeight="bold">{selectedPost.title}</Text>
                    </HStack>
                    <Text fontSize="sm" color="gray.600">
                      {selectedPost.description}
                    </Text>
                    <Text fontSize="xs" mt={1} color="gray.500">
                      Posted by: {selectedPost.user?.email || 'Unknown'} at {selectedPost.location}
                    </Text>
                  </Box>
                  
                  <Divider />
                  
                  <FormControl>
                    <FormLabel>Resolution Status</FormLabel>
                    <Select 
                      value={resolutionStatus} 
                      onChange={(e) => setResolutionStatus(e.target.value)}
                    >
                      <option value="Active">Active</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Unresolved">Unresolved</option>
                    </Select>
                  </FormControl>
                  
                  {resolutionStatus === 'Resolved' && (
                    <>
                      <FormControl isRequired>
                        <FormLabel>Resolved By User</FormLabel>
                        <Select 
                          placeholder="Select user to award points" 
                          value={resolvedBy} 
                          onChange={(e) => setResolvedBy(e.target.value)}
                          isRequired
                        >
                          {users && users.length > 0 ? (
                            users.map(user => (
                              <option key={user._id} value={user._id}>
                                {user.email} ({user.username || 'No Username'})
                              </option>
                            ))
                          ) : (
                            <option value="" disabled>No users available</option>
                          )}
                        </Select>
                        <Text fontSize="xs" color="green.500" mt={1}>
                          <StarIcon mr={1} boxSize={3} />
                          Selected user will receive 10 points!
                        </Text>
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Resolution Date</FormLabel>
                        <Input 
                          type="date" 
                          value={resolvedDate} 
                          onChange={(e) => setResolvedDate(e.target.value)}
                          max={new Date().toISOString().split('T')[0]}
                        />
                      </FormControl>
                    </>
                  )}
                  
                  <FormControl>
                    <FormLabel>Resolution Note</FormLabel>
                    <Textarea 
                      value={resolutionNote} 
                      onChange={(e) => setResolutionNote(e.target.value)}
                      placeholder="Add optional notes about the resolution..."
                    />
                  </FormControl>
                  
                  <HStack justify="space-between" mt={2}>
                    <Text fontSize="sm">
                      <Switch 
                        isChecked={resolutionStatus === 'Resolved'} 
                        isReadOnly 
                        colorScheme="green" 
                        mr={2} 
                      />
                      Archive post automatically when resolved
                    </Text>
                  </HStack>
                </VStack>
              )}
            </ModalBody>
            <ModalFooter bg="gray.50" borderBottomRadius="md">
              <Button onClick={onResolutionClose} mr={3}>Cancel</Button>
              <Button 
                colorScheme="teal" 
                leftIcon={<CheckIcon />}
                onClick={handleUpdateResolution}
              >
                Update Resolution
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Comments Modal */}
        <Modal isOpen={isCommentsOpen} onClose={onCommentsClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader bg="blue.50" borderTopRadius="md">
              <HStack>
                <ChatIcon color="blue.500" />
                <Text>Comments for: {selectedPost?.title}</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              {/* Add admin comment */}
              <Box mb={4} p={4} borderWidth="1px" borderRadius="md" bg="gray.50">
                <FormControl>
                  <FormLabel>Add Admin Comment</FormLabel>
                  <Textarea 
                    value={adminComment}
                    onChange={(e) => setAdminComment(e.target.value)}
                    placeholder="Enter your comment as an admin..."
                  />
                </FormControl>
                <Button 
                  mt={3} 
                  colorScheme="blue" 
                  leftIcon={<AddIcon />} 
                  onClick={handleAddAdminComment}
                >
                  Post as Admin
                </Button>
              </Box>

              {/* Reply to comment form (visible only when replying) */}
              {replyToId && (
                <Box mb={4} p={4} borderWidth="1px" borderRadius="md" bg="blue.50">
                  <FormControl>
                    <FormLabel>Reply as Admin</FormLabel>
                    <Textarea 
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Enter your reply..."
                    />
                  </FormControl>
                  <Flex gap={2} mt={3}>
                    <Button 
                      colorScheme="blue" 
                      leftIcon={<AddIcon />} 
                      onClick={handleReply}
                    >
                      Post Reply
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setReplyToId(null);
                        setReplyText('');
                      }}
                    >
                      Cancel
                    </Button>
                  </Flex>
                </Box>
              )}

              <Divider my={4} />

              {/* Comments list */}
              <VStack spacing={4} align="stretch" mt={4}>
                {comments.length === 0 ? (
                  <Text textAlign="center" py={4} color="gray.500">No comments yet</Text>
                ) : (
                  comments.map((comment) => (
                    <Box 
                      key={comment._id} 
                      p={4} 
                      borderWidth="1px" 
                      borderRadius="md"
                      ml={comment.parentCommentId ? 8 : 0}
                      bg={comment.isRemoved ? "red.50" : comment.isAdmin ? "blue.50" : "white"} 
                      borderLeft={comment.isRemoved ? "4px solid red" : comment.isAdmin ? "4px solid blue" : "none"}
                    >
                      <Flex justify="space-between" mb={2}>
                        <HStack>
                          <Text fontWeight="bold">
                            {comment.isAdmin 
                              ? (comment.botName || 'Admin')
                              : (comment.userId?.username || comment.userId?.email || 'Unknown User')
                            }
                          </Text>
                          {comment.isAdmin && (
                            <Badge colorScheme="blue">Admin</Badge>
                          )}
                          {comment.isRemoved && (
                            <Badge colorScheme="red">Removed</Badge>
                          )}
                          {comment.parentCommentId && (
                            <Badge colorScheme="purple">Reply</Badge>
                          )}
                        </HStack>
                        <Text fontSize="sm" color="gray.500">
                          {new Date(comment.createdAt).toLocaleString()}
                        </Text>
                      </Flex>
                      
                      <Text 
                        my={2}
                        color={comment.isRemoved ? "red.500" : "inherit"}
                        fontStyle={comment.isRemoved ? "italic" : "normal"}
                      >
                        {comment.text}
                      </Text>
                      
                      <Flex justify="flex-end" gap={2} mt={2}>
                        {!comment.parentCommentId && !comment.isRemoved && (
                          <Button 
                            size="xs" 
                            leftIcon={<ChatIcon />} 
                            onClick={() => {
                              setReplyToId(comment._id);
                              setReplyText('');
                            }}
                          >
                            Reply
                          </Button>
                        )}
                        {!comment.isRemoved && (
                          <IconButton
                            colorScheme="red"
                            icon={<DeleteIcon />}
                            size="xs"
                            onClick={() => handleDeleteComment(comment._id)}
                            aria-label="Remove Comment"
                          />
                        )}
                      </Flex>
                    </Box>
                  ))
                )}
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
    </Container>
  );
};

export default PostManagement;