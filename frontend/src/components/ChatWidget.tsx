import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Paper, Typography, Box, Alert, Snackbar } from '@mui/material';
import type { Message } from '../types/chat';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { sendMessage } from '../services/api';

export const ChatWidget = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string>();
  const [error, setError] = useState<string>();

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
      <Paper
        elevation={3}
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          width: 400,
          height: 600,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ bgcolor: 'primary.main', p: 2 }}>
          <Typography variant="h6" color="white">
            AI Support Chat
          </Typography>
        </Box>
        <MessageList messages={messages} isTyping={isTyping} />
        <MessageInput onSendMessage={handleSendMessage} disabled={isTyping} />
      </Paper>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(undefined)}>
        <Alert severity="error" onClose={() => setError(undefined)}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};
