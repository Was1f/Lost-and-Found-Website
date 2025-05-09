// HomePage.jsx
import React, { useState, useEffect } from 'react';
import './LandingPage.css';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Image,
  Icon,
  SimpleGrid,
  useColorModeValue,
  Avatar,
  AvatarGroup,
  Badge,
  keyframes,
} from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { FaSearch, FaMapMarkerAlt, FaBell, FaShieldAlt } from "react-icons/fa";
import { motion } from "framer-motion";

// Animation keyframes
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Student",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    content: "I found my lost laptop within hours of posting! The community here is amazing and so helpful.",
  },
  {
    name: "Michael Chen",
    role: "Faculty",
    image: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    content: "As a faculty member, I appreciate how organized and efficient this platform is for managing lost and found items.",
  },
  {
    name: "Emily Rodriguez",
    role: "Student",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    content: "The real-time notifications and location-based search make it so easy to find lost items.",
  },
];

const features = [
  {
    icon: FaSearch,
    title: "Smart Search",
    description: "Find lost items quickly with our advanced search algorithm",
  },
  {
    icon: FaMapMarkerAlt,
    title: "Location Based",
    description: "Search for items in specific locations on campus",
  },
  {
    icon: FaBell,
    title: "Real-time Notifications",
    description: "Get instant updates when your lost item is found",
  },
  {
    icon: FaShieldAlt,
    title: "Secure Platform",
    description: "Your data is protected with enterprise-grade security",
  },
];

const MotionBox = motion(Box);

const LandingPage = () => {
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);
  }, []);

  const handleGetStarted = () => {
    if (isLoggedIn) {
      navigate('/recent');
    } else {
      navigate('/signup');
    }
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        bgGradient="linear(to-r, blue.400, blue.600)"
        color="white"
        py={20}
        position="relative"
        overflow="hidden"
      >
        <Container maxW="container.xl">
          <Flex
            direction={{ base: "column", md: "row" }}
            align="center"
            justify="space-between"
            gap={8}
          >
            <VStack align="start" spacing={6} flex={1}>
              <Heading
                as="h1"
                size="2xl"
                lineHeight="1.2"
                fontWeight="bold"
              >
                Find What You've Lost,<br />
                Help Others Find Theirs
              </Heading>
              <Text fontSize="xl" opacity={0.9}>
                Join our community to report lost items or help others find what they've lost.
                Sign in to view and manage items.
              </Text>
              <HStack spacing={4}>
                <Button
                  onClick={handleGetStarted}
                  size="lg"
                  colorScheme="whiteAlpha"
                  _hover={{ bg: "whiteAlpha.300" }}
                >
                  Get Started
                </Button>
              </HStack>
            </VStack>
            <Box flex={1} position="relative">
              <MotionBox
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                position="relative"
                transform="rotate(25deg)"
              >
                <Box
                  position="relative"
                  w="full"
                  h="full"
                  overflow="hidden"
                >
                  <Image
                    src="/landingPage-hero-image.png"
                    alt="Lost and Found Illustration"
                    maxW="110%"
                    h="auto"
                    transform="translateX(-5%)"
                    filter="drop-shadow(0 0 10px rgba(0,0,0,0.2))"
                  />
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    bg="radial-gradient(circle at center, transparent 60%, rgba(0,0,0,0.1) 100%)"
                    pointerEvents="none"
                  />
                </Box>
              </MotionBox>
            </Box>
          </Flex>
        </Container>
      </Box>

      {/* Features Section */}
      <Box py={20} bg={bgColor}>
        <Container maxW="container.xl">
          <VStack spacing={12}>
            <VStack spacing={4} textAlign="center">
              <Heading size="xl">How It Works</Heading>
              <Text fontSize="lg" color="gray.600" maxW="2xl">
                Our platform makes it easy to report lost items and help others find what they've lost
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
              {features.map((feature, index) => (
                <Box
                  key={index}
                  bg={cardBg}
                  p={6}
                  rounded="xl"
                  boxShadow="lg"
                  transition="all 0.3s"
                  _hover={{
                    transform: "translateY(-5px)",
                    boxShadow: "xl",
                  }}
                >
                  <Icon
                    as={feature.icon}
                    w={10}
                    h={10}
                    color="blue.500"
                    mb={4}
                  />
                  <Heading size="md" mb={2}>
                    {feature.title}
                  </Heading>
                  <Text color="gray.600">{feature.description}</Text>
                </Box>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box py={20}>
        <Container maxW="container.xl">
          <VStack spacing={12}>
            <VStack spacing={4} textAlign="center">
              <Heading size="xl">What Our Users Say</Heading>
              <Text fontSize="lg" color="gray.600" maxW="2xl">
                Join thousands of satisfied users who have found their lost items through our platform
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
              {testimonials.map((testimonial, index) => (
                <Box
                  key={index}
                  bg={cardBg}
                  p={6}
                  rounded="xl"
                  boxShadow="lg"
                  transition="all 0.3s"
                  _hover={{
                    transform: "translateY(-5px)",
                    boxShadow: "xl",
                  }}
                >
                  <VStack align="start" spacing={4}>
                    <HStack>
                      <Avatar src={testimonial.image} />
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="bold">{testimonial.name}</Text>
                        <Text fontSize="sm" color="gray.500">
                          {testimonial.role}
                        </Text>
                      </VStack>
                    </HStack>
                    <Text color="gray.600">{testimonial.content}</Text>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Contact Section */}
      <Box py={20} bg={bgColor}>
        <Container maxW="container.xl">
          <VStack spacing={12}>
            <VStack spacing={4} textAlign="center">
              <Heading size="xl">Contact Us</Heading>
              <Text fontSize="lg" color="gray.600" maxW="2xl">
                Have questions? We're here to help!
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} w="full">
              <Box
                bg={cardBg}
                p={6}
                rounded="xl"
                boxShadow="lg"
                textAlign="center"
              >
                <Heading size="md" mb={2}>
                  Email
                </Heading>
                <Text color="blue.500">support@lostfoundapp.com</Text>
              </Box>
              <Box
                bg={cardBg}
                p={6}
                rounded="xl"
                boxShadow="lg"
                textAlign="center"
              >
                <Heading size="md" mb={2}>
                  Phone
                </Heading>
                <Text color="blue.500">+1 (555) 123-4567</Text>
              </Box>
              <Box
                bg={cardBg}
                p={6}
                rounded="xl"
                boxShadow="lg"
                textAlign="center"
              >
                <Heading size="md" mb={2}>
                  Office Hours
                </Heading>
                <Text color="blue.500">Mon-Fri: 9AM - 5PM</Text>
              </Box>
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Footer */}
      <Box py={8} bg="gray.900" color="white">
        <Container maxW="container.xl">
          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align="center"
            gap={4}
          >
            <Text>© 2024 Lost & Found. All rights reserved.</Text>
            <HStack spacing={4}>
              <Button
                as={RouterLink}
                to="/faq"
                variant="link"
                color="white"
              >
                FAQ
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
