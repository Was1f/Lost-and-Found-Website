import { Box, Heading, Text, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const BannedPage = () => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    // Redirect user to homepage or login page
    navigate('/login'); // You can customize this as per your need.
  };

  return (
    <Box p={6} bg="white" boxShadow="lg" rounded="md" border="1px solid" borderColor="gray.200" maxW="lg" m="auto">
      <Heading as="h2" size="lg" textAlign="center">
        Account Banned
      </Heading>
      <Text mt={4} textAlign="center">
        We're sorry, but your account has been banned due to policy violations. If you believe this is a mistake, please contact support.
      </Text>
      <Button mt={6} colorScheme="blue" onClick={handleBackToHome} width="full">
        Back to Login
      </Button>
    </Box>
  );
};

export default BannedPage;
