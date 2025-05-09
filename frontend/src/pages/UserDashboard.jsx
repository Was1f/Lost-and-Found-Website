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
  useToast,
  Tooltip
} from '@chakra-ui/react';
import { FaSearch, FaMapMarkerAlt, FaArchive, FaCheck, FaTimes } from 'react-icons/fa';
import { MdLocationOn } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ArchiveDashboard = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    // Fetch archived posts
    const fetchArchivedPosts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/posts/archived');
        console.log('Archived posts:', response.data);
        setPosts(response.data);
        setFilteredPosts(response.data);
      } catch (error) {
        console.error('Failed to fetch archived posts', error);
        toast({
          title: "Error",
          description: "Failed to load archived posts",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchArchivedPosts();
  }, [toast]);

  // Filter posts based on tab selection
  const handleTabChange = (tabValue) => {
    setActiveTab(tabValue);
    
    if (tabValue === 'all') {
      setFilteredPosts(posts);
    } else if (tabValue === 'resolved') {
      setFilteredPosts(posts.filter(post => post.resolutionStatus === 'Resolved'));
    } else if (tabValue === 'unresolved') {
      setFilteredPosts(posts.filter(post => post.resolutionStatus === 'Unresolved'));
    } else if (tabValue === 'lost') {
      setFilteredPosts(posts.filter(post => post.status === 'lost'));
    } else if (tabValue === 'found') {
      setFilteredPosts(posts.filter(post => post.status === 'found'));
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

  // Get resolution badge based on resolution status
  const getResolutionBadge = (resolutionStatus) => {
    if (resolutionStatus === 'Resolved') {
      return (
        <Badge 
          colorScheme="green" 
          borderRadius="full" 
          px={3} 
          py={1}
          display="flex"
          alignItems="center"
        >
          <Icon as={FaCheck} mr={1} boxSize={3} />
          Resolved
        </Badge>
      );
    } else if (resolutionStatus === 'Unresolved') {
      return (
        <Badge 
          colorScheme="red" 
          borderRadius="full" 
          px={3} 
          py={1}
          display="flex"
          alignItems="center"
        >
          <Icon as={FaTimes} mr={1} boxSize={3} />
          Unresolved
        </Badge>
      );
    } else {
      return (
        <Badge 
          colorScheme="blue" 
          borderRadius="full" 
          px={3} 
          py={1}
        >
          Active
        </Badge>
      );
    }
  };

  // Get time since creation
  const getTimeSinceCreation = (createdAt) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  return (
    <Box p={5} maxW="1200px" mx="auto">
      {/* Header */}
      <Box mb={10}>
        <Flex align="center">
          <Icon as={FaArchive} mr={3} boxSize={8} color="blue.500" />
          <Heading as="h1" size="2xl" mb={2}>Archives</Heading>
        </Flex>
        <Text fontSize="lg" color="gray.600">View items that have been resolved or remained unresolved for over 15 days</Text>
        
        {/* Action Buttons */}
        <Flex justify="flex-end" mt={5}>
          <Button 
            onClick={() => navigate('/profile')} 
            variant="outline"
            colorScheme="blue"
          >
            My Profile
          </Button>
        </Flex>
      </Box>

      {/* Archives Section */}
      <Box 
        p={6} 
        borderWidth="1px" 
        borderRadius="lg" 
        bg="white" 
        boxShadow="sm"
        mb={8}
      >
        <Flex align="center" mb={6}>
          <Icon as={FaArchive} boxSize={6} mr={3} color="blue.500" />
          <Heading as="h2" size="lg">Archived Posts</Heading>
        </Flex>
        <Text color="gray.600" mb={6}>Browse through items that have been resolved or remained unresolved for an extended period</Text>
        
        {/* Tabs */}
        <Tabs variant="soft-rounded" colorScheme="blue" mb={6}>
          <TabList>
            <Tab 
              bg={activeTab === 'all' ? 'blue.50' : 'gray.100'} 
              onClick={() => handleTabChange('all')}
            >
              All Archives
            </Tab>
            <Tab 
              bg={activeTab === 'resolved' ? 'blue.50' : 'gray.100'} 
              onClick={() => handleTabChange('resolved')}
            >
              Resolved
            </Tab>
            <Tab 
              bg={activeTab === 'unresolved' ? 'blue.50' : 'gray.100'} 
              onClick={() => handleTabChange('unresolved')}
            >
              Unresolved
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
              <Th>Age (Days)</Th>
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
                    {post.resolutionNote && (
                      <Tooltip label={post.resolutionNote} aria-label="Resolution note">
                        <Icon as={FaCheck} ml={2} color="green.500" />
                      </Tooltip>
                    )}
                  </Td>
                  <Td>{post.location}</Td>
                  <Td>{formatDate(post.createdAt)}</Td>
                  <Td isNumeric>{getTimeSinceCreation(post.createdAt)}</Td>
                  <Td>
                    {getResolutionBadge(post.resolutionStatus)}
                  </Td>
                  <Td>
                    <Button
                      size="sm"
                      onClick={() => navigate(`/post/${post._id}`)}
                      colorScheme="blue"
                      variant="outline"
                    >
                      View
                    </Button>
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={7} textAlign="center" py={4}>
                  No archived posts found.
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default ArchiveDashboard;