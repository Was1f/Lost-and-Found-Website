import { Box, Button, Container, FormControl, FormLabel, Heading, Input, useToast, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignUpPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const toast = useToast();
  const navigate = useNavigate();

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
        body: JSON.stringify({ email, password }),
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

      navigate("/login"); // Redirect to login after successful signup
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
    <Container maxW={"lg"} py={{ base: "12", sm: "24" }} px={{ base: "0", sm: "10" }} centerContent>
      <VStack spacing={4} w="100%">
        <Heading as="h1" size="xl" textAlign="center">
          Sign Up
        </Heading>
        <Box
          w="100%"
          p={6}
          bg="white"
          boxShadow="lg"
          rounded="md"
          border="1px solid"
          borderColor="gray.200"
        >
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

            <FormControl>
              <FormLabel>Confirm Password</FormLabel>
              <Input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </FormControl>

            <Button
              colorScheme="blue"
              size="lg"
              onClick={handleSignUp}
              width="full"
            >
              Sign Up
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default SignUpPage;
