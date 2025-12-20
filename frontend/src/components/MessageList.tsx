import { useEffect, useRef } from 'react';
import { Box, Avatar } from '@mui/material';
import { SmartToy, Person } from '@mui/icons-material';
import type { Message } from '../types/chat';
import { TypingDots } from './TypingDots';

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
            justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
            alignItems: 'flex-end',
            gap: 1,
            mb: 1
          }}
        >
          {message.sender === 'ai' && (
            <Avatar
              sx={{
                bgcolor: '#2196f3',
                width: 40,
                height: 40,
                mb: 0.5
              }}
            >
              <SmartToy sx={{ fontSize: '1.2rem', color: 'white' }} />
            </Avatar>
          )}
          <Box
            sx={{
              maxWidth: '70%',
              p: 2.5,
              borderRadius: message.sender === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
              backgroundColor: message.sender === 'user' ? '#4285f4' : '#f1f3f4',
              color: message.sender === 'user' ? 'white' : '#202124',
              fontSize: '0.95rem',
              lineHeight: 1.4,
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
            }}
          >
            {typeof message.content === 'string' ? (
              message.content
            ) : (
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                {JSON.stringify(message.content, null, 2)}
              </pre>
            )}
          </Box>
          {message.sender === 'user' && (
            <Avatar
              sx={{
                bgcolor: '#34a853',
                width: 40,
                height: 40,
                mb: 0.5
              }}
            >
              <Person sx={{ fontSize: '1.2rem', color: 'white' }} />
            </Avatar>
          )}
        </Box>
      ))}
      {isTyping && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-start',
          alignItems: 'flex-end',
          gap: 1,
          mb: 1
        }}>
          <Avatar
            sx={{
              bgcolor: '#2196f3',
              width: 40,
              height: 40,
              mb: 0.5
            }}
          >
            <SmartToy sx={{ fontSize: '1.2rem', color: 'white' }} />
          </Avatar>
          <Box sx={{ 
            p: 2.5,
            borderRadius: '20px 20px 20px 4px',
            backgroundColor: '#f1f3f4',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
          }}>
            <TypingDots />
          </Box>
        </Box>
      )}
      <div ref={messagesEndRef} />
    </Box>
  );
};
