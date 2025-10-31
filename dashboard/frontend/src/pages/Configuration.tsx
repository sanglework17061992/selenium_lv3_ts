import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Stack,
  Alert,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Computer as BrowserIcon,
  Cloud as EnvironmentIcon,
  Speed as PerformanceIcon,
  Visibility as VisibilityIcon,
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  RestartAlt as ResetIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useDashboard } from '../contexts/DashboardContext';
import { TestConfiguration } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Configuration() {
  const { state, actions } = useDashboard();
  const [config, setConfig] = useState<TestConfiguration>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    actions.loadConfiguration();
  }, []);

  useEffect(() => {
    setConfig(state.configuration);
    setHasChanges(false);
  }, [state.configuration]);

  const handleConfigChange = (key: string, value: any) => {
    setConfig(prev => {
      const newConfig = { ...prev, [key]: value };
      setHasChanges(JSON.stringify(newConfig) !== JSON.stringify(state.configuration));
      return newConfig;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Validate configuration first
      const validation = await validateConfiguration();
      if (validation.errors.length > 0) {
        setValidationErrors(validation.errors);
        return;
      }
      
      await actions.updateConfiguration(config);
      setHasChanges(false);
      setValidationErrors([]);
    } catch (error) {
      console.error('Failed to save configuration:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setConfig(state.configuration);
    setHasChanges(false);
    setValidationErrors([]);
    setValidationWarnings([]);
    setShowResetDialog(false);
  };

  const validateConfiguration = async () => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    if (!config.BASE_URL) {
      errors.push('BASE_URL is required');
    } else if (!config.BASE_URL.startsWith('http')) {
      warnings.push('BASE_URL should start with http:// or https://');
    }

    if (config.TIMEOUT && isNaN(parseInt(config.TIMEOUT))) {
      errors.push('TIMEOUT must be a number');
    }

    if (config.RETRY_COUNT && isNaN(parseInt(config.RETRY_COUNT))) {
      errors.push('RETRY_COUNT must be a number');
    }

    if (config.MAX_WORKERS && isNaN(parseInt(config.MAX_WORKERS))) {
      errors.push('MAX_WORKERS must be a number');
    }

    setValidationErrors(errors);
    setValidationWarnings(warnings);

    return { errors, warnings };
  };

  const browserOptions = [
    { value: 'chrome', label: 'Chrome', description: 'Google Chrome (recommended)' },
    { value: 'firefox', label: 'Firefox', description: 'Mozilla Firefox' },
    { value: 'edge', label: 'Edge', description: 'Microsoft Edge' },
    { value: 'safari', label: 'Safari', description: 'Apple Safari (macOS only)' }
  ];

  const platformOptions = [
    { value: 'linux', label: 'Linux', description: 'Linux operating system' },
    { value: 'windows', label: 'Windows', description: 'Windows operating system' },
    { value: 'macos', label: 'macOS', description: 'Apple macOS' }
  ];

  const environmentOptions = [
    { value: 'dev', label: 'Development', description: 'Development environment' },
    { value: 'staging', label: 'Staging', description: 'Staging environment' },
    { value: 'prod', label: 'Production', description: 'Production environment' }
  ];

  const logLevelOptions = [
    { value: 'error', label: 'Error', description: 'Only errors' },
    { value: 'warn', label: 'Warning', description: 'Warnings and errors' },
    { value: 'info', label: 'Info', description: 'Info, warnings, and errors' },
    { value: 'debug', label: 'Debug', description: 'All log levels' }
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            Configuration
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Configure your test automation settings
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={actions.loadConfiguration}
          >
            Reload
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<ResetIcon />}
            onClick={() => setShowResetDialog(true)}
            disabled={!hasChanges}
          >
            Reset
          </Button>
          
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Stack>
      </Box>

      {/* Changes Alert */}
      {hasChanges && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            You have unsaved changes. Click "Save Changes" to apply them.
          </Typography>
        </Alert>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            Configuration Errors:
          </Typography>
          <Box component="ul" sx={{ mt: 1, pl: 2 }}>
            {validationErrors.map((error, index) => (
              <Typography component="li" variant="body2" key={index}>
                {error}
              </Typography>
            ))}
          </Box>
        </Alert>
      )}

      {/* Validation Warnings */}
      {validationWarnings.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            Configuration Warnings:
          </Typography>
          <Box component="ul" sx={{ mt: 1, pl: 2 }}>
            {validationWarnings.map((warning, index) => (
              <Typography component="li" variant="body2" key={index}>
                {warning}
              </Typography>
            ))}
          </Box>
        </Alert>
      )}

      {/* Configuration Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Browser & Environment" icon={<BrowserIcon />} />
            <Tab label="Performance & Timing" icon={<PerformanceIcon />} />
            <Tab label="Display & Logging" icon={<VisibilityIcon />} />
            <Tab label="Advanced Settings" icon={<SettingsIcon />} />
          </Tabs>
        </Box>

        {/* Browser & Environment Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Browser</InputLabel>
                <Select
                  value={config.BROWSER || 'chrome'}
                  label="Browser"
                  onChange={(e) => handleConfigChange('BROWSER', e.target.value)}
                >
                  {browserOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box>
                        <Typography variant="body1">{option.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Platform</InputLabel>
                <Select
                  value={config.PLATFORM || 'linux'}
                  label="Platform"
                  onChange={(e) => handleConfigChange('PLATFORM', e.target.value)}
                >
                  {platformOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box>
                        <Typography variant="body1">{option.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Environment</InputLabel>
                <Select
                  value={config.ENVIRONMENT || 'dev'}
                  label="Environment"
                  onChange={(e) => handleConfigChange('ENVIRONMENT', e.target.value)}
                >
                  {environmentOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box>
                        <Typography variant="body1">{option.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Base URL"
                value={config.BASE_URL || ''}
                onChange={(e) => handleConfigChange('BASE_URL', e.target.value)}
                placeholder="https://example.com"
                helperText="The base URL for your application under test"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Window Size"
                value={config.WINDOW_SIZE || '1920,1080'}
                onChange={(e) => handleConfigChange('WINDOW_SIZE', e.target.value)}
                placeholder="1920,1080"
                helperText="Browser window size (width,height)"
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Performance & Timing Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Timeout (ms)"
                type="number"
                value={config.TIMEOUT || '30000'}
                onChange={(e) => handleConfigChange('TIMEOUT', e.target.value)}
                helperText="Global timeout for operations"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Implicit Wait (ms)"
                type="number"
                value={config.IMPLICIT_WAIT || '10000'}
                onChange={(e) => handleConfigChange('IMPLICIT_WAIT', e.target.value)}
                helperText="Implicit wait timeout for element discovery"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Explicit Wait (ms)"
                type="number"
                value={config.EXPLICIT_WAIT || '30000'}
                onChange={(e) => handleConfigChange('EXPLICIT_WAIT', e.target.value)}
                helperText="Explicit wait timeout for conditions"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Retry Count"
                type="number"
                value={config.RETRY_COUNT || '3'}
                onChange={(e) => handleConfigChange('RETRY_COUNT', e.target.value)}
                helperText="Number of retries for failed operations"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.PARALLEL_MODE === 'true'}
                    onChange={(e) => handleConfigChange('PARALLEL_MODE', e.target.checked.toString())}
                  />
                }
                label="Enable Parallel Execution"
              />
            </Grid>

            {config.PARALLEL_MODE === 'true' && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Max Workers"
                  type="number"
                  value={config.MAX_WORKERS || '4'}
                  onChange={(e) => handleConfigChange('MAX_WORKERS', e.target.value)}
                  inputProps={{ min: 1, max: 10 }}
                  helperText="Maximum number of parallel workers"
                />
              </Grid>
            )}
          </Grid>
        </TabPanel>

        {/* Display & Logging Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.HEADLESS === 'true'}
                    onChange={(e) => handleConfigChange('HEADLESS', e.target.checked.toString())}
                  />
                }
                label="Headless Mode"
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Run browser without GUI (faster execution)
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.ENABLE_SCREENSHOTS === 'true'}
                    onChange={(e) => handleConfigChange('ENABLE_SCREENSHOTS', e.target.checked.toString())}
                  />
                }
                label="Enable Screenshots"
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Capture screenshots on test failures
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.ENABLE_VIDEO === 'true'}
                    onChange={(e) => handleConfigChange('ENABLE_VIDEO', e.target.checked.toString())}
                  />
                }
                label="Enable Video Recording"
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Record video of test execution
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.ENABLE_LOGGING === 'true'}
                    onChange={(e) => handleConfigChange('ENABLE_LOGGING', e.target.checked.toString())}
                  />
                }
                label="Enable Logging"
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Enable detailed logging output
              </Typography>
            </Grid>

            {config.ENABLE_LOGGING === 'true' && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Log Level</InputLabel>
                  <Select
                    value={config.LOG_LEVEL || 'error'}
                    label="Log Level"
                    onChange={(e) => handleConfigChange('LOG_LEVEL', e.target.value)}
                  >
                    {logLevelOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Box>
                          <Typography variant="body1">{option.label}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {option.description}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        {/* Advanced Settings Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Dashboard Port"
                type="number"
                value={config.DASHBOARD_PORT || '3001'}
                onChange={(e) => handleConfigChange('DASHBOARD_PORT', e.target.value)}
                helperText="Port for the dashboard frontend"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="API Port"
                type="number"
                value={config.API_PORT || '3000'}
                onChange={(e) => handleConfigChange('API_PORT', e.target.value)}
                helperText="Port for the backend API"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.EMAIL_NOTIFICATIONS === 'true'}
                    onChange={(e) => handleConfigChange('EMAIL_NOTIFICATIONS', e.target.checked.toString())}
                  />
                }
                label="Email Notifications"
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Send email notifications for test results
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.CI_MODE === 'true'}
                    onChange={(e) => handleConfigChange('CI_MODE', e.target.checked.toString())}
                  />
                }
                label="CI/CD Mode"
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Optimize settings for continuous integration
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Node Environment"
                value={config.NODE_ENV || 'development'}
                onChange={(e) => handleConfigChange('NODE_ENV', e.target.value)}
                helperText="Node.js environment (development, production)"
              />
            </Grid>
          </Grid>
        </TabPanel>
      </Card>

      {/* Reset Confirmation Dialog */}
      <Dialog open={showResetDialog} onClose={() => setShowResetDialog(false)}>
        <DialogTitle>Reset Configuration</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to reset all changes? This will discard all unsaved modifications.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResetDialog(false)}>Cancel</Button>
          <Button onClick={handleReset} color="error" variant="contained">
            Reset
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}