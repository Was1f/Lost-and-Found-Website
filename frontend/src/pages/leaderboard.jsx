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
  Divider,
  Tooltip,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { 
  FaShieldAlt, FaAward, FaMedal, FaTrophy, FaCheckCircle, FaIdCard, FaInfoCircle, 
  FaCrown, FaStar, FaHandHoldingHeart, FaHandsHelping, FaThumbsUp, FaGem, FaQuestion
} from 'react-icons/fa';
import axios from 'axios';

// Badge system definitions - integrated directly into the component
const BADGE_TIERS = [
  { 
    id: 'helper', 
    name: 'Helper', 
    icon: FaHandsHelping, 
    color: '#48BB78', // green.400
    threshold: 20, 
    description: 'Awarded for earning 20+ points by helping return items' 
  },
  { 
    id: 'finder', 
    name: 'Finder', 
    icon: FaShieldAlt, 
    color: '#ED8936', // orange.400
    threshold: 50, 
    description: 'Awarded for earning 50+ points as a dedicated helper' 
  },
  { 
    id: 'champion', 
    name: 'Champion', 
    icon: FaMedal, 
    color: '#F6AD55', // orange.300
    threshold: 100, 
    description: 'Awarded for earning 100+ points as an outstanding member' 
  },
  { 
    id: 'elite', 
    name: 'Elite', 
    icon: FaAward, 
    color: '#FC8181', // red.300
    threshold: 150, 
    description: 'Awarded for earning 150+ points as a premier helper' 
  },
  { 
    id: 'legend', 
    name: 'Legend', 
    icon: FaCrown, 
    color: '#F6E05E', // yellow.300
    threshold: 250, 
    description: 'Awarded for earning 250+ points as a legendary contributor' 
  },
  { 
    id: 'ultimate', 
    name: 'Ultimate', 
    icon: FaGem, 
    color: '#B794F4', // purple.300
    threshold: 500, 
    description: 'Awarded for earning 500+ points - the highest honor!' 
  }
];

// Helper function to get badges earned by a user based on points
const getUserBadges = (points) => {
  if (points === undefined || points <= 0) return [];
  return BADGE_TIERS.filter(badge => points >= badge.threshold);
};

// Get the highest badge a user has earned
const getHighestBadge = (points) => {
  if (points === undefined || points <= 0) return null;
  const earnedBadges = getUserBadges(points);
  return earnedBadges.length ? earnedBadges[earnedBadges.length - 1] : null;
};

// Component for displaying user's badge
const UserBadgeIcon = ({ user, ...props }) => {
  const highestBadge = getHighestBadge(user.points);
  
  if (!highestBadge) return null;

  
};

