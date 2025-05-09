import { useState, useEffect } from 'react';
import { Box, Text, VStack, Spinner, Button, Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';  // Using useNavigate for redirection

import './ViewMyReportsPage.css'; // Import the CSS file for styling

const ViewMyReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [postError, setPostError] = useState(null);  // To handle post error (deleted or not found)
  const [processedReportIds, setProcessedReportIds] = useState(new Set());
  const token = localStorage.getItem('authToken');
  const navigate = useNavigate();

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

  // Notification when admin responds
  useEffect(() => {
    // Find reports with admin responses that haven't been processed yet
    const reportsWithNewResponses = reports.filter(
      (report) => report.adminResponse && !processedReportIds.has(report._id)
    );
    
    // Only process if we have new responses to avoid unnecessary rerenders
    if (reportsWithNewResponses.length > 0) {
      const newNotifications = reportsWithNewResponses.map((report) => ({
        message: `Your report for post "${report.postId.title}" has been reviewed by the admin.`,
        reportId: report._id,
        postId: report.postId._id // Store the actual post ID for navigation
      }));

      // Update notifications
      setNotifications((prev) => [...prev, ...newNotifications]);
      
      // Track which reports have been processed
      const newProcessedIds = new Set(processedReportIds);
      reportsWithNewResponses.forEach(report => newProcessedIds.add(report._id));
      setProcessedReportIds(newProcessedIds);
    }
  }, [reports, processedReportIds]);

  const handleViewPost = async (postId) => {
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
    setNotifications([]);
  };

  if (loading) {
    return <Spinner size="lg" />;
  }

  return (
    <Box className="reports-container" p={6}>
      <Text className="page-title">My Reports</Text>
      
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

      {/* Show Notifications */}
      {notifications.length > 0 &&
        notifications.map((notification, index) => (
          <Alert status="info" key={notification.reportId} mb={4}>
            <AlertIcon />
            <Box flex="1">
              <AlertTitle>{notification.message}</AlertTitle>
            </Box>
            <Button
              colorScheme="blue"
              size="sm"
              mr={2}
              onClick={() => handleViewPost(notification.postId)} // Use the post ID, not report ID
            >
              View Post
            </Button>
            <Button
              colorScheme="gray"
              size="sm"
              onClick={() => setNotifications(prev => prev.filter(n => n.reportId !== notification.reportId))}
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
            <Box key={report._id} className="report-card">
              <Text className="report-title">Post: {report.postId.title}</Text>
              <Text className="report-type">Category: {report.reportType}</Text>
              <Text className="report-description"><Text className="description-label">Description:</Text> {report.description}</Text>
              <Text className="report-status">Status: {report.status}</Text>
              {report.adminResponse && (
                <Box mt={2}>
                  <Text className="admin-response">Admin Response:</Text>
                  <Text fontStyle="italic">{report.adminResponse}</Text>
                </Box>
              )}

              {/* View Post Button */}
              <Button
                colorScheme="blue"
                className="view-post-btn"
                onClick={() => handleViewPost(report.postId._id)} 
                size="sm"
              >
                View Post
              </Button>
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default ViewMyReportsPage;