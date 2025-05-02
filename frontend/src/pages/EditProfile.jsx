import { useEffect, useState } from "react";
import { 
  Box, 
  Button, 
  Input, 
  FormControl, 
  FormLabel, 
  Textarea, 
  VStack, 
  Heading, 
  useToast, 
  Image,
  Text,
  Flex,
  Spinner,
  Divider
} from "@chakra-ui/react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
  });
  const [profilePic, setProfilePic] = useState(null);
  const [coverPic, setCoverPic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  // Get auth token
  const token = localStorage.getItem('authToken');

  // Preview URLs for selected images
  const [profilePicPreview, setProfilePicPreview] = useState("");
  const [coverPicPreview, setCoverPicPreview] = useState("");

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/userprofile/me", {
          headers: {
            "Authorization": `Bearer ${token}`,
          }
        });

        console.log("User profile data:", response.data);
        
        setFormData({
          username: response.data.username || "",
          bio: response.data.bio || "",
        });

        // Set existing image URLs for preview
        if (response.data.profilePic) {
          setProfilePicPreview(`http://localhost:5000/${response.data.profilePic}`);
        }
        
        if (response.data.coverPic) {
          setCoverPicPreview(`http://localhost:5000/${response.data.coverPic}`);
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setInitialLoading(false);
      }
    };

    if (token) {
      fetchUserData();
    } else {
      setInitialLoading(false);
      toast({
        title: "Authentication Error",
        description: "You need to be logged in to edit your profile",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      navigate('/login');
    }
  }, [token, toast, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleProfilePicChange = (e) => {
    if (e.target.files[0]) {
      setProfilePic(e.target.files[0]);
      setProfilePicPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleCoverPicChange = (e) => {
    if (e.target.files[0]) {
      setCoverPic(e.target.files[0]);
      setCoverPicPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create FormData for the request
      const formDataToSend = new FormData();
      formDataToSend.append("username", formData.username);
      formDataToSend.append("bio", formData.bio);
      
      // Add images only if they're selected
      if (profilePic) {
        formDataToSend.append("profilePic", profilePic);
      }
      
      if (coverPic) {
        formDataToSend.append("coverPic", coverPic);
      }

      // Send update request
      const response = await axios.put(
        `http://localhost:5000/api/userprofile/update`, 
        formDataToSend, 
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Navigate to profile page
      navigate('/profile');
    } catch (error) {
      console.error("Update error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update profile",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" color="blue.500" />
        <Text mt={4}>Loading your profile...</Text>
      </Box>
    );
  }

  return (
    <Box maxW="lg" mx="auto" mt={10} p={6} boxShadow="lg" rounded="md" bg="white">
      <Heading as="h2" size="xl" mb={6}>
        Edit Profile
      </Heading>
      
      <form onSubmit={handleSubmit}>
        <VStack spacing={5} align="stretch">
          <FormControl isRequired>
            <FormLabel>Username</FormLabel>
            <Input
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Bio</FormLabel>
            <Textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself"
              resize="vertical"
              minH="100px"
            />
            <Text fontSize="xs" color="gray.500" mt={1}>
              {formData.bio ? `${formData.bio.length}/500` : "0/500"} characters
            </Text>
          </FormControl>

          <Divider my={3} />

          <FormControl>
            <FormLabel>Profile Picture</FormLabel>
            <Input
              type="file"
              accept="image/*"
              onChange={handleProfilePicChange}
            />
            {profilePicPreview && (
              <Box mt={3} borderWidth="1px" borderRadius="md" overflow="hidden" maxW="200px">
                <Image
                  src={profilePicPreview}
                  alt="Profile picture preview"
                  fallback={<Box bg="gray.100" p={4} textAlign="center">Preview not available</Box>}
                  boxSize="150px"
                  objectFit="cover"
                />
              </Box>
            )}
          </FormControl>

          <FormControl>
            <FormLabel>Cover Picture</FormLabel>
            <Input
              type="file"
              accept="image/*"
              onChange={handleCoverPicChange}
            />
            {coverPicPreview && (
              <Box mt={3} borderWidth="1px" borderRadius="md" overflow="hidden" w="100%">
                <Image
                  src={coverPicPreview}
                  alt="Cover picture preview"
                  fallback={<Box bg="gray.100" p={4} textAlign="center">Preview not available</Box>}
                  width="100%"
                  height="100px"
                  objectFit="cover"
                />
              </Box>
            )}
          </FormControl>

          <Flex mt={4} justify="space-between">
            <Button variant="outline" onClick={() => navigate('/profile')}>
              Cancel
            </Button>
            <Button
              type="submit"
              colorScheme="blue"
              isLoading={loading}
              loadingText="Updating"
            >
              Save Changes
            </Button>
          </Flex>
        </VStack>
      </form>
    </Box>
  );
};

export default EditProfile;