import { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import { SmartToy } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatWidget } from './components/ChatWidget';
import { FloatingChatIcon } from './components/FloatingChatIcon';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    background: {
      default: '#0a0f1c',
    },
  },
});

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showIcon, setShowIcon] = useState(false);

  useEffect(() => {
    // Show icon with slide-up animation after page load
    const timer = setTimeout(() => {
      setShowIcon(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        onClick={isChatOpen ? toggleChat : undefined}
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0a0f1c 0%, #1a237e 50%, #0d47a1 100%)',
          position: 'relative',
          overflow: 'hidden',
          cursor: isChatOpen ? 'pointer' : 'default',
        }}
      >
        {/* Enhanced animated background elements */}
        <Box
          component={motion.div}
          animate={{
            rotate: [0, 360],
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          sx={{
            position: 'absolute',
            top: '8%',
            left: '5%',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(33, 150, 243, 0.15) 0%, rgba(144, 202, 249, 0.05) 50%, transparent 80%)',
            borderRadius: '50%',
            zIndex: 0,
            filter: 'blur(1px)',
          }}
        />
        <Box
          component={motion.div}
          animate={{
            rotate: [360, 0],
            scale: [1, 0.7, 1.2],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          sx={{
            position: 'absolute',
            top: '55%',
            right: '8%',
            width: '250px',
            height: '250px',
            background: 'radial-gradient(circle, rgba(144, 202, 249, 0.12) 0%, rgba(33, 150, 243, 0.03) 60%, transparent 80%)',
            borderRadius: '50%',
            zIndex: 0,
            filter: 'blur(2px)',
          }}
        />
        <Box
          component={motion.div}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
            rotate: [0, 180, 360],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          sx={{
            position: 'absolute',
            bottom: '15%',
            left: '15%',
            width: '180px',
            height: '180px',
            background: 'radial-gradient(circle, rgba(255, 87, 34, 0.08) 0%, rgba(255, 193, 7, 0.04) 70%, transparent 90%)',
            borderRadius: '50%',
            zIndex: 0,
          }}
        />
        
        {/* Additional floating particles */}
        {[...Array(6)].map((_, i) => (
          <Box
            key={i}
            component={motion.div}
            animate={{
              y: [0, -50, 0],
              x: [0, 25, 0],
              opacity: [0.1, 0.4, 0.1],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 1.5,
            }}
            sx={{
              position: 'absolute',
              top: `${20 + i * 10}%`,
              left: `${10 + i * 15}%`,
              width: '8px',
              height: '8px',
              background: `rgba(${100 + i * 20}, ${150 + i * 15}, 243, 0.6)`,
              borderRadius: '50%',
              zIndex: 0,
              boxShadow: `0 0 10px rgba(${100 + i * 20}, ${150 + i * 15}, 243, 0.4)`,
            }}
          />
        ))}

        {/* Main content area with enhanced welcome message */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            textAlign: 'center',
            zIndex: 1,
            position: 'relative',
            px: 4,
          }}
        >
          {/* Hero Section */}
          <motion.div
            initial={{ scale: 0, rotateY: 180 }}
            animate={{ scale: 1, rotateY: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 200,
              damping: 15,
              duration: 1.2, 
              delay: 0.8 
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: { xs: 2, sm: 3, md: 4 },
                fontSize: { xs: '3rem', sm: '4rem', md: '5rem' },
                marginBottom: 4,
                background: 'linear-gradient(135deg, #2196f3 0%, #21cbf3 50%, #90caf9 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: '900',
                fontFamily: '"Inter", "Roboto", sans-serif',
                letterSpacing: '-0.02em',
                textShadow: '0 0 30px rgba(33, 150, 243, 0.3)',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, #2196f3 0%, #21cbf3 50%, #90caf9 100%)',
                  WebkitBackgroundClip: 'text',
                  filter: 'blur(20px)',
                  opacity: 0.3,
                  zIndex: -1,
                },
              }}
            >
              <SmartToy 
                sx={{ 
                  fontSize: { xs: '3rem', sm: '4rem', md: '5rem' },
                  color: '#21cbf3',
                  filter: 'drop-shadow(0 0 30px rgba(33, 150, 243, 0.3))',
                }} 
              />
              spurbot
            </Box>
          </motion.div>

          {/* Subtitle with typing effect */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
          >
            <Box
              sx={{
                fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
                fontWeight: '600',
                background: 'linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(144,202,249,0.8) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: 3,
                fontFamily: '"Inter", sans-serif',
              }}
            >
              Your Intelligent AI Assistant
            </Box>
          </motion.div>

          {/* Main description */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.8 }}
          >
            <Box
              sx={{
                color: 'rgba(255, 255, 255, 0.75)',
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                maxWidth: '700px',
                lineHeight: 1.8,
                fontFamily: '"Inter", sans-serif',
                fontWeight: '400',
                marginBottom: 6,
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }}
            >
              Experience the future of AI conversation. Get instant answers, creative solutions, 
              and intelligent assistance for all your needs.
              <br />
              <Box component="span" sx={{ color: 'rgba(144, 202, 249, 0.9)', fontWeight: '500' }}>
                Click the chat icon below to begin your journey.
              </Box>
            </Box>
          </motion.div>

        </Box>

        {/* Floating Chat Icon - only show when chat is closed */}
        <AnimatePresence>
          {showIcon && !isChatOpen && (
            <FloatingChatIcon onClick={toggleChat} isActive={false} />
          )}
        </AnimatePresence>

        {/* Chat Widget */}
        <AnimatePresence>
          {isChatOpen && <ChatWidget onClose={toggleChat} />}
        </AnimatePresence>
      </Box>
    </ThemeProvider>
  );
}

export default App;
