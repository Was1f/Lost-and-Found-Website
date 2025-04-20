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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/profile/${userId}`);
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleEditProfile = () => {
    alert("Edit profile clicked!");
  };

  const handleViewHistory = () => {
    navigate("/history");
  };

  if (loading) return <Spinner size="xl" />;

  return (
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
      </Box>
    </Flex>
  );
};

export default ProfilePage;

