import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { Toaster } from 'react-hot-toast';

import { DashboardProvider } from './contexts/DashboardContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import TestRunner from './pages/TestRunner';
import Configuration from './pages/Configuration';
import Reports from './pages/Reports';
import ExecutionHistory from './pages/ExecutionHistory';

// Create Material-UI theme (Cypress-like dark theme)
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00d4aa',
      light: '#4ffcd2',
      dark: '#00a383',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#9c88ff',
      light: '#cfbaff',
      dark: '#6a5acd',
      contrastText: '#ffffff'
    },
    background: {
      default: '#1a1a1a',
      paper: '#2a2a2a'
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0'
    },
    success: {
      main: '#4caf50'
    },
    error: {
      main: '#f44336'
    },
    warning: {
      main: '#ff9800'
    },
    info: {
      main: '#2196f3'
    }
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif'
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '8px 16px'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6
        }
      }
    }
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DashboardProvider>
        <Router>
          <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/test-runner" element={<TestRunner />} />
                <Route path="/configuration" element={<Configuration />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/history" element={<ExecutionHistory />} />
              </Routes>
            </Layout>
          </Box>
        </Router>
        
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#333',
              color: '#fff',
              borderRadius: '8px',
              border: '1px solid #444'
            },
            success: {
              style: {
                background: '#2e7d32',
                color: '#fff'
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#2e7d32'
              }
            },
            error: {
              style: {
                background: '#d32f2f',
                color: '#fff'
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#d32f2f'
              }
            }
          }}
        />
      </DashboardProvider>
    </ThemeProvider>
  );
}

export default App;