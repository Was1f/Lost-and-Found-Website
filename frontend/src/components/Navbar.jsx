import { 
	Button, 
	Container, 
	Flex, 
	HStack, 
	Text, 
	useColorMode,
	Box,
	IconButton,
	Menu,
	MenuButton,
	MenuList,
	MenuItem,
	Avatar,
	useDisclosure,
	Drawer,
	DrawerOverlay,
	DrawerContent,
	DrawerCloseButton,
	DrawerHeader,
	DrawerBody,
	VStack,
	useBreakpointValue,
	Image
} from "@chakra-ui/react";
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { PlusSquareIcon, HamburgerIcon } from "@chakra-ui/icons";
import { FaHome, FaHistory, FaUser, FaBookmark, FaHandshake, FaFlag } from "react-icons/fa";
import { FaBoxArchive } from "react-icons/fa6";
import { useState, useEffect } from "react";
import axios from "axios";

const Navbar = () => {
	const { colorMode } = useColorMode();
	const navigate = useNavigate();
	const location = useLocation();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const isMobile = useBreakpointValue({ base: true, md: false });
	const [userProfile, setUserProfile] = useState(null);

	const token = localStorage.getItem("authToken");
	const adminToken = localStorage.getItem("adminToken");
	const isAdmin = userProfile?.email === 'zidan@gmail.com';

	useEffect(() => {
		const fetchUserProfile = async () => {
			if (token) {
				try {
					const response = await axios.get("http://localhost:5000/api/userprofile/me", {
						headers: {
							Authorization: `Bearer ${token}`,
						},
					});
					setUserProfile(response.data);
				} catch (error) {
					console.error("Failed to fetch user profile", error);
				}
			}
		};
		fetchUserProfile();
	}, [token]);

	const handleLogout = () => {
		localStorage.removeItem("authToken");
		navigate("/login");
	};

	const isActive = (path) => {
		return location.pathname === path;
	};

	const NavButton = ({ to, icon, children, isHighlighted }) => (
		<Link to={to}>
			<Button
				variant={isHighlighted ? "solid" : "ghost"}
				colorScheme={isHighlighted ? "blue" : "gray"}
				color="blue.50"
				leftIcon={icon}
				size="md"
				bg={isActive(to) && !isHighlighted ? "rgba(69, 65, 145, 0.25)" : undefined}
				_hover={{
					transform: "translateY(-2px)",
					boxShadow: "sm",
					textDecoration: "none",
					color: "white",
					bg: isActive(to) && !isHighlighted ? "rgba(70, 66, 170, 0.38)" : undefined
				}}
				_active={{
					transform: "translateY(0px)"
				}}
				transition="all 0.2s ease"
				borderRadius="md"
				fontWeight={isActive(to) ? "medium" : "normal"}
			>
				{children}
			</Button>
		</Link>
	);

	const MobileNav = () => (
		<Drawer isOpen={isOpen} placement="right" onClose={onClose}>
			<DrawerOverlay />
			<DrawerContent>
				<DrawerCloseButton />
				<DrawerHeader>Menu</DrawerHeader>
				<DrawerBody>
					<VStack spacing={4} align="stretch">
						<NavButton to="/" icon={<FaHome />}>Home</NavButton>
						{isAdmin && (
							<NavButton to="/auto-matching-result" icon={<FaHandshake />}>Matches</NavButton>
						)}
						<NavButton to="/recent" icon={<FaHistory />}>Recent Posts</NavButton>
						{!isAdmin && (
							<>
								<NavButton to="/my-posts" icon={<FaUser />}>My Posts</NavButton>
								<NavButton to="/my-reports" icon={<FaFlag />}>My Reports</NavButton>
								<NavButton to="/userdashboard" icon={<FaBoxArchive />}>Archived</NavButton>
								<NavButton to="/create" icon={<PlusSquareIcon />} isHighlighted>Create Post</NavButton>
							</>
						)}
						{isAdmin && (
							<NavButton to="/dashboard" icon={<FaUser />}>Dashboard</NavButton>
						)}
						<Button
							onClick={handleLogout}
							colorScheme="red"
							variant="outline"
							leftIcon={<FaUser />}
						>
							Logout
						</Button>
					</VStack>
				</DrawerBody>
			</DrawerContent>
		</Drawer>
	);

	return (
		<Box 
			position="sticky" 
			top={0} 
			zIndex={1000} 
			bg={colorMode === "light" ? "white" : "gray.800"}
			boxShadow="sm"
			borderBottom="1px"
			borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
		>
			<Container maxW="1400px" px={4}>
				<Flex
					h={16}
					alignItems="center"
					justifyContent="space-between"
				>
					{/* Logo */}
					<Link to="/">
						<Text
							fontSize={{ base: "xl", md: "2xl" }}
							fontWeight="bold"
							bgGradient="linear(to-r, blue.400, blue.600)"
							bgClip="text"
							_hover={{
								transform: "scale(1.05)",
							}}
							transition="all 0.2s"
						>
							Lost & Found
						</Text>
					</Link>

					{/* Navigation */}
					{token ? (
						<>
							{isMobile ? (
								<IconButton
									icon={<HamburgerIcon />}
									variant="ghost"
									onClick={onOpen}
									aria-label="Open menu"
								/>
							) : (
								<HStack spacing={4}>
									<NavButton to="/" icon={<FaHome />}>Home</NavButton>
									{isAdmin && (
										<NavButton to="/auto-matching-result" icon={<FaHandshake />}>Matches</NavButton>
									)}
									<NavButton to="/recent" icon={<FaHistory />}>Recent Posts</NavButton>
									{!isAdmin && (
										<>
											<NavButton to="/my-posts" icon={<FaUser />}>My Posts</NavButton>
											<NavButton to="/my-reports" icon={<FaFlag />}>My Reports</NavButton>
											<NavButton to="/userdashboard" icon={<FaBoxArchive />}>Archived</NavButton>
											<NavButton to="/create" icon={<PlusSquareIcon />} isHighlighted>Create Post</NavButton>
										</>
									)}
									{isAdmin && (
										<NavButton to="/dashboard" icon={<FaUser />}>Dashboard</NavButton>
									)}
									<Menu>	
										<MenuButton
											as={Button}
											variant="ghost"
											_hover={{ bg: "transparent" }}
										>
											{userProfile?.profilePic ? (
												<Image
													src={`http://localhost:5000/${userProfile.profilePic}`}
													alt="Profile"
													boxSize="32px"
													borderRadius="full"
													objectFit="cover"
												/>
											) : (
												<Avatar size="sm" name={userProfile?.username} />
											)}
										</MenuButton>
										<MenuList>
											<MenuItem onClick={() => navigate("/profile")}>Profile</MenuItem>
											<MenuItem onClick={handleLogout} color="red.500">Logout</MenuItem>
										</MenuList>
									</Menu>
									{/* Bookmarks icon only for non-admins */}
									{!isAdmin && (
										<Link to="/bookmarks" style={{ marginLeft: "4px" }}>
											<IconButton
												icon={<FaBookmark size="24px" />}
												variant="ghost"
												aria-label="Bookmarks"
												size="lg"
												color={isActive('/bookmarks') ? "blue.500" : "gray.500"}
												_hover={{
													transform: "translateY(-2px)",
													boxShadow: "sm",
												}}
												_active={{
													transform: "translateY(0px)"
												}}
												transition="all 0.2s ease"
											/>
										</Link>
									)}
								</HStack>
							)}
						</>
					) : (
						<HStack spacing={4}>
							<Link to="/login">
								<Button variant="ghost" colorScheme="blue">
									Login
								</Button>
							</Link>
							<Link to="/signup">
								<Button colorScheme="blue">
									Sign Up
								</Button>
							</Link>
						</HStack>
					)}
				</Flex>
			</Container>
			<MobileNav />
		</Box>
	);
};

export default Navbar;