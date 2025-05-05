import { Box, useColorModeValue } from "@chakra-ui/react";
import { Route, Routes } from "react-router-dom";

import CreatePage from "./pages/CreatePage";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage"; // Importing the Landing Page
import SignUp from "./pages/SignUp"; // Import SignUpPage
import Login from "./pages/Login"; // Import LoginPage
import ProfilePage from "./pages/ProfilePage";
import UserDashboard from "./pages/UserDashboard"; 

function App() {
  return (
    <Box minH={"100vh"} bg={useColorModeValue("gray.100", "gray.900")}>
      <Navbar />
      <Routes>
        <Route path='/' element={<LandingPage />} /> {/* Landing Page Route */}
       
        <Route path='/create' element={<CreatePage />} /> {/* Create Page Route */}
        <Route path='/signup' element={<SignUp />} /> {/* Sign Up Page Route */}
        <Route path='/login' element={<Login />} /> {/* Login Page Route */}
        <Route path="/profile" element={<ProfilePage />} /> {/* Profile Page Route */}
        <Route path='/dashboard' element={<UserDashboard />} /> 
        
      </Routes>
    </Box>
  );
}

export default App;
