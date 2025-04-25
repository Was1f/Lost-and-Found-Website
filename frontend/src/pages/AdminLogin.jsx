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
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to log in');
      }

      // Store the token in localStorage for future authentication
      localStorage.setItem('adminToken', data.token);


      toast({
        title: 'Login successful',
        description: 'Redirecting to Admin Dashboard...',
        status: 'success',
        isClosable: true,
      });

      // Redirect to the admin dashboard page
      navigate('/admin/dashboard');
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
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </FormControl>

            <FormControl>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </FormControl>

            <Button colorScheme="blue" size="lg" onClick={handleLogin} width="full">
              Log In
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default AdminLogin;
