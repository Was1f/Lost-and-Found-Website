import React, { useEffect, useState } from 'react';
import {
  Box, Text, Spinner, Flex, Icon, Image,
  Badge, Tooltip, Button, VStack
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaHandsHelping, FaShieldAlt, FaMedal, FaAward, FaCrown, FaGem,
  FaIdCard, FaCheckCircle, FaCalendarAlt, FaTrophy, FaMapMarkerAlt
} from 'react-icons/fa';
import axios from 'axios';

const BADGE_TIERS = [
  { id: 'helper', name: 'Helper', icon: FaHandsHelping, color: '#48BB78', threshold: 20, description: 'Awarded for earning 20+ points by helping return items' },
  { id: 'finder', name: 'Finder', icon: FaShieldAlt, color: '#ED8936', threshold: 50, description: 'Awarded for earning 50+ points as a dedicated helper' },
  { id: 'champion', name: 'Champion', icon: FaMedal, color: '#F6AD55', threshold: 100, description: 'Awarded for earning 100+ points as an outstanding member' },
  { id: 'elite', name: 'Elite', icon: FaAward, color: '#FC8181', threshold: 150, description: 'Awarded for earning 150+ points as a premier helper' },
  { id: 'legend', name: 'Legend', icon: FaCrown, color: '#F6E05E', threshold: 250, description: 'Awarded for earning 250+ points as a legendary contributor' },
  { id: 'ultimate', name: 'Ultimate', icon: FaGem, color: '#B794F4', threshold: 500, description: 'Awarded for earning 500+ points - the highest honor!' }
];
const getHighestBadge = (points) => {
  if (!points || points <= 0) return null;
  const earned = BADGE_TIERS.filter(b => points >= b.threshold);
  return earned.length ? earned[earned.length - 1] : null;
};

const VisitUserProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userId } = useParams(); // Get userId from URL
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        // Fetch user profile data with Authorization header
        const response = await axios.get(`http://localhost:5000/api/userprofile/${userId}`,
          token ? { headers: { Authorization: `Bearer ${token}` } } : {}
        );
        setUserData(response.data);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Failed to load user profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" color="blue.500" />
        <Text mt={4}>Loading profile...</Text>
      </Box>
    );
  }

  if (error || !userData) {
    return (
      <Box textAlign="center" py={10}>
        <Text fontSize="xl" mb={4}>{error || "User not found"}</Text>
        <Button colorScheme="blue" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Box>
    );
  }

  // Get the server URL for images
  const serverUrl = "http://localhost:5000/";
  const profilePicUrl = userData.profilePic ? serverUrl + userData.profilePic : "/avatar-placeholder.png";
  const coverPicUrl = userData.coverPic ? serverUrl + userData.coverPic : "/cover-placeholder.jpg";
  
  const highestBadge = getHighestBadge(userData.points);

  return (
    <Box className="profile-container" position="relative" pb={8}>
      {/* Cover Image */}
      <Box position="relative" className="cover-container">
        <Image 
          src={coverPicUrl}
          alt="Cover" 
          className="cover-photo"
          fallback={<Box className="gradient-cover" />}
        />
      </Box>

      {/* Avatar & Badge */}
      <Flex
        direction="row"
        align="center"
        justify="center"
        position="relative"
        mt={-20}
        mb={4}
        zIndex={2}
      >
        <Box position="relative" display="inline-block">
          <Image
            src={profilePicUrl}
            alt="Profile"
            className="profile-avatar"
            boxSize={{ base: "100px", md: "150px" }}
            borderRadius="full"
            border="4px solid white"
            boxShadow="lg"
            background="#fff"
            objectFit="cover"
            onError={e => { e.target.src = "/avatar-placeholder.png"; }}
          />
          {/* Badge (if any) */}
          {userData.points >= 20 && highestBadge && (
            <Tooltip label={`${highestBadge.name}: ${highestBadge.description}`}>
              <Box
                position="absolute"
                bottom={2}
                right={2}
                bg="white"
                borderRadius="full"
                p={1}
                boxShadow="md"
                border={`2px solid ${highestBadge.color}`}
                zIndex={3}
              >
                <Icon as={highestBadge.icon} boxSize={6} color={highestBadge.color} />
              </Box>
            </Tooltip>
          )}
        </Box>
      </Flex>

      {/* Profile Info */}
      <Box className="profile-body" textAlign="center" mt={2}>
        <Text className="user-name" fontSize="2xl" fontWeight="bold">{userData.username || "User"}</Text>
        <Text className="user-role" color="gray.600" mb={2}>{userData.bio || "Lost & Found Portal Member"}</Text>
        <Flex align="center" justify="center" gap={6} color="gray.600" flexWrap="wrap">
          {userData.studentId && (
            <Flex align="center">
              <Icon as={FaIdCard} mr={2} color="blue.500" />
              <Text fontWeight="medium">Student</Text>
              {userData.isVerified && (
                <Tooltip label="Verified Student" placement="top">
                  <span>
                    <Icon as={FaCheckCircle} color="green.500" ml={2} />
                  </span>
                </Tooltip>
              )}
            </Flex>
          )}
          <Flex align="center">
            <Icon as={FaCalendarAlt} mr={2} />
            <Text>Member since {new Date(userData.createdAt).toLocaleDateString()}</Text>
          </Flex>
          {userData.points > 0 && (
            <Flex align="center">
              <Icon as={FaTrophy} mr={2} color="yellow.500" />
              <Text fontWeight="bold">{userData.points} points</Text>
            </Flex>
          )}
        </Flex>
        <Box className="profile-grid" mt={8}>
          <Box>
            <Text fontWeight="bold" mb={2}>About</Text>
            <Text>{userData.bio || "This user hasn't added a bio yet."}</Text>
          </Box>
        </Box>
      </Box>

      {/* User's Posts Section */}
      {userData.posts && userData.posts.length > 0 && (
        <Box mt={8} maxW="900px" mx="auto">
          <Text fontSize="2xl" fontWeight="bold" mb={4} textAlign="center">
            Posts by {userData.username}
          </Text>
          <VStack spacing={6} align="stretch">
            {userData.posts.map(post => (
              <Box
                key={post._id}
                bg="white"
                boxShadow="md"
                rounded="xl"
                overflow="hidden"
                transition="all 0.3s ease"
                _hover={{
                  transform: 'translateY(-5px) scale(1.01)',
                  boxShadow: '2xl',
                  bg: 'gray.50'
                }}
              >
                <Flex align="start" p={6} gap={6}>
                  <Image
                    src={`http://localhost:5000${post.image}`}
                    alt={post.title}
                    boxSize="120px"
                    objectFit="cover"
                    borderRadius="lg"
                    transition="all 0.5s ease"
                    _hover={{ transform: 'scale(1.05)' }}
                  />
                  <Box flex="1">
                    <Flex align="center" gap={3} mb={3}>
                      <Badge
                        colorScheme={post.status === "lost" ? "red" : "green"}
                        fontSize="sm"
                        px={3}
                        py={1}
                        borderRadius="full"
                        textTransform="uppercase"
                        fontWeight="bold"
                        transition="all 0.3s ease"
                        _hover={{ transform: 'scale(1.05)' }}
                      >
                        {post.status?.toUpperCase() || 'POST'}
                      </Badge>
                      <Text fontSize="sm" color="gray.500">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </Text>
                    </Flex>
                    <Text fontWeight="bold" fontSize="xl" mb={2} color="gray.700">
                      {post.title}
                    </Text>
                    <Text
                      mb={4}
                      color="gray.600"
                      fontSize="md"
                      style={{
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        WebkitLineClamp: "2",
                      }}
                    >
                      {post.description}
                    </Text>
                    <Flex gap={4} mb={4}>
                      <Flex align="center" gap={1}>
                        <Icon as={FaMapMarkerAlt} color="blue.500" />
                        <Text color="blue.500" fontWeight="medium">
                          {post.location}
                        </Text>
                      </Flex>
                    </Flex>
                    <Button
                      colorScheme="blue"
                      size="md"
                      onClick={() => navigate(`/post/${post._id}`)}
                      _hover={{
                        transform: 'translateY(-2px) scale(1.05)',
                        boxShadow: 'lg',
                        bg: 'blue.600'
                      }}
                      transition="all 0.3s ease"
                    >
                      View Details
                    </Button>
                  </Box>
                </Flex>
              </Box>
            ))}
          </VStack>
        </Box>
      )}
    </Box>
  );
};

export default VisitUserProfilePage;