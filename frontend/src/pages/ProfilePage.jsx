import React, { useEffect, useState } from 'react';
import {
  Box, Button, Text, Spinner, useToast, Flex, Icon, Image,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,Tooltip, Badge 
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaCalendarAlt, FaPencilAlt,FaCheckCircle, FaIdCard  } from 'react-icons/fa';
import { BsGrid3X3 } from 'react-icons/bs';
import './ProfilePage.css';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  

  useEffect(() => {
    const fetchProfile = async () => {
      try {
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
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [toast, navigate]);

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setImageModalOpen(true);
  };

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

  // Get the server URL for images
  const serverUrl = "http://localhost:5000/";
  const profilePicUrl = userData.profilePic ? serverUrl + userData.profilePic : "/avatar-placeholder.png";
  const coverPicUrl = userData.coverPic ? serverUrl + userData.coverPic : "/cover-placeholder.jpg";
  const isVerified = userData.isVerified || false;
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
          onClick={() => openImageModal(profilePicUrl)}
          cursor="pointer"
          onError={(e) => {
            e.target.src = "/avatar-placeholder.png";
          }}
        />
      </Box>

      {/* Action Buttons */}
      <Flex justify="flex-end" mt={4} px={6}>
        <Button 
          leftIcon={<FaPencilAlt />}
          variant="outline"
          colorScheme="blue"
          size="md"
          onClick={() => navigate('/edit-profile')}
          mr={2}
        >
          Edit Profile
        </Button>
      </Flex>

      {/* Profile Info */}
      <Box className="profile-body">
        <Text className="user-name">{userData.username || "Jane Doe"}</Text>
        <Text className="user-role">{userData.bio || "UI/UX Designer & Frontend Developer"}</Text>

        <Flex align="center" mt={4} justify="center" gap={6} color="gray.600">
          <Flex align="center">
            <Icon as={FaIdCard} mr={2} color="blue.500" />
            <Text fontWeight="medium">{userData.studentId || "not given"}</Text>
            {isVerified && (
              <Tooltip label="Verified Student" placement="top">
                <span>
                <Icon as={FaCheckCircle} color="green.500" ml={2} />
                </span>
              </Tooltip>
            )}
          </Flex>
          <Flex align="center">
            <Icon as={FaCalendarAlt} mr={2} />
            <Text>Joined {new Date(userData.createdAt).toLocaleDateString()}</Text>
          </Flex>
        </Flex>

        <Box className="profile-grid">
          <Box>
            <Text fontWeight="bold" mb={2}>About</Text>
            <Text>{userData.bio || "Hi! I'm using Lost and Found Portal!"}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold" mb={2}>Info</Text>
            <Flex>
              <Text fontWeight="medium" width="150px">Email</Text>
              <Text>{userData.email}</Text>
            </Flex>
            <Flex>
              <Text fontWeight="medium" width="150px">Student ID</Text>
              <Flex align="center">
                <Text>{userData.studentId}</Text>
                {isVerified &&(
                  <Badge colorScheme="green" ml={2} borderRadius="full" px={2}>
                    Verified
                  </Badge>
                )}
              </Flex>
            </Flex>
            <Flex>
              <Text fontWeight="medium" width="150px">Member Since</Text>
              <Text>{new Date(userData.createdAt).toLocaleDateString()}</Text>
            </Flex>
          </Box>
        </Box>
      </Box>

      {/* Image Modal */}
      <Modal isOpen={imageModalOpen} onClose={() => setImageModalOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Profile Picture</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Image 
              src={selectedImage} 
              alt="Profile" 
              maxH="70vh" 
              mx="auto" 
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Profile;