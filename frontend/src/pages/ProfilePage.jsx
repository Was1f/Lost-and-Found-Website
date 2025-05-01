import React from 'react';
import './ProfilePage.css'; // Make sure profile.css is in the same folder
import { Box, Button, Text } from '@chakra-ui/react';

const Profile = () => {
  // Mocked user data (replace with actual API/user context)
  const userData = {
    name: 'Nathaniel Clarke',
    role: 'Software Engineer at IBM',
    location: 'San Francisco, California',
    studentId: 'CSE20201234', // this part will only be visible to the user
    isCurrentUser: true, // this should be true only for the logged-in user
  };

  return (
    <Box className="profile-container">
      {/* Cover + Profile Image */}
      <Box position="relative">
        <img
          src="/cover.jpg" // Use a real path or import image
          alt="Cover"
          className="cover-photo"
        />
        <img
          src="/profile.jpg" // Use a real path or import image
          alt="Profile"
          className="profile-picture"
        />
      </Box>

      {/* User Info */}
      <Box className="info-section">
        <Text className="name">{userData.name}</Text>
        <Text className="role">{userData.role}</Text>
        <Text className="location">{userData.location}</Text>

        <Box className="button-group">
          <Button colorScheme="blue">Edit Profile</Button>
          <Button
            variant="outline"
            colorScheme="blue"
            onClick={() => window.location.href = '/dashboard'}
          >
            Dashboard
          </Button>
        </Box>

        {userData.isCurrentUser && (
          <Box className="private-info">
            Student ID (Private): <strong>{userData.studentId}</strong>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Profile;


