import { useState, useEffect } from "react";
import { Box, Heading, Text, Image, VStack, Input, Button, Badge } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import axios from "axios";

const PostDetailsPage = () => {
  const { id } = useParams(); // Get the post ID from URL
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [selectedCommentId, setSelectedCommentId] = useState(null);
  const [replyText, setReplyText] = useState("");
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

  // Handle posting a reply
  const handleReplySubmit = async () => {
    if (!replyText.trim()) return; // Prevent empty replies
    
    try {
      // Make sure the postId is being sent correctly as a valid MongoDB ObjectId
      const response = await axios.post(
        `http://localhost:5000/api/comments/comments/reply`, // Fixed route path to match backend
        { 
          text: replyText, 
          parentCommentId: selectedCommentId, 
          postId: id // This should be a valid MongoDB ObjectId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );
      
      console.log("Reply posted successfully:", response.data);
      
      setReplyText(""); // Clear input
      setSelectedCommentId(null); // Close reply input

      // ✅ Refresh comments with replies immediately after posting
      const updatedComments = await axios.get(`http://localhost:5000/api/comments/${id}`);
      setComments(updatedComments.data);
    } catch (error) {
      console.error("Error posting reply:", error.response?.data || error.message);
      alert(`Error posting reply: ${error.response?.data?.message || error.message}`);
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
        📧 Posted By: {post.user?.email || "Unknown"}
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

                {/* Reply Button */}
                <Button
                  colorScheme="blue"
                  size="sm"
                  mt={2}
                  onClick={() => setSelectedCommentId(comment._id)} // Set comment ID to reply to
                >
                  Reply
                </Button>

                {/* Replies Section */}
                {comment._doc?.replies && comment._doc.replies.length > 0 ? (
                  <Box mt={3} ml={6}>
                    {comment._doc.replies.map((reply) => (
                      <Box key={reply._id} bg="gray.200" p={3} rounded="md" mb={2}>
                        <Text fontWeight="bold" fontSize="sm" mb={1}>
                          {reply.userId?.email || "Anonymous"}
                        </Text>
                        <Text fontSize="sm">{reply.text}</Text>
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          {new Date(reply.createdAt).toLocaleString()}
                        </Text>
                      </Box>
                    ))}
                  </Box>
                ) : comment.replies && comment.replies.length > 0 ? (
                  <Box mt={3} ml={6}>
                    {comment.replies.map((reply) => (
                      <Box key={reply._id} bg="gray.200" p={3} rounded="md" mb={2}>
                        <Text fontWeight="bold" fontSize="sm" mb={1}>
                          {reply.userId?.email || "Anonymous"}
                        </Text>
                        <Text fontSize="sm">{reply.text}</Text>
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          {new Date(reply.createdAt).toLocaleString()}
                        </Text>
                      </Box>
                    ))}
                  </Box>
                ) : null}

                {/* Reply Input */}
                {selectedCommentId === comment._id && (
                  <Box display="flex" mt={3}>
                    <Input
                      placeholder="Write a reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      mr={2}
                    />
                    <Button colorScheme="blue" onClick={handleReplySubmit}>
                      Reply
                    </Button>
                  </Box>
                )}

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