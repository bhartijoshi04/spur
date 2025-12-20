import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Paper, Typography, Box, Alert, Snackbar, IconButton } from '@mui/material';
import { Close, Minimize, SmartToy } from '@mui/icons-material';
import { motion } from 'framer-motion';
import type { Message } from '../types/chat';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { sendMessage } from '../services/api';

interface ChatWidgetProps {
  onClose: () => void;
}

export const ChatWidget = ({ onClose }: ChatWidgetProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string>();
  const [error, setError] = useState<string>();
  const [hasShownWelcome, setHasShownWelcome] = useState(false);

  useEffect(() => {
    if (!hasShownWelcome) {
      const timer = setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          const welcomeMessage: Message = {
            id: uuidv4(),
            content: "Hi! Need help with something?",
            sender: 'ai',
            timestamp: new Date(),
          };
          setMessages([welcomeMessage]);
          setIsTyping(false);
          setHasShownWelcome(true);
        }, 2000); // 2 second typing delay
      }, 1000); // 1 second before showing typing indicator

      return () => clearTimeout(timer);
    }
  }, [hasShownWelcome]);

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      content,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Show typing indicator
    setIsTyping(true);
    setError(undefined);

    try {
      const response = await sendMessage(content, sessionId);
      setSessionId(response.sessionId);
      
      // Parse the JSON string from reply
      const parsedReply = JSON.parse(response.reply);
      const aiMessage: Message = {
        id: uuidv4(),
        content: parsedReply.response,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30,
          duration: 0.4
        }}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 999,
        }}
      >
        <Paper
          elevation={8}
          sx={{
            width: 400,
            height: 600,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Box 
            sx={{ 
              background: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)',
              p: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SmartToy sx={{ color: 'white', fontSize: '1.5rem' }} />
              <Typography variant="h6" color="white" sx={{ fontWeight: 600 }}>
                spurbot Chat
              </Typography>
            </Box>
            <Box>
              <IconButton 
                size="small" 
                sx={{ color: 'white', mr: 0.5 }}
                onClick={onClose}
              >
                <Minimize />
              </IconButton>
              <IconButton 
                size="small" 
                sx={{ color: 'white' }}
                onClick={onClose}
              >
                <Close />
              </IconButton>
            </Box>
          </Box>
          <MessageList messages={messages} isTyping={isTyping} />
          <MessageInput onSendMessage={handleSendMessage} disabled={isTyping} />
        </Paper>
      </motion.div>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(undefined)}>
        <Alert severity="error" onClose={() => setError(undefined)}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};
