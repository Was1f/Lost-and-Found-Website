import React, { useEffect, useState } from 'react';
import {
  Box, Text, Spinner, Flex, Icon, Image, Heading, Divider,
  Badge, Tooltip, Button, Avatar, Center, VStack, HStack
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaHandsHelping, FaShieldAlt, FaMedal, FaAward, FaCrown, FaGem,
  FaIdCard, FaCheckCircle, FaCalendarAlt, FaTrophy, FaMapMarkerAlt, FaClock
} from 'react-icons/fa';
import axios from 'axios';
import './MyPostsPage'; // Import the CSS for styling the posts

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
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userId } = useParams(); // Get userId from URL
  const navigate = useNavigate();
  
  // Fetch user profile data
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
        console.log('User data found:', response.data);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Failed to load user profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  // Fetch user's posts
  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!userId) return;
      
      try {
        setPostsLoading(true);
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          console.log("Token not found, can't fetch posts");
          setPostsLoading(false);
          return;
        }
        
        console.log(`Fetching posts for user ID: ${userId}`);
        
        // Use the endpoint to get user-specific posts
        const response = await axios.get(`http://localhost:5000/api/posts/by-user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log("Posts fetched:", response.data);
        setUserPosts(response.data);
      } catch (err) {
        console.error("Error fetching user posts:", err);
        
        if (err.response) {
          console.log("Response status:", err.response.status);
          console.log("Response data:", err.response.data);
        }
        
        // Don't show an error toast, just show empty posts section
        setUserPosts([]);
      } finally {
        setPostsLoading(false);
      }
    };
    
    fetchUserPosts();
  }, [userId]);
  
  // Function to get status bar color - LESS INTENSE COLORS
  const getStatusBarColor = (status, returnPending) => {
    if (returnPending) return "rgba(128, 90, 213, 0.6)"; // purple with transparency
    
    switch (status) {
      case 'lost':
        return 'rgba(229, 62, 62, 0.6)'; // less intense red
      case 'found':
        return 'rgba(56, 161, 105, 0.6)'; // less intense green
      case 'returned':
        return 'rgba(128, 90, 213, 0.6)'; // less intense purple
      default:
        return 'rgba(113, 128, 150, 0.6)'; // less intense gray
    }
  };
  
  // Function to get appropriate status text
  const getStatusText = (post) => {
    if (post.returnPending) return "RETURN PENDING";
    return post.status.toUpperCase();
  };
  
  // Handle post click to view details
  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`);
  };

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
  const serverUrl = "http://localhost:5000";
  
  // Debug logs to check the URLs
  console.log("Profile Pic Data:", userData.profilePic);
  
  const profilePicUrl = userData.profilePic ? `${serverUrl}${userData.profilePic}` : "/avatar-placeholder.png";
  const coverPicUrl = userData.coverPic ? `${serverUrl}${userData.coverPic}` : "/cover-placeholder.jpg";
  
  console.log("Constructed Profile Pic URL:", profilePicUrl);
  
  const highestBadge = getHighestBadge(userData.points);
  
  // Get membership date from createdAt or fallback to current year
  const memberSinceText = userData.createdAt 
    ? `Member since ${new Date(userData.createdAt).toLocaleDateString()}`
    : "Member since 2023"; // Default fallback

  return (
    <Box className="profile-container" position="relative" pb={8}>
      {/* Cover Image */}
      <Box position="relative" className="cover-container" height="180px" overflow="hidden">
        <Image 
          src={coverPicUrl}
          alt="Cover" 
          className="cover-photo"
          w="100%"
          h="100%"
          objectFit="cover"
          fallback={
            <Box className="gradient-cover" bg="blue.50" w="100%" h="100%" />
          }
        />
      </Box>

      {/* Back Button */}
      <Button 
        colorScheme="blue" 
        size="sm" 
        position="absolute" 
        top={4} 
        right={4} 
        onClick={() => navigate(-1)}
        zIndex={2}
      >
        Back
      </Button>

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
            onError={e => { 
              console.log("Error loading profile image, using fallback");
              e.target.src = "/avatar-placeholder.png"; 
            }}
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
      <Box className="profile-body" textAlign="center" mt={2} px={4}>
        <Text className="user-name" fontSize="2xl" fontWeight="bold">
          {userData.username || "User"}
        </Text>
        
        <Text className="user-role" color="gray.600" mb={2}>
          {userData.bio || "Lost & Found Portal Member"}
        </Text>
        
        {/* User Stats */}
        <Flex 
          align="center" 
          justify="center" 
          gap={6} 
          color="gray.600" 
          flexWrap="wrap"
          width="100%"
          mt={4}
          mb={4}
        >
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
            <Text>{memberSinceText}</Text>
          </Flex>
          
          {userData.points > 0 && (
            <Flex align="center">
              <Icon as={FaTrophy} mr={2} color="yellow.500" />
              <Text fontWeight="bold">{userData.points} points</Text>
            </Flex>
          )}
        </Flex>
        
        {/* About Section */}
        <Box mt={8} textAlign="left">
          <Text fontWeight="bold" mb={2}>About</Text>
          <Text>{userData.bio || "This user hasn't added a bio yet."}</Text>
        </Box>
        
        {/* User Posts Section */}
        <Divider my={6} />
        
        <Box mt={8} textAlign="left">
          <Heading as="h2" size="lg" mb={4}>
            {userData.username}'s Posts
          </Heading>
          
          {postsLoading ? (
            <Flex justify="center" py={10}>
              <Spinner />
            </Flex>
          ) : userPosts.length === 0 ? (
            <Box textAlign="center" py={6} bg="gray.50" borderRadius="md">
              <Text>This user hasn't made any posts yet.</Text>
            </Box>
          ) : (
            <Box className="reports-container" bgColor="transparent" boxShadow="none" p={0}>
              {userPosts.map(post => (
                <Box 
                  key={post._id} 
                  className="report-card"
                  onClick={() => handlePostClick(post._id)}
                  cursor="pointer"
                  _hover={{ transform: 'translateY(-3px)', boxShadow: 'lg' }}
                  position="relative"
                  overflow="hidden" // Important for the status bar
                  mb={4}
                  p={4}
                  borderRadius="md"
                  boxShadow="sm"
                  bg="white"
                >
                  <Flex justifyContent="space-between" alignItems="flex-start">
                    <Box flex="1">
                      <Heading as="h3" size="md" mb={2}>{post.title}</Heading>
                      
                      <Text noOfLines={2} mb={3} color="gray.600">
                        {post.description}
                      </Text>
                      
                      <Flex alignItems="center" mt={4} color="gray.500" fontSize="sm">
                        <Icon as={FaMapMarkerAlt} mr={1} />
                        <Text mr={4}>{post.location}</Text>
                        
                        <Icon as={FaClock} mr={1} />
                        <Text>{new Date(post.createdAt).toLocaleDateString()}</Text>
                      </Flex>
                    </Box>
                    
                    {post.image && (
                      <Image 
                        src={`${serverUrl}${post.image}`}
                        alt={post.title}
                        boxSize="100px"
                        objectFit="cover"
                        borderRadius="md"
                        ml={4}
                      />
                    )}
                  </Flex>
                  
                  {/* Status Bar - Less intense and thinner */}
                  <Box
                    position="absolute"
                    bottom="0"
                    left="0"
                    right="0"
                    height="6px" // Thinner status bar
                    backgroundColor={getStatusBarColor(post.status, post.returnPending)}
                  />
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default VisitUserProfilePage;