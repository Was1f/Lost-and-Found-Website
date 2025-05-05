import { useState, useEffect } from "react";
import { Box, Heading, Text, Image, VStack, Input, Button, Badge } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import axios from "axios";

const PostDetailsPage = () => {
  const { id } = useParams(); // Get the post ID from URL
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const token = localStorage.getItem("authToken");

  // Fetch post details and comments
  useEffect(() => {
    const fetchPostAndComments = async () => {
      try {
        const postRes = await axios.get(`http://localhost:5000/api/posts/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPost(postRes.data);

        const commentsRes = await axios.get(`http://localhost:5000/api/comments/${id}`);
        setComments(commentsRes.data);
      } catch (error) {
        console.error("Error fetching post or comments", error);
      }
    };

    fetchPostAndComments();
  }, [id, token]);

  // Handle posting a new comment
  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return; // Prevent empty comments

    try {
      await axios.post(
        `http://localhost:5000/api/comments/${id}`,
        { text: newComment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNewComment(""); // Clear input

      // ✅ Refresh comments immediately after posting
      const updatedComments = await axios.get(`http://localhost:5000/api/comments/${id}`);
      setComments(updatedComments.data);
    } catch (error) {
      console.error("Error posting comment", error);
    }
  };

  if (!post) {
    return <Text>Loading...</Text>;
  }

  return (
    <Box maxW="4xl" mx="auto" mt={10} p={6} bg="white" boxShadow="md" rounded="md">
      {/* Post Image */}
      <Image
        src={`http://localhost:5000${post.image}`}
        alt={post.title}
        width="100%"
        maxHeight="500px"
        objectFit="cover"
        borderRadius="md"
        mb={6}
      />

      {/* Post Info */}
      <Heading as="h2" size="xl" mb={4}>
        {post.title}
      </Heading>

      <Badge colorScheme={post.status === "lost" ? "red" : "green"} fontSize="md" mb={4}>
        {post.status.toUpperCase()}
      </Badge>

      <Text fontSize="md" color="gray.700" mb={4}>
        {post.description}
      </Text>

      <Text fontSize="sm" color="gray.600" mb={2}>
        📍 Location: {post.location}
      </Text>

      <Text fontSize="sm" color="gray.600" mb={2}>
        📧 Posted By: {post.user.email}
      </Text>

      <Text fontSize="sm" color="gray.500" mb={6}>
        🕒 Posted On: {new Date(post.createdAt).toLocaleString()}
      </Text>

      {/* Comments Section */}
      <Box mt={10}>
        <Heading as="h3" size="lg" mb={4}>
          Comments
        </Heading>

        {/* Comment Input */}
        <Box display="flex" mb={4}>
          <Input
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            mr={2}
          />
          <Button colorScheme="blue" onClick={handleCommentSubmit}>
            Comment
          </Button>
        </Box>

        {/* List of Comments */}
        <VStack align="start" spacing={3}>
          {comments.length > 0 ? (
            comments.map((comment) => (
              <Box
                key={comment._id}
                bg="gray.100"
                p={3}
                rounded="md"
                w="100%"
              >
                <Text fontWeight="bold" fontSize="sm" mb={1}>
                  {comment.userId?.email || "Anonymous"} {/* populated user email */}
                </Text>
                <Text fontSize="sm">{comment.text}</Text>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  {new Date(comment.createdAt).toLocaleString()}
                </Text>
              </Box>
            ))
          ) : (
            <Text>No comments yet. Be the first!</Text>
          )}
        </VStack>
      </Box>
    </Box>
  );
};

export default PostDetailsPage;
