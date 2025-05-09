import React, { useEffect, useState } from 'react';
import {
  Box, Text, Spinner, Flex, Icon, Image,
  Badge, Tooltip, Button
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaIdCard, FaCheckCircle, FaCalendarAlt, FaTrophy } from 'react-icons/fa';
import axios from 'axios';

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
        
        // Fetch user profile data
        const response = await axios.get(`http://localhost:5000/api/userprofile/${userId}`);
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
  
  return (
    <Box className="profile-container">
      {/* Cover Image */}
      <Box position="relative" className="cover-container">
        <Image 
          src={coverPicUrl}
          alt="Cover" 
          className="cover-photo"
          fallback={
            <Box className="gradient-cover" />
          }
        />
      </Box>

      {/* Avatar */}
      <Box className="avatar-wrapper">
        <Image 
          src={profilePicUrl}
          alt="Profile" 
          className="profile-avatar"
          onError={(e) => {
            e.target.src = "/avatar-placeholder.png";
          }}
        />
      </Box>

      {/* Profile Info */}
      <Box className="profile-body">
        <Button colorScheme="blue" size="sm" position="absolute" top={5} right={5} onClick={() => navigate(-1)}>
          Back
        </Button>

        <Text className="user-name">{userData.username || "User"}</Text>
        <Text className="user-role">{userData.bio || "Lost & Found Portal Member"}</Text>

        <Flex align="center" mt={4} justify="center" gap={6} color="gray.600">
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