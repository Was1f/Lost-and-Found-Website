<<<<<<< Updated upstream
import { useEffect, useState } from "react";
import axios from "axios";
import { Box, Button, Flex, Heading, Image, Stack, Text, Spinner } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fake logged-in user ID for testing — replace with actual ID from auth later
  const userId = "661f989c7ae27cb3a44649f1"; 
=======
import React, { useEffect, useState } from 'react';
import { Box, Button, Text, Spinner, useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

import './ProfilePage.css';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();
>>>>>>> Stashed changes

  useEffect(() => {
    const fetchProfile = async () => {
      try {
<<<<<<< Updated upstream
        const res = await axios.get(`http://localhost:5000/api/profile/${userId}`);
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to load profile", err);
=======
        const token = localStorage.getItem("authToken");

        if (!token) {
          toast({
            title: "Authentication Error",
            description: "Please login first",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
          navigate('/login');
          return;
        }

        const response = await fetch("http://localhost:5000/api/userprofile/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch profile");
        }

        console.log("Profile data received:", data);
        setUserData(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
>>>>>>> Stashed changes
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
<<<<<<< Updated upstream
  }, []);

  const handleEditProfile = () => {
    alert("Edit profile clicked!");
  };
=======
  }, [toast, navigate]);

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" color="blue.500" />
        <Text mt={4}>Loading your profile...</Text>
      </Box>
    );
  }

  if (!userData) {
    return (
      <Box textAlign="center" py={10}>
        <Text fontSize="xl" mb={4}>Unable to load profile data</Text>
        <Button colorScheme="blue" onClick={() => navigate('/login')}>
          Go to Login
        </Button>
      </Box>
    );
  }
>>>>>>> Stashed changes

  const handleViewHistory = () => {
    navigate("/history");
  };

  if (loading) return <Spinner size="xl" />;

  return (
<<<<<<< Updated upstream
    <Flex direction="column" align="center" justify="center" minH="80vh" p={6}>
      <Box
        maxW="lg"
        borderWidth="1px"
        borderRadius="2xl"
        overflow="hidden"
        boxShadow="lg"
        bg="white"
        p={6}
        w="100%"
      >
        <Flex justify="center">
          <Image
            borderRadius="full"
            boxSize="120px"
            src={profile?.profilePicUrl || "https://via.placeholder.com/150"}
            alt="Profile Picture"
            mb={4}
          />
        </Flex>
        <Stack spacing={3} textAlign="center">
          <Heading size="md">{profile?.name || "Unnamed User"}</Heading>
          <Text color="gray.600">{profile?.email}</Text>
          <Text mt={2}>
            {profile?.bio || "👋 Hi! You haven't added a bio yet."}
          </Text>
          <Button colorScheme="blue" onClick={handleEditProfile}>
            Edit Profile
          </Button>
          <Button variant="outline" colorScheme="teal" onClick={handleViewHistory}>
            View History
          </Button>
          <Button variant="ghost" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </Stack>
=======
    <Box className="profile-container">
      <Box position="relative">
        {/* Using hardcoded placeholder images to test rendering */}
        <img 
          src="https://via.placeholder.com/800x180"
          alt="Cover" 
          className="cover-photo" 
        />

        <img 
          src="https://via.placeholder.com/80"
          alt="Profile" 
          className="profile-picture" 
        />
      </Box>

      <Box className="info-section">
        <Text className="name">{userData.username || userData.email}</Text>
        <Text className="role">
          {userData.createdAt ? 
            `User since: ${new Date(userData.createdAt).toLocaleDateString()}` : 
            "New user"}
        </Text>
        <Text className="location">{userData.bio || "No bio yet."}</Text>

        <Box className="button-group">
          <Button colorScheme="blue" onClick={() => navigate('/edit-profile')}>
            Edit Profile
          </Button>
          <Button
            variant="outline"
            colorScheme="blue"
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </Button>
        </Box>
>>>>>>> Stashed changes
      </Box>
    </Flex>
  );
};

<<<<<<< Updated upstream
export default ProfilePage;

=======
export default Profile;
>>>>>>> Stashed changes
