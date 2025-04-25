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
} from '@chakra-ui/react';
import { DeleteIcon, ArrowBackIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';

const PostManagement = () => {
  const [posts, setPosts] = useState([]);
  const toast = useToast();
  const navigate = useNavigate(); // 👈 For navigating back

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
      const response = await fetch(`http://localhost:5000/api/admin/post/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

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
                  <Flex justify="center">
                    <IconButton
                      colorScheme="red"
                      icon={<DeleteIcon />}
                      size="sm"
                      onClick={() => handleDeletePost(post._id)}
                      aria-label="Delete Post"
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
          onClick={() => navigate('./dashboard')} // 👈 Update this to your dashboard route
        >
          Back to Dashboard
        </Button>
      </Flex>
    </Box>
  );
};

export default PostManagement;
