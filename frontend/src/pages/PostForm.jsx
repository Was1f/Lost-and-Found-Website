import { useState } from "react";
import {
  Box, Select, Button, FormControl, FormLabel, Input, Textarea, VStack, useToast
} from "@chakra-ui/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/PostForm.css";

const PostForm = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("lost");
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("status", status);
    formData.append("image", image);
    formData.append("location", location);
    try {
      const token = localStorage.getItem("authToken");
      await axios.post("http://localhost:5000/api/posts/create", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      toast({
        title: "Post created successfully!",
        description: "Your item has been posted.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top"
      });

      setTitle("");
      setDescription("");
      setImage(null);
      setLocation("");
      setStatus("lost");

      navigate('/recent');

    } catch (error) {
      toast({
        title: "Failed to create post",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="post-form-container">
      <h1 className="form-title">Create New Post</h1>
      <form onSubmit={handleSubmit}>
        <VStack spacing={6}>
          <div className="form-group">
            <FormControl isRequired>
              <FormLabel className="form-label">Title</FormLabel>
              <Input
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter item title"
              />
            </FormControl>
          </div>

          <div className="form-group">
            <FormControl isRequired>
              <FormLabel className="form-label">Description</FormLabel>
              <Textarea
                className="form-input form-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the item"
              />
            </FormControl>
          </div>

          <div className="form-group">
            <FormControl isRequired>
              <FormLabel className="form-label">Status</FormLabel>
              <div className="status-selector">
                <div className="status-option">
                  <input
                    type="radio"
                    id="lost"
                    name="status"
                    value="lost"
                    checked={status === "lost"}
                    onChange={(e) => setStatus(e.target.value)}
                  />
                  <label htmlFor="lost" className="status-label">
                    Lost
                  </label>
                </div>
                <div className="status-option">
                  <input
                    type="radio"
                    id="found"
                    name="status"
                    value="found"
                    checked={status === "found"}
                    onChange={(e) => setStatus(e.target.value)}
                  />
                  <label htmlFor="found" className="status-label">
                    Found
                  </label>
                </div>
              </div>
            </FormControl>
          </div>

          <div className="form-group">
            <FormControl isRequired>
              <FormLabel className="form-label">Location</FormLabel>
              <Input
                className="form-input"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter the location of the item"
              />
            </FormControl>
          </div>

          <div className="form-group">
            <FormControl isRequired>
              <FormLabel className="form-label">Image</FormLabel>
              <div className="file-input-container">
                <label className="file-input-label">
                  {image ? image.name : "Choose an image"}
                  <input
                    className="file-input"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files[0])}
                  />
                </label>
              </div>
            </FormControl>
          </div>

          <Button
            type="submit"
            className="submit-button"
            isLoading={isSubmitting}
            loadingText="Creating post..."
            disabled={isSubmitting}
          >
            Confirm Post
          </Button>
        </VStack>
      </form>
    </div>
  );
};

export default PostForm;


