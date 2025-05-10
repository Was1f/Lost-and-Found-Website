import React, { useEffect, useState } from 'react';
import {
  Box, Text, Spinner, Flex, Icon, Image,
  Badge, Tooltip, Button
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaHandsHelping, FaShieldAlt, FaMedal, FaAward, FaCrown, FaGem,
  FaIdCard, FaCheckCircle, FaCalendarAlt, FaTrophy
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
    </Box>
  );
};

export default VisitUserProfilePage;