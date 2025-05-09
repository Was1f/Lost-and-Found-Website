import React, { useEffect, useState } from 'react';
import { Box, Heading, Text, VStack, HStack, Badge, Spinner, Divider, Image, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Flex, Button, useToast } from '@chakra-ui/react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';

const AutoMatchingResult = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runningMatch, setRunningMatch] = useState(false);
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

  if (loading) {
    return <Box textAlign="center" py={10}><Spinner size="xl" color="blue.500" /><Text mt={4}>Loading matches...</Text></Box>;
  }

  return (
    <Box maxW="6xl" mx="auto" mt={10} p={6} bg="white" boxShadow="md" rounded="md">
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
                        <Badge colorScheme="blue" fontSize="md">{Math.round(similarity * 100)}% match</Badge>
                      </Flex>
                    ))}
                  </VStack>
                )}
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </Box>
  );
};

export default AutoMatchingResult; 