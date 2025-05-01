import { useState, useEffect } from 'react';
import { Box, Heading, VStack, Text, Button, FormControl, FormLabel, Input, Textarea, Select } from "@chakra-ui/react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const EditPostPage = () => {
  const { id } = useParams(); // Get the post ID from URL
  const navigate = useNavigate();

  const [post, setPost] = useState({
    title: "",
    description: "",
    status: "lost",
    location: "",
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/posts/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPost(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch post", error);
      }
    };

    fetchPost();
  }, [id, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", post.title);
    formData.append("description", post.description);
    formData.append("status", post.status);
    formData.append("location", post.location);
    if (image) {
      formData.append("image", image);
    }

    try {
      await axios.put(`http://localhost:5000/api/posts/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      navigate("/my-posts"); // Redirect to "My Posts" page after successful update
    } catch (error) {
      console.error("Failed to update post", error);
    }
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <Box maxW="lg" mx="auto" mt={10} p={6} bg="white" boxShadow="md" rounded="md">
      <Heading as="h2" size="xl" mb={6}>
        Edit Post
      </Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Title</FormLabel>
            <Input
              value={post.title}
              onChange={(e) => setPost({ ...post, title: e.target.value })}
              placeholder="Enter item title"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Description</FormLabel>
            <Textarea
              value={post.description}
              onChange={(e) => setPost({ ...post, description: e.target.value })}
              placeholder="Describe the item"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Status</FormLabel>
            <Select
              value={post.status}
              onChange={(e) => setPost({ ...post, status: e.target.value })}
            >
              <option value="lost">Lost</option>
              <option value="found">Found</option>
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Location</FormLabel>
            <Input
              value={post.location}
              onChange={(e) => setPost({ ...post, location: e.target.value })}
              placeholder="Enter the location where the item was found"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Image</FormLabel>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
            />
          </FormControl>

          <Button type="submit" colorScheme="blue" width="full">
            Update Post
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default EditPostPage;
