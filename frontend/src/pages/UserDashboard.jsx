import React from 'react';
import './UserDashboard.css';
import { Box, Button, Text } from '@chakra-ui/react';

const UserDashboard = () => {
  // Mocked user data for dashboard (replace with actual API/user context)
  const foundItems = [
    { title: 'Found Wallet', description: 'A wallet found near the library.', id: 1 },
    { title: 'Found Keys', description: 'Set of keys found on the campus.', id: 2 },
  ];

  const lostItems = [
    { title: 'Lost Phone', description: 'Lost phone near the bus stop.', id: 1 },
    { title: 'Lost Jacket', description: 'A jacket lost in the cafeteria.', id: 2 },
  ];

  return (
    <Box className="dashboard-container">
      {/* Dashboard Header */}
      <Box className="dashboard-header">
        <Text>Dashboard</Text>
        <Button className="return-button" onClick={() => window.location.href = '/profile'}>
          Return to Profile
        </Button>
      </Box>

      {/* Found Items Section */}
      <Box>
        <Text className="section-title">Found Items</Text>
        {foundItems.length > 0 ? (
          foundItems.map((item) => (
            <Box key={item.id} className="item-card">
              <Text className="item-card-title">{item.title}</Text>
              <Text>{item.description}</Text>
              <Box className="card-footer">
                <Button>Contact Owner</Button>
                <Button>Mark as Collected</Button>
              </Box>
            </Box>
          ))
        ) : (
          <Text>No found items yet.</Text>
        )}
      </Box>

      {/* Lost Items Section */}
      <Box mt="32px">
        <Text className="section-title">Lost Items</Text>
        {lostItems.length > 0 ? (
          lostItems.map((item) => (
            <Box key={item.id} className="item-card">
              <Text className="item-card-title">{item.title}</Text>
              <Text>{item.description}</Text>
              <Box className="card-footer">
                <Button>Report Found</Button>
                <Button>Update Status</Button>
              </Box>
            </Box>
          ))
        ) : (
          <Text>No lost items yet.</Text>
        )}
      </Box>
    </Box>
  );
};

export default UserDashboard;

  