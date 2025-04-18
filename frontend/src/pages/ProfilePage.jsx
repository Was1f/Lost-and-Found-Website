import { Box, Button, Flex, Heading, Image, Stack, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const navigate = useNavigate();

  const handleEditProfile = () => {
    // Placeholder for profile editing
    alert("Edit profile clicked!");
  };

  const handleViewHistory = () => {
    navigate("/history"); // You can create this route later
  };

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
      >
        <Flex justify="center">
          <Image
            borderRadius="full"
            boxSize="120px"
            src="https://via.placeholder.com/150"
            alt="Profile Picture"
            mb={4}
          />
        </Flex>
        <Stack spacing={3} textAlign="center">
          <Heading size="md">John Doe</Heading>
          <Text color="gray.600">johndoe@example.com</Text>
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