// Component for badge info tooltip
const BadgeInfo = () => (
  <Popover placement="bottom">
    <PopoverTrigger>
      <Box display="inline-block" cursor="pointer" ml={2}>
        <Icon as={FaInfoCircle} color="blue.400" />
      </Box>
    </PopoverTrigger>
    <PopoverContent>
      <PopoverArrow />
      <PopoverCloseButton />
      <PopoverHeader fontWeight="bold">Badge Point Thresholds</PopoverHeader>
      <PopoverBody>
        <VStack align="start" spacing={2}>
          {BADGE_TIERS.map(badge => (
            <HStack key={badge.id} spacing={2}>
              <Icon as={badge.icon} color={badge.color} />
              <Text fontWeight="medium">{badge.name}:</Text>
              <Text>{badge.threshold}+ points</Text>
            </HStack>
          ))}
        </VStack>
      </PopoverBody>
    </PopoverContent>
  </Popover>
);

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [userProfiles, setUserProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    // Fetch users with points
    const fetchLeaderboardAndProfiles = async () => {
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
        // Fetch full profiles in parallel with auth header
        const profilePromises = sortedUsers.map(user =>
          axios.get(`http://localhost:5000/api/userprofile/${user._id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          })
            .then(res => res.data)
            .catch(() => user) // fallback to leaderboard user if error
        );
        const profiles = await Promise.all(profilePromises);
        setUserProfiles(profiles);
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

    fetchLeaderboardAndProfiles();
  }, [toast]);

  const handleUserClick = (userId) => {
    navigate(`/visituserprofile/${userId}`);
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
  const usersWithPoints = userProfiles.filter(user => user.points > 0);

  return (
    <Box maxW="1200px" mx="auto" p={5} bg="gray.50" minH="100vh">
      <Heading 
        as="h1" 
        size="xl" 
        textAlign="center" 
        mb={2}
        bgGradient="linear(to-r, blue.400, purple.500)"
        bgClip="text"
        fontWeight="extrabold"
      >
        Leaderboard
      </Heading>
      
      <HStack justify="center" mb={8}>
        <Text textAlign="center" color="gray.600" fontSize="lg">
          Top contributors who helped return lost items
        </Text>
        <BadgeInfo />
      </HStack>

      {usersWithPoints.length === 0 ? (
        <Box 
          textAlign="center" 
          p={10} 
          bg="white" 
          borderRadius="xl" 
          boxShadow="lg"
          border="1px solid"
          borderColor="gray.200"
        >
          <Text fontSize="lg" color="gray.600">No users with points yet. Be the first to help!</Text>
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
                  boxShadow="2xl"
                  borderRadius="2xl"
                  p={6}
                  spacing={4}
                  align="center"
                  w={{ base: "full", md: `${index === 0 ? "300px" : "270px"}` }}
                  h={{ base: "auto", md: `${index === 0 ? "400px" : "370px"}` }}
                  cursor="pointer"
                  onClick={() => handleUserClick(user._id)}
                  position="relative"
                  transform={index === 0 ? "scale(1.05)" : "scale(1)"}
                  zIndex={index === 0 ? 2 : 1}
                  border={index === 0 ? "3px solid gold" : index === 1 ? "3px solid silver" : index === 2 ? "3px solid #CD7F32" : "none"}
                  _hover={{
                    transform: "translateY(-5px)",
                    transition: "all 0.3s ease"
                  }}
                >
                  {/* Trophy/Medal */}
                  <Box 
                    position="absolute" 
                    top="-20px" 
                    bg={index === 0 ? "gold" : index === 1 ? "silver" : "#CD7F32"} 
                    p={3} 
                    borderRadius="full"
                    boxShadow="lg"
                  >
                    {getMedal(index)}
                  </Box>
                  
                  <Box position="relative">
                    <Avatar 
                      size={index === 0 ? "2xl" : "xl"}
                      src={user.profilePic ? `http://localhost:5000/${user.profilePic}` : null}
                      name={user.username}
                      border={`4px solid ${index === 0 ? "gold" : index === 1 ? "silver" : index === 2 ? "#CD7F32" : ""}`}
                      boxShadow="lg"
                    />
                  </Box>
                  
                  <VStack spacing={2}>
                    <Text 
                      fontWeight="bold" 
                      fontSize={index === 0 ? "2xl" : "xl"}
                      color="gray.700"
                    >
                      {user.username}
                    </Text>
                    
                    <HStack>
                      <Icon as={FaIdCard} color="blue.500" />
                      <Text fontSize="md" color="gray.600">{user.studentId || "Student"}</Text>
                      {user.isVerified && (
                        <Icon as={FaCheckCircle} color="green.500" />
                      )}
                    </HStack>
                  </VStack>
                  
                  <Badge 
                    colorScheme={index === 0 ? "yellow" : index === 1 ? "gray" : "orange"} 
                    fontSize="xl" 
                    px={6} 
                    py={2} 
                    borderRadius="full"
                    boxShadow="md"
                  >
                    {user.points} points
                  </Badge>
                  
                  {/* Display highest badge only if earned */}
                  {user.points >= 20 && getHighestBadge(user.points) && (
                    <Box 
                      bg="white"
                      p={3}
                      borderRadius="xl"
                      w="full"
                      border="2px solid"
                      borderColor="purple.200"
                      boxShadow="sm"
                    >
                      <VStack spacing={1.5}>
                        <HStack spacing={1.5}>
                          <Icon as={FaMedal} color="purple.500" boxSize={4} />
                          <Text fontSize="xs" fontWeight="semibold" color="purple.600">
                            Badge
                          </Text>
                        </HStack>
                        <HStack 
                          spacing={2} 
                          justify="center"
                          bg="purple.50"
                          p={1.5}
                          borderRadius="lg"
                          w="full"
                        >
                          {(() => {
                            const badge = getHighestBadge(user.points);
                            return (
                              <>
                                <Icon 
                                  as={badge.icon} 
                                  color={badge.color} 
                                  boxSize={5} 
                                />
                                <Text 
                                  fontWeight="bold" 
                                  fontSize="sm" 
                                  color="purple.700"
                                >
                                  {badge.name}
                                </Text>
                              </>
                            );
                          })()}
                        </HStack>
                      </VStack>
                    </Box>
                  )}
                  
                  <Text 
                    fontSize="sm" 
                    color="gray.600" 
                    noOfLines={2} 
                    textAlign="center"
                    px={2}
                  >
                    {user.bio || "Helping return lost items!"}
                  </Text>
                </VStack>
              ))}
            </Flex>
          )}

          <Divider my={8} borderColor="gray.300" />
          
          {/* Other Users Table */}
          {usersWithPoints.length > 3 && (
            <Box 
              overflowX="auto" 
              bg="white" 
              borderRadius="xl" 
              boxShadow="lg"
              p={6}
            >
              <Heading 
                as="h3" 
                size="lg" 
                mb={6}
                color="gray.700"
                textAlign="center"
              >
                Other Top Contributors
              </Heading>
              <Table variant="simple" size="lg">
                <Thead>
                  <Tr bg="gray.50">
                    <Th>Rank</Th>
                    <Th>User</Th>
                    <Th>Student ID</Th>
                    <Th>Badges</Th>
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
                      transition="all 0.2s"
                    >
                      <Td fontWeight="bold" color="gray.600">{index + 4}</Td>
                      <Td>
                        <Flex align="center">
                          <Avatar 
                            size="md" 
                            name={user.username} 
                            src={user.profilePic ? `http://localhost:5000/${user.profilePic}` : null} 
                            mr={3}
                            boxShadow="sm"
                          />
                          <Text fontWeight="medium" color="gray.700">{user.username}</Text>
                          {user.isVerified && (
                            <Icon as={FaCheckCircle} color="green.500" ml={2} />
                          )}
                        </Flex>
                      </Td>
                      <Td color="gray.600">{user.studentId || "Not provided"}</Td>
                      <Td>
                        {user.points >= 20 && getHighestBadge(user.points) ? (
                          <HStack spacing={2}>
                            {(() => {
                              const badge = getHighestBadge(user.points);
                              return (
                                <>
                                  <Icon 
                                    as={badge.icon} 
                                    color={badge.color} 
                                    boxSize={5} 
                                  />
                                  <Text fontSize="md" color="gray.700" fontWeight="medium">
                                    {badge.name}
                                  </Text>
                                </>
                              );
                            })()}
                          </HStack>
                        ) : (
                          <Text fontSize="sm" color="gray.400">None yet</Text>
                        )}
                      </Td>
                      <Td isNumeric>
                        <Badge 
                          colorScheme="blue" 
                          fontSize="md" 
                          px={3} 
                          py={1}
                          borderRadius="full"
                        >
                          {user.points}
                        </Badge>
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