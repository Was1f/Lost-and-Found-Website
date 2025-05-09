import { Box, Heading, VStack, Text, Button, Image, Badge, HStack, Flex, Avatar, Link, Container, Divider, keyframes, Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { FaMapMarkerAlt, FaCalendarAlt, FaUser, FaSearch, FaMedal } from "react-icons/fa";
import debounce from 'lodash/debounce';

// Define keyframes for animations
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const RecentPostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [topUsers, setTopUsers] = useState([]);
  const navigate = useNavigate();

  // Fetch recent posts and user profile
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/posts/recent");
        console.log(response.data);
        setPosts(response.data);
        setFilteredPosts(response.data);
      } catch (error) {
        console.error("Failed to fetch posts", error);
      }
    };

    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (token) {
          const response = await axios.get("http://localhost:5000/api/userprofile/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUserProfile(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch user profile", error);
      }
    };

    const fetchTopUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/leaderboard");
        setTopUsers(response.data.slice(0, 3)); // Get top 3 users
      } catch (error) {
        console.error("Failed to fetch top users", error);
      }
    };

    fetchPosts();
    fetchUserProfile();
    fetchTopUsers();
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query) => {
      if (!query.trim()) {
        setFilteredPosts(posts);
        return;
      }

      const searchLower = query.toLowerCase();
      const filtered = posts.filter((post) => {
        return (
          post.title.toLowerCase().includes(searchLower) ||
          post.description.toLowerCase().includes(searchLower) ||
          post.location.toLowerCase().includes(searchLower)
        );
      });
      setFilteredPosts(filtered);
    }, 300),
    [posts]
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const isAdmin = userProfile?.email === 'zidan@gmail.com';

  return (
    <Container maxW="1400px" py={8}>
      <Flex gap={8}>
        {/* Profile Section */}
        {userProfile && (
          <Box w="320px" position="sticky" top="100px">
            <VStack spacing={4} align="stretch">
              {/* Profile Card */}
              <VStack 
                spacing={0} 
                align="center" 
                bg="white" 
                boxShadow="lg" 
                rounded="xl" 
                overflow="hidden"
                transition="all 0.3s ease"
                _hover={{ transform: 'translateY(-5px)', boxShadow: '2xl' }}
              >
                {/* Cover Photo */}
                <Box 
                  w="100%" 
                  h="180px" 
                  position="relative" 
                  mt={2}
                  overflow="hidden"
                >
                  {userProfile.coverPic ? (
                    <Image
                      src={`http://localhost:5000/${userProfile.coverPic}`}
                      alt="Cover"
                      w="100%"
                      h="100%"
                      objectFit="cover"
                      transition="all 0.5s ease"
                      _hover={{ transform: 'scale(1.1)' }}
                    />
                  ) : (
                    <Box
                      w="100%"
                      h="100%"
                      bgGradient="linear(to-r, blue.400, purple.500)"
                      animation={`${pulse} 3s infinite ease-in-out`}
                    />
                  )}
                </Box>

                {/* Profile Content */}
                <VStack spacing={4} align="center" p={6} w="100%" bg="white">
                  <Box 
                    mt="-70px" 
                    position="relative"
                    animation={`${float} 3s infinite ease-in-out`}
                  >
                    {userProfile.profilePic ? (
                      <Image
                        src={`http://localhost:5000/${userProfile.profilePic}`}
                        alt={userProfile.username}
                        boxSize="120px"
                        borderRadius="full"
                        objectFit="cover"
                        border="4px solid white"
                        boxShadow="lg"
                        transition="all 0.3s ease"
                        _hover={{ transform: 'scale(1.1)', boxShadow: '2xl' }}
                      />
                    ) : (
                      <Avatar
                        size="2xl"
                        name={userProfile.username}
                        border="4px solid white"
                        boxShadow="lg"
                        transition="all 0.3s ease"
                        _hover={{ transform: 'scale(1.1)', boxShadow: '2xl' }}
                      />
                    )}
                  </Box>
                  <Link 
                    onClick={() => navigate('/profile')}
                    _hover={{ textDecoration: 'none' }}
                  >
                    <Heading 
                      as="h3" 
                      size="lg" 
                      textAlign="center" 
                      cursor="pointer" 
                      color="gray.700"
                      transition="all 0.3s ease"
                      _hover={{ color: 'blue.500', transform: 'scale(1.05)' }}
                    >
                      {userProfile.username}
                    </Heading>
                  </Link>
                  <Text 
                    fontSize="md" 
                    color="gray.600" 
                    textAlign="center" 
                    px={4}
                    transition="all 0.3s ease"
                    _hover={{ color: 'gray.800' }}
                  >
                    {userProfile.bio || "No bio yet"}
                  </Text>
                  <Divider my={2} />
                  <Button
                    colorScheme="blue"
                    variant="solid"
                    size="md"
                    width="full"
                    onClick={() => navigate('/profile')}
                    _hover={{ 
                      transform: 'translateY(-2px) scale(1.02)', 
                      boxShadow: 'lg',
                      bg: 'blue.600'
                    }}
                    transition="all 0.3s ease"
                  >
                    View Profile
                  </Button>
                </VStack>
              </VStack>

              {/* Leaderboard Card */}
              <Box 
                bg="white" 
                p={6} 
                rounded="xl" 
                boxShadow="lg"
                borderTop="4px solid"
                borderColor="yellow.400"
                transition="all 0.3s ease"
                _hover={{ 
                  transform: 'translateY(-5px)', 
                  boxShadow: '2xl',
                  bg: 'gray.50'
                }}
              >
                <Heading size="md" mb={4} color="gray.700" display="flex" alignItems="center" gap={2}>
                  <FaMedal color="#F6E05E" /> Top Contributors
                </Heading>
                <VStack spacing={4} align="stretch">
                  {topUsers.map((user, index) => (
                    <HStack 
                      key={user._id} 
                      p={3} 
                      bg="gray.50" 
                      rounded="lg"
                      transition="all 0.3s ease"
                      _hover={{ transform: 'translateX(5px)', bg: 'gray.100' }}
                      cursor="pointer"
                      onClick={() => {
                        // If the clicked user is the current user, go to profile page
                        // Otherwise, go to the user's profile page
                        if (userProfile && user._id === userProfile._id) {
                          navigate('/profile');
                        } else {
                          navigate(`/visituserprofile/${user._id}`);
                        }
                      }}
                    >
                      <Box 
                        w="30px" 
                        h="30px" 
                        rounded="full" 
                        display="flex" 
                        alignItems="center" 
                        justifyContent="center"
                        bg={index === 0 ? "yellow.400" : index === 1 ? "gray.400" : "orange.600"}
                        color="white"
                        fontWeight="bold"
                      >
                        {index + 1}
                      </Box>
                      <Avatar 
                        size="sm" 
                        name={user.username}
                        src={user.profilePic ? `http://localhost:5000/${user.profilePic}` : undefined}
                      />
                      <Box flex="1">
                        <Text fontWeight="bold" fontSize="sm" noOfLines={1}>
                          {user.username}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {user.points} points
                        </Text>
                      </Box>
                    </HStack>
                  ))}
                </VStack>
                <Button
                  mt={4}
                  size="sm"
                  colorScheme="yellow"
                  variant="outline"
                  width="full"
                  onClick={() => navigate('/leaderboard')}
                  _hover={{ 
                    transform: 'translateY(-2px)', 
                    boxShadow: 'md',
                    bg: 'yellow.50'
                  }}
                >
                  View Full Leaderboard
                </Button>
              </Box>
            </VStack>
          </Box>
        )}

        {/* Main Content */}
        <Box flex="1">
          <Box 
            bg="white" 
            boxShadow="lg" 
            rounded="xl" 
            p={6} 
            mb={6}
            position="relative"
            overflow="hidden"
            _before={{
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "3px",
              background: "linear-gradient(90deg, #3182ce, #805ad5)",
            }}
          >
            <Flex align="center" mb={4}>
              <Box
                p={2}
                bg="blue.50"
                borderRadius="full"
                mr={3}
                animation={`${pulse} 2s infinite ease-in-out`}
              >
                <FaSearch size="20px" color="#3182ce" />
              </Box>
              <Box flex="1">
                <Heading 
                  as="h2" 
                  size="lg" 
                  bgGradient="linear(to-r, blue.500, purple.500)"
                  bgClip="text"
                  fontWeight="bold"
                >
                  Recent Posts
                </Heading>
                <Text 
                  color="gray.500" 
                  fontSize="md"
                  mt={0.5}
                >
                  Discover the latest lost and found items in your area
                </Text>
              </Box>
            </Flex>

            {/* Search Input */}
            <InputGroup size="md" mt={4}>
              <InputLeftElement pointerEvents="none">
                <FaSearch color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Search by title, description, or location..."
                value={searchQuery}
                onChange={handleSearchChange}
                bg="gray.50"
                border="1px"
                borderColor="gray.200"
                _hover={{ borderColor: "gray.300" }}
                _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                transition="all 0.2s"
              />
            </InputGroup>
          </Box>

          <VStack spacing={6} align="stretch">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <Box 
                  key={post._id} 
                  bg="white" 
                  boxShadow="md" 
                  rounded="xl" 
                  overflow="hidden"
                  transition="all 0.3s ease"
                  _hover={{ 
                    transform: 'translateY(-5px) scale(1.01)', 
                    boxShadow: '2xl',
                    bg: 'gray.50'
                  }}
                >
                  <HStack spacing={6} align="start" p={6}>
                    {/* Item Image */}
                    <Image
                      src={`http://localhost:5000${post.image}`}
                      alt={post.title}
                      boxSize="280px"
                      objectFit="cover"
                      borderRadius="lg"
                      transition="all 0.5s ease"
                      _hover={{ transform: 'scale(1.05)' }}
                    />

                    {/* Post Details */}
                    <Box flex="1">
                      <HStack spacing={3} mb={3}>
                        <Badge
                          colorScheme={post.status === "lost" ? "red" : "green"}
                          fontSize="sm"
                          px={3}
                          py={1}
                          borderRadius="full"
                          textTransform="uppercase"
                          fontWeight="bold"
                          transition="all 0.3s ease"
                          _hover={{ transform: 'scale(1.05)' }}
                        >
                          {post.status.toUpperCase()}
                        </Badge>
                        <Text 
                          fontSize="sm" 
                          color="gray.500"
                          transition="all 0.3s ease"
                          _hover={{ color: 'gray.700' }}
                        >
                          Posted {new Date(post.createdAt).toLocaleDateString()}
                        </Text>
                      </HStack>

                      <Heading 
                        as="h3" 
                        size="lg" 
                        fontWeight="bold" 
                        mb={3} 
                        color="gray.700"
                        transition="all 0.3s ease"
                        _hover={{ color: 'blue.500' }}
                      >
                        {post.title}
                      </Heading>

                      <Text
                        mb={4}
                        color="gray.600"
                        fontSize="md"
                        style={{
                          display: "-webkit-box",
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          WebkitLineClamp: "2",
                        }}
                        transition="all 0.3s ease"
                        _hover={{ color: 'gray.800' }}
                      >
                        {post.description}
                      </Text>

                      <HStack spacing={4} mb={6}>
                        <HStack 
                          transition="all 0.3s ease"
                          _hover={{ transform: 'translateX(5px)' }}
                        >
                          <FaMapMarkerAlt color="#3182CE" />
                          <Text color="blue.500" fontWeight="medium">
                            {post.location}
                          </Text>
                        </HStack>
                        <HStack 
                          transition="all 0.3s ease"
                          _hover={{ transform: 'translateX(5px)' }}
                        >
                          <FaUser color="#718096" />
                          <Text color="gray.500">
                            {post.user && post.user.email ? post.user.email : "Anonymous"}
                          </Text>
                        </HStack>
                      </HStack>

                      <Button
                        colorScheme="blue"
                        size="md"
                        onClick={() => navigate(`/post/${post._id}`)}
                        _hover={{ 
                          transform: 'translateY(-2px) scale(1.05)', 
                          boxShadow: 'lg',
                          bg: 'blue.600'
                        }}
                        transition="all 0.3s ease"
                      >
                        View Details
                      </Button>
                    </Box>
                  </HStack>
                </Box>
              ))
            ) : (
              <Box 
                bg="white" 
                boxShadow="md" 
                rounded="xl" 
                p={8} 
                textAlign="center"
                transition="all 0.3s ease"
                _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
              >
                <Text 
                  fontSize="lg" 
                  color="gray.500"
                  transition="all 0.3s ease"
                  _hover={{ color: 'gray.700' }}
                >
                  {searchQuery ? "No posts found matching your search" : "No recent posts available"}
                </Text>
              </Box>
            )}
          </VStack>
        </Box>
      </Flex>
    </Container>
  );
};

export default RecentPostsPage;