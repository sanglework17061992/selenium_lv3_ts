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
  LinearProgress,
  Alert,
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
  List,
  ListItemButton,
  Divider,
  Tab,
  Tabs
} from '@mui/material';
import {
  Assessment as ReportIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Schedule as TimeIcon,
  CheckCircle as PassIcon,
  Cancel as FailIcon,
  Warning as SkipIcon,
  BugReport as BugIcon,
  Timeline as TrendIcon,
  PieChart as ChartIcon,
  OpenInNew as OpenIcon,
  Search as SearchIcon,
  CloudDownload as ExportIcon,
  Share as ShareIcon,
  Delete as DeleteIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useDashboard } from '../contexts/DashboardContext';
import { TestReport, TestExecution } from '../types';

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

interface ReportMetrics {
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  passRate: number;
}

export default function Reports() {
  const { state, actions } = useDashboard();
  const [reports, setReports] = useState<TestReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<TestReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<TestReport | null>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  
  // Table pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('7d');

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [reports, searchTerm, statusFilter, dateFilter]);

  const loadReports = async () => {
    setLoading(true);
    try {
      await actions.loadReports();
      setReports(state.reports);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...reports];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(report => 
        report.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.executionId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === statusFilter);
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
      
      filtered = filtered.filter(report => 
        new Date(report.createdAt || 0) >= filterDate
      );
    }

    setFilteredReports(filtered);
  };

  const calculateMetrics = (reports: TestReport[]): ReportMetrics => {
    const totalTests = reports.reduce((sum, report) => sum + (report.totalTests || 0), 0);
    const passed = reports.reduce((sum, report) => sum + (report.passedTests || 0), 0);
    const failed = reports.reduce((sum, report) => sum + (report.failedTests || 0), 0);
    const skipped = reports.reduce((sum, report) => sum + (report.skippedTests || 0), 0);
    const duration = reports.reduce((sum, report) => sum + (report.duration || 0), 0);
    const passRate = totalTests > 0 ? Math.round((passed / totalTests) * 100) : 0;

    return { totalTests, passed, failed, skipped, duration, passRate };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'success';
      case 'failed':
        return 'error';
      case 'skipped':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <PassIcon />;
      case 'failed':
        return <FailIcon />;
      case 'skipped':
        return <SkipIcon />;
      default:
        return <BugIcon />;
    }
  };

  const handleViewReport = (report: TestReport) => {
    setSelectedReport(report);
    setShowReportDialog(true);
  };

  const handleOpenAllureReport = (report: TestReport) => {
    if (report.allureReportUrl) {
      window.open(report.allureReportUrl, '_blank');
    }
  };

  const handleDownloadReport = async (report: TestReport) => {
    try {
      // Implementation for downloading report
      console.log('Downloading report:', report.id);
    } catch (error) {
      console.error('Failed to download report:', error);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      // await actions.deleteReport(reportId);
      console.log('Delete report:', reportId);
      await loadReports();
    } catch (error) {
      console.error('Failed to delete report:', error);
    }
  };

  const formatDuration = (duration: number) => {
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

  const metrics = calculateMetrics(filteredReports);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            Test Reports
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            View and manage your test execution reports
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadReports}
            disabled={loading}
          >
            Refresh
          </Button>
          
          <Button
            variant="contained"
            startIcon={<ExportIcon />}
            onClick={() => {/* Export functionality */}}
          >
            Export All
          </Button>
        </Stack>
      </Box>

      {/* Loading */}
      {loading && <LinearProgress sx={{ mb: 3 }} />}

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <ReportIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {metrics.totalTests}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Tests
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PassIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                {metrics.passed}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Passed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <FailIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                {metrics.failed}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Failed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <ChartIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                {metrics.passRate}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pass Rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Reports Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="All Reports" />
            <Tab label="Recent Reports" />
            <Tab label="Failed Reports" />
            <Tab label="Trends" />
          </Tabs>
        </Box>

        {/* All Reports Tab */}
        <TabPanel value={tabValue} index={0}>
          {/* Filters */}
          <Box sx={{ mb: 3, p: 3, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search reports..."
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
                    <MenuItem value="passed">Passed</MenuItem>
                    <MenuItem value="failed">Failed</MenuItem>
                    <MenuItem value="skipped">Skipped</MenuItem>
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

          {/* Reports Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Report Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Tests</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredReports
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((report) => (
                    <TableRow key={report.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                            {report.name || `Report ${report.id}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {report.executionId}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(report.status || 'unknown')}
                          label={report.status || 'Unknown'}
                          color={getStatusColor(report.status || 'unknown') as any}
                          size="small"
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            Total: {report.totalTests || 0}
                          </Typography>
                          <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                            <Chip label={`✓ ${report.passedTests || 0}`} size="small" color="success" />
                            <Chip label={`✗ ${report.failedTests || 0}`} size="small" color="error" />
                            <Chip label={`○ ${report.skippedTests || 0}`} size="small" color="warning" />
                          </Stack>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TimeIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {formatDuration(report.duration || 0)}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2">
                          {report.createdAt ? new Date(report.createdAt).toLocaleString() : 'Unknown'}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewReport(report)}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          
                          {report.allureReportUrl && (
                            <Tooltip title="Open Allure Report">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenAllureReport(report)}
                              >
                                <OpenIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          <Tooltip title="Download">
                            <IconButton
                              size="small"
                              onClick={() => handleDownloadReport(report)}
                            >
                              <DownloadIcon />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteReport(report.id)}
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
            count={filteredReports.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </TabPanel>

        {/* Recent Reports Tab */}
        <TabPanel value={tabValue} index={1}>
          <List>
            {filteredReports
              .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
              .slice(0, 10)
              .map((report) => (
                <ListItem key={report.id} divider>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: getStatusColor(report.status || 'unknown') + '.main' }}>
                      {getStatusIcon(report.status || 'unknown')}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={report.name || `Report ${report.id}`}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {report.totalTests} tests • {formatDuration(report.duration || 0)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {report.createdAt ? new Date(report.createdAt).toLocaleString() : 'Unknown'}
                        </Typography>
                      </Box>
                    }
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleViewReport(report)}
                  >
                    View
                  </Button>
                </ListItem>
              ))}
          </List>
        </TabPanel>

        {/* Failed Reports Tab */}
        <TabPanel value={tabValue} index={2}>
          <List>
            {filteredReports
              .filter(report => report.status === 'failed')
              .map((report) => (
                <ListItem key={report.id} divider>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'error.main' }}>
                      <FailIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={report.name || `Report ${report.id}`}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {report.failedTests} failed out of {report.totalTests} tests
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {report.createdAt ? new Date(report.createdAt).toLocaleString() : 'Unknown'}
                        </Typography>
                      </Box>
                    }
                  />
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleViewReport(report)}
                  >
                    Debug
                  </Button>
                </ListItem>
              ))}
          </List>
        </TabPanel>

        {/* Trends Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <TrendIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Trends and Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Charts and trend analysis will be implemented here
            </Typography>
          </Box>
        </TabPanel>
      </Card>

      {/* Report Details Dialog */}
      <Dialog
        open={showReportDialog}
        onClose={() => setShowReportDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {selectedReport?.name || `Report ${selectedReport?.id}`}
            </Typography>
            <IconButton onClick={() => setShowReportDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Chip
                    icon={getStatusIcon(selectedReport.status || 'unknown')}
                    label={selectedReport.status || 'Unknown'}
                    color={getStatusColor(selectedReport.status || 'unknown') as any}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Duration</Typography>
                  <Typography variant="body1">
                    {formatDuration(selectedReport.duration || 0)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Total Tests</Typography>
                  <Typography variant="body1">{selectedReport.totalTests || 0}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Pass Rate</Typography>
                  <Typography variant="body1">
                    {selectedReport.totalTests ? 
                      Math.round(((selectedReport.passedTests || 0) / selectedReport.totalTests) * 100) : 0}%
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" sx={{ mb: 2 }}>Test Results Breakdown</Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                    <Typography variant="h4" color="success.contrastText">
                      {selectedReport.passedTests || 0}
                    </Typography>
                    <Typography variant="body2" color="success.contrastText">
                      Passed
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
                    <Typography variant="h4" color="error.contrastText">
                      {selectedReport.failedTests || 0}
                    </Typography>
                    <Typography variant="body2" color="error.contrastText">
                      Failed
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                    <Typography variant="h4" color="warning.contrastText">
                      {selectedReport.skippedTests || 0}
                    </Typography>
                    <Typography variant="body2" color="warning.contrastText">
                      Skipped
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {selectedReport.allureReportUrl && (
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Button
                    variant="contained"
                    startIcon={<OpenIcon />}
                    onClick={() => handleOpenAllureReport(selectedReport)}
                  >
                    Open Full Allure Report
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}