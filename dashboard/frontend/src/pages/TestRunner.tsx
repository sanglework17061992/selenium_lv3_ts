import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  TextField,
  Stack,
  Alert,
  Checkbox,
  ListItem,
  ListItemIcon,
  ListItemText,
  List,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  ExpandMore as ExpandMoreIcon,
  Code as CodeIcon,
  Timer as TimerIcon,
  Computer as BrowserIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { useDashboard } from '../contexts/DashboardContext';
import { TestFile, TestExecutionOptions } from '../types';

export default function TestRunner() {
  const { state, actions } = useDashboard();
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [executionOptions, setExecutionOptions] = useState<TestExecutionOptions>({
    browser: state.configuration.BROWSER || 'chrome',
    headless: state.configuration.HEADLESS === 'true',
    environment: state.configuration.ENVIRONMENT || 'dev',
    parallel: state.configuration.PARALLEL_MODE === 'true',
    maxWorkers: parseInt(state.configuration.MAX_WORKERS || '4')
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    actions.loadTests();
  }, []);

  useEffect(() => {
    setExecutionOptions({
      browser: state.configuration.BROWSER || 'chrome',
      headless: state.configuration.HEADLESS === 'true',
      environment: state.configuration.ENVIRONMENT || 'dev',
      parallel: state.configuration.PARALLEL_MODE === 'true',
      maxWorkers: parseInt(state.configuration.MAX_WORKERS || '4')
    });
  }, [state.configuration]);

  const handleSelectAll = () => {
    if (selectedTests.length === state.tests.length) {
      setSelectedTests([]);
    } else {
      setSelectedTests(state.tests.map(test => test.filename));
    }
  };

  const handleSelectTest = (filename: string) => {
    setSelectedTests(prev => 
      prev.includes(filename) 
        ? prev.filter(f => f !== filename)
        : [...prev, filename]
    );
  };

  const handleExecuteTests = async () => {
    if (selectedTests.length === 0) {
      return;
    }

    setIsExecuting(true);
    try {
      await actions.executeTest(selectedTests, executionOptions);
    } catch (error) {
      console.error('Failed to execute tests:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleStopExecution = async () => {
    if (state.activeExecution) {
      await actions.stopExecution(state.activeExecution.id);
    }
  };

  const getTestStatusIcon = (testFile: TestFile) => {
    const recentExecution = state.executions
      .filter(exec => exec.testFile === testFile.filename)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())[0];

    if (!recentExecution) return null;

    switch (recentExecution.status) {
      case 'completed':
        return <Chip label="✓" size="small" color="success" />;
      case 'failed':
        return <Chip label="✗" size="small" color="error" />;
      case 'running':
        return <Chip label="●" size="small" color="info" />;
      default:
        return null;
    }
  };

  const browserOptions = [
    { value: 'chrome', label: 'Chrome', icon: '🌐' },
    { value: 'firefox', label: 'Firefox', icon: '🦊' },
    { value: 'edge', label: 'Edge', icon: '🌊' },
    { value: 'safari', label: 'Safari', icon: '🧭' }
  ];

  const environmentOptions = [
    { value: 'dev', label: 'Development', icon: '🛠️' },
    { value: 'staging', label: 'Staging', icon: '🎭' },
    { value: 'prod', label: 'Production', icon: '🚀' }
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            Test Runner
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Select and execute your Selenium tests
          </Typography>
        </Box>
        
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={actions.loadTests}
        >
          Refresh Tests
        </Button>
      </Box>

      {/* Active Execution Alert */}
      {state.activeExecution && (
        <Alert 
          severity="info" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={handleStopExecution}>
              STOP
            </Button>
          }
        >
          <Typography variant="body2">
            <strong>Test Running:</strong> {state.activeExecution.testFile}
          </Typography>
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Test Selection */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CodeIcon color="primary" />
                  Available Tests ({state.tests.length})
                </Typography>
                
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleSelectAll}
                  startIcon={selectedTests.length === state.tests.length ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />}
                >
                  {selectedTests.length === state.tests.length ? 'Deselect All' : 'Select All'}
                </Button>
              </Box>

              {state.tests.length === 0 ? (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 4,
                  color: 'text.secondary'
                }}>
                  <Typography variant="h6" gutterBottom>
                    No Tests Found
                  </Typography>
                  <Typography variant="body2">
                    Make sure your test files are in the tests directory and end with .test.ts
                  </Typography>
                </Box>
              ) : (
                <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {state.tests.map((test) => (
                    <ListItem
                      key={test.id}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        mb: 1,
                        backgroundColor: selectedTests.includes(test.filename) ? 'action.selected' : 'background.paper'
                      }}
                    >
                      <ListItemIcon>
                        <Checkbox
                          checked={selectedTests.includes(test.filename)}
                          onChange={() => handleSelectTest(test.filename)}
                          color="primary"
                        />
                      </ListItemIcon>
                      
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                              {test.name}
                            </Typography>
                            {getTestStatusIcon(test)}
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              {test.filename}
                            </Typography>
                            {test.description && (
                              <Typography variant="body2" sx={{ mt: 0.5 }}>
                                {test.description}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Execution Configuration */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <SettingsIcon color="primary" />
                Execution Configuration
              </Typography>

              <Stack spacing={3}>
                {/* Browser Selection */}
                <FormControl fullWidth>
                  <InputLabel>Browser</InputLabel>
                  <Select
                    value={executionOptions.browser}
                    label="Browser"
                    onChange={(e) => setExecutionOptions(prev => ({ ...prev, browser: e.target.value }))}
                  >
                    {browserOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span>{option.icon}</span>
                          {option.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Environment Selection */}
                <FormControl fullWidth>
                  <InputLabel>Environment</InputLabel>
                  <Select
                    value={executionOptions.environment}
                    label="Environment"
                    onChange={(e) => setExecutionOptions(prev => ({ ...prev, environment: e.target.value }))}
                  >
                    {environmentOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span>{option.icon}</span>
                          {option.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Headless Mode */}
                <FormControlLabel
                  control={
                    <Switch
                      checked={executionOptions.headless}
                      onChange={(e) => setExecutionOptions(prev => ({ ...prev, headless: e.target.checked }))}
                      color="primary"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {executionOptions.headless ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                      Headless Mode
                    </Box>
                  }
                />

                {/* Parallel Execution */}
                <FormControlLabel
                  control={
                    <Switch
                      checked={executionOptions.parallel}
                      onChange={(e) => setExecutionOptions(prev => ({ ...prev, parallel: e.target.checked }))}
                      color="primary"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TimerIcon fontSize="small" />
                      Parallel Execution
                    </Box>
                  }
                />

                {/* Max Workers (only when parallel is enabled) */}
                {executionOptions.parallel && (
                  <TextField
                    label="Max Workers"
                    type="number"
                    value={executionOptions.maxWorkers}
                    onChange={(e) => setExecutionOptions(prev => ({ ...prev, maxWorkers: parseInt(e.target.value) || 4 }))}
                    inputProps={{ min: 1, max: 10 }}
                    fullWidth
                    size="small"
                  />
                )}

                {/* Advanced Options Accordion */}
                <Accordion expanded={showAdvanced} onChange={() => setShowAdvanced(!showAdvanced)}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2">Advanced Options</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={2}>
                      <TextField
                        label="Test Pattern"
                        value={executionOptions.testPattern || ''}
                        onChange={(e) => setExecutionOptions(prev => ({ ...prev, testPattern: e.target.value }))}
                        placeholder="e.g., **/*login*.test.ts"
                        fullWidth
                        size="small"
                        helperText="Use glob patterns to filter tests"
                      />
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              </Stack>
            </CardContent>
          </Card>

          {/* Execution Summary */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Execution Summary
              </Typography>
              
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Selected Tests:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {selectedTests.length}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Browser:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {browserOptions.find(b => b.value === executionOptions.browser)?.label}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Mode:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {executionOptions.headless ? 'Headless' : 'Visible'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Execution:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {executionOptions.parallel ? `Parallel (${executionOptions.maxWorkers} workers)` : 'Sequential'}
                  </Typography>
                </Box>
              </Stack>

              {/* Run Button */}
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={state.activeExecution ? <StopIcon /> : <PlayIcon />}
                onClick={state.activeExecution ? handleStopExecution : handleExecuteTests}
                disabled={(!state.activeExecution && selectedTests.length === 0) || isExecuting || !state.connected}
                color={state.activeExecution ? "error" : "primary"}
                sx={{ mt: 3 }}
              >
                {state.activeExecution 
                  ? 'Stop Execution' 
                  : isExecuting 
                    ? 'Starting...'
                    : `Run ${selectedTests.length} Test${selectedTests.length !== 1 ? 's' : ''}`
                }
              </Button>

              {!state.connected && (
                <Typography variant="caption" color="error" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                  Connection required to run tests
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}