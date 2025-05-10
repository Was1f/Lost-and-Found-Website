import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  Icon,
  Stack,
  Text,
  useColorModeValue,
  CircularProgress,
  CircularProgressLabel,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUsers, 
  FiFileText, 
  FiActivity,
  FiFlag,
  FiClock,
  FiCalendar,
  FiServer
} from 'react-icons/fi';

const DashboardCard = ({ title, description, icon, onClick, colorScheme }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue(`${colorScheme}.100`, `${colorScheme}.800`);
  const iconBg = useColorModeValue(`${colorScheme}.100`, `${colorScheme}.800`);
  const hoverBg = useColorModeValue(`${colorScheme}.50`, `${colorScheme}.900`);
  
  return (
    <Box
      p={6}
      borderRadius="lg"
      boxShadow="md"
      bg={bgColor}
      borderLeft="4px solid"
      borderColor={borderColor}
      transition="all 0.3s"
      _hover={{ 
        transform: 'translateY(-4px)', 
        boxShadow: 'lg',
        bg: hoverBg
      }}
      cursor="pointer"
      onClick={onClick}
    >
      <Flex mb={4} align="center">
        <Box
          p={2}
          borderRadius="md"
          bg={iconBg}
          mr={4}
        >
          <Icon as={icon} boxSize={6} color={`${colorScheme}.500`} />
        </Box>
        <Heading size="md">{title}</Heading>
      </Flex>
      <Text color="gray.500">{description}</Text>
    </Box>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  
  // State for real-time clock
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemLoad, setSystemLoad] = useState(65); // This would be fetched from an API in production
  const [uptime, setUptime] = useState("23:47:12"); // This would be fetched from an API in production
  
  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(timer);
  }, []);
  
  // Format date and time
  const formattedTime = currentTime.toLocaleTimeString();
  const formattedDate = currentTime.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Hardcoding Admin Name for now
  const adminName = "Zidan"; // You can make this dynamic later from token if needed
  
  // Navigation functions
  const goToUserManagement = () => navigate('/admin/users');
  const goToPostManagement = () => navigate('/admin/posts');
  const goToHistoryManagement = () => navigate('/admin/history');
  const goToReportsManagement = () => navigate('/admin/reports');

  return (
    <Box bg={bgColor} minH="calc(100vh - 64px)" py={8}>
      <Container maxW="container.xl">
        <Stack spacing={8}>
          {/* Welcome Header */}
          <Box
            bg={useColorModeValue('white', 'gray.800')}
            p={6}
            borderRadius="lg"
            boxShadow="md"
          >
            <Heading size="lg" mb={2}>
              Welcome, {adminName}!
            </Heading>
            <Text color="gray.500">
              You are logged in as an Admin. Here you can review posts, manage users, 
              track history, and handle reports efficiently.
            </Text>
          </Box>

          {/* Admin Task Cards */}
          <Box>
            <Heading size="md" mb={4} px={2}>Admin Tasks</Heading>
            <Grid 
              templateColumns={{ 
                base: "1fr", 
                md: "repeat(2, 1fr)", 
                lg: "repeat(4, 1fr)" 
              }}
              gap={6}
            >
              <DashboardCard
                title="Manage Users"
                description="Review, add, edit, and manage user accounts and permissions."
                icon={FiUsers}
                colorScheme="blue"
                onClick={goToUserManagement}
              />
              
              <DashboardCard
                title="Manage Posts"
                description="Review, approve, edit, and delete user submitted content."
                icon={FiFileText}
                colorScheme="green"
                onClick={goToPostManagement}
              />
              
              <DashboardCard
                title="Edit History"
                description="View records of post edits and deletion history."
                icon={FiActivity}
                colorScheme="purple"
                onClick={goToHistoryManagement}
              />
              
              <DashboardCard
                title="User Reports"
                description="Review and handle flagged content and user reports."
                icon={FiFlag}
                colorScheme="red"
                onClick={goToReportsManagement}
              />
            </Grid>
          </Box>
          
          {/* Real-Time Dashboard Info */}
          <Box
            bg={useColorModeValue('white', 'gray.800')}
            p={6}
            borderRadius="lg"
            boxShadow="md"
          >
            <Heading size="md" mb={4}>System Information</Heading>
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6}>
              {/* Real-time Clock */}
              <Box 
                p={4} 
                borderRadius="lg" 
                bg={useColorModeValue('blue.50', 'blue.900')}
                boxShadow="sm"
              >
                <Flex align="center" mb={2}>
                  <Icon as={FiClock} mr={2} color="blue.500" />
                  <Text fontWeight="bold">Current Time</Text>
                </Flex>
                <Text fontSize="xl" fontWeight="semibold">{formattedTime}</Text>
                <Text fontSize="sm" color="gray.500" mt={1}>
                  <Icon as={FiCalendar} mr={1} />
                  {formattedDate}
                </Text>
              </Box>
              
              {/* System Load */}
              <Box 
                p={4} 
                borderRadius="lg" 
                bg={useColorModeValue('green.50', 'green.900')}
                boxShadow="sm"
              >
                <Flex align="center" mb={3}>
                  <Icon as={FiServer} mr={2} color="green.500" />
                  <Text fontWeight="bold">System Load</Text>
                </Flex>
                <Flex justify="center">
                  <CircularProgress value={systemLoad} color="green.400" size="80px">
                    <CircularProgressLabel>{systemLoad}%</CircularProgressLabel>
                  </CircularProgress>
                </Flex>
              </Box>
              
              {/* Active Session */}
              <Box 
                p={4} 
                borderRadius="lg" 
                bg={useColorModeValue('purple.50', 'purple.900')}
                boxShadow="sm"
              >
                <Stat>
                  <StatLabel>
                    <Flex align="center">
                      <Icon as={FiUsers} mr={2} color="purple.500" />
                      <Text fontWeight="bold">Active Session</Text>
                    </Flex>
                  </StatLabel>
                  <StatNumber>
                    {Math.floor(Math.random() * 20) + 1}
                  </StatNumber>
                  <StatHelpText>
                    Updated in real-time
                  </StatHelpText>
                </Stat>
              </Box>
              
              {/* System Uptime */}
              <Box 
                p={4} 
                borderRadius="lg" 
                bg={useColorModeValue('orange.50', 'orange.900')}
                boxShadow="sm"
              >
                <Stat>
                  <StatLabel>
                    <Flex align="center">
                      <Icon as={FiActivity} mr={2} color="orange.500" />
                      <Text fontWeight="bold">System Uptime</Text>
                    </Flex>
                  </StatLabel>
                  <StatNumber>{uptime}</StatNumber>
                  <StatHelpText>
                    Since last restart
                  </StatHelpText>
                </Stat>
              </Box>
            </Grid>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default Dashboard;