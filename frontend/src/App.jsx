import { Box, useColorModeValue } from "@chakra-ui/react";
import { Route, Routes } from "react-router-dom";
import { useEffect } from 'react';

import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage"; // Importing the Landing Page
import SignUp from "./pages/SignUp"; // Import SignUpPage
import Login from "./pages/Login"; // Import LoginPage
import ProfilePage from "./pages/ProfilePage";
import HistoryPage from "./pages/HistoryPage"; 
import PostForm from './pages/PostForm';
import ProtectedRoute from "./components/ProtectedRoute";
import RecentPostsPage from "./pages/RecentPostPage";
import MyPostsPage from "./pages/MyPostsPage";
import EditPostPage from "./pages/EditPostPage";
import PostDetailsPage from "./pages/PostDetailsPage";

function App() {
  useEffect(() => {
    // Check if token exists and if it's expired
    const token = localStorage.getItem('authToken');
    if (token) {
      // Decode token and check expiration (optional)
      const decoded = JSON.parse(atob(token.split('.')[1]));
      const expiry = decoded.exp * 1000;

      if (Date.now() > expiry) {
        // Token expired, remove it
        localStorage.removeItem('authToken');
      }
    }
  }, []);
  return (
    <Box minH={"100vh"} bg={useColorModeValue("gray.100", "gray.900")}>
      <Navbar />
      <Routes>
        <Route path='/' element={<LandingPage />} /> {/* Landing Page Route */}
        <Route path="/post/:id" element={<PostDetailsPage />} />
        <Route path='/create' element={<ProtectedRoute><PostForm /> </ProtectedRoute>} /> {/* Create Page Route */}
        <Route path='/signup' element={<SignUp />} /> {/* Sign Up Page Route */}
        <Route path='/login' element={<Login />} /> {/* Login Page Route */}
        <Route path="/profile" element={<ProfilePage />} /> {/* Profile Page Route */}
        <Route path='/history' element={<HistoryPage />} /> 
        <Route path="/recent" element={<RecentPostsPage />} />
        <Route path="/my-posts" element={<MyPostsPage />} />
        <Route path="/edit-post/:id" element={<EditPostPage />} />

      </Routes>
    </Box>
  );
}

export default App;
