import React, { useEffect, useState } from 'react';
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
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/admin/users', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch users');
        }

        const data = await response.json();
        setUsers(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: error.message,
          status: 'error',
          isClosable: true,
        });
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);

  const handleBanUnbanUser = async (id, currentStatus) => {
    const isBanned = currentStatus === 'banned';
    const confirm = window.confirm(
      isBanned ? "Activate this user?" : "Ban this user?"
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
      });

      // Update the user status in the state
      setUsers(
        users.map((user) =>
          user._id === id
            ? { ...user, status: isBanned ? 'active' : 'banned' }
            : user
        )
      );
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
    const confirm = window.confirm("Are you sure you want to delete this user? This action cannot be undone.");
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
      });

      // Remove deleted user from state
      setUsers(users.filter((user) => user._id !== id));
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Box p={8} textAlign="center">
        <Text>Loading users...</Text>
      </Box>
    );
  }

  return (
    <Box p={8} bg="gray.50" minH="100vh">
      <Heading as="h2" size="xl" textAlign="center" mb={10}>
        👥 Admin: Manage Users
      </Heading>

      {users.length === 0 ? (
        <Box textAlign="center" p={8}>
          <Text fontSize="lg">No users found</Text>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {users.map((user) => (
            <Box
              key={user._id}
              bg="white"
              p={6}
              rounded="lg"
              boxShadow="md"
              border="1px solid"
              borderColor={user.status === 'banned' ? "red.200" : "gray.200"}
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
            >
              <VStack spacing={3} align="start">
                <Text fontWeight="bold" fontSize="lg">{user.email}</Text>
                
                {user.username && (
                  <Text fontSize="md">Username: {user.username}</Text>
                )}
                
                {user.studentId && (
                  <Text fontSize="md">Student ID: {user.studentId}</Text>
                )}

                <Badge
                  colorScheme={user.status === 'banned' ? 'red' : 'green'}
                  fontSize="md"
                >
                  {user.status === 'banned' ? 'Banned' : 'Active'}
                </Badge>

                <Text fontSize="sm" color="gray.600">
                  Joined: {new Date(user.createdAt).toLocaleDateString()}
                </Text>
              </VStack>

              <Flex mt={4} gap={2}>
                <Button
                  size="sm"
                  flex="1"
                  colorScheme={user.status === 'banned' ? 'green' : 'red'}
                  onClick={() =>
                    handleBanUnbanUser(user._id, user.status)
                  }
                >
                  {user.status === 'banned' ? 'Activate' : 'Ban'}
                </Button>

                <IconButton
                  size="sm"
                  colorScheme="red"
                  icon={<DeleteIcon />}
                  onClick={() => handleDeleteUser(user._id)}
                  aria-label="Delete User"
                />
              </Flex>
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
};

export default UserManagement;