import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useColorModeValue,
} from "@chakra-ui/react";

const faqItems = [
  {
    question: "How do I report a lost item?",
    answer: "To report a lost item, first sign in to your account. Then click on 'Create Post' in the navigation bar. Fill out the form with details about your lost item, including a description, location, and any relevant photos. Once submitted, your post will be visible to the community."
  },
  {
    question: "How do I claim a found item?",
    answer: "If you've found an item that matches a lost item post, you can contact the poster through the platform. Click on the post and use the contact button to message the owner. You'll need to provide proof of ownership or specific details about the item to verify your claim."
  },
  {
    question: "Is my personal information safe?",
    answer: "Yes, we take privacy seriously. Your personal information is only shared when necessary for item recovery. We use secure encryption and follow best practices for data protection. Your contact information is only visible to other users when you choose to share it."
  },
  {
    question: "Can I edit or delete my posts?",
    answer: "Yes, you can edit or delete your posts at any time. Go to 'My Posts' in the navigation bar to see all your posts. Each post has options to edit or delete. Note that editing is only available for active posts."
  },
  {
    question: "What should I do if I find a lost item?",
    answer: "If you find a lost item, first check if there's a matching post on our platform. If not, create a new post in the 'Found Items' section. Include clear photos, the location where you found it, and any identifying details. Keep the item in a safe place until it's claimed."
  },
  {
    question: "How long are posts kept active?",
    answer: "Posts remain active for 30 days by default. You can extend this period if needed. After 30 days, posts are automatically archived but can be reactivated if the item is still lost or found."
  },
  {
    question: "Can I search for specific items?",
    answer: "Yes, you can use our search feature to look for specific items. You can search by item type, location, date, or keywords. The search is available to all signed-in users."
  },
  {
    question: "What types of items can I post?",
    answer: "You can post any lost or found items on campus. This includes electronics, books, clothing, accessories, and other personal belongings. However, we do not allow posting of dangerous items, illegal substances, or items that violate campus policies."
  }
];

const FAQPage = () => {
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");

  return (
    <Box py={20} bg={bgColor} minH="100vh">
      <Container maxW="container.xl">
        <VStack spacing={12}>
          <VStack spacing={4} textAlign="center">
            <Heading size="xl">Frequently Asked Questions</Heading>
            <Text fontSize="lg" color="gray.600" maxW="2xl">
              Find answers to common questions about our Lost and Found platform
            </Text>
          </VStack>

          <Box w="full" maxW="3xl" bg={cardBg} p={8} rounded="xl" boxShadow="lg">
            <Accordion allowMultiple>
              {faqItems.map((item, index) => (
                <AccordionItem key={index} border="none">
                  <h2>
                    <AccordionButton py={4}>
                      <Box flex="1" textAlign="left" fontWeight="bold">
                        {item.question}
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    <Text color="gray.600">{item.answer}</Text>
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default FAQPage; 