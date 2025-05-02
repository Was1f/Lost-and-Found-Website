import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  Flex,
  Tabs,
  TabList,
  Tab,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Icon,
  Badge,
  useToast
} from '@chakra-ui/react';
import { FaSearch, FaMapMarkerAlt } from 'react-icons/fa';
import { MdLocationOn } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    // Fetch all recent posts
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/posts/recent');
        console.log('Recent posts:', response.data);
        setPosts(response.data);
        setFilteredPosts(response.data);
      } catch (error) {
        console.error('Failed to fetch posts', error);
        toast({
          title: "Error",
          description: "Failed to load recent posts",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchPosts();
  }, [toast]);

  // Filter posts based on tab selection
  const handleTabChange = (tabValue) => {
    setActiveTab(tabValue);
    
    if (tabValue === 'all') {
      setFilteredPosts(posts);
    } else if (tabValue === 'lost') {
      setFilteredPosts(posts.filter(post => post.status === 'lost'));
    } else if (tabValue === 'found') {
      setFilteredPosts(posts.filter(post => post.status === 'found'));
    } else {
      // For "other" or any other tab
      setFilteredPosts(posts);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get status icon based on post type
  const getStatusIcon = (status) => {
    return status === 'lost' 
      ? <Icon as={FaSearch} color="red.500" /> 
      : <Icon as={MdLocationOn} color="green.500" />;
  };

  return (
    <Box p={5} maxW="1200px" mx="auto">
      {/* Header */}
      <Box mb={10}>
        <Heading as="h1" size="2xl" mb={2}>Dashboard</Heading>
        <Text fontSize="lg" color="gray.600">View and manage your lost and found posts</Text>
        
        {/* Action Buttons */}
        <Flex justify="flex-end" mt={5}>
          <Button 
            onClick={() => navigate('/profile')} 
            variant="outline" 
            mr={4}
          >
            View Profile
          </Button>
          <Button 
            onClick={() => navigate('/create')} 
            colorScheme="blue"
          >
            Create New Post
          </Button>
        </Flex>
      </Box>

      {/* Recent Posts Section */}
      <Box 
        p={6} 
        borderWidth="1px" 
        borderRadius="lg" 
        bg="white" 
        boxShadow="sm"
        mb={8}
      >
        <Flex align="center" mb={6}>
          <Icon as={FaSearch} boxSize={6} mr={3} />
          <Heading as="h2" size="lg">Recent Posts</Heading>
        </Flex>
        <Text color="gray.600" mb={6}>Browse through recently published lost and found items</Text>
        
        {/* Tabs */}
        <Tabs variant="soft-rounded" colorScheme="blue" mb={6}>
          <TabList>
            <Tab 
              bg={activeTab === 'all' ? 'blue.50' : 'gray.100'} 
              onClick={() => handleTabChange('all')}
            >
              All Posts
            </Tab>
            <Tab 
              bg={activeTab === 'lost' ? 'blue.50' : 'gray.100'} 
              onClick={() => handleTabChange('lost')}
            >
              Lost Items
            </Tab>
            <Tab 
              bg={activeTab === 'found' ? 'blue.50' : 'gray.100'} 
              onClick={() => handleTabChange('found')}
            >
              Found Items
            </Tab>
            <Tab 
              bg={activeTab === 'other' ? 'blue.50' : 'gray.100'} 
              onClick={() => handleTabChange('other')}
            >
              Other
            </Tab>
          </TabList>
        </Tabs>
        
        {/* Posts Table */}
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Type</Th>
              <Th>Title</Th>
              <Th>Location</Th>
              <Th>Date</Th>
              <Th>Status</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <Tr key={post._id}>
                  <Td>
                    {getStatusIcon(post.status)}
                  </Td>
                  <Td fontWeight="medium">
                    {post.title}
                  </Td>
                  <Td>{post.location}</Td>
                  <Td>{formatDate(post.createdAt)}</Td>
                  <Td>
                    <Badge 
                      colorScheme="green" 
                      borderRadius="full" 
                      px={3} 
                      py={1}
                    >
                      Open
                    </Badge>
                  </Td>
                  <Td>
                    <Button
                      size="sm"
                      onClick={() => navigate(`/post/${post._id}`)}
                    >
                      View
                    </Button>
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={6} textAlign="center" py={4}>
                  No posts found. Create a new post to get started.
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default Dashboard;