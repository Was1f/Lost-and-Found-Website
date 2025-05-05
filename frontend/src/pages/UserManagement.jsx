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
  const toast = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/admin/users', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch users');

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
      }
    };

    fetchUsers();
  }, [toast]);

  const handleBanUnbanUser = async (id, isBanned) => {
    const confirm = window.confirm(
      isBanned ? "Unban this user?" : "Ban this user?"
    );
    if (!confirm) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/user/ban/${id}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      toast({
        title: isBanned ? 'User Unbanned' : 'User Banned',
        description: data.message,
        status: 'success',
        isClosable: true,
      });

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
    const confirm = window.confirm("Are you sure you want to delete this user?");
    if (!confirm) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/user/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      toast({
        title: 'User Deleted',
        description: data.message,
        status: 'success',
        isClosable: true,
      });

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

  return (
    <Box p={8} bg="gray.50" minH="100vh">
      <Heading as="h2" size="xl" textAlign="center" mb={10}>
        👥 Admin: Manage Users
      </Heading>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {users.map((user) => (
          <Box
            key={user._id}
            bg="white"
            p={6}
            rounded="lg"
            boxShadow="md"
            border="1px solid"
            borderColor="gray.200"
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
          >
            <VStack spacing={3} align="start">
              <Text fontWeight="bold" fontSize="lg">{user.email}</Text>

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
                  handleBanUnbanUser(user._id, user.status === 'banned')
                }
              >
                {user.status === 'banned' ? 'Unban' : 'Ban'}
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
    </Box>
  );
};

export default UserManagement;
