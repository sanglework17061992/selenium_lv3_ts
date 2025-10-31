import React, { useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  LinearProgress,
  Alert,
  Stack,
  IconButton,
  Tooltip,
  Fade,
  Paper
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Computer as BrowserIcon
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { format } from 'date-fns';
import { useDashboard } from '../contexts/DashboardContext';
import { TestFile, TestExecution } from '../types';

const COLORS = {
  passed: '#4caf50',
  failed: '#f44336',
  skipped: '#ff9800',
  running: '#2196f3'
};

export default function Dashboard() {
  const { state, actions } = useDashboard();

  useEffect(() => {
    // Refresh data on component mount
    actions.refreshAll();
    
    // Set up periodic refresh
    const interval = setInterval(() => {
      actions.loadStatistics();
      if (state.activeExecution) {
        actions.loadExecutionHistory();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleRunAllTests = async () => {
    try {
      await actions.executeAllTests({
        browser: state.configuration.BROWSER || 'chrome',
        headless: state.configuration.HEADLESS === 'true',
        parallel: state.configuration.PARALLEL_MODE === 'true'
      });
    } catch (error) {
      console.error('Failed to run all tests:', error);
    }
  };

  const handleStopExecution = async () => {
    if (state.activeExecution) {
      await actions.stopExecution(state.activeExecution.id);
    }
  };

  const testStatsData = [
    { name: 'Passed', value: state.statistics.passed, color: COLORS.passed },
    { name: 'Failed', value: state.statistics.failed, color: COLORS.failed },
    { name: 'Skipped', value: state.statistics.skipped, color: COLORS.skipped }
  ].filter(item => item.value > 0);

  const recentExecutions = state.executions.slice(0, 5);

  const getExecutionStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'running': return 'info';
      case 'cancelled': return 'warning';
      default: return 'default';
    }
  };

  const getExecutionStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckIcon fontSize="small" />;
      case 'failed': return <ErrorIcon fontSize="small" />;
      case 'running': return <ScheduleIcon fontSize="small" />;
      case 'cancelled': return <StopIcon fontSize="small" />;
      default: return <ScheduleIcon fontSize="small" />;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          Test Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Monitor and control your Selenium test automation
        </Typography>
      </Box>

      {/* Connection Status Alert */}
      {!state.connected && (
        <Fade in={!state.connected}>
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2">
              Real-time connection lost. Some features may be limited.
            </Typography>
          </Alert>
        </Fade>
      )}

      {/* Health Issues Alert */}
      {state.health.issues.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            System Issues Detected:
          </Typography>
          <Box component="ul" sx={{ mt: 1, pl: 2 }}>
            {state.health.issues.map((issue, index) => (
              <Typography component="li" variant="body2" key={index}>
                {issue}
              </Typography>
            ))}
          </Box>
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <SpeedIcon color="primary" />
                Quick Actions
              </Typography>
              
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Button
                  variant="contained"
                  startIcon={state.activeExecution ? <StopIcon /> : <PlayIcon />}
                  onClick={state.activeExecution ? handleStopExecution : handleRunAllTests}
                  color={state.activeExecution ? "error" : "primary"}
                  size="large"
                  disabled={!state.connected}
                >
                  {state.activeExecution ? 'Stop Tests' : `Run All Tests (${state.tests.length})`}
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={actions.refreshAll}
                  size="large"
                >
                  Refresh Data
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={() => window.open('/reports/allure', '_blank')}
                  disabled={state.reports.length === 0}
                  size="large"
                >
                  View Reports
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Current Execution Status */}
        {state.activeExecution && (
          <Grid item xs={12}>
            <Card sx={{ backgroundColor: 'primary.dark', color: 'primary.contrastText' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Running: {state.activeExecution.testFile}
                  </Typography>
                  <Chip 
                    label={state.activeExecution.status.toUpperCase()} 
                    color="primary" 
                    variant="outlined"
                    sx={{ color: 'white', borderColor: 'white' }}
                  />
                </Box>
                
                <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                  Started: {format(state.activeExecution.startTime, 'HH:mm:ss')}
                </Typography>
                
                <LinearProgress 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: 'white'
                    }
                  }} 
                />
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Statistics Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Tests
                  </Typography>
                  <Typography variant="h4" component="div">
                    {state.statistics.total}
                  </Typography>
                </Box>
                <ScheduleIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Passed
                  </Typography>
                  <Typography variant="h4" component="div" color="success.main">
                    {state.statistics.passed}
                  </Typography>
                </Box>
                <CheckIcon sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Failed
                  </Typography>
                  <Typography variant="h4" component="div" color="error.main">
                    {state.statistics.failed}
                  </Typography>
                </Box>
                <ErrorIcon sx={{ fontSize: 40, color: 'error.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Available Tests
                  </Typography>
                  <Typography variant="h4" component="div" color="info.main">
                    {state.tests.length}
                  </Typography>
                </Box>
                <BrowserIcon sx={{ fontSize: 40, color: 'info.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Test Results Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Test Results Distribution
              </Typography>
              
              {testStatsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={testStatsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {testStatsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ 
                  height: 300, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'text.secondary'
                }}>
                  <Typography>No test results available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Executions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Recent Executions
              </Typography>
              
              {recentExecutions.length > 0 ? (
                <Stack spacing={2}>
                  {recentExecutions.map((execution) => (
                    <Paper 
                      key={execution.id} 
                      sx={{ 
                        p: 2, 
                        backgroundColor: 'background.default',
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getExecutionStatusIcon(execution.status)}
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {execution.testFile}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            label={execution.status} 
                            size="small" 
                            color={getExecutionStatusColor(execution.status) as any}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {format(execution.startTime, 'HH:mm')}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Box sx={{ 
                  height: 200, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'text.secondary'
                }}>
                  <Typography>No executions yet</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* System Status */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                System Status
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Connection
                    </Typography>
                    <Typography variant="h6" color={state.connected ? 'success.main' : 'error.main'}>
                      {state.connected ? 'Connected' : 'Disconnected'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Browser
                    </Typography>
                    <Typography variant="h6">
                      {state.configuration.BROWSER || 'chrome'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Environment
                    </Typography>
                    <Typography variant="h6">
                      {state.configuration.ENVIRONMENT || 'dev'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Last Run
                    </Typography>
                    <Typography variant="h6">
                      {state.statistics.lastRun 
                        ? format(new Date(state.statistics.lastRun), 'MM/dd HH:mm')
                        : 'Never'
                      }
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}