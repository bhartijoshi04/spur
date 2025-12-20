import { motion } from 'framer-motion';
import { Fab } from '@mui/material';
import { Chat, Close } from '@mui/icons-material';

interface FloatingChatIconProps {
  onClick: () => void;
  isActive: boolean;
}

export const FloatingChatIcon = ({ onClick, isActive }: FloatingChatIconProps) => {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 260, 
        damping: 20,
        duration: 0.6 
      }}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 1000,
      }}
    >
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          rotate: isActive ? 45 : 0,
        }}
        transition={{ duration: 0.2 }}
      >
        <Fab
          color="primary"
          onClick={onClick}
          sx={{
            background: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)',
            boxShadow: '0 8px 32px rgba(33, 150, 243, 0.3)',
            '&:hover': {
              background: 'linear-gradient(45deg, #1976d2 30%, #1cb5e0 90%)',
              boxShadow: '0 12px 40px rgba(33, 150, 243, 0.4)',
            },
            transition: 'all 0.3s ease-in-out',
          }}
        >
          {isActive ? <Close /> : <Chat />}
        </Fab>
      </motion.div>
    </motion.div>
  );
};
