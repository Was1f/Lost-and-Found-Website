import { Box, useColorModeValue } from "@chakra-ui/react";
import { Route, Routes } from "react-router-dom";


import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage"; // Importing the Landing Page
import SignUp from "./pages/SignUp"; // Import SignUpPage
import Login from "./pages/Login"; // Import LoginPage
import ProfilePage from "./pages/ProfilePage";
import HistoryPage from "./pages/HistoryPage"; 
import PostForm from './pages/PostForm';
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Box minH={"100vh"} bg={useColorModeValue("gray.100", "gray.900")}>
      <Navbar />
      <Routes>
        <Route path='/' element={<LandingPage />} /> {/* Landing Page Route */}
       
        <Route path='/create' element={<ProtectedRoute><PostForm /> </ProtectedRoute>} /> {/* Create Page Route */}
        <Route path='/signup' element={<SignUp />} /> {/* Sign Up Page Route */}
        <Route path='/login' element={<Login />} /> {/* Login Page Route */}
        <Route path="/profile" element={<ProfilePage />} /> {/* Profile Page Route */}
        <Route path='/history' element={<HistoryPage />} /> 
        
      </Routes>
    </Box>
  );
}

export default App;
