import { useState } from "react";
import {
  Box, Button, FormControl, FormLabel, Input, Textarea, VStack, useToast
} from "@chakra-ui/react";
import axios from "axios";

const PostForm = () => {
  const toast = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("image", image);

    try {
      const token = localStorage.getItem("authToken");
      await axios.post("http://localhost:5000/api/posts/create", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      toast({
        title: "Post created!",
        status: "success",
        isClosable: true
      });

      setTitle("");
      setDescription("");
      setImage(null);
    } catch (error) {
      toast({
        title: "Failed to create post",
        description: error.message,
        status: "error",
        isClosable: true
      });
    }
  };

  return (
    <Box maxW="lg" mx="auto" mt={10} p={6} bg="white" boxShadow="md" rounded="md">
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Title</FormLabel>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter item title"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Description</FormLabel>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the item"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Image</FormLabel>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
            />
          </FormControl>

          {/* ✅ THIS is the Confirm Post button */}
          <Button type="submit" colorScheme="blue" width="full">
            Confirm Post
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default PostForm;


