import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Button,
  Badge,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  useToast,
  IconButton,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Avatar,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Stat,
  StatLabel,
  StatNumber,
  Divider,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Select,
  HStack,
  AvatarBadge,
  Tag,
  TagLabel,
  Tooltip,
  Skeleton,
  SkeletonCircle,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerFooter,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Wrap,
  WrapItem,
  Spinner,
  ButtonGroup,
  useColorModeValue,
  Center,
  Grid,
  GridItem,
  Stack,
} from '@chakra-ui/react';

import {
  SearchIcon,
  DeleteIcon,
  CheckIcon,
  ViewIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EmailIcon,
  InfoIcon,
  TimeIcon,
  StarIcon,
  WarningIcon,
} from '@chakra-ui/icons';

import { FaSortAmountDown, FaSortAmountUp, FaUserAlt, FaCalendarAlt, FaFilter, FaCheck, FaBan, FaEye, FaEdit, FaUserGraduate } from 'react-icons/fa';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [userStatsLoading, setUserStatsLoading] = useState(false);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const drawerDisclosure = useDisclosure();
  
  const toast = useToast();
  const searchInputRef = useRef(null);
  
  // Color schemes
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const activeBadgeBg = useColorModeValue('green.100', 'green.800');
  const activeBadgeColor = useColorModeValue('green.800', 'green.200');
  const bannedBadgeBg = useColorModeValue('red.100', 'red.800');
  const bannedBadgeColor = useColorModeValue('red.800', 'red.200');
  
  useEffect(() => {
    fetchUsers();
  }, [page, statusFilter, sortBy, sortOrder]);
  
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Build query params for API request
      const queryParams = new URLSearchParams({
        page,
        limit: 12,
        sort: sortBy,
        order: sortOrder
      });
      
      if (statusFilter !== 'all') {
        queryParams.append('status', statusFilter);
      }
      
      if (searchTerm.trim()) {
        queryParams.append('search', searchTerm);
      }
      
      const response = await fetch(
        `http://localhost:5000/api/admin/users?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users || []);
      setPagination(data.pagination || { total: 0, pages: 1 });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        isClosable: true,
      });
      setUsers([]);
      setPagination({ total: 0, pages: 1 });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchUserDetails = async (userId) => {
    setUserStatsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch user details');
      
      const data = await response.json();
      setUserDetails(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not fetch user details',
        status: 'error',
        isClosable: true,
      });
    } finally {
      setUserStatsLoading(false);
    }
  };
  
  const handleUserClick = (user) => {
    setSelectedUser(user);
    fetchUserDetails(user._id);
    drawerDisclosure.onOpen();
  };

  const handleBanUnbanUser = async (id, currentStatus) => {
    const isBanned = currentStatus === 'banned';
    const confirm = window.confirm(
      isBanned 
        ? "Activate this user? They will regain access to the platform."
        : "Ban this user? They will lose access to the platform."
    );
    if (!confirm) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/users/${id}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
          body: JSON.stringify({
            status: isBanned ? 'active' : 'banned'
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user status');
      }

      const data = await response.json();
      toast({
        title: isBanned ? 'User Activated' : 'User Banned',
        description: data.message,
        status: 'success',
        isClosable: true,
        position: 'top-right',
      });

      // Update the user status in our lists
      setUsers(users.map((user) => 
        user._id === id ? { ...user, status: isBanned ? 'active' : 'banned' } : user
      ));
      
      // Update the selected user if it's the same one
      if (selectedUser && selectedUser._id === id) {
        setSelectedUser({ ...selectedUser, status: isBanned ? 'active' : 'banned' });
      }
      
      // Update user details if loaded for the same user
      if (userDetails && userDetails.user._id === id) {
        setUserDetails({
          ...userDetails,
          user: { ...userDetails.user, status: isBanned ? 'active' : 'banned' }
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        isClosable: true,
      });
    }
  };

  const handleDeleteUser = async (id) => {
    const confirm = window.confirm(
      "Are you sure you want to permanently delete this user? This action cannot be undone and will remove all associated data."
    );
    if (!confirm) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/users/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete user');
      }

      const data = await response.json();
      toast({
        title: 'User Deleted',
        description: data.message,
        status: 'success',
        isClosable: true,
        position: 'top-right',
      });

      // Remove deleted user from state
      setUsers(users.filter((user) => user._id !== id));
      
      // Close the drawer if this was the selected user
      if (selectedUser && selectedUser._id === id) {
        drawerDisclosure.onClose();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        isClosable: true,
      });
    }
  };
  
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1); // Reset to first page when changing filters
  };
  
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(1); // Reset to first page when changing sort
  };
  
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    setPage(1); // Reset to first page when changing sort order
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };
  
  const clearSearch = () => {
    setSearchTerm('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
    fetchUsers();
  };
  
  const nextPage = () => {
    if (pagination && page < pagination.pages) {
      setPage(page + 1);
    }
  };
  
  const prevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  // Loading skeleton for user cards
  const renderSkeletons = () => {
    return Array(8).fill(0).map((_, index) => (
      <Box 
        key={index} 
        bg={cardBg} 
        borderRadius="lg" 
        overflow="hidden" 
        borderWidth="1px"
        borderColor={borderColor}
        boxShadow="md"
      >
        <Flex p={2} direction="column" align="center">
          <SkeletonCircle size="40px" mb={2} />
          <Skeleton height="10px" width="75px" mb={1} />
          <Skeleton height="15px" width="60px" mb={1} />
          <Skeleton height="5px" width="40px" mb={1.5} />
          <Skeleton height="15px" width="100%" mb={2} />
          <Skeleton height="15px" width="50%" />
        </Flex>
      </Box>
    ));
  };

  return (
    <Box p={5} bg="gray.50" minH="100vh">
      {/* Header */}
      <Box mb={8} maxW="1400px" mx="auto">
        <Heading as="h1" size="xl" mb={2}>
          <Flex align="center">
            <FaUserAlt style={{ marginRight: '12px' }} />
            User Management
          </Flex>
        </Heading>
        <Text color="gray.600">
          Manage users, control access, and monitor activity
        </Text>
      </Box>
      
      {/* Filters and Search */}
      <Box 
        mb={6} 
        p={4} 
        bg={cardBg} 
        borderRadius="lg" 
        boxShadow="sm"
        maxW="1400px" 
        mx="auto"
      >
        <Flex 
          direction={{ base: "column", md: "row" }} 
          justify="space-between" 
          align={{ base: "stretch", md: "center" }}
          gap={4}
        >
          <HStack spacing={4} wrap="wrap">
            <Box>
              <HStack>
                <FaFilter />
                <Select 
                  value={statusFilter} 
                  onChange={handleStatusFilterChange}
                  size="md"
                  w="150px"
                >
                  <option value="all">All Users</option>
                  <option value="active">Active Only</option>
                  <option value="banned">Banned Only</option>
                </Select>
              </HStack>
            </Box>
            
            <Box>
              <HStack>
                {sortOrder === 'desc' ? <FaSortAmountDown /> : <FaSortAmountUp />}
                <Select 
                  value={sortBy} 
                  onChange={handleSortChange}
                  size="md"
                  w="150px"
                >
                  <option value="createdAt">Join Date</option>
                  <option value="username">Username</option>
                  <option value="email">Email</option>
                </Select>
                <IconButton
                  icon={sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
                  onClick={toggleSortOrder}
                  aria-label="Toggle sort order"
                  variant="ghost"
                  colorScheme="blue"
                />
              </HStack>
            </Box>
          </HStack>
          
          <form onSubmit={handleSearch}>
            <InputGroup maxW="300px">
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={handleSearchChange}
                ref={searchInputRef}
                borderRadius="full"
                bg="white"
              />
              {searchTerm && (
                <Button
                  position="absolute"
                  right="0"
                  borderLeftRadius={0}
                  borderRightRadius="full"
                  colorScheme="blue"
                  type="submit"
                  zIndex={1}
                >
                  Search
                </Button>
              )}
            </InputGroup>
          </form>
        </Flex>
      </Box>
      
      {/* Stats Summary */}
      <Box mb={6} maxW="1400px" mx="auto">
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
          <Box 
            bg="white"
            p={4}
            borderRadius="lg"
            boxShadow="sm"
            borderLeft="4px solid"
            borderColor="blue.400"
          >
            <Flex justify="space-between" align="center">
              <Box>
                <Text color="gray.500" fontSize="sm">Total Users</Text>
                <Heading size="lg">{pagination?.total || 0}</Heading>
              </Box>
              <Box
                p={2}
                borderRadius="full"
                bg="blue.100"
                color="blue.700"
              >
                <FaUserAlt size="20px" />
              </Box>
            </Flex>
          </Box>
          
          <Box 
            bg="white"
            p={4}
            borderRadius="lg"
            boxShadow="sm"
            borderLeft="4px solid"
            borderColor="green.400"
          >
            <Flex justify="space-between" align="center">
              <Box>
                <Text color="gray.500" fontSize="sm">Active Users</Text>
                <Heading size="lg">{users?.filter(u => u.status === 'active')?.length || 0}</Heading>
              </Box>
              <Box
                p={2}
                borderRadius="full"
                bg="green.100"
                color="green.700"
              >
                <FaCheck size="20px" />
              </Box>
            </Flex>
          </Box>
          
          <Box 
            bg="white"
            p={4}
            borderRadius="lg"
            boxShadow="sm"
            borderLeft="4px solid"
            borderColor="red.400"
          >
            <Flex justify="space-between" align="center">
              <Box>
                <Text color="gray.500" fontSize="sm">Banned Users</Text>
                <Heading size="lg">{users?.filter(u => u.status === 'banned')?.length || 0}</Heading>
              </Box>
              <Box
                p={2}
                borderRadius="full"
                bg="red.100"
                color="red.700"
              >
                <FaBan size="20px" />
              </Box>
            </Flex>
          </Box>
        </SimpleGrid>
      </Box>
      
      {/* User Grid - Instagram Style */}
      <Box maxW="1400px" mx="auto">
        <Flex justify="space-between" align="center" mb={4}>
          <Heading as="h2" size="lg">
            {statusFilter === 'all' 
              ? 'All Users' 
              : statusFilter === 'active' 
                ? 'Active Users' 
                : 'Banned Users'}
          </Heading>
          
          {pagination && (
            <HStack spacing={2}>
              <IconButton 
                icon={<ChevronLeftIcon />} 
                onClick={prevPage} 
                isDisabled={page <= 1}
                aria-label="Previous page"
              />
              <Text>
                Page {page} of {pagination.pages}
              </Text>
              <IconButton 
                icon={<ChevronRightIcon />} 
                onClick={nextPage} 
                isDisabled={!pagination || page >= pagination.pages}
                aria-label="Next page"
              />
            </HStack>
          )}
        </Flex>
        
        {loading ? (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
            {renderSkeletons()}
          </SimpleGrid>
        ) : users.length === 0 ? (
          <Center py={10} flexDirection="column" bg="white" borderRadius="lg" boxShadow="sm">
            <InfoIcon boxSize="50px" color="blue.400" mb={4} />
            <Heading size="md" mb={2}>No Users Found</Heading>
            <Text mb={4} textAlign="center" maxW="400px">
              {searchTerm 
                ? `No results match your search for "${searchTerm}"`
                : statusFilter !== 'all'
                  ? `No ${statusFilter} users found`
                  : 'No users in the system yet'}
            </Text>
            {searchTerm && (
              <Button onClick={clearSearch} colorScheme="blue">
                Clear Search
              </Button>
            )}
          </Center>
        ) : (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
            {users.map((user) => (
              <Box
                key={user._id}
                bg={cardBg}
                borderRadius="lg"
                overflow="hidden"
                borderWidth="1px"
                borderColor={user.status === 'banned' ? "red.200" : borderColor}
                boxShadow="md"
                transition="all 0.3s"
                _hover={{
                  transform: 'translateY(-5px)',
                  boxShadow: 'lg',
                  borderColor: user.status === 'banned' ? "red.300" : "blue.300",
                }}
              >
                {/* Instagram-style user card */}
                <Flex p={5} direction="column" align="center">
                  <Box position="relative" mb={4}>
                    <Avatar
                      size="xl"
                      name={user.username || user.email}
                      src={user.profilePic ? `http://localhost:5000${user.profilePic}` : undefined}
                      border="3px solid"
                      borderColor={user.status === 'banned' ? "red.400" : "blue.400"}
                    >
                      <AvatarBadge 
                        boxSize="0.8em" 
                        bg={user.status === 'active' ? "green.500" : "red.500"}
                        borderColor="white"
                        borderWidth="2px"
                      />
                    </Avatar>
                  </Box>
                  
                  <VStack spacing={1} align="center" mb={3}>
                    <Heading size="md" textAlign="center" noOfLines={1}>
                      {user.username || 'No Username'}
                    </Heading>
                    
                    <Text fontSize="sm" color="gray.500" noOfLines={1}>
                      {user.email}
                    </Text>
                    
                    <Badge
                      px={2}
                      py={1}
                      borderRadius="full"
                      textTransform="uppercase"
                      fontSize="xs"
                      fontWeight="bold"
                      bg={user.status === 'active' ? activeBadgeBg : bannedBadgeBg}
                      color={user.status === 'active' ? activeBadgeColor : bannedBadgeColor}
                    >
                      {user.status}
                    </Badge>
                  </VStack>
                  
                  <HStack fontSize="xs" color="gray.500" mb={4}>
                    <Flex align="center">
                      <FaUserGraduate style={{ marginRight: '4px' }} />
                      <Text>{user.studentId || 'N/A'}</Text>
                    </Flex>
                    <Text>•</Text>
                    <Flex align="center">
                      <FaCalendarAlt style={{ marginRight: '4px' }} />
                      <Text>{new Date(user.createdAt).toLocaleDateString()}</Text>
                    </Flex>
                  </HStack>
                  
                  <ButtonGroup size="sm" width="100%" isAttached variant="outline">
                    <Button
                      flex={1}
                      leftIcon={<FaEye />}
                      onClick={() => handleUserClick(user)}
                      colorScheme="blue"
                      variant="solid"
                    >
                      View
                    </Button>
                    <Button
                      flex={1}
                      leftIcon={user.status === 'banned' ? <FaCheck /> : <FaBan />}
                      onClick={() => handleBanUnbanUser(user._id, user.status)}
                      colorScheme={user.status === 'banned' ? "green" : "red"}
                      variant="solid"
                    >
                      {user.status === 'banned' ? 'Activate' : 'Ban'}
                    </Button>
                    <IconButton
                      aria-label="Delete user"
                      icon={<DeleteIcon />}
                      onClick={() => handleDeleteUser(user._id)}
                      colorScheme="red"
                      variant="solid"
                    />
                  </ButtonGroup>
                </Flex>
              </Box>
            ))}
          </SimpleGrid>
        )}
        
        {/* Pagination Controls */}
        {pagination && pagination.pages > 1 && (
       
          <Flex justify="center" mt={8}>
            <ButtonGroup isAttached variant="outline">
              <IconButton
                icon={<ChevronLeftIcon />}
                onClick={prevPage}
                isDisabled={page <= 1}
                aria-label="Previous page"
              />
              
              {/* Generate page buttons */}
              {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                .filter(pageNum => {
                  // Show first page, last page, current page, and pages around current
                  return pageNum === 1 || 
                         pageNum === pagination.pages || 
                         (pageNum >= page - 1 && pageNum <= page + 1);
                })
                .map((pageNum, index, array) => {
                  // Add ellipsis when there are gaps
                  const prevPage = array[index - 1];
                  const showEllipsisBefore = prevPage && pageNum - prevPage > 1;
                  
                  return (
                    <React.Fragment key={pageNum}>
                      {showEllipsisBefore && (
                        <Button isDisabled>...</Button>
                      )}
                      <Button
                        onClick={() => setPage(pageNum)}
                        colorScheme={pageNum === page ? "blue" : "gray"}
                        variant={pageNum === page ? "solid" : "outline"}
                      >
                        {pageNum}
                      </Button>
                    </React.Fragment>
                  );
                })}
              
              <IconButton
                icon={<ChevronRightIcon />}
                onClick={nextPage}
                isDisabled={!pagination || page >= pagination.pages}
                aria-label="Next page"
              />
            </ButtonGroup>
          </Flex>
        )}
      </Box>
      
      {/* User Detail Drawer */}
      <Drawer
        isOpen={drawerDisclosure.isOpen}
        placement="right"
        onClose={drawerDisclosure.onClose}
        size="md"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            User Profile
          </DrawerHeader>

          <DrawerBody p={0}>
            {selectedUser && (
              <Box>
                {/* User Header */}
                <Flex 
                  direction="column" 
                  align="center" 
                  p={6} 
                  borderBottomWidth="1px"
                  borderColor={borderColor}
                  bg={hoverBg}
                >
                  <Box position="relative" mb={4}>
                    <Avatar
                      size="2xl"
                      name={selectedUser.username || selectedUser.email}
                      src={selectedUser.profilePic ? `http://localhost:5000${selectedUser.profilePic}` : undefined}
                      border="4px solid"
                      borderColor={selectedUser.status === 'banned' ? "red.400" : "blue.400"}
                    >
                      <AvatarBadge 
                        boxSize="1.25em" 
                        bg={selectedUser.status === 'active' ? "green.500" : "red.500"}
                        borderColor="white"
                        borderWidth="2px"
                      />
                    </Avatar>
                  </Box>
                  
                  <Heading size="lg" mb={1}>{selectedUser.username || 'No Username'}</Heading>
                  <Text color="gray.600" mb={2}>{selectedUser.email}</Text>
                  
                  <Badge
                    px={3}
                    py={1}
                    borderRadius="full"
                    textTransform="uppercase"
                    fontSize="sm"
                    fontWeight="bold"
                    bg={selectedUser.status === 'active' ? activeBadgeBg : bannedBadgeBg}
                    color={selectedUser.status === 'active' ? activeBadgeColor : bannedBadgeColor}
                    mb={3}
                  >
                    {selectedUser.status}
                  </Badge>
                  
                  <Wrap spacing={2} justify="center">
                    <Tag size="md" colorScheme="blue" borderRadius="full">
                      <FaUserGraduate style={{ marginRight: '8px' }} />
                      <TagLabel>ID: {selectedUser.studentId || 'N/A'}</TagLabel>
                    </Tag>
                    <Tag size="md" colorScheme="purple" borderRadius="full">
                      <TimeIcon mr={2} />
                      <TagLabel>Joined: {new Date(selectedUser.createdAt).toLocaleDateString()}</TagLabel>
                    </Tag>
                  </Wrap>
                </Flex>
                
                {/* User Stats and Details */}
                <Box p={6}>
                  {userStatsLoading ? (
                    <Center py={6}>
                      <Spinner size="lg" color="blue.500" />
                    </Center>
                  ) : userDetails ? (
                    <>
                      {/* User Stats */}
                      <SimpleGrid columns={2} spacing={4} mb={6}>
                        <Stat>
                          <StatLabel>Posts</StatLabel>
                          <StatNumber>{userDetails.stats.postsCount}</StatNumber>
                        </Stat>
                        <Stat>
                          <StatLabel>Comments</StatLabel>
                          <StatNumber>{userDetails.stats.commentsCount}</StatNumber>
                        </Stat>
                      </SimpleGrid>
                      
                      <Divider my={4} />
                      
                      {/* Bio */}
                      <Box mb={6}>
                        <Heading size="sm" mb={2}>Bio</Heading>
                        <Text>{userDetails.user.bio || 'No bio available.'}</Text>
                      </Box>
                      
                      <Divider my={4} />
                      
                      {/* Additional User Information */}
                      <VStack align="start" spacing={3}>
                        <Heading size="sm" mb={2}>Account Details</Heading>
                        
                        <HStack>
                          <EmailIcon color="gray.500" />
                          <Text fontWeight="medium">Email:</Text>
                          <Text>{userDetails.user.email}</Text>
                        </HStack>
                        
                        <HStack>
                          <FaUserGraduate style={{ color: 'gray' }} />
                          <Text fontWeight="medium">Student ID:</Text>
                          <Text>{userDetails.user.studentId || 'Not provided'}</Text>
                        </HStack>
                        
                        <HStack>
                          <FaCalendarAlt style={{ color: 'gray' }} />
                          <Text fontWeight="medium">Joined:</Text>
                          <Text>{new Date(userDetails.user.createdAt).toLocaleString()}</Text>
                        </HStack>
                        
                        {/* Cover Picture Preview */}
                        {userDetails.user.coverPic && (
                          <Box mt={3} width="100%">
                            <Text fontWeight="medium" mb={2}>Cover Picture:</Text>
                            <Image
                              src={`http://localhost:5000${userDetails.user.coverPic}`}
                              alt="Cover"
                              borderRadius="md"
                              fallback={<Box height="100px" bg="gray.200" borderRadius="md" />}
                            />
                          </Box>
                        )}
                      </VStack>
                    </>
                  ) : (
                    <Center py={6}>
                      <Text>Failed to load user details.</Text>
                    </Center>
                  )}
                </Box>
              </Box>
            )}
          </DrawerBody>

          <DrawerFooter borderTopWidth="1px">
            {selectedUser && (
              <ButtonGroup spacing={3} width="100%">
                <Button 
                  colorScheme={selectedUser.status === 'banned' ? "green" : "red"}
                  leftIcon={selectedUser.status === 'banned' ? <CheckIcon /> : <WarningIcon />}
                  flex={1}
                  onClick={() => handleBanUnbanUser(selectedUser._id, selectedUser.status)}
                >
                  {selectedUser.status === 'banned' ? 'Activate User' : 'Ban User'}
                </Button>
                <Button 
                  colorScheme="red" 
                  leftIcon={<DeleteIcon />}
                  onClick={() => {
                    handleDeleteUser(selectedUser._id);
                  }}
                >
                  Delete
                </Button>
              </ButtonGroup>
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default UserManagement;