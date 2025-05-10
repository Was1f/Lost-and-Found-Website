import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  Select,
  Text,
  useDisclosure,
  useToast,
  Divider,
  HStack,
  VStack,
  Spacer,
  Tag,
  TagLabel,
  Image,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Tooltip,
  Skeleton,
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import {
  CheckIcon,
  DeleteIcon,
  SearchIcon,
  WarningIcon,
  InfoIcon,
  TimeIcon,
  ChevronDownIcon,
  CloseIcon,
  ViewIcon,
} from "@chakra-ui/icons";
import axios from "axios";

function AdminReportPage() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [adminResponse, setAdminResponse] = useState("");
  const [status, setStatus] = useState("Pending");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  
  // Modal disclosures
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteDialogOpen,
    onOpen: onOpenDeleteDialog,
    onClose: onCloseDeleteDialog,
  } = useDisclosure();
  const cancelRef = React.useRef();
  const toast = useToast();

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [reports, filter, searchTerm, sortOrder]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/admin/reports");
      setReports(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Failed to fetch reports:", error);
      toast({
        title: "Error",
        description: "Failed to fetch reports. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  const applyFilters = () => {
    let result = [...reports];
    
    // Apply status filter
    if (filter !== "all") {
      result = result.filter(report => report.status === filter);
    }
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(report => 
        (report.postId && report.postId.title && report.postId.title.toLowerCase().includes(term)) ||
        (report.reportType && report.reportType.toLowerCase().includes(term)) ||
        (report.userId && report.userId.username && report.userId.username.toLowerCase().includes(term)) ||
        (report.description && report.description.toLowerCase().includes(term))
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
    });
    
    setFilteredReports(result);
  };

  const handleReportClick = (report) => {
    setSelectedReport(report);
    setAdminResponse(report.adminResponse || "");
    setStatus(report.status);
    onOpen();
  };

  const handleUpdateReport = async () => {
    try {
      setSubmitting(true);
      
      await axios.put(
        `http://localhost:5000/api/admin/reports/${selectedReport._id}`,
        { 
          status, 
          adminResponse,
          isClaim: selectedReport.reportType === 'Item Claim'
        }
      );

      setSubmitting(false);
      onClose();
      
      // Update report in the local state
      setReports(reports.map(report => 
        report._id === selectedReport._id 
          ? { ...report, status, adminResponse, updatedAt: new Date() } 
          : report
      ));
      
      toast({
        title: "Success",
        description: "Report updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } catch (error) {
      setSubmitting(false);
      console.error("Failed to update report:", error);
      toast({
        title: "Error",
        description: "Failed to update report",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  const handleDeletePost = async () => {
    if (!selectedReport || !selectedReport.postId || !selectedReport.postId._id) {
      toast({
        title: "Error",
        description: "Cannot delete: Post information not available",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    try {
      setSubmitting(true);
      
      // Delete the post with admin token
      await axios.delete(
        `http://localhost:5000/api/admin/posts/${selectedReport.postId._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
          }
        }
      );

      // Also update the report to resolved
      await axios.put(
        `http://localhost:5000/api/admin/reports/${selectedReport._id}`,
        { 
          status: "Resolved", 
          adminResponse: adminResponse || "Post has been deleted due to policy violation."
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
          }
        }
      );

      setSubmitting(false);
      onCloseDeleteDialog();
      onClose();

      // Update local state
      setReports(reports.map(report => 
        report._id === selectedReport._id 
          ? { 
              ...report, 
              status: "Resolved", 
              adminResponse: adminResponse || "Post has been deleted due to policy violation.", 
              updatedAt: new Date(),
              postId: { ...report.postId, _id: report.postId._id, title: "Post Deleted" }
            } 
          : report
      ));
      
      toast({
        title: "Success",
        description: "Post deleted and report resolved",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });

      // Refresh reports to get updated data
      fetchReports();
    } catch (error) {
      setSubmitting(false);
      console.error("Failed to delete post:", error);
      toast({
        title: "Error",
        description: "Failed to delete post: " + (error.response?.data?.message || error.message),
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "yellow";
      case "Resolved":
        return "green";
      default:
        return "gray";
    }
  };

  const getReportTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "inappropriate content":
        return <WarningIcon color="red.500" />;
      case "spam":
        return <CloseIcon color="orange.500" />;
      case "misinformation":
        return <InfoIcon color="blue.500" />;
      default:
        return <InfoIcon color="gray.500" />;
    }
  };

  const renderTableSkeletons = () => {
    return Array(5).fill(0).map((_, index) => (
      <Tr key={`skeleton-${index}`}>
        <Td><Skeleton height="20px" /></Td>
        <Td><Skeleton height="20px" /></Td>
        <Td><Skeleton height="20px" /></Td>
        <Td><Skeleton height="20px" /></Td>
        <Td><Skeleton height="20px" /></Td>
        <Td><Skeleton height="20px" /></Td>
      </Tr>
    ));
  };

  return (
    <Box p={5} bg="gray.50" minH="100vh">
      <Flex 
        direction="column" 
        bg="white" 
        borderRadius="lg" 
        boxShadow="md" 
        p={6}
      >
        <Flex align="center" mb={6}>
          <Heading size="lg">Report Management</Heading>
          <Spacer />
          <Button 
            leftIcon={<TimeIcon />}
            colorScheme="teal" 
            onClick={fetchReports}
            isLoading={loading}
            size="sm"
          >
            Refresh
          </Button>
        </Flex>
        
        <Flex mb={5} wrap="wrap" gap={3}>
          <InputGroup maxW="300px">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg="white"
            />
          </InputGroup>
          
          <HStack spacing={2}>
            <Text fontSize="sm" fontWeight="medium">Filter:</Text>
            <Select 
              size="sm" 
              width="auto" 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              bg="white"
            >
              <option value="all">All Reports</option>
              <option value="Pending">Pending</option>
              <option value="Resolved">Resolved</option>
            </Select>
          </HStack>
          
          <HStack spacing={2}>
            <Text fontSize="sm" fontWeight="medium">Sort:</Text>
            <Select 
              size="sm" 
              width="auto" 
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              bg="white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </Select>
          </HStack>
          
          <Spacer />
          
          <Tag size="md" variant="subtle" colorScheme="blue">
            <TagLabel>Total: {filteredReports.length} reports</TagLabel>
          </Tag>
        </Flex>
        
        <Box overflowX="auto">
          <Table variant="simple" bg="white" borderRadius="md">
            <Thead bg="gray.50">
              <Tr>
                <Th>Post Details</Th>
                <Th>Report Type</Th>
                <Th>Reporter</Th>
                <Th>Submitted</Th>
                <Th>Status</Th>
                <Th textAlign="center">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {loading ? (
                renderTableSkeletons()
              ) : filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <Tr key={report._id} _hover={{ bg: "gray.50" }}>
                    <Td maxW="200px" overflow="hidden" textOverflow="ellipsis">
                      <Text fontWeight="medium">
                        {report.postId ? (
                          report.postId.title ? report.postId.title.substring(0, 30) + (report.postId.title.length > 30 ? "..." : "") : "Post Unavailable"
                        ) : "Post Deleted"}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        ID: {report.postId?._id ? report.postId._id.substring(0, 8) + "..." : "N/A"}
                      </Text>
                    </Td>
                    <Td>
                      <Flex align="center">
                        {getReportTypeIcon(report.reportType)}
                        <Text ml={2}>
                          {report.reportType}
                          {report.reportType === 'Item Claim' && (
                            <Badge ml={2} colorScheme="green" variant="subtle">
                              Claim
                            </Badge>
                          )}
                        </Text>
                      </Flex>
                    </Td>
                    <Td>
                      {report.userId ? (
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="medium">{report.userId.username}</Text>
                          <Text fontSize="xs" color="gray.500">{report.userId.email}</Text>
                        </VStack>
                      ) : "Unknown"}
                    </Td>
                    <Td>
                      <VStack align="start" spacing={0}>
                        <Text>{new Date(report.createdAt).toLocaleDateString()}</Text>
                        <Text fontSize="xs" color="gray.500">
                          {new Date(report.createdAt).toLocaleTimeString()}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={getStatusColor(report.status)}
                        px={2}
                        py={1}
                        borderRadius="full"
                      >
                        {report.status}
                      </Badge>
                    </Td>
                    <Td>
                      <HStack justify="center" spacing={2}>
                        <Tooltip label="View/Handle Report">
                          <IconButton
                            aria-label="View report"
                            icon={<ViewIcon />}
                            colorScheme="blue"
                            size="sm"
                            onClick={() => handleReportClick(report)}
                          />
                        </Tooltip>
                      </HStack>
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={6} textAlign="center" py={6}>
                    <Text color="gray.500">No reports found. Try adjusting your filters.</Text>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>
      </Flex>

      {/* Modal for handling reports */}
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        size="xl" 
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader bg="blue.50" borderTopRadius="md">
            Handle Report
            {selectedReport && 
              <Badge 
                ml={2} 
                colorScheme={getStatusColor(selectedReport.status)}
                variant="solid"
              >
                {selectedReport.status}
              </Badge>
            }
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedReport && (
              <Box>
                <Flex 
                  direction={{ base: "column", md: "row" }} 
                  bg="gray.50" 
                  p={4} 
                  borderRadius="md" 
                  mb={4}
                >
                  <VStack align="start" spacing={1} flex={1}>
                    <Text fontWeight="bold" color="gray.700">Post Information</Text>
                    <HStack>
                      <Text fontWeight="semibold">Title:</Text>
                      <Text>{selectedReport.postId ? selectedReport.postId.title : "Post Unavailable"}</Text>
                    </HStack>
                    {selectedReport.postId && selectedReport.postId.status && (
                      <HStack>
                        <Text fontWeight="semibold">Status:</Text>
                        <Badge colorScheme={selectedReport.postId.status === "lost" ? "red" : "green"}>
                          {selectedReport.postId.status.toUpperCase()}
                        </Badge>
                      </HStack>
                    )}
                    {selectedReport.postId && selectedReport.postId.location && (
                      <HStack>
                        <Text fontWeight="semibold">Location:</Text>
                        <Text>{selectedReport.postId.location}</Text>
                      </HStack>
                    )}
                  </VStack>
                  
                  {selectedReport.postId && selectedReport.postId.image && (
                    <Box mt={{ base: 4, md: 0 }}>
                      <Image 
                        src={selectedReport.postId.image} 
                        alt="Post image" 
                        fallbackSrc="https://via.placeholder.com/150"
                        maxH="100px"
                        borderRadius="md"
                      />
                    </Box>
                  )}
                </Flex>
                
                <Divider my={4} />
                
                <Box mb={4}>
                  <Text fontWeight="bold" color="gray.700" mb={2}>Report Details</Text>
                  
                  <HStack mb={2}>
                    <Text fontWeight="semibold">Report Type:</Text>
                    <Flex align="center">
                      {getReportTypeIcon(selectedReport.reportType)}
                      <Text ml={2}>
                        {selectedReport.reportType}
                        {selectedReport.reportType === 'Item Claim' && (
                          <Badge ml={2} colorScheme="green" variant="subtle">
                            Claim
                          </Badge>
                        )}
                      </Text>
                    </Flex>
                  </HStack>
                  
                  <Text fontWeight="semibold" mb={1}>Description from User:</Text>
                  <Box 
                    p={3} 
                    bg="gray.50" 
                    borderRadius="md" 
                    borderLeft="4px" 
                    borderColor="blue.400"
                    mb={3}
                  >
                    <Text>{selectedReport.description || "No description provided"}</Text>
                  </Box>
                  
                  <HStack mb={2}>
                    <Text fontWeight="semibold">Reported by:</Text>
                    <Text>{selectedReport.userId ? selectedReport.userId.username : "Unknown"}</Text>
                    {selectedReport.userId && selectedReport.userId.email && (
                      <Text color="gray.500">({selectedReport.userId.email})</Text>
                    )}
                  </HStack>
                  
                  <HStack mb={2}>
                    <Text fontWeight="semibold">Date Reported:</Text>
                    <Text>{new Date(selectedReport.createdAt).toLocaleString()}</Text>
                  </HStack>
                </Box>
                
                <Divider my={4} />
                
                <Box mb={4}>
                  <Text fontWeight="bold" color="gray.700" mb={3}>Admin Response</Text>
                  
                  <FormControl mb={4}>
                    <FormLabel fontWeight="medium">Status</FormLabel>
                    <Select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      bg="white"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Resolved">Resolved</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel fontWeight="medium">Admin Response (visible to user)</FormLabel>
                    <Textarea
                      value={adminResponse}
                      onChange={(e) => setAdminResponse(e.target.value)}
                      placeholder="Provide feedback to the user about this report"
                      rows={4}
                      bg="white"
                    />
                  </FormControl>
                </Box>
              </Box>
            )}
          </ModalBody>
          <ModalFooter bg="gray.50" borderBottomRadius="md">
            <Button 
              leftIcon={<DeleteIcon />}
              colorScheme="red" 
              mr={3} 
              isDisabled={!selectedReport || !selectedReport.postId || !selectedReport.postId._id}
              onClick={onOpenDeleteDialog}
            >
              Delete Post
            </Button>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              leftIcon={<CheckIcon />}
              colorScheme="blue" 
              onClick={handleUpdateReport}
              isLoading={submitting}
            >
              Update Report
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={onCloseDeleteDialog}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Post
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this post? This action cannot be undone.
              <Box mt={4} bg="red.50" p={3} borderRadius="md">
                <Text fontWeight="bold">
                  {selectedReport?.postId?.title || "Post"}
                </Text>
              </Box>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onCloseDeleteDialog}>
                Cancel
              </Button>
              <Button 
                colorScheme="red" 
                onClick={handleDeletePost} 
                ml={3}
                isLoading={submitting}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}

export default AdminReportPage;