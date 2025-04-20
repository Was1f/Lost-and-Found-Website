import {
    Box,
    Heading,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    VStack,
    Text,
    useColorModeValue,
    Button,
    HStack,
  } from "@chakra-ui/react";
  import { useNavigate } from "react-router-dom";
  
  const dummyLostItems = [
    { id: 1, title: "Lost Wallet", date: "2024-04-10", location: "Dhanmondi" },
    { id: 2, title: "Lost Phone", date: "2024-04-05", location: "Gulshan" },
  ];
  
  const dummyFoundItems = [
    { id: 1, title: "Found Umbrella", date: "2024-04-08", location: "Mirpur" },
    { id: 2, title: "Found Keys", date: "2024-04-03", location: "Badda" },
  ];
  
  const HistoryPage = () => {
    const cardBg = useColorModeValue("white", "gray.700");
    const navigate = useNavigate();
  
    const handleDelete = (type, id) => {
      console.log(`Deleted ${type} item with ID:`, id);
      // Add API call or local state removal here
    };
  
    const handleViewMore = (type, id) => {
      console.log(`Viewing details of ${type} item with ID:`, id);
      // Navigate or show modal later
    };
  
    return (
      <Box p={8}>
        <Heading mb={6} textAlign="center">
          Your History
        </Heading>
        <Tabs variant="enclosed">
          <TabList>
            <Tab>Lost Items</Tab>
            <Tab>Found Items</Tab>
          </TabList>
  
          <TabPanels>
            <TabPanel>
              <VStack spacing={4}>
                {dummyLostItems.map((item) => (
                  <Box
                    key={item.id}
                    bg={cardBg}
                    p={4}
                    rounded="md"
                    shadow="md"
                    w="100%"
                  >
                    <Text fontWeight="bold">{item.title}</Text>
                    <Text>Date: {item.date}</Text>
                    <Text>Location: {item.location}</Text>
                    <HStack mt={4} spacing={3}>
                      <Button
                        colorScheme="blue"
                        onClick={() => handleViewMore("lost", item.id)}
                      >
                        View More
                      </Button>
                      <Button
                        colorScheme="red"
                        variant="outline"
                        onClick={() => handleDelete("lost", item.id)}
                      >
                        Delete
                      </Button>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </TabPanel>
  
            <TabPanel>
              <VStack spacing={4}>
                {dummyFoundItems.map((item) => (
                  <Box
                    key={item.id}
                    bg={cardBg}
                    p={4}
                    rounded="md"
                    shadow="md"
                    w="100%"
                  >
                    <Text fontWeight="bold">{item.title}</Text>
                    <Text>Date: {item.date}</Text>
                    <Text>Location: {item.location}</Text>
                    <HStack mt={4} spacing={3}>
                      <Button
                        colorScheme="blue"
                        onClick={() => handleViewMore("found", item.id)}
                      >
                        View More
                      </Button>
                      <Button
                        colorScheme="red"
                        variant="outline"
                        onClick={() => handleDelete("found", item.id)}
                      >
                        Delete
                      </Button>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
  
        <Button mt={6} variant="ghost" colorScheme="blue" onClick={() => navigate("/profile")}>
          Back to Profile
        </Button>
      </Box>
    );
  };
  
  export default HistoryPage;
  