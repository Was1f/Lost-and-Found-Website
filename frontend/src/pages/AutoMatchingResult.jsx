import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Container,
  Heading, 
  Text, 
  VStack, 
  HStack, 
  Badge, 
  Spinner, 
  Divider, 
  Image, 
  Accordion, 
  AccordionItem, 
  AccordionButton, 
  AccordionPanel, 
  AccordionIcon, 
  Flex, 
  Button, 
  useToast, 
  Link as ChakraLink, 
  Textarea, 
  IconButton, 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalFooter, 
  ModalBody, 
  ModalCloseButton, 
  useDisclosure,
  Checkbox,
  FormControl,
  FormLabel
} from '@chakra-ui/react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import { ChatIcon, CheckIcon, ArrowBackIcon } from '@chakra-ui/icons';

const AutoMatchingResult = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runningMatch, setRunningMatch] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [commentText, setCommentText] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const toast = useToast();

  const runMatching = async () => {
    try {
      setRunningMatch(true);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }
      
      await axios.post('http://localhost:5000/api/matches/run', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      toast({
        title: "Matching completed",
        description: "Successfully ran the matching process",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      // Fetch the updated matches after running
      fetchMatches();
    } catch (error) {
      console.error('Error running matching:', error.response?.data || error.message);
      toast({
        title: "Error running matching",
        description: error.response?.data?.message || "Failed to run matching process",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setRunningMatch(false);
    }
  };

  const fetchMatches = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        console.log('No admin token found, redirecting to login');
        navigate('/admin/login');
        return;
      }
      console.log('Fetching matches with token:', token);
      const response = await axios.get('http://localhost:5000/api/matches', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Matches response:', response.data);
      setMatches(response.data);
    } catch (error) {
      console.error('Error fetching matches:', error.response?.data || error.message);
      setMatches([]);
      if (error.response?.status === 401) {
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [navigate]);

  // Group matches by lost post
  const grouped = {};
  matches.forEach(match => {
    if (!match.lostPost || !match.foundPost) {
      console.log('Invalid match data:', match);
      return;
    }
    const lostId = match.lostPost._id;
    if (!lostId) {
      console.log('No lost post ID:', match);
      return;
    }
    if (!grouped[lostId]) grouped[lostId] = { lost: match.lostPost, found: [] };
    grouped[lostId].found.push({ found: match.foundPost, similarity: match.similarity });
  });

  // Function to handle opening the comment modal
  const handleOpenCommentModal = (lostPost, foundPost, similarity) => {
    setSelectedMatch({ lostPost, foundPost, similarity });
    
    // Set default comment text with more item details
    const percentMatch = Math.round(similarity * 100);
    const defaultText = `🎯 MATCH NOTIFICATION (${percentMatch}% similarity): 

LOST ITEM: "${lostPost.title}" (${lostPost.location})
FOUND ITEM: "${foundPost.title}" (${foundPost.location})

These items appear to be related. Please contact each other to coordinate return of the item.`;
    
    setCommentText(defaultText);
    onOpen();
  };
  
  // Function to add comments to both posts
  const handleAddMatchComments = async () => {
    if (!commentText.trim() || !selectedMatch) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast({
          title: 'Authentication error',
          description: 'You need to be logged in as admin to add comments',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        navigate('/admin/login');
        return;
      }
      
      // Add comment to lost post
      const lostPostResponse = await axios.post(
        'http://localhost:5000/api/admin/comments',
        {
          postId: selectedMatch.lostPost._id,
          text: commentText
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Add comment to found post
      const foundPostResponse = await axios.post(
        'http://localhost:5000/api/admin/comments',
        {
          postId: selectedMatch.foundPost._id,
          text: commentText
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      toast({
        title: 'Comments added',
        description: 'Comments have been added to both matched posts',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onClose();
    } catch (error) {
      console.error('Error adding match comments:', error.response?.data || error.message);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to add comments',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return <Box textAlign="center" py={10}><Spinner size="xl" color="blue.500" /><Text mt={4}>Loading matches...</Text></Box>;
  }

  return (
    <Container maxW="container.lg" py={8}>
      <Box mb={6}>
        <Heading as="h1" size="xl" textAlign="center" mb={2}>
          🤖 Automatic Matching Results
        </Heading>
        <Text textAlign="center" color="gray.600">
          Our system automatically matches lost items with found items based on similarity.
        </Text>
      </Box>

      <Button leftIcon={<ArrowBackIcon />} mb={6} onClick={() => navigate('/dashboard')}>
        Back to Dashboard
      </Button>

      <Flex justify="space-between" align="center" mb={6}>
        <Heading as="h2" size="xl">Auto Matching Results</Heading>
        <Button
          colorScheme="blue"
          onClick={runMatching}
          isLoading={runningMatch}
          loadingText="Running Match..."
        >
          Run Matching
        </Button>
      </Flex>
      {Object.keys(grouped).length === 0 ? (
        <Text>No matches found. Click "Run Matching" to find potential matches.</Text>
      ) : (
        <Accordion allowMultiple defaultIndex={[0]}>
          {Object.values(grouped).map(({ lost, found }) => (
            <AccordionItem key={lost._id} borderWidth={1} borderRadius="md" mb={4}>
              <h2>
                <AccordionButton _expanded={{ bg: 'blue.50' }}>
                  <Flex align="center" flex="1">
                    <Image
                      src={`http://localhost:5000${lost.image}`}
                      alt={lost.title}
                      boxSize="60px"
                      objectFit="cover"
                      borderRadius="md"
                      mr={4}
                    />
                    <Box textAlign="left">
                      <Text as={RouterLink} to={`/post/${lost._id}`} fontWeight="bold" color="red.600" _hover={{ textDecoration: 'underline', color: 'red.800' }}>
                        Lost: {lost.title}
                      </Text>
                      <Text fontSize="sm" color="gray.500">{lost.location}</Text>
                    </Box>
                  </Flex>
                  <Badge colorScheme="blue" ml={4} fontSize="md">
                    {found.length} possible match{found.length !== 1 ? 'es' : ''}
                  </Badge>
                  <AccordionIcon ml={4} />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <Box mb={2}>
                  <Text mb={1}><b>Description:</b> {lost.description}</Text>
                  <Text fontSize="sm" color="gray.500">Posted: {new Date(lost.createdAt).toLocaleString()}</Text>
                </Box>
                <Divider my={2} />
                <Text fontWeight="bold" mb={2}>Possible Found Matches:</Text>
                {found.length === 0 ? (
                  <Text color="gray.400">No found posts matched.</Text>
                ) : (
                  <VStack align="stretch" spacing={4}>
                    {found.map(({ found, similarity }) => (
                      <Flex key={found._id} p={3} borderWidth={1} borderRadius="md" bg="gray.50" align="center" gap={6}>
                        <Image
                          src={`http://localhost:5000${found.image}`}
                          alt={found.title}
                          boxSize="60px"
                          objectFit="cover"
                          borderRadius="md"
                        />
                        <Box flex="1">
                          <Text as={RouterLink} to={`/post/${found._id}`} color="green.600" fontWeight="bold" _hover={{ textDecoration: 'underline', color: 'green.800' }}>
                            Found: {found.title}
                          </Text>
                          <Text fontSize="sm">{found.description}</Text>
                          <Text fontSize="sm" color="gray.500">Location: {found.location}</Text>
                          <Text fontSize="xs" color="gray.400">Posted: {new Date(found.createdAt).toLocaleString()}</Text>
                        </Box>
                        <VStack>
                          <Badge colorScheme="blue" fontSize="md">{Math.round(similarity * 100)}% match</Badge>
                          <Button
                            size="sm"
                            leftIcon={<ChatIcon />}
                            colorScheme="teal"
                            onClick={() => handleOpenCommentModal(lost, found, similarity)}
                          >
                            Add Comments
                          </Button>
                        </VStack>
                      </Flex>
                    ))}
                  </VStack>
                )}
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      )}
      
      {/* Comment Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader bg="blue.50">Add Comments to Matched Posts</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedMatch && (
              <>
                <HStack mb={4} spacing={3}>
                  <Image 
                    src={`http://localhost:5000${selectedMatch.lostPost.image}`}
                    alt="Lost item"
                    boxSize="70px"
                    objectFit="cover"
                    borderRadius="md"
                    border="2px solid red"
                  />
                  <Box flex={1}>
                    <Badge colorScheme="red" mb={1}>Lost Item</Badge>
                    <Text fontWeight="bold">{selectedMatch.lostPost.title}</Text>
                    <Text fontSize="sm" noOfLines={2}>{selectedMatch.lostPost.description}</Text>
                  </Box>
                </HStack>
                
                <HStack mb={4} spacing={3}>
                  <Image 
                    src={`http://localhost:5000${selectedMatch.foundPost.image}`}
                    alt="Found item"
                    boxSize="70px"
                    objectFit="cover"
                    borderRadius="md"
                    border="2px solid green"
                  />
                  <Box flex={1}>
                    <Badge colorScheme="green" mb={1}>Found Item</Badge>
                    <Text fontWeight="bold">{selectedMatch.foundPost.title}</Text>
                    <Text fontSize="sm" noOfLines={2}>{selectedMatch.foundPost.description}</Text>
                  </Box>
                </HStack>
                
                <Divider my={3} />
                
                <FormControl mb={4}>
                  <FormLabel>Comment for both posts</FormLabel>
                  <Textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Enter your comment..."
                    size="md"
                    rows={8}
                  />
                  <Text fontSize="sm" color="blue.600" mt={2}>
                    This comment will be posted on both posts. Include specific details to help users connect.
                  </Text>
                </FormControl>
                
                <Box bg="gray.50" p={3} borderRadius="md" fontSize="sm">
                  <Text fontWeight="bold" mb={2}>Tips for effective match comments:</Text>
                  <Text>• Include specific item details that confirm the match</Text>
                  <Text>• If you've verified these items match, clearly state this</Text>
                  <Text>• Provide instructions for users to claim/return the item</Text>
                  <Text>• Add next steps like "Please reply to this comment"</Text>
                </Box>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onClose}>Cancel</Button>
            <Button
              colorScheme="blue"
              onClick={handleAddMatchComments}
              leftIcon={<CheckIcon />}
            >
              Post Comments
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      <Button
        colorScheme="blue"
        leftIcon={<ArrowBackIcon />}
        mt={6}
        onClick={() => navigate('/dashboard')}
      >
        Back to Dashboard
      </Button>
    </Container>
  );
};

export default AutoMatchingResult; 