import React, { useState, ReactNode } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Box,
  IconButton,
  Badge,
  Chip,
  Divider,
  Avatar,
  Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  PlayArrow as PlayArrowIcon,
  Settings as SettingsIcon,
  Assessment as ReportsIcon,
  History as HistoryIcon,
  Circle as CircleIcon,
  Notifications as NotificationsIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDashboard } from '../contexts/DashboardContext';

const drawerWidth = 280;

interface LayoutProps {
  children: ReactNode;
}

interface NavItem {
  text: string;
  icon: React.ReactElement;
  path: string;
  badge?: number;
}

export default function Layout({ children }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { state, actions } = useDashboard();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems: NavItem[] = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard'
    },
    {
      text: 'Test Runner',
      icon: <PlayArrowIcon />,
      path: '/test-runner',
      badge: state.tests.length
    },
    {
      text: 'Configuration',
      icon: <SettingsIcon />,
      path: '/configuration'
    },
    {
      text: 'Reports',
      icon: <ReportsIcon />,
      path: '/reports',
      badge: state.reports.length
    },
    {
      text: 'Execution History',
      icon: <HistoryIcon />,
      path: '/history',
      badge: state.executions.length
    }
  ];

  const getStatusColor = () => {
    if (!state.connected) return 'error';
    if (state.health.status === 'error') return 'error';
    if (state.health.status === 'issues') return 'warning';
    return 'success';
  };

  const getStatusText = () => {
    if (!state.connected) return 'Disconnected';
    if (state.activeExecution) return 'Running Tests';
    return 'Ready';
  };

  const drawer = (
    <Box>
      {/* Logo/Header */}
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          🚀 Selenium
        </Typography>
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          Test Dashboard
        </Typography>
        
        {/* Status Indicator */}
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <CircleIcon 
            sx={{ 
              fontSize: 12, 
              color: getStatusColor() === 'error' ? 'error.main' : 
                     getStatusColor() === 'warning' ? 'warning.main' : 'success.main'
            }} 
          />
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {getStatusText()}
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Navigation */}
      <List sx={{ px: 2, py: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText',
                  }
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{ fontWeight: location.pathname === item.path ? 600 : 400 }}
              />
              {item.badge !== undefined && item.badge > 0 && (
                <Chip 
                  label={item.badge} 
                  size="small" 
                  sx={{ 
                    height: 20, 
                    fontSize: '0.75rem',
                    backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.2)' : 'primary.main',
                    color: location.pathname === item.path ? 'white' : 'white'
                  }} 
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      {/* Quick Stats */}
      <Box sx={{ px: 3, py: 2 }}>
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 2 }}>
          Quick Stats
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">Total Tests</Typography>
            <Chip label={state.statistics.total} size="small" variant="outlined" />
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">Passed</Typography>
            <Chip 
              label={state.statistics.passed} 
              size="small" 
              sx={{ backgroundColor: 'success.main', color: 'white' }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">Failed</Typography>
            <Chip 
              label={state.statistics.failed} 
              size="small" 
              sx={{ backgroundColor: 'error.main', color: 'white' }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: 'background.paper',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {navItems.find(item => item.path === location.pathname)?.text || 'Dashboard'}
          </Typography>

          {/* Header Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Refresh Button */}
            <Tooltip title="Refresh Data">
              <IconButton onClick={actions.refreshAll} color="inherit">
                <RefreshIcon />
              </IconButton>
            </Tooltip>

            {/* Notifications */}
            <Tooltip title="Health Issues">
              <IconButton color="inherit">
                <Badge badgeContent={state.health.issues.length} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* User Avatar */}
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
              U
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: 'background.paper',
              borderRight: '1px solid',
              borderColor: 'divider'
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: 'background.paper',
              borderRight: '1px solid',
              borderColor: 'divider'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: 'background.default',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Toolbar /> {/* Spacer for fixed AppBar */}
        <Box sx={{ flexGrow: 1, p: 3, overflow: 'auto' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}