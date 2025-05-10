import { useState, useEffect } from 'react';
import { Box, Text, VStack, Spinner, Button, Alert, AlertIcon, AlertTitle, AlertDescription, useToast, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText } from '@chakra-ui/react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';  // Using useNavigate for redirection

import './ViewMyReportsPage.css'; // Import the CSS file for styling

const ViewMyReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [postError, setPostError] = useState(null);  // To handle post error (deleted or not found)
  const [processedReportIds, setProcessedReportIds] = useState(() => {
    // Initialize from localStorage if available
    const savedIds = localStorage.getItem('processedReportIds');
    return savedIds ? new Set(JSON.parse(savedIds)) : new Set();
  });
  const token = localStorage.getItem('authToken');
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    // Check if token exists and redirect if not
    if (!token) {
      console.warn('No authentication token found. Redirecting to login.');
      navigate('/login');
      return;
    }

    const fetchReports = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/reports/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setReports(response.data);
      } catch (error) {
        console.error('Error fetching reports:', error);
        // If unauthorized, redirect to login
        if (error.response?.status === 401) {
          console.warn('Token expired or invalid. Redirecting to login.');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [token, navigate]);

  // Notification when admin resolves report (with or without response)
  useEffect(() => {
    // Find reports that are resolved and haven't been processed yet
    const resolvedReports = reports.filter(
      (report) => report.status === 'Resolved' && !processedReportIds.has(report._id)
    );
    
    // Only process if we have new resolved reports to avoid unnecessary rerenders
    if (resolvedReports.length > 0) {
      const newNotifications = resolvedReports.map((report) => {
        const hasAdminResponse = report.adminResponse && report.adminResponse.trim() !== '';
        let message;
        
        if (report.postId) {
          // Post exists - include post title
          message = hasAdminResponse
            ? `Your report for post "${report.postId.title}" has been reviewed with admin comments.`
            : `Your report for post "${report.postId.title}" has been resolved.`;
        } else {
          // Post was deleted - don't mention "Deleted post"
          message = hasAdminResponse
            ? "Your report has been reviewed with admin comments."
            : "Your report has been resolved.";
        }
        
        return {
          message,
          reportId: report._id,
          postId: report.postId?._id, // Store the actual post ID for navigation
          hasResponse: hasAdminResponse
        };
      });

      // Update notifications
      setNotifications((prev) => [...prev, ...newNotifications]);
      
      // Track which reports have been processed
      const newProcessedIds = new Set(processedReportIds);
      resolvedReports.forEach(report => newProcessedIds.add(report._id));
      setProcessedReportIds(newProcessedIds);
    }
  }, [reports, processedReportIds]);

  const handleViewPost = async (postId) => {
    // If postId is null, show error directly
    if (!postId) {
      setPostError('This post has been removed or does not exist.');
      return;
    }
    
    try {
      // Clear any previous errors
      setPostError(null);
      
      // Debug: Log the token and postId to verify they have values
      console.log('Attempting to fetch post:', postId);
      console.log('Auth token available:', !!token);
      
      // Fetch the post to check if it exists - INCLUDE THE AUTH TOKEN
      const response = await axios.get(`http://localhost:5000/api/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Debug: Log the response
      console.log('Post fetch successful:', response.data);
      
      if (response.data) {
        // If the post exists, navigate to the post's details page
        navigate(`/post/${postId}`);
      } else {
        setPostError('This post has been removed or does not exist.');
      }
    } catch (error) {
      console.error('Error fetching post details:', error);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.response?.data?.message || error.message);
      
      if (error.response?.status === 401) {
        setPostError('Authentication error. Please log in again.');
      } else if (error.response?.status === 404) {
        setPostError('This post has been removed or does not exist.');
      } else {
        setPostError('Error loading post. Please try again later.');
      }
    }
  };
  
  const dismissAllNotifications = () => {
    // Save all current notification IDs to processed set
    const newProcessedIds = new Set(processedReportIds);
    notifications.forEach(notification => newProcessedIds.add(notification.reportId));
    
    // Update state and localStorage
    setProcessedReportIds(newProcessedIds);
    localStorage.setItem('processedReportIds', JSON.stringify([...newProcessedIds]));
    
    // Clear notifications
    setNotifications([]);
  };

  const handleCopyReportId = (reportId) => {
    navigator.clipboard.writeText(reportId);
    toast({
      title: "Report ID Copied",
      description: "The report ID has been copied to your clipboard",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  // Calculate report statistics
  const reportStats = {
    total: reports.length,
    resolved: reports.filter(report => report.status === 'Resolved').length,
    pending: reports.filter(report => report.status === 'Pending').length,
    resolutionRate: reports.length > 0 
      ? Math.round((reports.filter(report => report.status === 'Resolved').length / reports.length) * 100) 
      : 0
  };

  if (loading) {
    return <Spinner size="lg" />;
  }

  return (
    <Box className="reports-container" p={6}>
      <Text className="page-title">My Reports</Text>

      {/* Report Statistics */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
        <Stat bg="white" p={4} borderRadius="md" boxShadow="sm">
          <StatLabel>Total Reports</StatLabel>
          <StatNumber>{reportStats.total}</StatNumber>
          <StatHelpText>All time</StatHelpText>
        </Stat>
        <Stat bg="white" p={4} borderRadius="md" boxShadow="sm">
          <StatLabel>Resolved</StatLabel>
          <StatNumber color="green.500">{reportStats.resolved}</StatNumber>
          <StatHelpText>Successfully handled</StatHelpText>
        </Stat>
        <Stat bg="white" p={4} borderRadius="md" boxShadow="sm">
          <StatLabel>Pending</StatLabel>
          <StatNumber color="yellow.500">{reportStats.pending}</StatNumber>
          <StatHelpText>Under review</StatHelpText>
        </Stat>
        <Stat bg="white" p={4} borderRadius="md" boxShadow="sm">
          <StatLabel>Resolution Rate</StatLabel>
          <StatNumber color="blue.500">{reportStats.resolutionRate}%</StatNumber>
          <StatHelpText>Of total reports</StatHelpText>
        </Stat>
      </SimpleGrid>

      {/* Dismiss All Notifications button */}
      {notifications.length > 1 && (
        <Box textAlign="right" mb={2}>
          <Button 
            colorScheme="gray" 
            size="sm" 
            onClick={dismissAllNotifications}
          >
            Dismiss All Notifications
          </Button>
        </Box>
      )}

     {/* Simple notification alert matching the design */}
      {notifications.length > 0 &&
        notifications.map((notification, index) => (
          <Alert 
            status="info"
            key={notification.reportId} 
            mb={4}
            variant="subtle"
            borderRadius="md"
            py={2}
            display="flex"
            alignItems="center"
            bg="blue.50"
          >
            <AlertIcon color="blue.400" />
            <Box flex="1" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
              <Text mb={0} fontWeight="medium">{notification.message}</Text>
            </Box>
            <Button
              colorScheme="gray"
              size="sm"
              variant="outline"
              onClick={() => {
                const newProcessedIds = new Set(processedReportIds);
                newProcessedIds.add(notification.reportId);
                setProcessedReportIds(newProcessedIds);
                
                localStorage.setItem('processedReportIds', JSON.stringify([...newProcessedIds]));
                
                setNotifications(prev => prev.filter(n => n.reportId !== notification.reportId));
              }}
            >
              Dismiss
            </Button>
          </Alert>
        ))}

      {/* Handle post error */}
      {postError && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          <AlertDescription>{postError}</AlertDescription>
        </Alert>
      )}

      {reports.length === 0 ? (
        <Text>No reports found.</Text>
      ) : (
        <VStack className="reports-list" align="stretch" spacing={4}>
          {reports.map((report) => (
            <Box 
              key={report._id} 
              className={`report-card ${!report.postId ? 'deleted-post' : ''}`}
              borderLeft={report.status === 'Resolved' ? '4px solid green' : undefined}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Text className="report-title">
                  {report.postId ? (
                    <>Post: {report.postId.title}</>
                  ) : (
                    <span className="deleted-post-indicator">
                      <i className="fa fa-exclamation-triangle" aria-hidden="true"></i> This post has been permanently removed
                    </span>
                  )}
                </Text>
              </Box>
              <Text className="report-type">Category: {report.reportType}</Text>
              <Text className="report-description">
                <Text className="description-label">Description:</Text> {report.description}
              </Text>
              <Text 
                className="report-status" 
                color={report.status === 'Resolved' ? 'green.500' : undefined}
                fontWeight={report.status === 'Resolved' ? 'bold' : undefined}
              >
                Status: {report.status}
              </Text>
              {report.adminResponse && (
                <Box mt={2} bg="gray.50" p={2} borderRadius="md">
                  <Text className="admin-response" fontWeight="bold">Admin Response:</Text>
                  <Text fontStyle="italic">{report.adminResponse}</Text>
                </Box>
              )}

              {/* Show empty admin response message if resolved but no response */}
              {!report.adminResponse && report.status === 'Resolved' && (
                <Box mt={2} bg="gray.50" p={2} borderRadius="md">
                  <Text className="admin-response" fontWeight="bold">Admin Response:</Text>
                  <Text fontStyle="italic" color="gray.500">Report resolved without additional comments.</Text>
                </Box>
              )}

              {/* View Post Button */}
              {report.postId ? (
                <Button
                  colorScheme="blue"
                  className="view-post-btn"
                  onClick={() => handleViewPost(report.postId._id)} 
                  size="sm"
                  mt={3}
                >
                  View Post
                </Button>
              ) : (
                <Button
                  className="deleted-post-btn"
                  size="sm"
                  isDisabled
                  mt={3}
                >
                  Post Permanently Removed
                </Button>
              )}
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default ViewMyReportsPage;