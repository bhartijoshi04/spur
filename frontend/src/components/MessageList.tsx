import { useEffect, useRef } from 'react';
import { Box, Paper, CircularProgress } from '@mui/material';
import type { Message } from '../types/chat';

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
}

export const MessageList = ({ messages, isTyping }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  return (
    <Box sx={{ 
      flexGrow: 1, 
      overflow: 'auto', 
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }}>
      {messages.map((message) => (
        <Box
          key={message.id}
          sx={{
            display: 'flex',
            justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start'
          }}
        >
          <Paper
            elevation={1}
            sx={{
              maxWidth: '80%',
              p: 2,
              backgroundColor: message.sender === 'user' ? 'primary.main' : 'grey.100',
              color: message.sender === 'user' ? 'white' : 'text.primary'
            }}
          >
            {typeof message.content === 'string' ? (
              message.content
            ) : (
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                {JSON.stringify(message.content, null, 2)}
              </pre>
            )}
          </Paper>
        </Box>
      ))}
      {isTyping && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
          <Paper elevation={1} sx={{ p: 2, backgroundColor: 'grey.100' }}>
            <CircularProgress size={20} />
          </Paper>
        </Box>
      )}
      <div ref={messagesEndRef} />
    </Box>
  );
};
