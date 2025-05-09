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
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Textarea,
  VStack,
  HStack,
  Divider,
  Badge,
} from '@chakra-ui/react';
import { 
  DeleteIcon, 
  ArrowBackIcon, 
  ChatIcon, 
  AddIcon 
} from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';

const PostManagement = () => {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [adminComment, setAdminComment] = useState('');
  const [replyToId, setReplyToId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const navigate = useNavigate();

  // Fetch posts on mount
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/admin/posts', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch posts');

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

    fetchPosts();
  }, [toast]);

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
      
      onOpen();
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

  return (
    <Box p={8} bg="gray.50" minH="100vh">
      <Heading as="h2" size="xl" textAlign="center" mb={10}>
        🗃️ Admin: Manage Lost & Found Posts
      </Heading>

      <Box overflowX="auto" bg="white" p={6} borderRadius="lg" boxShadow="lg">
        <Table variant="striped" size="md">
          <Thead bg="gray.100">
            <Tr>
              <Th>Image</Th>
              <Th>Title</Th>
              <Th>Description</Th>
              <Th>Status</Th>
              <Th>User Email</Th>
              <Th>Posted On</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {posts.map((post) => (
              <Tr key={post._id}>
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
                </Td>
                <Td maxW="300px">
                  <Tooltip label={post.description} hasArrow>
                    <Text isTruncated>{post.description}</Text>
                  </Tooltip>
                </Td>
                <Td>
                  <Text fontWeight="bold" color={post.status === 'found' ? 'green.500' : 'red.500'}>
                    {post.status === 'found' ? '🟢 Found' : '🔴 Lost'}
                  </Text>
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
                  <Flex gap={2}>
                    <IconButton
                      colorScheme="red"
                      icon={<DeleteIcon />}
                      size="sm"
                      onClick={() => handleDeletePost(post._id)}
                      aria-label="Delete Post"
                    />
                    <IconButton
                      colorScheme="blue"
                      icon={<ChatIcon />}
                      size="sm"
                      onClick={() => fetchComments(post._id)}
                      aria-label="View Comments"
                    />
                  </Flex>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
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

      {/* Comments Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedPost && (
              <Text>Comments for: {selectedPost.title}</Text>
            )}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {/* Add admin comment */}
            <Box mb={4} p={4} borderWidth="1px" borderRadius="md">
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
              <Box mb={4} p={4} borderWidth="1px" borderRadius="md" bg="gray.50">
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
                <Text>No comments yet</Text>
              ) : (
                comments.map((comment) => (
                  <Box 
                    key={comment._id} 
                    p={4} 
                    borderWidth="1px" 
                    borderRadius="md"
                    ml={comment.parentCommentId ? 8 : 0}
                    bg={comment.isRemoved ? "red.50" : comment.isAdmin ? "blue.50" : "white"} 
                    borderLeft={comment.isRemoved ? "4px solid red" : "none"}
                  >
                    <Flex justify="space-between" mb={2}>
                      <HStack>
                        <Text fontWeight="bold">
                          {comment.isAdmin 
                            ? 'Admin'
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
                          aria-label="Delete Comment"
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
  );
};

export default PostManagement;