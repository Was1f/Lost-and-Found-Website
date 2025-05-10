import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  Spinner,
  Image,
  Badge,
  HStack,
  Button,
  useToast,
  Flex,
  Icon,
  SimpleGrid,
  Container,
  useColorModeValue,
  Divider,
  Tag,
  TagLabel,
  Tooltip,
  ScaleFade
} from '@chakra-ui/react';
import { FaBookmark, FaMapMarkerAlt, FaCalendarAlt, FaInfoCircle } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// Import the CSS file
import './BookmarksPage.css';

const BookmarksPage = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 
  const navigate = useNavigate();
  const toast = useToast();
  const token = localStorage.getItem('authToken');

  // Color mode values
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headerColor = useColorModeValue('blue.600', 'blue.400');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const accentColor = useColorModeValue('blue.500', 'blue.300');

  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options); // Formats the date
  };

  useEffect(() => {
    // Fetch user's bookmarked posts
    const fetchBookmarks = async () => {
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/bookmarks', {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Check if response has data property (wrapper)
        const bookmarksData = response.data.data || response.data;
        setBookmarks(bookmarksData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching bookmarks:', error);
        setError(error.response?.data?.message || 'Failed to load bookmarks');
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'Failed to load bookmarks',
          status: 'error',
          duration: 5000,
          isClosable: true
        });
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [token, navigate, toast]);

  const handleRemoveBookmark = async (postId) => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/bookmarks/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Check if response has data property (wrapper)
      const responseData = response.data.data || response.data;

      // Remove from local state
      setBookmarks(bookmarks.filter(bookmark => bookmark._id !== postId));

      toast({
        title: 'Bookmark removed',
        description: responseData.message || 'Bookmark removed successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
        variant: 'subtle',
        icon: <Icon as={FaBookmark} />
      });
    } catch (error) {
      console.error('Error removing bookmark:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to remove bookmark',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };

  return (
    <Container maxW="1400px" px={{ base: 4, md: 8 }} py={12}>
      {/* Stylish Header with gradient background */}
      <Box 
        mb={10} 
        pb={6} 
        borderBottom="1px" 
        borderColor={borderColor}
      >
        <Flex align="center" mb={3}>
          <Box 
            p={2} 
            borderRadius="full" 
            bg={`${accentColor}`} 
            color="white" 
            mr={4}
          >
            <Icon as={FaBookmark} boxSize={5} />
          </Box>
          <Heading 
            size="xl" 
            bgGradient="linear(to-r, blue.400, purple.500)" 
            bgClip="text"
            letterSpacing="tight"
          >
            My Bookmarks
          </Heading>
        </Flex>
        <Text color={textColor} fontWeight="medium" ml={12}>
          Keep track of your saved items in one convenient place
        </Text>
      </Box>
      
      {loading ? (
        <Flex direction="column" justify="center" align="center" py={20}>
          <Spinner 
            size="xl" 
            thickness="4px" 
            speed="0.65s" 
            emptyColor="gray.200" 
            color={accentColor}
            mb={4}
          />
          <Text color={textColor} fontWeight="medium">Loading your bookmarks...</Text>
        </Flex>
      ) : bookmarks.length > 0 ? (
        <SimpleGrid 
          columns={{ base: 1, md: 2, lg: 3 }} 
          spacing={8}
          autoRows="1fr"
        >
          {bookmarks.map((post, index) => (
            <ScaleFade initialScale={0.9} in={true} delay={index * 0.05}>
              <Box 
                key={post._id} 
                p={0} 
                shadow="lg" 
                borderRadius="xl" 
                overflow="hidden"
                bg={cardBg}
                borderWidth="1px"
                borderColor={borderColor}
                height="100%"
                transition="all 0.3s"
                _hover={{ 
                  transform: "translateY(-8px)", 
                  shadow: "2xl",
                  borderColor: accentColor 
                }}
                className="bookmark-card"
              >
                {/* Image Section */}
                <Box position="relative">
                  <Image 
                    src={`http://localhost:5000${post.image}`}
                    alt={post.title}
                    height="220px"
                    width="100%"
                    objectFit="cover"
                  />
                  
                  {/* Overlay with status badge */}
                  <Box 
                    position="absolute" 
                    top={0} 
                    right={0}
                    p={2}
                  >
                    <Tag
                      size="lg"
                      borderRadius="full"
                      variant="solid"
                      colorScheme={post.status === 'lost' ? 'red' : 'green'}
                      boxShadow="md"
                    >
                      <TagLabel fontWeight="bold">{post.status.toUpperCase()}</TagLabel>
                    </Tag>
                  </Box>
                  
                  {/* Bookmark icon overlay */}
                  <Box 
                    position="absolute" 
                    top={0} 
                    left={0} 
                    bg="rgba(0,0,0,0.5)" 
                    color="white" 
                    p={2}
                    borderBottomRightRadius="md"
                  >
                    <Tooltip label="Bookmarked item">
                      <span>
                        <Icon as={FaBookmark} boxSize={5} />
                      </span>
                    </Tooltip>
                  </Box>
                  
                  {/* Archived badge if applicable */}
                  {post.isArchived && (
                    <Box 
                      position="absolute" 
                      bottom={0} 
                      right={0} 
                      bg="purple.500" 
                      color="white" 
                      py={1}
                      px={3}
                      borderTopLeftRadius="md"
                    >
                      <Text fontSize="xs" fontWeight="bold">ARCHIVED</Text>
                    </Box>
                  )}
                </Box>
                
                {/* Content Section */}
                <VStack align="stretch" p={5} spacing={3} height="calc(100% - 220px)">
                  <Heading 
                    size="md" 
                    noOfLines={1} 
                    color={headerColor}
                    fontWeight="600"
                  >
                    {post.title}
                  </Heading>
                  
                  <HStack fontSize="sm" color={textColor}>
                    <Icon as={FaMapMarkerAlt} color={accentColor} />
                    <Text>{post.location}</Text>
                  </HStack>
                  
                  <HStack fontSize="sm" color={textColor}>
                    <Icon as={FaCalendarAlt} color={accentColor} />
                    <Text>{formatDate(post.createdAt)}</Text>
                  </HStack>
                  
                  <Divider my={2} />
                  
                  <Text 
                    noOfLines={2} 
                    fontSize="sm" 
                    color={textColor}
                    flex="1"
                  >
                    {post.description}
                  </Text>
                  
                  {/* Action Buttons */}
                  <HStack mt="auto" spacing={4} pt={3}>
                    <Button 
                      flex={1}
                      size="sm" 
                      colorScheme="blue"
                      borderRadius="full"
                      boxShadow="sm"
                      leftIcon={<FaInfoCircle />}
                      onClick={() => navigate(`/post/${post._id}`)}
                      _hover={{
                        transform: "translateY(-2px)",
                        boxShadow: "md"
                      }}
                    >
                      View Details
                    </Button>
                    <Button 
                      flex={1}
                      size="sm" 
                      colorScheme="red" 
                      variant="outline"
                      borderRadius="full"
                      onClick={() => handleRemoveBookmark(post._id)}
                      _hover={{
                        bg: "red.50",
                        borderColor: "red.500"
                      }}
                    >
                      Remove
                    </Button>
                  </HStack>
                </VStack>
              </Box>
            </ScaleFade>
          ))}
        </SimpleGrid>
      ) : (
        <Box 
          textAlign="center" 
          py={16} 
          px={8} 
          borderWidth="1px" 
          borderRadius="xl" 
          borderStyle="dashed"
          borderColor={borderColor}
          bg={cardBg}
          className="empty-state"
        >
          <Box 
            mb={6} 
            p={4} 
            borderRadius="full" 
            bg="gray.100" 
            width="80px"
            height="80px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            margin="0 auto"
          >
            <Icon as={FaBookmark} boxSize={8} color="gray.400" />
          </Box>
          <Heading size="lg" mb={4} color={headerColor}>No bookmarked posts yet</Heading>
          <Text color={textColor} fontSize="lg" maxW="600px" mx="auto" mb={8}>
            When you bookmark posts, they will appear here for easy access and tracking.
          </Text>
          <Button 
            size="lg"
            colorScheme="blue"
            borderRadius="full"
            px={8}
            shadow="md"
            onClick={() => navigate('/recent')} 
            _hover={{
              transform: "translateY(-2px)",
              shadow: "lg"
            }}
          >
            Browse Posts
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default BookmarksPage;