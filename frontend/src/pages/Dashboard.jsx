import React from 'react';
import { Box, Button, Flex, Heading, Text, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const goToUserManagement = () => {
    navigate('/admin/users');
  };

  const goToPostManagement = () => {
    navigate('/admin/posts');
  };

  // Hardcoding Admin Name for now
  const adminName = "Zidan";  // 👈 you can make this dynamic later from token if needed

  return (
    <Flex minH="100vh" bg="gray.100" align="center" justify="center" p={8}>
      <Box flex="1" p={8}>
        <Heading as="h1" size="2xl" mb={4}>
          👋 Welcome, {adminName}!
        </Heading>
        <Text fontSize="xl" color="gray.600">
          You are logged in as an Admin. Here you can review posts and manage users efficiently.
        </Text>
      </Box>

      {/* Sticky Note Style Box */}
      <Box
        w="350px"
        bg="yellow.100"
        p={6}
        rounded="md"
        boxShadow="2xl"
        border="1px solid"
        borderColor="yellow.300"
        position="relative"
        transform="rotate(-2deg)"
      >
        <Heading as="h3" size="lg" textAlign="center" mb={6}>
          📋 Admin Tasks
        </Heading>

        <VStack spacing={6}>
          <Button
            colorScheme="blue"
            size="lg"
            width="100%"
            onClick={goToPostManagement}
          >
            Review Posts
          </Button>
          <Button
            colorScheme="teal"
            size="lg"
            width="100%"
            onClick={goToUserManagement}
          >
            Review Users
          </Button>
        </VStack>

        {/* Fake pin effect */}
        <Box
          w="10px"
          h="10px"
          bg="red.500"
          rounded="full"
          position="absolute"
          top="-5px"
          left="50%"
          transform="translateX(-50%)"
          boxShadow="lg"
        />
      </Box>
    </Flex>
  );
};

export default Dashboard;
