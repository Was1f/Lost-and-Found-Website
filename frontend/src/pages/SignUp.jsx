import { Box, Button, Container, FormControl, FormLabel, Heading, Input, useToast, VStack, Text, Link as ChakraLink, useColorModeValue } from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";

const SignUpPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [studentId, setStudentId] = useState("");
  const toast = useToast();
  const navigate = useNavigate();
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        status: "error",
        isClosable: true,
      });
      return;
    }
   
    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email,
          studentId,
          password,
          username,
          bio,
          isVerified: false
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to sign up");
      }

      toast({
        title: "Account created successfully",
        description: "You can now log in with your credentials.",
        status: "success",
        isClosable: true,
      });

      navigate("/login");
    } catch (error) {
      toast({
        title: "Error",
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
              Create Account
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Join our community to help others find their lost items
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
              <FormControl isRequired>
                <FormLabel>Username</FormLabel>
                <Input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  size="lg"
                  _focus={{
                    borderColor: "blue.400",
                    boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)",
                  }}
                />
              </FormControl>

              <FormControl isRequired>
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

              <FormControl isRequired>
                <FormLabel>Student ID</FormLabel>
                <Input
                  type="text"
                  placeholder="8-digit Student ID number"
                  value={studentId}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                    setStudentId(value);
                  }}
                  size="lg"
                  _focus={{
                    borderColor: "blue.400",
                    boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)",
                  }}
                />
              </FormControl>

              <FormControl isRequired>
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

              <FormControl isRequired>
                <FormLabel>Confirm Password</FormLabel>
                <Input
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  size="lg"
                  _focus={{
                    borderColor: "blue.400",
                    boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)",
                  }}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Bio</FormLabel>
                <Input
                  type="text"
                  placeholder="Tell us about yourself"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
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
                onClick={handleSignUp}
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "lg",
                }}
                transition="all 0.2s"
              >
                Create Account
              </Button>

              <Text textAlign="center" color="gray.600">
                Already have an account?{" "}
                <ChakraLink
                  as={RouterLink}
                  to="/login"
                  color="blue.500"
                  fontWeight="bold"
                  _hover={{ textDecoration: "underline" }}
                >
                  Sign In
                </ChakraLink>
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default SignUpPage;
