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
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay
} from "@chakra-ui/react";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { HamburgerIcon, DeleteIcon } from '@chakra-ui/icons';

const MyPostsPage = () => {
  const [posts, setPosts] = useState([]); // Store user posts
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null); 
  const token = localStorage.getItem("authToken");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/posts/user", {
          headers: {
            Authorization: `Bearer ${token}`, // Send the token for user-specific data
          },
        });

        setLoading(false);

        // Sort posts by createdAt descending (most recent first)
        const sortedPosts = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setPosts(sortedPosts);

      } catch (error) {
        console.error("Failed to fetch user posts", error);
        setLoading(false);
      }
    };

    if (token) {
      fetchUserPosts(); // Fetch the posts if token exists
    } else {
      navigate("/login"); // Redirect to login if no token
    }
  }, [token, navigate]);

  // Handle Delete Post
  const handleDelete = async () => {
    try {
      if (!selectedPost || !selectedPost._id) {
        console.error("No post selected for deletion");
        return;
      }
      
      console.log("Attempting to delete post with ID:", selectedPost._id);
      
      // Delete post API call - using the standard RESTful DELETE pattern
      const response = await axios.delete(
        `http://localhost:5000/api/posts/${selectedPost._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log("Delete response:", response.data);

      // If successful, remove the post from the UI
      setPosts(posts.filter(post => post._id !== selectedPost._id));
      onClose(); // Close the dialog
      setSelectedPost(null); // Clear the selected post after deletion
    } catch (error) {
      console.error("Error deleting post:", error);
      console.error("Error details:", error.response?.data || error.message);
      // Keep the dialog open if there's an error
    }
  };

  // Handle opening the delete confirmation dialog
  const openDeleteDialog = (post) => {
    setSelectedPost(post);
    onOpen();
  };

  return (
    <Box maxW="2xl" mx="auto" mt={10} p={6} bg="white" boxShadow="md" rounded="md">
      <Heading as="h2" size="xl" mb={6}>
        My Posts
      </Heading>
      
      {loading ? (
        <Text>Loading your posts...</Text>
      ) : (
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
                    {/* Post Header with Three-dot menu */}
                    <HStack justify="space-between" align="center">
                      <Text fontSize="sm" color="gray.500" mb={2}>
                        User: {post.user.email}
                      </Text>

                      {/* Three-dot menu for actions */}
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

                    {/* Action Buttons */}
                    <HStack spacing={4}>
                      <Button
                        colorScheme="blue"
                        onClick={() => navigate(`/post/${post._id}`)}
                      >
                        View Details
                      </Button>

                      <Button
                        colorScheme="teal"
                        onClick={() => navigate(`/edit-post/${post._id}`)}
                      >
                        Edit
                      </Button>
                    </HStack>
                  </Box>
                </HStack>
              </Box>
            ))
          ) : (
            <Text>No posts available</Text> // Handle when no posts are found
          )}
        </VStack>
      )}

      {/* Delete Confirmation Dialog */}
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
    </Box>
  );
};

export default MyPostsPage;