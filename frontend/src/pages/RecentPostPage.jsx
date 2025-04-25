import { Box, Heading, VStack, Text, Button, Image, Badge,HStack } from "@chakra-ui/react"; // Corrected imports
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const RecentPostsPage = () => {
  const [posts, setPosts] = useState([]); // Use setPosts for an array of posts
  const navigate = useNavigate();

  // Fetch recent posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/posts/recent");
        console.log(response.data);
        setPosts(response.data); // Set the posts data
      } catch (error) {
        console.error("Failed to fetch posts", error);
      }
    };

    fetchPosts();
  }, []); // Empty dependency array to fetch only once when component mounts

  return (
    <Box maxW="2xl" mx="auto" mt={10} p={6} bg="white" boxShadow="md" rounded="md">
    <Heading as="h2" size="xl" mb={6}>
      Recent Posts
    </Heading>
    <VStack spacing={4} align="stretch">
      {posts.length > 0 ? (
        posts.map((post) => (
          <Box key={post._id} borderWidth={1} borderRadius="md" p={4} mb={4}>
            <HStack spacing={6} align="start">
              {/* Item Image */}
              <Image
                src={`http://localhost:5000${post.image}`}
                alt={post.title}
                boxSize="250px" // Adjusted image size
                objectFit="cover"
                borderRadius="md"
              />

              {/* Post Details */}
              <Box flex="1">
                {/* User Info */}
                <Text fontSize="sm" color="gray.500" mb={2}>User: {post.user.email}</Text>

                {/* Title */}
                <Heading as="h3" size="md" fontWeight="bold" mb={2}>
                  {post.title}
                </Heading>

                {/* Status */}
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

                {/* Post Description */}
                <Text
                    mb={4}
                    style={{
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        WebkitLineClamp: "1", // Limit to 1 line
                    }}
                    >
                    {post.description}
                    </Text>
                    
                {/* Location */}
                <Text fontSize="sm" color="blue.500" fontWeight="medium" mb={2}>
                  Location: {post.location}
                </Text>

                {/* Date and Time */}
                <Text fontSize="sm" color="gray.400" mb={4}>
                  Posted on: {new Date(post.createdAt).toLocaleString()}
                </Text>

                {/* View Post Button */}
                <Button
                  colorScheme="blue"
                  onClick={() => navigate(`/post/${post._id}`)} // Redirect to individual post page
                >
                  View Details
                </Button>
              </Box>
            </HStack>
          </Box>
        ))
      ) : (
        <Text>No recent posts available</Text>  // No posts available
      )}
    </VStack>
  </Box>
);
};

export default RecentPostsPage;