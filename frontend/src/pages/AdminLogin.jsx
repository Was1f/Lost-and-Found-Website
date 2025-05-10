import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, FormControl, FormLabel, Heading, Input, useToast, VStack } from '@chakra-ui/react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      // First try to login as a regular user to get the user token
      const userResponse = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const userData = await userResponse.json();

      if (!userResponse.ok) {
        throw new Error(userData.message || 'Failed to log in as user');
      }

      // Then try to login as admin
      const adminResponse = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const adminData = await adminResponse.json();

      if (!adminResponse.ok) {
        throw new Error(adminData.message || 'Failed to log in as admin');
      }

      // Store both tokens
      localStorage.setItem('authToken', userData.token);
      localStorage.setItem('adminToken', adminData.token);

      toast({
        title: 'Login Successful',
        description: 'Welcome back, Admin!',
        status: 'success',
        isClosable: true,
      });

      // Redirect to recent posts page
      navigate('/recent');
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW={'lg'} py={{ base: '12', sm: '24' }} px={{ base: '0', sm: '10' }} centerContent>
      <VStack spacing={4} w="100%">
        <Heading as="h1" size="xl" textAlign="center">
          Admin Login
        </Heading>
        <Box w="100%" p={6} bg="white" boxShadow="lg" rounded="md" border="1px solid" borderColor="gray.200">
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                placeholder="Enter your admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </FormControl>

            <FormControl>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                placeholder="Enter your admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </FormControl>

            <Button colorScheme="blue" size="lg" onClick={handleLogin} width="full">
              Admin Login
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default AdminLogin;
