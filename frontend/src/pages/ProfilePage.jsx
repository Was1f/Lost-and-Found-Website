import React, { useEffect, useState } from 'react';
import {
  Box, Button, Text, Spinner, useToast, Flex, Icon, Image,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,Tooltip, Badge, Heading, SimpleGrid, HStack, VStack
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaCalendarAlt, FaPencilAlt,FaCheckCircle, FaIdCard, FaTrophy, FaAward, FaCrown, FaStar, FaHandHoldingHeart,FaHandsHelping, FaMedal, FaThumbsUp, FaGem,FaShieldAlt } from 'react-icons/fa';
import { BsGrid3X3 } from 'react-icons/bs';
import './ProfilePage.css';


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
  if (!points) return [];
  return BADGE_TIERS.filter(badge => points >= badge.threshold);
};

// Get the highest badge a user has earned
const getHighestBadge = (points) => {
  if (!points) return null;
  const earnedBadges = getUserBadges(points);
  return earnedBadges.length ? earnedBadges[earnedBadges.length - 1] : null;
};

const BadgeDisplay = ({ badge, size = "md" }) => {
  const sizeProps = {
    sm: { iconSize: 4, fontSize: "xs" },
    md: { iconSize: 5, fontSize: "sm" },
    lg: { iconSize: 6, fontSize: "md" }
  };

  return (
    <Tooltip label={badge.description} placement="top">
      <VStack
        bg="white"
        boxShadow="md"
        borderRadius="lg"
        p={2}
        align="center"
        justify="center"
        border={`2px solid ${badge.color}`}
        minW={size === "sm" ? "70px" : size === "md" ? "90px" : "110px"}
      >
        <Icon 
          as={badge.icon} 
          color={badge.color} 
          boxSize={sizeProps[size].iconSize} 
        />
        <Text 
          fontSize={sizeProps[size].fontSize} 
          fontWeight="bold" 
          textAlign="center" 
          noOfLines={1}
        >
          {badge.name}
        </Text>
      </VStack>
    </Tooltip>
  );
};

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [badgesModalOpen, setbadgesModalOpen] = useState(false);
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
  }, [navigate, toast]);

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setImageModalOpen(true);
  };
  const openBadgesModal = () => {
    setbadgesModalOpen(true);
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
    // Get user's points and badges
  const userPoints = userData.points !== undefined ? userData.points : 0;
  const earnedBadges = getUserBadges(userPoints);
  const highestBadge = getHighestBadge(userPoints);

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
                    {/* Points Display */}
          <Flex align="center">
            <Icon as={FaTrophy} mr={2} color="yellow.500" />
            <Text fontWeight="bold">{userPoints} points</Text>
          </Flex>
        </Flex>

        {/* Badges Display (if any earned) */}

        {highestBadge && (
          <Box mt={6} textAlign="center">
            <HStack spacing={2} justifyContent="center" mb={2}>
              <Icon as={FaAward} color="purple.500" />
              <Text fontWeight="bold" color="purple.500">Current Badge</Text>
            </HStack>
            
            <Flex justify="center" align="center" direction="column">
              <BadgeDisplay badge={highestBadge} size="md" />
              
              <Box mt={3} p={2} bg="gray.50" borderRadius="md" maxW="400px">
 
                {earnedBadges.length > 1 && (
                  <Button 
                    size="xs" 
                    variant="link" 
                    colorScheme="purple"
                    onClick={openBadgesModal}
                    mt={1}
                  >
                    View all earned badges
                  </Button>
                )}
              </Box>
            </Flex>
          </Box>
        )}


        
  
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
            <Flex>
              <Text fontWeight="medium" width="150px">Contribution</Text>
              <Flex align="center">
                <Text>{userPoints} points</Text>
                {highestBadge && (
                  <Badge 
                    ml={2} 
                    borderRadius="full" 
                    px={2}
                    colorScheme="purple"
                    onClick={openBadgesModal}
                    cursor="pointer"
                    _hover={{ bg: "purple.100" }}
                  >
                    {highestBadge.name}
                  </Badge>
                )}
              </Flex>
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
      {/* Badges Modal */}
      <Modal isOpen={badgesModalOpen} onClose={() => setbadgesModalOpen(false)} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader display="flex" alignItems="center">
            <Icon as={FaAward} mr={2} color="purple.500" />
            My Badges
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {earnedBadges.length > 0 ? (
              <>
                <Text mb={4}>
                  You've earned {earnedBadges.length} badge{earnedBadges.length !== 1 ? 's' : ''} by helping the community!
                </Text>
                
                <SimpleGrid columns={[1, 2, 3]} spacing={4}>
                  {earnedBadges.map(badge => (
                    <BadgeDisplay key={badge.id} badge={badge} size="lg" />
                  ))}
                </SimpleGrid>
                
                <Box mt={6} p={4} bg="purple.50" borderRadius="md">
                  <Heading size="sm" mb={2}>Keep helping to earn more badges!</Heading>
                  <Text fontSize="sm">
                    Return more lost items to increase your points and earn prestigious badges.
                  </Text>
                </Box>
              </>
            ) : (
              <Box textAlign="center" py={4}>
                <Text>You haven't earned any badges yet. Start helping by finding and returning lost items!</Text>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>     
    </Box>
  );
};

export default Profile;