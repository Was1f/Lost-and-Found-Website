import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  Avatar,
  Badge,
  Spinner,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Icon,
  VStack,
  HStack,
  Divider
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FaAward, FaMedal, FaTrophy, FaCheckCircle, FaIdCard } from 'react-icons/fa';
import axios from 'axios';

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    // Fetch users with points
    const fetchLeaderboard = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('http://localhost:5000/api/leaderboard', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Sort users by points in descending order
        const sortedUsers = response.data.sort((a, b) => b.points - a.points);
        setUsers(sortedUsers);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Failed to load leaderboard data');
        toast({
          title: 'Error',
          description: 'Failed to load leaderboard data',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [toast]);

  const handleUserClick = (userId) => {
    navigate(`/user-profile/${userId}`);
  };

  // Render medal for top 3 positions
  const getMedal = (position) => {
    switch (position) {
      case 0:
        return <Icon as={FaTrophy} color="gold" boxSize={6} />;
      case 1:
        return <Icon as={FaMedal} color="silver" boxSize={6} />;
      case 2:
        return <Icon as={FaMedal} color="#CD7F32" boxSize={6} />; // Bronze
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" height="500px">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" p={5}>
        <Heading size="md" color="red.500">{error}</Heading>
      </Box>
    );
  }

  // Filter users with points greater than 0
  const usersWithPoints = users.filter(user => user.points > 0);

  return (
    <Box maxW="1000px" mx="auto" p={5}>
      <Heading as="h1" size="xl" textAlign="center" mb={6}>Leaderboard</Heading>
      <Text textAlign="center" mb={10} color="gray.600">
        Top contributors who helped return lost items
      </Text>

      {usersWithPoints.length === 0 ? (
        <Box textAlign="center" p={10} bg="gray.50" borderRadius="md">
          <Text fontSize="lg">No users with points yet. Be the first to help!</Text>
        </Box>
      ) : (
        <>
          {/* Top 3 Users */}
          {usersWithPoints.length > 0 && (
            <Flex 
              direction={{ base: 'column', md: 'row' }} 
              justify="center" 
              align="center" 
              gap={{ base: 4, md: 6 }} 
              mb={10}
            >
              {/* Display top 3 users if available */}
              {usersWithPoints.slice(0, 3).map((user, index) => (
                <VStack 
                  key={user._id}
                  bg="white"
                  boxShadow="md"
                  borderRadius="lg"
                  p={5}
                  spacing={4}
                  align="center"
                  w={{ base: "full", md: `${index === 0 ? "280px" : "250px"}` }}
                  h={{ base: "auto", md: `${index === 0 ? "350px" : "320px"}` }}
                  cursor="pointer"
                  onClick={() => handleUserClick(user._id)}
                  position="relative"
                  transform={index === 0 ? "scale(1.05)" : "scale(1)"}
                  zIndex={index === 0 ? 2 : 1}
                  border={index === 0 ? "2px solid gold" : index === 1 ? "2px solid silver" : index === 2 ? "2px solid #CD7F32" : "none"}
                >
                  {/* Trophy/Medal */}
                  <Box position="absolute" top="-15px" bg={index === 0 ? "gold" : index === 1 ? "silver" : "#CD7F32"} p={2} borderRadius="full">
                    {getMedal(index)}
                  </Box>
                  
                  <Avatar 
                    size={index === 0 ? "xl" : "lg"}
                    src={user.profilePic ? `http://localhost:5000/${user.profilePic}` : null}
                    name={user.username}
                    border={`3px solid ${index === 0 ? "gold" : index === 1 ? "silver" : "#CD7F32"}`}
                  />
                  
                  <VStack spacing={1}>
                    <Text fontWeight="bold" fontSize={index === 0 ? "xl" : "lg"}>{user.username}</Text>
                    
                    <HStack>
                      <Icon as={FaIdCard} color="blue.500" />
                      <Text fontSize="sm">{user.studentId || "Student"}</Text>
                      {user.isVerified && (
                        <Icon as={FaCheckCircle} color="green.500" />
                      )}
                    </HStack>
                  </VStack>
                  
                  <Badge 
                    colorScheme={index === 0 ? "yellow" : index === 1 ? "gray" : "orange"} 
                    fontSize="xl" 
                    px={4} 
                    py={2} 
                    borderRadius="full"
                  >
                    {user.points} points
                  </Badge>
                  
                  <Text fontSize="sm" color="gray.500" noOfLines={2} textAlign="center">
                    {user.bio || "Helping return lost items!"}
                  </Text>
                </VStack>
              ))}
            </Flex>
          )}

          <Divider my={6} />
          
          {/* Other Users Table */}
          {usersWithPoints.length > 3 && (
            <Box overflowX="auto">
              <Heading as="h3" size="md" mb={4}>Other Top Contributors</Heading>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Rank</Th>
                    <Th>User</Th>
                    <Th>Student ID</Th>
                    <Th isNumeric>Points</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {usersWithPoints.slice(3).map((user, index) => (
                    <Tr 
                      key={user._id} 
                      _hover={{ bg: "gray.50" }}
                      cursor="pointer"
                      onClick={() => handleUserClick(user._id)}
                    >
                      <Td>{index + 4}</Td>
                      <Td>
                        <Flex align="center">
                          <Avatar size="sm" name={user.username} src={user.profilePic ? `http://localhost:5000/${user.profilePic}` : null} mr={2} />
                          <Text fontWeight="medium">{user.username}</Text>
                          {user.isVerified && (
                            <Icon as={FaCheckCircle} color="green.500" ml={1} />
                          )}
                        </Flex>
                      </Td>
                      <Td>{user.studentId || "Not provided"}</Td>
                      <Td isNumeric>
                        <Badge colorScheme="blue">{user.points}</Badge>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default Leaderboard;