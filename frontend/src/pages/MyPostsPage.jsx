import { Box, Heading, VStack, Text, Button, Image, Badge, HStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const MyPostsPage = () => {
  const [posts, setPosts] = useState([]); // Store user posts
  const navigate = useNavigate();

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/posts/user", {
          headers: {
            Authorization: `Bearer ${token}`, // Send the token for user-specific data
          },
        });
        // Sort posts by createdAt descending (most recent first)
        const sortedPosts = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setPosts(sortedPosts);
      } catch (error) {
        console.error("Failed to fetch user posts", error);
      }
    };

    if (token) {
      fetchUserPosts(); // Fetch the posts if token exists
    } else {
      navigate("/login"); // Redirect to login if no token
    }
  }, [token, navigate]);

  return (
    <Box maxW="2xl" mx="auto" mt={10} p={6} bg="white" boxShadow="md" rounded="md">
      <Heading as="h2" size="xl" mb={6}>
        My Posts
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
                  boxSize="250px"
                  objectFit="cover"
                  borderRadius="md"
                />

                {/* Post Details */}
                <Box flex="1">
                  {/* User Info */}
                  <Text fontSize="sm" color="gray.500" mb={2}>
                    User: {post.user.email}
                  </Text>

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

                {/* Location */}
                <Text fontSize="sm" color="blue.500" fontWeight="medium" mb={2}>
                  Location: {post.location}
                </Text>

              {/* Description */}
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

                   {/* Edit Button */}
                   <Button
                    colorScheme="blue"
                    onClick={() => navigate(`/edit-post/${post._id}`)}  ml={8} // Redirect to edit page
                  >
                    Edit
                  </Button>
                </Box>
              </HStack>
            </Box>
          ))
        ) : (
          <Text>No posts available</Text> // Handle when no posts are found
        )}
      </VStack>
    </Box>
  );
};

export default MyPostsPage;
