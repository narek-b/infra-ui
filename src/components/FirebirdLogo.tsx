import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { Cloud as CloudIcon } from '@mui/icons-material';

interface FirebirdLogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  variant?: 'horizontal' | 'vertical';
}

export default function FirebirdLogo({ 
  size = 'medium', 
  showText = true, 
  variant = 'horizontal' 
}: FirebirdLogoProps) {
  const theme = useTheme();
  
  const sizeMap = {
    small: { icon: 20, text: 'body2' },
    medium: { icon: 32, text: 'h6' },
    large: { icon: 48, text: 'h4' }
  };
  
  const currentSize = sizeMap[size];
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        flexDirection: variant === 'vertical' ? 'column' : 'row'
      }}
    >
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CloudIcon 
          sx={{ 
            fontSize: currentSize.icon,
            color: theme.palette.primary.main,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
          }} 
        />
        {/* Add a small flame effect */}
        <Box
          sx={{
            position: 'absolute',
            bottom: -2,
            right: -2,
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': {
                transform: 'scale(1)',
                opacity: 0.8,
              },
              '50%': {
                transform: 'scale(1.2)',
                opacity: 1,
              },
              '100%': {
                transform: 'scale(1)',
                opacity: 0.8,
              },
            },
          }}
        />
      </Box>
      {showText && (
        <Typography 
          variant={currentSize.text as any}
          sx={{ 
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}
        >
          Firebird
        </Typography>
      )}
    </Box>
  );
} 