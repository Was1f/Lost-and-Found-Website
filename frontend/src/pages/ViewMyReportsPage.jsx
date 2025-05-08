import { useState, useEffect } from 'react';
import { Box, Text, VStack, Spinner } from '@chakra-ui/react';
import axios from 'axios';

const ViewMyReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('authToken');

  useEffect(() => {
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
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [token]);

  if (loading) {
    return <Spinner size="lg" />;
  }

  return (
    <Box p={6}>
      <Text fontSize="2xl" mb={4}>My Reports</Text>
      {reports.length === 0 ? (
        <Text>No reports found.</Text>
      ) : (
        <VStack align="start" spacing={4}>
          {reports.map((report) => (
            <Box key={report._id} p={4} shadow="md" borderWidth="1px" rounded="md" width="100%">
              <Text fontWeight="bold">Post: {report.postId.title}</Text>
              <Text>Type: {report.reportType}</Text>
              <Text>Description: {report.description}</Text>
              <Text>Status: {report.status}</Text>
              {report.adminResponse && (
                <Text>Admin Response: {report.adminResponse}</Text>
              )}
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default ViewMyReportsPage;
