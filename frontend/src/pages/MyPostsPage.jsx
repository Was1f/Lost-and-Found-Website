import { 
  Box, 
  Heading, 
  VStack, 
  Text, 
  Button, 
  Image, 
  Badge, 
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Container,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  keyframes,
  useDisclosure,
  Avatar,
  Link,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid
} from "@chakra-ui/react";
import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { HamburgerIcon, DeleteIcon } from '@chakra-ui/icons';
import { FaSearch, FaRegClock, FaRegSadTear, FaRegSmile } from 'react-icons/fa';
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

const MyPostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null); 
  const [userProfile, setUserProfile] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    lost: 0,
    found: 0
  });
  const token = localStorage.getItem("authToken");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/posts/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Sort posts by createdAt descending (most recent first)
        const sortedPosts = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setPosts(sortedPosts);
        setFilteredPosts(sortedPosts);

        // Calculate stats
        const stats = {
          total: sortedPosts.length,
          lost: sortedPosts.filter(post => post.status === 'lost').length,
          found: sortedPosts.filter(post => post.status === 'found').length
        };
        setStats(stats);
        
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch user posts", error);
        setLoading(false);
      }
    };

    const fetchUserProfile = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/userprofile/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserProfile(response.data);
      } catch (error) {
        console.error("Failed to fetch user profile", error);
      }
    };

    if (token) {
      fetchUserPosts();
      fetchUserProfile();
    } else {
      navigate("/login");
    }
  }, [token, navigate]);

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

  // Handle Delete Post
  const handleDelete = async () => {
    try {
      if (!selectedPost || !selectedPost._id) {
        console.error("No post selected for deletion");
        return;
      }
      
      const response = await axios.delete(
        `http://localhost:5000/api/posts/${selectedPost._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setPosts(posts.filter(post => post._id !== selectedPost._id));
      setFilteredPosts(filteredPosts.filter(post => post._id !== selectedPost._id));
      onClose();
      setSelectedPost(null);
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const openDeleteDialog = (post) => {
    setSelectedPost(post);
    onOpen();
  };

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

              {/* Stats Card */}
              <Box 
                bg="white" 
                p={6} 
                rounded="xl" 
                boxShadow="lg"
                borderTop="4px solid"
                borderColor="blue.500"
              >
                <Heading size="md" mb={4} color="gray.700">Post Statistics</Heading>
                <SimpleGrid columns={1} spacing={4}>
                  <Stat>
                    <StatLabel color="gray.600">Total Posts</StatLabel>
                    <StatNumber color="blue.500">{stats.total}</StatNumber>
                    <StatHelpText>
                      <FaRegClock color="#3182ce" /> All time
                    </StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel color="gray.600">Lost Items</StatLabel>
                    <StatNumber color="red.500">{stats.lost}</StatNumber>
                    <StatHelpText>
                      <FaRegSadTear color="#e53e3e" /> Items you're looking for
                    </StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel color="gray.600">Found Items</StatLabel>
                    <StatNumber color="green.500">{stats.found}</StatNumber>
                    <StatHelpText>
                      <FaRegSmile color="#38a169" /> Items you've found
                    </StatHelpText>
                  </Stat>
                </SimpleGrid>
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
        My Posts
      </Heading>
              </Box>
            </Flex>

            <Tabs variant="enclosed" colorScheme="blue" mb={6}>
              <TabList>
                <Tab>All Posts</Tab>
                <Tab>Lost Items</Tab>
                <Tab>Found Items</Tab>
              </TabList>

              <TabPanels>
                <TabPanel px={0}>
                  <InputGroup size="lg" mb={6}>
                    <InputLeftElement pointerEvents="none">
                      <FaSearch color="gray.300" />
                    </InputLeftElement>
                    <Input
                      placeholder="Search your posts..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      bg="white"
                      borderColor="gray.200"
                      _hover={{ borderColor: "blue.400" }}
                      _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)" }}
                    />
                  </InputGroup>
      
      {loading ? (
        <Text>Loading your posts...</Text>
      ) : (
        <VStack spacing={4} align="stretch">
                      {filteredPosts.length > 0 ? (
                        filteredPosts.map((post) => (
                          <Box 
                            key={post._id} 
                            borderWidth={1} 
                            borderRadius="md" 
                            p={4} 
                            mb={4}
                            transition="all 0.3s ease"
                            _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                            borderLeft="4px solid"
                            borderColor={post.status === "lost" ? "red.500" : "green.500"}
                          >
                <HStack spacing={6} align="start">
                  <Image
                    src={`http://localhost:5000${post.image}`}
                    alt={post.title}
                    boxSize="250px"
                    objectFit="cover"
                    borderRadius="md"
                                transition="all 0.3s ease"
                                _hover={{ transform: 'scale(1.05)' }}
                  />

                  <Box flex="1">
                    <HStack justify="space-between" align="center">
                      <Text fontSize="sm" color="gray.500" mb={2}>
                                    Posted on: {new Date(post.createdAt).toLocaleString()}
                      </Text>

                      <Menu>
                        <MenuButton 
                          as={IconButton} 
                          icon={<HamburgerIcon />} 
                          variant="ghost" 
                          aria-label="Options" 
                          size="sm"
                        />
                        <MenuList>
                          <MenuItem 
                            icon={<DeleteIcon color="red.500" />}
                            onClick={() => openDeleteDialog(post)}
                          >
                            Delete
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </HStack>

                    <Heading as="h3" size="md" fontWeight="bold" mb={2}>
                      {post.title}
                    </Heading>

                    <Badge
                      colorScheme={post.status === "lost" ? "red" : "green"}
                      fontSize="md"
                      p={2}
                      borderRadius="full"
                      textTransform="uppercase"
                      fontWeight="bold"
                      mb={4}
                    >
                      {post.status.toUpperCase()}
                    </Badge>

                    <Text fontSize="sm" color="blue.500" fontWeight="medium" mb={2}>
                      Location: {post.location}
                    </Text>

                    <Text
                      mb={4}
                      style={{
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                                    WebkitLineClamp: "2",
                      }}
                    >
                      {post.description}
                    </Text>

                    <HStack spacing={4}>
                      <Button
                        colorScheme="blue"
                        onClick={() => navigate(`/post/${post._id}`)}
                                    _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
                      >
                        View Details
                      </Button>

                      <Button
                        colorScheme="teal"
                        onClick={() => navigate(`/edit-post/${post._id}`)}
                                    _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
                      >
                        Edit
                      </Button>
                    </HStack>
                  </Box>
                </HStack>
              </Box>
            ))
          ) : (
                        <Box 
                          textAlign="center" 
                          py={12} 
                          bg="gray.50" 
                          borderRadius="lg"
                          borderWidth={1}
                          borderStyle="dashed"
                          borderColor="gray.200"
                        >
                          <Text fontSize="xl" color="gray.500" mb={2}>
                            {searchQuery ? "No posts match your search" : "No posts available"}
                          </Text>
                          <Text color="gray.400" fontSize="md">
                            {searchQuery ? "Try different search terms" : "Start by creating your first post"}
                          </Text>
                          {!searchQuery && (
                            <Button
                              mt={4}
                              colorScheme="blue"
                              onClick={() => navigate('/create-post')}
                              _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
                            >
                              Create New Post
                            </Button>
                          )}
                        </Box>
          )}
        </VStack>
      )}
                </TabPanel>

                <TabPanel px={0}>
                  <VStack spacing={4} align="stretch">
                    {posts.filter(post => post.status === 'lost').map((post) => (
                      <Box 
                        key={post._id} 
                        borderWidth={1} 
                        borderRadius="md" 
                        p={4} 
                        mb={4}
                        transition="all 0.3s ease"
                        _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                        borderLeft="4px solid"
                        borderColor="red.500"
                      >
                        <HStack spacing={6} align="start">
                          <Image
                            src={`http://localhost:5000${post.image}`}
                            alt={post.title}
                            boxSize="250px"
                            objectFit="cover"
                            borderRadius="md"
                            transition="all 0.3s ease"
                            _hover={{ transform: 'scale(1.05)' }}
                          />

                          <Box flex="1">
                            <HStack justify="space-between" align="center">
                              <Text fontSize="sm" color="gray.500" mb={2}>
                                Posted on: {new Date(post.createdAt).toLocaleString()}
                              </Text>

                              <Menu>
                                <MenuButton 
                                  as={IconButton} 
                                  icon={<HamburgerIcon />} 
                                  variant="ghost" 
                                  aria-label="Options" 
                                  size="sm"
                                />
                                <MenuList>
                                  <MenuItem 
                                    icon={<DeleteIcon color="red.500" />}
                                    onClick={() => openDeleteDialog(post)}
                                  >
                                    Delete
                                  </MenuItem>
                                </MenuList>
                              </Menu>
                            </HStack>

                            <Heading as="h3" size="md" fontWeight="bold" mb={2}>
                              {post.title}
                            </Heading>

                            <Badge
                              colorScheme="red"
                              fontSize="md"
                              p={2}
                              borderRadius="full"
                              textTransform="uppercase"
                              fontWeight="bold"
                              mb={4}
                            >
                              Lost
                            </Badge>

                            <Text fontSize="sm" color="blue.500" fontWeight="medium" mb={2}>
                              Location: {post.location}
                            </Text>

                            <Text
                              mb={4}
                              style={{
                                display: "-webkit-box",
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                WebkitLineClamp: "2",
                              }}
                            >
                              {post.description}
                            </Text>

                            <HStack spacing={4}>
                              <Button
                                colorScheme="blue"
                                onClick={() => navigate(`/post/${post._id}`)}
                                _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
                              >
                                View Details
                              </Button>

                              <Button
                                colorScheme="teal"
                                onClick={() => navigate(`/edit-post/${post._id}`)}
                                _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
                              >
                                Edit
                              </Button>
                            </HStack>
                          </Box>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                </TabPanel>

                <TabPanel px={0}>
                  <VStack spacing={4} align="stretch">
                    {posts.filter(post => post.status === 'found').map((post) => (
                      <Box 
                        key={post._id} 
                        borderWidth={1} 
                        borderRadius="md" 
                        p={4} 
                        mb={4}
                        transition="all 0.3s ease"
                        _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                        borderLeft="4px solid"
                        borderColor="green.500"
                      >
                        <HStack spacing={6} align="start">
                          <Image
                            src={`http://localhost:5000${post.image}`}
                            alt={post.title}
                            boxSize="250px"
                            objectFit="cover"
                            borderRadius="md"
                            transition="all 0.3s ease"
                            _hover={{ transform: 'scale(1.05)' }}
                          />

                          <Box flex="1">
                            <HStack justify="space-between" align="center">
                              <Text fontSize="sm" color="gray.500" mb={2}>
                                Posted on: {new Date(post.createdAt).toLocaleString()}
                              </Text>

                              <Menu>
                                <MenuButton 
                                  as={IconButton} 
                                  icon={<HamburgerIcon />} 
                                  variant="ghost" 
                                  aria-label="Options" 
                                  size="sm"
                                />
                                <MenuList>
                                  <MenuItem 
                                    icon={<DeleteIcon color="red.500" />}
                                    onClick={() => openDeleteDialog(post)}
                                  >
                                    Delete
                                  </MenuItem>
                                </MenuList>
                              </Menu>
                            </HStack>

                            <Heading as="h3" size="md" fontWeight="bold" mb={2}>
                              {post.title}
                            </Heading>

                            <Badge
                              colorScheme="green"
                              fontSize="md"
                              p={2}
                              borderRadius="full"
                              textTransform="uppercase"
                              fontWeight="bold"
                              mb={4}
                            >
                              Found
                            </Badge>

                            <Text fontSize="sm" color="blue.500" fontWeight="medium" mb={2}>
                              Location: {post.location}
                            </Text>

                            <Text
                              mb={4}
                              style={{
                                display: "-webkit-box",
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                WebkitLineClamp: "2",
                              }}
                            >
                              {post.description}
                            </Text>

                            <HStack spacing={4}>
                              <Button
                                colorScheme="blue"
                                onClick={() => navigate(`/post/${post._id}`)}
                                _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
                              >
                                View Details
                              </Button>

                              <Button
                                colorScheme="teal"
                                onClick={() => navigate(`/edit-post/${post._id}`)}
                                _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
                              >
                                Edit
                              </Button>
                            </HStack>
                          </Box>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </Box>
      </Flex>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Post
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this post? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
};

export default MyPostsPage;