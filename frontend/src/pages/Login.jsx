import { Box, Button, Container, FormControl, FormLabel, Heading, Input, useToast, VStack, Text, Link as ChakraLink, useColorModeValue } from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const toast = useToast();
  const navigate = useNavigate();
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");

  const handleLogin = async () => {
    try {
      // Try regular user login first
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If login fails, check if it's because the user is an admin
        const adminCheckResponse = await fetch("http://localhost:5000/api/admin/check", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        const adminCheckData = await adminCheckResponse.json();

        if (adminCheckData.isAdmin) {
          toast({
            title: "Admin Account Detected",
            description: "Please use the admin login page to access your account.",
            status: "warning",
            isClosable: true,
          });
          navigate('/admin/login');
          return;
        }

        // If not an admin, throw the original error
        throw new Error(data.message || "Login failed");
      }

      // ✅ If the user is banned, redirect to the banned page
      if (data.user && data.user.status === 'banned') {
        toast({
          title: "Account Banned",
          description: "You have been banned. Please contact support.",
          status: "error",
          isClosable: true,
        });
        navigate('/banned');
        return;
      }

      // ✅ Store the JWT token in localStorage
      localStorage.setItem("authToken", data.token);

      toast({
        title: "Login Successful",
        description: "You are now logged in.",
        status: "success",
        isClosable: true,
      });

      navigate("/recent");
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error.message,
        status: "error",
        isClosable: true,
      });
    }
  };

  return (
    <Box minH="100vh" bg={bgColor} py={20}>
      <Container maxW="lg">
        <VStack spacing={8}>
          <VStack spacing={3} textAlign="center">
            <Heading
              as="h1"
              size="2xl"
              bgGradient="linear(to-r, blue.400, blue.600)"
              bgClip="text"
              fontWeight="bold"
            >
              Welcome Back
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Sign in to access your account
            </Text>
          </VStack>

          <Box
            w="full"
            p={8}
            bg={cardBg}
            rounded="xl"
            boxShadow="lg"
            border="1px solid"
            borderColor="gray.200"
          >
            <VStack spacing={6}>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  size="lg"
                  _focus={{
                    borderColor: "blue.400",
                    boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)",
                  }}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  size="lg"
                  _focus={{
                    borderColor: "blue.400",
                    boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)",
                  }}
                />
              </FormControl>

              <Button
                colorScheme="blue"
                size="lg"
                width="full"
                onClick={handleLogin}
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "lg",
                }}
                transition="all 0.2s"
              >
                Sign In
              </Button>

              <Text textAlign="center" color="gray.600">
                Don't have an account?{" "}
                <ChakraLink
                  as={RouterLink}
                  to="/signup"
                  color="blue.500"
                  fontWeight="bold"
                  _hover={{ textDecoration: "underline" }}
                >
                  Sign Up
                </ChakraLink>
              </Text>
              <Text textAlign="center" fontSize="sm" color="gray.500">
                Are you an admin?{" "}
                <ChakraLink
                  as={RouterLink}
                  to="/admin/login"
                  color="blue.500"
                  fontWeight="bold"
                  _hover={{ textDecoration: "underline" }}
                >
                  Admin Login
                </ChakraLink>
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default LoginPage;
