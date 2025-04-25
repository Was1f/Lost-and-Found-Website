import { Button, Container, Flex, HStack, Text, useColorMode } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom"; // Import useNavigate to redirect
import { PlusSquareIcon } from "@chakra-ui/icons";
import { IoMoon } from "react-icons/io5";
import { LuSun } from "react-icons/lu";

const Navbar = () => {
	const { colorMode, toggleColorMode } = useColorMode();
	const navigate = useNavigate();

	const token = localStorage.getItem("authToken");
	const handleLogout = () => {
		// Remove the authToken from localStorage
		localStorage.removeItem("authToken");
	
		// Redirect to the login page after logout
		navigate("/login");
	  };
	return (
		<Container maxW={"1140px"} px={4}>
			<Flex
				h={16}
				alignItems={"center"}
				justifyContent={"space-between"}
				flexDir={{
					base: "column",
					sm: "row",
				}}
			>
				<Text
					fontSize={{ base: "22", sm: "28" }}
					fontWeight={"bold"}
					textTransform={"uppercase"}
					textAlign={"center"}
					bgGradient={"linear(to-r, cyan.400, blue.500)"}
					bgClip={"text"}
				>
					<Link to={"/"}>Lost & Found</Link>
				</Text>

				{token && (
				<HStack spacing={2} alignItems={"center"}>
				 
				 <Button onClick={toggleColorMode}>
						{colorMode === "light" ? <IoMoon /> : <LuSun size='20' />}
					</Button>

				 
				 <Link to={"/create"}>
						<Button>
							<PlusSquareIcon fontSize={20} />
						</Button>
					</Link>

					<Link to={"/my-posts"}>
							<Button
							variant="outline"
							colorScheme="blue"
							_hover={{
								background: "transparent",
								borderColor: "blue.500",
							}}
							>
							My Posts
							</Button>
						</Link>

						<Link to="/recent">
							<Button
						variant="outline"  // Transparent with border
						colorScheme="blue"  // Blue border color
						_hover={{
							background: "transparent", // Ensure background is transparent on hover too
							borderColor: "blue.500",  // Blue border color on hover
						}}
						>
						View Recent Posts
						</Button>
                </Link>

					<Button
					onClick={handleLogout}
					variant="outline"  // Transparent with border
					colorScheme="blue"  // Blue border color
					_hover={{
					background: "transparent", // Ensure background is transparent on hover too
					borderColor: "blue.500",  // Blue border color on hover
					}}
				>
					Log Out
				</Button>
				</HStack>
				)}
			</Flex>
		</Container>
	);
};
export default Navbar;