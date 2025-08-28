import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Divider,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import FirebirdLogo from './FirebirdLogo';

// Custom icon for Compute
const ComputeIcon = () => (
  <Box sx={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5.83334 8.33334C5.83334 7.15483 5.83334 6.56558 6.19945 6.19946C6.56557 5.83334 7.15482 5.83334 8.33334 5.83334H11.6667C12.8452 5.83334 13.4344 5.83334 13.8006 6.19946C14.1667 6.56558 14.1667 7.15483 14.1667 8.33334V11.6667C14.1667 12.8452 14.1667 13.4344 13.8006 13.8006C13.4344 14.1667 12.8452 14.1667 11.6667 14.1667H8.33334C7.15482 14.1667 6.56557 14.1667 6.19945 13.8006C5.83334 13.4344 5.83334 12.8452 5.83334 11.6667V8.33334Z" fill="#B99F6F"/>
      <path d="M3.33333 10C3.33333 6.85731 3.33333 5.28596 4.30964 4.30965C5.28595 3.33334 6.85730 3.33334 10 3.33334C13.1427 3.33334 14.7140 3.33334 15.6904 4.30965C16.6667 5.28596 16.6667 6.85731 16.6667 10C16.6667 13.1427 16.6667 14.7141 15.6904 15.6904C14.7140 16.6667 13.1427 16.6667 10 16.6667C6.85730 16.6667 5.28595 16.6667 4.30964 15.6904C3.33333 14.7141 3.33333 13.1427 3.33333 10Z" stroke="#181818" strokeWidth="1.2"/>
      <path d="M3.33333 10H1.66667" stroke="#181818" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M18.3333 10H16.6667" stroke="#181818" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M3.33333 7.5L1.66667 7.5" stroke="#181818" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M18.3333 7.5H16.6667" stroke="#181818" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M3.33333 12.5H1.66667" stroke="#181818" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M18.3333 12.5H16.6667" stroke="#181818" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M10 16.6667L10 18.3333" stroke="#181818" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M10 1.66666L10 3.33332" stroke="#181818" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M7.5 16.6667L7.5 18.3333" stroke="#181818" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M7.5 1.66666L7.5 3.33332" stroke="#181818" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M12.5 16.6667L12.5 18.3333" stroke="#181818" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M12.5 1.66666L12.5 3.33332" stroke="#181818" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  </Box>
);

const drawerWidth = 236;

const menuItems = [
  { text: 'Compute', icon: <ComputeIcon />, path: '/compute' },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawerContent = (
    <>
      {/* Logo Section */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        py: 3,
        // Removed borderBottom to eliminate the line between logo and navigation
      }}>
        <FirebirdLogo size="medium" />
      </Box>

      {/* Navigation Items */}
      <List sx={{ pt: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  mx: 2,
                  borderRadius: 1,
                  backgroundColor: isActive ? '#E0E0E0' : 'transparent', // More subtle active background
                  '&:hover': {
                    backgroundColor: isActive ? '#E0E0E0' : '#E8E8E8',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? '#B99F6F' : '#4A4A4A',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    '& .MuiListItemText-primary': {
                      color: '#181818',
                      fontSize: '14px',
                      fontWeight: 500,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Bottom Section */}
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Divider sx={{ mb: 2 }} />
        
        {/* Settings */}
        <ListItem disablePadding>
          <ListItemButton sx={{ borderRadius: 1 }}>
            <ListItemIcon sx={{ color: '#4A4A4A', minWidth: 40 }}>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText
              primary="Settings"
              sx={{
                '& .MuiListItemText-primary': {
                  color: '#181818',
                  fontSize: '14px',
                  fontWeight: 500,
                },
              }}
            />
          </ListItemButton>
        </ListItem>

        {/* User Profile */}
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, p: 1 }}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              backgroundColor: '#B99F6F',
              color: '#181818',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            R
          </Avatar>
          <Box sx={{ ml: 2, flex: 1 }}>
            <Typography
              variant="body2"
              sx={{
                color: '#181818',
                fontSize: '14px',
                fontWeight: 500,
                lineHeight: 1.2,
              }}
            >
              Robinson
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: '#7D7D7D',
                fontSize: '12px',
                lineHeight: 1.2,
              }}
            >
              Basic
            </Typography>
          </Box>
          <ArrowDownIcon sx={{ color: '#7D7D7D', fontSize: 16 }} />
        </Box>
      </Box>
    </>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Mobile Menu Button */}
      {isMobile && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: 1201,
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            '&:hover': {
              backgroundColor: '#F8F9F9',
            },
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* Sidebar */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#F8F9F9', // Changed to light grey background
            borderRight: '1px solid #E5E7EB',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main Content */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          backgroundColor: '#FFFFFF',
          height: '100vh',
          overflow: 'auto',
          margin: 0,
          padding: 0,
        }}
      >
        <Box sx={{ 
          height: '100%',
          margin: 0,
          padding: 0,
          pt: { xs: 3, sm: 0 }, // Only top padding on mobile for menu button
        }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
