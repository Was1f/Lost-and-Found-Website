import { Box, useColorModeValue } from "@chakra-ui/react";
import { Route, Routes } from "react-router-dom";
import { useEffect } from "react";

import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import ProfilePage from "./pages/ProfilePage";
import HistoryPage from "./pages/HistoryPage";
import PostForm from "./pages/PostForm";
import ProtectedRoute from "./components/ProtectedRoute";
import RecentPostsPage from "./pages/RecentPostPage";
import MyPostsPage from "./pages/MyPostsPage";
import EditPostPage from "./pages/EditPostPage";

// ✅ Admin Pages
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/Dashboard";
import PostManagement from "./pages/PostManagement";
import UserManagement from "./pages/UserManagement";

function App() {
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      const expiry = decoded.exp * 1000;

      if (Date.now() > expiry) {
        localStorage.removeItem('authToken');
      }
    }
  }, []);

  return (
    <Box minH={"100vh"} bg={useColorModeValue("gray.100", "gray.900")}>
      <Navbar />

      <Routes>
        {/* Public User Routes */}
        <Route path='/' element={<LandingPage />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='/login' element={<Login />} />
        <Route path='/profile' element={<ProfilePage />} />
        <Route path='/history' element={<HistoryPage />} />
        <Route path='/recent' element={<RecentPostsPage />} />
        <Route path='/my-posts' element={<MyPostsPage />} />
        <Route path='/edit-post/:id' element={<EditPostPage />} />
        <Route path='/create' element={<ProtectedRoute><PostForm /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path='/admin/login' element={<AdminLogin />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/admin/posts' element={<PostManagement />} />
        <Route path='/admin/users' element={<UserManagement />} />
      </Routes>
    </Box>
  );
}

export default App;
