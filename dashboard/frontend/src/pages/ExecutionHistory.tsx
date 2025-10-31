import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from '@mui/material';
import {
  History as HistoryIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Schedule as TimeIcon,
  CheckCircle as PassIcon,
  Cancel as FailIcon,
  Warning as SkipIcon,
  Computer as BrowserIcon,
  Storage as OutputIcon,
  Assessment as ReportIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  Replay as RerunIcon,
  BugReport as DebugIcon
} from '@mui/icons-material';
import { useDashboard } from '../contexts/DashboardContext';
import { TestExecution } from '../types';

export default function ExecutionHistory() {
  const { state, actions } = useDashboard();
  const [executions, setExecutions] = useState<TestExecution[]>([]);
  const [filteredExecutions, setFilteredExecutions] = useState<TestExecution[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedExecution, setSelectedExecution] = useState<TestExecution | null>(null);
  const [showExecutionDialog, setShowExecutionDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [executionToDelete, setExecutionToDelete] = useState<string | null>(null);
  
  // Table pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('7d');

  useEffect(() => {
    loadExecutionHistory();
  }, []);

  useEffect(() => {
    setExecutions([...state.executions]);
  }, [state.executions]);

  useEffect(() => {
    applyFilters();
  }, [executions, searchTerm, statusFilter, dateFilter]);

  const loadExecutionHistory = async () => {
    setLoading(true);
    try {
      await actions.loadExecutionHistory();
    } catch (error) {
      console.error('Failed to load execution history:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...executions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(execution => 
        execution.testFile?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        execution.id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(execution => execution.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case '1d':
          filterDate.setDate(now.getDate() - 1);
          break;
        case '7d':
          filterDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          filterDate.setDate(now.getDate() - 30);
          break;
        default:
          filterDate.setFullYear(1970); // Show all
      }
      
      filtered = filtered.filter(execution => 
        new Date(execution.startTime) >= filterDate
      );
    }

    // Sort by start time (newest first)
    filtered.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    setFilteredExecutions(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'running':
        return 'info';
      case 'cancelled':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <PassIcon />;
      case 'failed':
        return <FailIcon />;
      case 'running':
        return <PlayIcon />;
      case 'cancelled':
        return <StopIcon />;
      default:
        return <SkipIcon />;
    }
  };

  const handleViewExecution = (execution: TestExecution) => {
    setSelectedExecution(execution);
    setShowExecutionDialog(true);
  };

  const handleRerunExecution = async (execution: TestExecution) => {
    try {
      await actions.executeTest([execution.testFile]);
    } catch (error) {
      console.error('Failed to rerun execution:', error);
    }
  };

  const handleStopExecution = async (executionId: string) => {
    try {
      await actions.stopExecution(executionId);
    } catch (error) {
      console.error('Failed to stop execution:', error);
    }
  };

  const handleDeleteExecution = (executionId: string) => {
    setExecutionToDelete(executionId);
    setShowDeleteDialog(true);
  };

  const confirmDeleteExecution = async () => {
    if (executionToDelete) {
      try {
        // Implementation for deleting execution
        console.log('Deleting execution:', executionToDelete);
        setShowDeleteDialog(false);
        setExecutionToDelete(null);
        await loadExecutionHistory();
      } catch (error) {
        console.error('Failed to delete execution:', error);
      }
    }
  };

  const formatDuration = (startTime: Date, endTime?: Date) => {
    if (!endTime) return 'Running...';
    
    const duration = new Date(endTime).getTime() - new Date(startTime).getTime();
    const hours = Math.floor(duration / 3600000);
    const minutes = Math.floor((duration % 3600000) / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getExecutionSummary = () => {
    const total = filteredExecutions.length;
    const completed = filteredExecutions.filter(e => e.status === 'completed').length;
    const failed = filteredExecutions.filter(e => e.status === 'failed').length;
    const running = filteredExecutions.filter(e => e.status === 'running').length;
    const cancelled = filteredExecutions.filter(e => e.status === 'cancelled').length;

    return { total, completed, failed, running, cancelled };
  };

  const summary = getExecutionSummary();

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            Execution History
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            View and manage your test execution history
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadExecutionHistory}
            disabled={loading}
          >
            Refresh
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<DeleteIcon />}
            onClick={actions.clearExecutions}
            color="error"
          >
            Clear All
          </Button>
        </Stack>
      </Box>

      {/* Loading */}
      {loading && <LinearProgress sx={{ mb: 3 }} />}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <HistoryIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {summary.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Executions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PassIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                {summary.completed}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <FailIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                {summary.failed}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Failed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PlayIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                {summary.running}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Running
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <StopIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                {summary.cancelled}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cancelled
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Execution History Table */}
      <Card>
        <CardContent>
          {/* Filters */}
          <Box sx={{ mb: 3, p: 3, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search executions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Statuses</MenuItem>
                    <MenuItem value="running">Running</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="failed">Failed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Date Range</InputLabel>
                  <Select
                    value={dateFilter}
                    label="Date Range"
                    onChange={(e) => setDateFilter(e.target.value)}
                  >
                    <MenuItem value="1d">Last 24 hours</MenuItem>
                    <MenuItem value="7d">Last 7 days</MenuItem>
                    <MenuItem value="30d">Last 30 days</MenuItem>
                    <MenuItem value="all">All time</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setDateFilter('7d');
                  }}
                >
                  Clear
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Test File</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Started</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Exit Code</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredExecutions
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((execution) => (
                    <TableRow key={execution.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                            {execution.testFile}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {execution.id}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(execution.status)}
                          label={execution.status}
                          color={getStatusColor(execution.status) as any}
                          size="small"
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TimeIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {new Date(execution.startTime).toLocaleString()}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2">
                          {formatDuration(execution.startTime, execution.endTime)}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2">
                          {execution.exitCode !== undefined ? execution.exitCode : 'N/A'}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewExecution(execution)}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          
                          {execution.status === 'running' ? (
                            <Tooltip title="Stop Execution">
                              <IconButton
                                size="small"
                                color="warning"
                                onClick={() => handleStopExecution(execution.id)}
                              >
                                <StopIcon />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Tooltip title="Rerun Test">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleRerunExecution(execution)}
                              >
                                <RerunIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteExecution(execution.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            component="div"
            count={filteredExecutions.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </CardContent>
      </Card>

      {/* Execution Details Dialog */}
      <Dialog
        open={showExecutionDialog}
        onClose={() => setShowExecutionDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Execution Details: {selectedExecution?.testFile}
            </Typography>
            <IconButton onClick={() => setShowExecutionDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedExecution && (
            <Box>
              {/* Execution Info */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Execution ID</Typography>
                  <Typography variant="body1">{selectedExecution.id}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Chip
                    icon={getStatusIcon(selectedExecution.status)}
                    label={selectedExecution.status}
                    color={getStatusColor(selectedExecution.status) as any}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Start Time</Typography>
                  <Typography variant="body1">
                    {new Date(selectedExecution.startTime).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Duration</Typography>
                  <Typography variant="body1">
                    {formatDuration(selectedExecution.startTime, selectedExecution.endTime)}
                  </Typography>
                </Grid>
                {selectedExecution.exitCode !== undefined && (
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Exit Code</Typography>
                    <Typography variant="body1">{selectedExecution.exitCode}</Typography>
                  </Grid>
                )}
              </Grid>

              <Divider sx={{ my: 2 }} />

              {/* Output */}
              <Typography variant="h6" sx={{ mb: 2 }}>
                Execution Output
              </Typography>
              <Paper 
                sx={{ 
                  p: 2, 
                  bgcolor: 'grey.900', 
                  color: 'common.white',
                  fontFamily: 'monospace',
                  maxHeight: 400,
                  overflow: 'auto'
                }}
              >
                {selectedExecution.output && selectedExecution.output.length > 0 ? (
                  selectedExecution.output.map((line, index) => (
                    <Typography 
                      key={index} 
                      variant="body2" 
                      component="div"
                      sx={{ fontFamily: 'monospace' }}
                    >
                      {line}
                    </Typography>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No output available
                  </Typography>
                )}
              </Paper>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogTitle>Delete Execution</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this execution? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button onClick={confirmDeleteExecution} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}