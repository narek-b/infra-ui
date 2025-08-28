import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout';
import Compute from './pages/Compute';

// Create theme matching the design
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#181818',
    },
    secondary: {
      main: '#B99F6F',
    },
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#181818',
      secondary: '#7D7D7D',
    },
    grey: {
      50: '#F8F9F9',
      100: '#F1F5F9',
      200: '#E5E7EB',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
    },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    h4: {
      fontWeight: 600,
      fontSize: '18px',
      lineHeight: '23px',
      letterSpacing: '-0.03em',
      color: '#000000',
    },
    body1: {
      fontSize: '14px',
      lineHeight: '18px',
      color: '#181818',
    },
    body2: {
      fontSize: '12px',
      lineHeight: '16px',
      color: '#7D7D7D',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 6,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #E5E7EB',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/compute" replace />} />
            <Route path="/compute" element={<Compute />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
