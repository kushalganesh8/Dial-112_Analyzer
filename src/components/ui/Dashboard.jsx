import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Input,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Avatar,
  Chip,
  InputAdornment,
  Collapse,
  IconButton,
  MenuItem,
  FormControl,
  Select,
  AppBar,
  Toolbar,
  Tooltip,
  Tabs,
  Tab,
  Fade,
  Zoom
} from '@mui/material';
// import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts';
import {
  UploadFile,
  Search,
  CheckCircle,
  Cancel,
  Warning,
  Info,
  ExpandMore,
  ExpandLess,
  Edit,
  Save,
  CloudUpload,
  Dashboard as DashboardIcon,
  Map as MapIcon,
  Phone,
  LocationOn,
  Person,
  Schedule,
  Security,
  RecordVoiceOver
} from '@mui/icons-material';
import axios from 'axios';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import HeatmapTab from './HeatmapTab';
import VoiceAssistantTab from './VoiceAssistantTab';

// Enhanced color palette
const theme = {
  primary: {
    main: '#2563eb',
    light: '#3b82f6',
    dark: '#1d4ed8',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  secondary: {
    main: '#f59e0b',
    light: '#fbbf24',
    dark: '#d97706'
  },
  background: {
    main: '#f8fafc',
    paper: '#ffffff',
    dark: '#1e293b',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  text: {
    primary: '#1e293b',
    secondary: '#64748b',
    light: '#94a3b8'
  },
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6'
};

const AudioUploaderDashboard = ({ onLogout, username }) => {
  const [files, setFiles] = useState([]);
  const [uploadSummary, setUploadSummary] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [severityFilter, setSeverityFilter] = useState('');
  const [crimeTypeFilter, setCrimeTypeFilter] = useState('');
  const [crimeSubTypeFilter, setCrimeSubTypeFilter] = useState('');

  const [editRowIdx, setEditRowIdx] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editAssignee, setEditAssignee] = useState('');
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState(0);

  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [timeFilter, setTimeFilter] = useState('');
  
  // Time filter options
  const timeFilterOptions = [
    { value: 'last5min', label: 'Last 5 Minutes' },
    { value: 'last10min', label: 'Last 10 Minutes' },
    { value: 'last30min', label: 'Last 30 Minutes' },
    { value: 'lastHour', label: 'Last Hour' },
    { value: 'last7days', label: 'Last 7 Days' }
  ];

  const handleFileChange = (e) => {
    setFiles(e.target.files);
    setError('');
  };

  const handleUpload = async () => {
    if (!files || files.length === 0) {
      setError('Please select files to upload');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      for (let file of files) {
        formData.append('files', file);
      }
      // Updated API endpoint with the audio prefix
      const response = await axios.post('http://127.0.0.1:8007/audio/upload-and-process/', formData);
      setUploadSummary(response.data.results);
      setShowModal(true);
      fetchTableData();
    } catch (err) {
      setError('Upload failed! Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTableData = async () => {
    try {
      // Updated API endpoint with the data prefix
      const response = await axios.get('http://127.0.0.1:8007/data/get-data');
      setTableData(response.data.records);
    } catch (err) {
      setError('Failed to fetch records');
    }
  };

  useEffect(() => {
    fetchTableData();
  }, []);

  const handleExpandRow = (idx) => {
    setExpandedRow(expandedRow === idx ? null : idx);
  };

  const filteredData = tableData
    .filter(row =>
      Object.values(row).some(val =>
        String(val).toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
    .filter(row =>
      (!severityFilter || String(row.severity_rank) === severityFilter) &&
      (!crimeTypeFilter || row.crime_type === crimeTypeFilter) &&
      (!crimeSubTypeFilter || row.crime_subtype === crimeSubTypeFilter)
    )
    .filter(row => {
      if (!timeFilter && !fromDate && !toDate) return true;
      
      const rowDate = row.created_at ? new Date(row.created_at) : null;
      if (!rowDate) return false;
      
      if (timeFilter) {
        const now = new Date();
        let cutoffDate;
        
        switch (timeFilter) {
          case 'last5min':
            cutoffDate = new Date(now.getTime() - 5 * 60 * 1000);
            break;
          case 'last10min':
            cutoffDate = new Date(now.getTime() - 10 * 60 * 1000);
            break;
          case 'last30min':
            cutoffDate = new Date(now.getTime() - 30 * 60 * 1000);
            break;
          case 'lastHour':
            cutoffDate = new Date(now.getTime() - 60 * 60 * 1000);
            break;
          case 'last7days':
            cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          default:
            return true;
        }
        
        return rowDate >= cutoffDate;
      } else {
        if (fromDate && rowDate < new Date(fromDate)) return false;
        if (toDate && rowDate > new Date(toDate)) return false;
        return true;
      }
    });

  const getSeverityColor = (severity) => {
    const num = parseInt(severity, 10);
    if (num >= 8) return 'error';
    if (num >= 5) return 'warning';
    if (num >= 1) return 'success';
    return 'info';
  };

  const getSeverityIcon = (severity) => {
    const num = parseInt(severity, 10);
    if (num >= 8) return <Security sx={{ fontSize: 16 }} />;
    if (num >= 5) return <Warning sx={{ fontSize: 16 }} />;
    return <Info sx={{ fontSize: 16 }} />;
  };

  // Unique lists for filters
  const uniqueSeverities = [...new Set(tableData.map(item => item.severity_rank).filter(Boolean))];
  const uniqueCrimeTypes = [...new Set(tableData.map(item => item.crime_type).filter(Boolean))];
  const uniqueCrimeSubTypes = [...new Set(tableData.map(item => item.crime_subtype).filter(Boolean))];

  const statusOptions = ['pending', 'approved', 'rejected'];

  const handleEditClick = (idx, row) => {
    setEditRowIdx(idx);
    setEditStatus(row.status || 'pending');
    setEditAssignee(row.officer_assigned || '');
  };

  const handleSaveClick = async (row) => {
    setSaving(true);
    try {
      // Updated API endpoint with the data prefix
      await axios.post('http://127.0.0.1:8007/data/update-data', {
        ticket_id: row.ticket_id,
        status: editStatus,
        officer_assigned: editAssignee
      });
      setEditRowIdx(null);
      fetchTableData();
    } catch (err) {
      setError('Failed to update record');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return theme.success;
      case 'rejected': return theme.error;
      default: return theme.warning;
    }
  };


  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: `linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)`,
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 107, 107, 0.1) 0%, transparent 50%)',
        pointerEvents: 'none'
      }
    }}>
      {/* Enhanced Navbar */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          background: theme.background.gradient,
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              p: 1,
              display: 'flex',
              alignItems: 'center',
              backdropFilter: 'blur(10px)'
            }}>
              <Phone sx={{ color: 'black', fontSize: 24 }} />
            </Box>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 700, 
                color: 'black',
                background: 'none',
                backgroundClip: 'unset',
                WebkitBackgroundClip: 'unset',
                WebkitTextFillColor: 'unset'
              }}
            >
              Dial 112 AI Analyzer
            </Typography>
          </Box>
          
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
            <Chip
              avatar={<Person sx={{ color: 'black' }} />}
              label={`Welcome, ${username}`}
              sx={{
                background: 'rgba(255, 255, 255, 0.15)',
                color: 'black',
                backdropFilter: 'blur(10px)',
                fontWeight: 600,
                '& .MuiChip-avatar': { color: 'black' }
              }}
            />
          </Box>
          
          <Button 
            onClick={onLogout}
            variant="outlined"
            sx={{ 
              color: 'black',
              borderColor: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                borderColor: 'black',
                background: 'rgba(0, 0, 0, 0.05)'
              }
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ position: 'relative', zIndex: 1, p: 3 }}>
        {/* Enhanced Upload Section */}
        <Fade in timeout={800}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={5}>
              <Card 
                elevation={0}
                sx={{ 
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: 3,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box sx={{
                      background: theme.primary.gradient,
                      borderRadius: '12px',
                      p: 1.5,
                      mr: 2
                    }}>
                      <CloudUpload sx={{ color: 'white', fontSize: 28 }} />
                    </Box>
                    <Typography variant="h6" sx={{ color: theme.text.primary, fontWeight: 600 }}>
                      Upload Audio Files
                    </Typography>
                  </Box>
                  
                  <Box sx={{
                    border: '2px dashed #cbd5e1',
                    borderRadius: 2,
                    p: 3,
                    textAlign: 'center',
                    background: 'rgba(248, 250, 252, 0.5)',
                    mb: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: theme.primary.main,
                      background: 'rgba(37, 99, 235, 0.05)'
                    }
                  }}>
                    <Input 
                      type="file" 
                      inputProps={{ multiple: true, accept: '.wav' }} 
                      onChange={handleFileChange}
                      sx={{ 
                        width: '100%',
                        '&::before': { display: 'none' },
                        '& .MuiInput-input': {
                          padding: '12px 0',
                          textAlign: 'center',
                          color: theme.text.secondary
                        }
                      }}
                    />
                    <Typography variant="body2" sx={{ color: theme.text.light, mt: 1 }}>
                      Drag & drop or click to select .wav files
                    </Typography>
                  </Box>
                  
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <UploadFile />}
                    onClick={handleUpload}
                    disabled={loading || files.length === 0}
                    sx={{
                      background: theme.primary.gradient,
                      borderRadius: 2,
                      py: 1.5,
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '1rem',
                      boxShadow: '0 8px 20px rgba(37, 99, 235, 0.3)',
                      '&:hover': {
                        boxShadow: '0 12px 28px rgba(37, 99, 235, 0.4)',
                        transform: 'translateY(-2px)'
                      },
                      '&:disabled': {
                        background: theme.text.light,
                        boxShadow: 'none'
                      }
                    }}
                  >
                    {loading ? 'Processing...' : 'Upload & Process'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={7}>
              <Card 
                elevation={0}
                sx={{ 
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: 3,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  height: '100%'
                }}
              >
                <CardContent sx={{ p: 4, width: '100%' }}>
                  <Typography variant="h6" sx={{ color: 'black', fontWeight: 600, mb: 3 }}>
                    📊 Quick Stats
                  </Typography>
                  
                  <Grid container spacing={3}>
                    {/* Case Status Stats */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" sx={{ color: 'black', fontWeight: 600, mb: 1 }}>
                        Case Status
                      </Typography>
                      <Box sx={{ p: 2, background: 'rgba(255, 255, 255, 0.7)', borderRadius: 2, height: '100%' }}>
                        <Grid container spacing={1}>
                          <Grid item xs={4}>
                            <Box sx={{ textAlign: 'center', p: 1, background: 'rgba(16, 185, 129, 0.1)', borderRadius: 2 }}>
                              <Typography variant="h5" sx={{ color: 'black', fontWeight: 700 }}>
                                {tableData.length}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'black' }}>
                                Total
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={4}>
                            <Box sx={{ textAlign: 'center', p: 1, background: 'rgba(245, 158, 11, 0.1)', borderRadius: 2 }}>
                              <Typography variant="h5" sx={{ color: 'black', fontWeight: 700 }}>
                                {tableData.filter(row => row.status === 'pending').length}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'black' }}>
                                Pending
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={4}>
                            <Box sx={{ textAlign: 'center', p: 1, background: 'rgba(59, 130, 246, 0.1)', borderRadius: 2 }}>
                              <Typography variant="h5" sx={{ color: 'black', fontWeight: 700 }}>
                                {tableData.filter(row => row.status === 'approved').length}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'black' }}>
                                Approved
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>
                    
                    {/* Severity Stats */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" sx={{ color: 'black', fontWeight: 600, mb: 1 }}>
                        Severity Breakdown
                      </Typography>
                      <Box sx={{ p: 2, background: 'rgba(255, 255, 255, 0.7)', borderRadius: 2, height: '100%' }}>
                        <Grid container spacing={1}>
                          <Grid item xs={4}>
                            <Box sx={{ textAlign: 'center', p: 1, background: 'rgba(239, 68, 68, 0.1)', borderRadius: 2 }}>
                              <Typography variant="h5" sx={{ color: 'black', fontWeight: 700 }}>
                                {tableData.filter(row => parseInt(row.severity_rank, 10) >= 8).length}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'black' }}>
                                High
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={4}>
                            <Box sx={{ textAlign: 'center', p: 1, background: 'rgba(245, 158, 11, 0.1)', borderRadius: 2 }}>
                              <Typography variant="h5" sx={{ color: 'black', fontWeight: 700 }}>
                                {tableData.filter(row => parseInt(row.severity_rank, 10) >= 5 && parseInt(row.severity_rank, 10) < 8).length}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'black' }}>
                                Medium
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={4}>
                            <Box sx={{ textAlign: 'center', p: 1, background: 'rgba(16, 185, 129, 0.1)', borderRadius: 2 }}>
                              <Typography variant="h5" sx={{ color: 'black', fontWeight: 700 }}>
                                {tableData.filter(row => parseInt(row.severity_rank, 10) < 5).length}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'black' }}>
                                Low
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>
                    
                    {/* Top Crime Types */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" sx={{ color: 'black', fontWeight: 600, mb: 1 }}>
                        Top Crime Types
                      </Typography>
                      <Box sx={{ p: 2, background: 'rgba(255, 255, 255, 0.7)', borderRadius: 2, height: '100%' }}>
                        {(() => {
                          // Calculate top crime types
                          const crimeTypeCounts = {};
                          tableData.forEach(row => {
                            if (row.crime_type) {
                              crimeTypeCounts[row.crime_type] = (crimeTypeCounts[row.crime_type] || 0) + 1;
                            }
                          });
                          
                          // Sort and get top 3
                          const topCrimes = Object.entries(crimeTypeCounts)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 3);
                          
                          return (
                            <Box>
                              {topCrimes.map(([crimeType, count], index) => (
                                <Box 
                                  key={crimeType} 
                                  sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    mb: 1,
                                    p: 1,
                                    borderRadius: 1,
                                    background: index === 0 
                                      ? 'rgba(239, 68, 68, 0.1)' 
                                      : index === 1 
                                        ? 'rgba(245, 158, 11, 0.1)' 
                                        : 'rgba(59, 130, 246, 0.1)'
                                  }}
                                >
                                  <Typography variant="body2" sx={{ fontWeight: 500, color: 'black' }}>
                                    {crimeType}
                                  </Typography>
                                  <Chip 
                                    label={count} 
                                    size="small"
                                    sx={{ 
                                      fontWeight: 600,
                                      background: index === 0 
                                        ? 'rgba(239, 68, 68, 0.2)' 
                                        : index === 1 
                                          ? 'rgba(245, 158, 11, 0.2)' 
                                          : 'rgba(59, 130, 246, 0.2)',
                                      color: 'black'
                                    }}
                                  />
                                </Box>
                              ))}
                              {topCrimes.length === 0 && (
                                <Typography variant="body2" sx={{ color: 'black', textAlign: 'center', py: 2 }}>
                                  No crime data available
                                </Typography>
                              )}
                            </Box>
                          );
                        })()}
                      </Box>
                    </Grid>
                  </Grid>

                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Fade>

        {/* Enhanced Filters Section */}
        <Fade in timeout={1000}>
          <Card 
            elevation={0}
            sx={{ 
              background: theme.background.gradient,
              backdropFilter: 'blur(20px)',
              borderRadius: 3,
              border: '1px solid rgba(255, 255, 255, 0.2)',
              mb: 3
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField
                  placeholder="🔍 Search records"
                  variant="outlined"
                  size="small"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    // Clear time filter when using search
                    if (timeFilter) setTimeFilter('');
                  }}
                  sx={{
                    minWidth: 250,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      background: 'rgba(248, 250, 252, 0.8)',
                      color: 'black !important',
                      '& input': { 
                        color: 'black !important',
                        WebkitTextFillColor: 'black !important'
                      },
                      '& fieldset': { borderColor: '#cbd5e1' },
                      '&:hover': {
                        background: 'rgba(248, 250, 252, 1)'
                      }
                    },
                    '& .MuiInputLabel-root': { color: 'black' },
                    '& .MuiInputBase-input': { 
                      color: 'black !important',
                      WebkitTextFillColor: 'black !important'
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: theme.text.light }} />
                      </InputAdornment>
                    ),
                    style: { color: 'black' }
                  }}
                  inputProps={{
                    style: { color: 'black !important' }
                  }}
                />
                <FormControl size="small" sx={{ 
                  minWidth: 150, 
                  '& .MuiInputBase-root': { 
                    color: 'black !important', 
                    background: 'white',
                    '& .MuiSelect-select': { 
                      color: 'black !important',
                      WebkitTextFillColor: 'black !important'
                    }
                  }, 
                  '& .MuiInputLabel-root': { color: 'black' } 
                }}>
                  <Select
                    displayEmpty
                    value={timeFilter}
                    onChange={(e) => {
                      setTimeFilter(e.target.value);
                      if (e.target.value) {
                        setFromDate(null);
                        setToDate(null);
                      }
                    }}
                    sx={{
                      borderRadius: 2,
                      background: 'white',
                      color: 'black !important',
                      '& .MuiSelect-select': { 
                        color: 'black !important', 
                        background: 'white',
                        WebkitTextFillColor: 'black !important'
                      },
                      '&:hover': { background: 'white' }
                    }}
                    inputProps={{
                      style: { color: 'black !important' }
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          backgroundColor: 'white',
                          '& .MuiMenuItem-root': {
                            '&.Mui-selected': {
                              backgroundColor: '#B6D0E2 !important',
                              color: 'black'
                            },
                            '&:hover': {
                              backgroundColor: '#B6D0E2',
                              color: 'black'
                            }
                          }
                        }
                      }
                    }}
                  >
                    <MenuItem value="" sx={{ color: 'black', background: 'white' }}>All Time</MenuItem>
                    {timeFilterOptions.map(option => (
                      <MenuItem key={option.value} value={option.value} sx={{ color: 'black', background: 'white' }}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="From Date"
                    value={fromDate}
                    onChange={(date) => {
                      setFromDate(date);
                      if (date) setTimeFilter('');
                    }}
                    maxDate={new Date()}
                    slotProps={{
                      textField: {
                        size: 'small',
                        sx: {
                          minWidth: 140,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            background: 'white',
                            color: 'black',
                            '& input': { 
                              color: 'black !important',
                              WebkitTextFillColor: 'black !important'
                            },
                            '& fieldset': { borderColor: '#cbd5e1' },
                            '&:hover': { background: 'white' }
                          },
                          '& .MuiInputLabel-root': { color: 'black' },
                          '& .MuiInputBase-input': { 
                            color: 'black !important',
                            WebkitTextFillColor: 'black !important'
                          }
                        },
                        inputProps: {
                          style: { 
                            color: 'black !important',
                            WebkitTextFillColor: 'black !important'
                          },
                          placeholder: 'DD/MM/YY'
                        }
                      },
                      openPickerIcon: {
                        sx: { color: 'black' }
                      }
                    }}
                    sx={{
                      '& .MuiInputBase-input': {
                        color: 'black !important',
                        '-webkit-text-fill-color': 'black !important'
                      },
                      '& input': {
                        color: 'black !important',
                        '-webkit-text-fill-color': 'black !important'
                      }
                    }}
                  />
                  <DatePicker
                    label="To Date"
                    value={toDate}
                    onChange={(date) => {
                      setToDate(date);
                      if (date) setTimeFilter('');
                    }}
                    maxDate={new Date()}
                    slotProps={{
                      textField: {
                        size: 'small',
                        sx: {
                          minWidth: 140,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            background: 'white',
                            color: 'black',
                            '& input': { 
                              color: 'black !important',
                              WebkitTextFillColor: 'black !important'
                            },
                            '& fieldset': { borderColor: '#cbd5e1' },
                            '&:hover': { background: 'white' }
                          },
                          '& .MuiInputLabel-root': { color: 'black' },
                          '& .MuiInputBase-input': { 
                            color: 'black !important',
                            WebkitTextFillColor: 'black !important'
                          }
                        },
                        inputProps: {
                          style: { 
                            color: 'black !important',
                            WebkitTextFillColor: 'black !important'
                          },
                          placeholder: 'DD/MM/YY'
                        }
                      },
                      openPickerIcon: {
                        sx: { color: 'black' }
                      }
                    }}
                    sx={{
                      '& .MuiInputBase-input': {
                        color: 'black !important',
                        '-webkit-text-fill-color': 'black !important'
                      },
                      '& input': {
                        color: 'black !important',
                        '-webkit-text-fill-color': 'black !important'
                      }
                    }}
                  />
                </LocalizationProvider>
                
                <FormControl size="small" sx={{ 
                  minWidth: 150, 
                  '& .MuiInputBase-root': { 
                    color: 'black !important', 
                    background: 'white',
                    '& .MuiSelect-select': { 
                      color: 'black !important',
                      WebkitTextFillColor: 'black !important'
                    }
                  }, 
                  '& .MuiInputLabel-root': { color: 'black' } 
                }}>
                  <Select
                    displayEmpty
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                    sx={{
                      borderRadius: 2,
                      background: 'white',
                      color: 'black !important',
                      '& .MuiSelect-select': { 
                        color: 'black !important', 
                        background: 'white',
                        WebkitTextFillColor: 'black !important'
                      },
                      '&:hover': { background: 'white' }
                    }}
                    inputProps={{
                      style: { color: 'black !important' }
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          backgroundColor: 'white',
                          '& .MuiMenuItem-root': {
                            '&.Mui-selected': {
                              backgroundColor: '#B6D0E2 !important',
                              color: 'black'
                            },
                            '&:hover': {
                              backgroundColor: '#B6D0E2',
                              color: 'black'
                            }
                          }
                        }
                      }
                    }}
                  >
                    <MenuItem value="" sx={{ color: 'black', background: 'white' }}>All Severities</MenuItem>
                    {uniqueSeverities.map(s => (
                      <MenuItem key={s} value={String(s)} sx={{ color: 'black', background: 'white' }}>{s}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl size="small" sx={{ 
                  minWidth: 150, 
                  '& .MuiInputBase-root': { 
                    color: 'black !important', 
                    background: 'white',
                    '& .MuiSelect-select': { 
                      color: 'black !important',
                      WebkitTextFillColor: 'black !important'
                    }
                  }, 
                  '& .MuiInputLabel-root': { color: 'black' } 
                }}>
                  <Select
                    displayEmpty
                    value={crimeTypeFilter}
                    onChange={(e) => setCrimeTypeFilter(e.target.value)}
                    sx={{
                      borderRadius: 2,
                      background: 'white',
                      color: 'black !important',
                      '& .MuiSelect-select': { 
                        color: 'black !important', 
                        background: 'white',
                        WebkitTextFillColor: 'black !important'
                      },
                      '&:hover': { background: 'white' }
                    }}
                    inputProps={{
                      style: { color: 'black !important' }
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          backgroundColor: 'white',
                          '& .MuiMenuItem-root': {
                            '&.Mui-selected': {
                              backgroundColor: '#B6D0E2 !important',
                              color: 'black'
                            },
                            '&:hover': {
                              backgroundColor: '#B6D0E2',
                              color: 'black'
                            }
                          }
                        }
                      }
                    }}
                  >
                    <MenuItem value="" sx={{ color: 'black', background: 'white' }}>All Crime Types</MenuItem>
                    {uniqueCrimeTypes.map(c => (
                      <MenuItem key={c} value={c} sx={{ color: 'black', background: 'white' }}>{c}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl size="small" sx={{ 
                  minWidth: 150, 
                  '& .MuiInputBase-root': { 
                    color: 'black !important', 
                    background: 'white',
                    '& .MuiSelect-select': { 
                      color: 'black !important',
                      WebkitTextFillColor: 'black !important'
                    }
                  }, 
                  '& .MuiInputLabel-root': { color: 'black' } 
                }}>
                  <Select
                    displayEmpty
                    value={crimeSubTypeFilter}
                    onChange={(e) => setCrimeSubTypeFilter(e.target.value)}
                    sx={{
                      borderRadius: 2,
                      background: 'white',
                      color: 'black !important',
                      '& .MuiSelect-select': { 
                        color: 'black !important', 
                        background: 'white',
                        WebkitTextFillColor: 'black !important'
                      },
                      '&:hover': { background: 'white' }
                    }}
                    inputProps={{
                      style: { color: 'black !important' }
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          backgroundColor: 'white',
                          '& .MuiMenuItem-root': {
                            '&.Mui-selected': {
                              backgroundColor: '#B6D0E2 !important',
                              color: 'black'
                            },
                            '&:hover': {
                              backgroundColor: '#B6D0E2',
                              color: 'black'
                            }
                          }
                        }
                      }
                    }}
                  >
                    <MenuItem value="" sx={{ color: 'black', background: 'white' }}>All SubTypes</MenuItem>
                    {uniqueCrimeSubTypes.map(c => (
                      <MenuItem key={c} value={c} sx={{ color: 'black', background: 'white' }}>{c}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </CardContent>
          </Card>
        </Fade>

        {/* Enhanced Tabs */}
        <Box sx={{ mb: 3 }}>
          <Tabs 
            value={tab} 
            onChange={(_, v) => setTab(v)}
            centered
            variant="fullWidth"
            sx={{
              '& .MuiTabs-root': {
                background: 'rgba(255, 255, 255, 0.9)',
                borderRadius: 3
              },
              '& .MuiTab-root': {
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
                minHeight: 60,
                color: 'black',
                '&.Mui-selected': {
                  color: theme.primary.main
                }
              },
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: 1.5,
                background: theme.primary.gradient
              }
            }}
          >
            <Tab 
              icon={<DashboardIcon />} 
              label="Dashboard" 
              iconPosition="start"
            />
            <Tab 
              icon={<MapIcon />} 
              label="Heatmap" 
              iconPosition="start"
            />
            <Tab 
              icon={<RecordVoiceOver />} 
              label="Voice Assistant" 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {tab === 0 && (
          <Fade in timeout={1200}>
            <TableContainer 
              component={Paper} 
              elevation={0}
              sx={{ 
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                overflow: 'hidden'
              }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
                    <TableCell sx={{ fontWeight: 600, color: theme.text.primary }} />
                    <TableCell sx={{ fontWeight: 600, color: theme.text.primary }}>Ticket ID</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.text.primary }}>Caller</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.text.primary }}>Phone</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.text.primary }}>Crime Type</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.text.primary }}>Severity</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.text.primary }}>Audio</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.text.primary }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.text.primary }}>Location</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.text.primary }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.text.primary }}>Assignee</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.text.primary }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData.map((row, idx) => (
                    <React.Fragment key={idx}>
                      <TableRow 
                        hover 
                        sx={{ 
                          '&:hover': { 
                            background: 'rgba(37, 99, 235, 0.05)',
                            transform: 'scale(1.001)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <TableCell>
                          <IconButton 
                            size="small" 
                            onClick={() => handleExpandRow(idx)}
                            sx={{ 
                              color: theme.primary.main,
                              background: 'rgba(37, 99, 235, 0.1)',
                              '&:hover': { background: 'rgba(37, 99, 235, 0.2)' }
                            }}
                          >
                            {expandedRow === idx ? <ExpandLess /> : <ExpandMore />}
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={row.ticket_id} 
                            size="small"
                            sx={{ 
                              background: theme.primary.gradient,
                              color: 'white',
                              fontWeight: 600
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={row.caller_name} 
                            avatar={<Avatar sx={{ bgcolor: theme.primary.main }}>{row.caller_name?.[0]}</Avatar>}
                            sx={{ 
                              background: 'rgba(37, 99, 235, 0.1)',
                              color: theme.primary.main,
                              fontWeight: 500
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Phone sx={{ fontSize: 16, color: 'black' }} />
                            <Typography variant="body2" sx={{ color: 'black' }}>{row.phone_number}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={row.crime_type}
                            size="small"
                            sx={{ 
                              background: 'rgba(245, 158, 11, 0.1)',
                              color: theme.warning,
                              fontWeight: 500
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getSeverityIcon(row.severity_rank)}
                            label={row.severity_rank}
                            color={getSeverityColor(row.severity_rank)}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>
                          {row.audio_file ? (
                            <Box sx={{ minWidth: 140 }}>
                              <Typography variant="caption" sx={{ color: theme.text.secondary, mb: 0.5, display: 'block' }}>
                                {row.audio_file}
                              </Typography>
                              <audio 
                                controls 
                                style={{ 
                                  width: '140px', 
                                  height: '32px',
                                  borderRadius: '8px'
                                }}
                              >
                                <source src={`http://127.0.0.1:8007/uploaded_audios/${row.audio_file}`} type="audio/wav" />
                                Your browser does not support the audio element.
                              </audio>
                            </Box>
                          ) : (
                            <Typography variant="body2" sx={{ color: theme.text.light }}>N/A</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Schedule sx={{ fontSize: 16, color: 'black' }} />
                            <Typography variant="body2" sx={{ color: 'black' }}>
                              {new Date(row.created_at).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {row.latitude && row.longitude ? (
                            <Button
                              startIcon={<LocationOn />}
                              size="small"
                              variant="outlined"
                              onClick={() => window.open(`https://www.google.com/maps?q=${row.latitude},${row.longitude}`, '_blank')}
                              sx={{
                                borderColor: theme.primary.main,
                                color: theme.primary.main,
                                '&:hover': {
                                  background: 'rgba(37, 99, 235, 0.1)'
                                }
                              }}
                            >
                              View
                            </Button>
                          ) : (
                            <Typography variant="body2" sx={{ color: theme.text.light }}>N/A</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                      {editRowIdx === idx ? (
                        <Select
                          size="small"
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                          sx={{ 
                            minWidth: 100,
                            color: 'black !important',
                            '& .MuiSelect-select': { 
                              color: 'black !important',
                              WebkitTextFillColor: 'black !important'
                            }
                          }}
                          inputProps={{
                            style: { color: 'black !important' }
                          }}
                        >
                              {statusOptions.map(opt => (
                                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                              ))}
                            </Select>
                          ) : (
                            <Chip
                              label={row.status}
                              size="small"
                              sx={{
                                background: `${getStatusColor(row.status)}20`,
                                color: getStatusColor(row.status),
                                fontWeight: 600,
                                borderRadius: 2
                              }}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                      {editRowIdx === idx ? (
                        <TextField
                          size="small"
                          value={editAssignee}
                          onChange={(e) => setEditAssignee(e.target.value)}
                          sx={{ 
                            minWidth: 120,
                            '& .MuiOutlinedInput-root': {
                              '& input': { 
                                color: 'black !important',
                                WebkitTextFillColor: 'black !important'
                              }
                            },
                            '& .MuiInputBase-input': { 
                              color: 'black !important',
                              WebkitTextFillColor: 'black !important'
                            }
                          }}
                          inputProps={{
                            style: { color: 'black !important' }
                          }}
                        />
                          ) : (
                            <Typography variant="body2" sx={{ color: theme.text.primary, fontWeight: 500 }}>
                              {row.officer_assigned || 'Unassigned'}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {editRowIdx === idx ? (
                            <Tooltip title="Save changes">
                              <IconButton 
                                onClick={() => handleSaveClick(row)} 
                                disabled={saving}
                                sx={{ 
                                  color: theme.success,
                                  background: 'rgba(16, 185, 129, 0.1)',
                                  '&:hover': { background: 'rgba(16, 185, 129, 0.2)' }
                                }}
                              >
                                {saving ? <CircularProgress size={20} /> : <Save />}
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Tooltip title="Edit record">
                              <IconButton 
                                onClick={() => handleEditClick(idx, row)}
                                sx={{ 
                                  color: theme.primary.main,
                                  background: 'rgba(37, 99, 235, 0.1)',
                                  '&:hover': { background: 'rgba(37, 99, 235, 0.2)' }
                                }}
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                      
                      {/* Expanded Row Details */}
                      <TableRow>
                        <TableCell colSpan={12} sx={{ p: 0, border: 'none' }}>
                          <Collapse in={expandedRow === idx} timeout="auto" unmountOnExit>
                            <Box 
                              sx={{ 
                                p: 4, 
                                background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(147, 51, 234, 0.05) 100%)',
                                borderRadius: 2,
                                m: 1,
                                border: '1px solid rgba(37, 99, 235, 0.1)'
                              }}
                            >
                              <Typography 
                                variant="h6" 
                                sx={{ 
                                  color: theme.text.primary, 
                                  fontWeight: 600, 
                                  mb: 3,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1
                                }}
                              >
                                <Info sx={{ color: theme.primary.main }} />
                                Case Details
                              </Typography>
                              
                              <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                  <Card 
                                    elevation={0}
                                    sx={{ 
                                      background: 'rgba(255, 255, 255, 0.7)',
                                      borderRadius: 2,
                                      border: '1px solid rgba(255, 255, 255, 0.3)'
                                    }}
                                  >
                                    <CardContent sx={{ p: 3 }}>
                                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: theme.text.primary }}>
                                        📝 Case Information
                                      </Typography>
                                      {[
                                        { label: 'Summary', value: row.summary },
                                        { label: 'Description', value: row.description },
                                        { label: 'Crime Subtype', value: row.crime_subtype },
                                        { label: 'Additional Context', value: row.additional_context }
                                      ].map((item, i) => (
                                        <Box key={i} sx={{ mb: 2 }}>
                                          <Typography 
                                            variant="caption" 
                                            sx={{ 
                                              color: theme.text.secondary, 
                                              fontWeight: 600,
                                              textTransform: 'uppercase',
                                              letterSpacing: 0.5
                                            }}
                                          >
                                            {item.label}
                                          </Typography>
                                          <Typography 
                                            variant="body2" 
                                            sx={{ color: theme.text.primary, mt: 0.5 }}
                                          >
                                            {item.value || 'N/A'}
                                          </Typography>
                                        </Box>
                                      ))}
                                    </CardContent>
                                  </Card>
                                </Grid>
                                
                                <Grid item xs={12} md={6}>
                                  <Card 
                                    elevation={0}
                                    sx={{ 
                                      background: 'rgba(255, 255, 255, 0.7)',
                                      borderRadius: 2,
                                      border: '1px solid rgba(255, 255, 255, 0.3)'
                                    }}
                                  >
                                    <CardContent sx={{ p: 3 }}>
                                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: theme.text.primary }}>
                                        📍 Location Details
                                      </Typography>
                                      {[
                                        { label: 'Primary Location', value: row.primary_location },
                                        { label: 'Specific Landmark', value: row.specific_landmark },
                                        { label: 'State/Region', value: row.state_region },
                                        { label: 'Combined Address', value: row.combined_address },
                                        { label: 'Coordinates', value: row.latitude && row.longitude ? `${row.latitude}, ${row.longitude}` : null }
                                      ].map((item, i) => (
                                        <Box key={i} sx={{ mb: 2 }}>
                                          <Typography 
                                            variant="caption" 
                                            sx={{ 
                                              color: theme.text.secondary, 
                                              fontWeight: 600,
                                              textTransform: 'uppercase',
                                              letterSpacing: 0.5
                                            }}
                                          >
                                            {item.label}
                                          </Typography>
                                          <Typography 
                                            variant="body2" 
                                            sx={{ color: theme.text.primary, mt: 0.5 }}
                                          >
                                            {item.value || 'N/A'}
                                          </Typography>
                                        </Box>
                                      ))}
                                    </CardContent>
                                  </Card>
                                </Grid>
                              </Grid>
                              
                              {/* Status and Assignee Controls */}
                              <Card 
                                elevation={0}
                                sx={{ 
                                  mt: 3,
                                  background: 'rgba(255, 255, 255, 0.7)',
                                  borderRadius: 2,
                                  border: '1px solid rgba(255, 255, 255, 0.3)'
                                }}
                              >
                                <CardContent sx={{ p: 3 }}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: theme.text.primary }}>
                                    ⚙️ Case Management
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                      <Typography variant="body2" sx={{ fontWeight: 600, color: theme.text.primary }}>
                                        Status:
                                      </Typography>
                                      {editRowIdx === idx ? (
                                        <Select
                                          size="small"
                                          value={editStatus}
                                          onChange={(e) => setEditStatus(e.target.value)}
                                          sx={{ 
                                            minWidth: 120,
                                            '& .MuiOutlinedInput-root': { borderRadius: 2 }
                                          }}
                                        >
                                          {statusOptions.map(opt => (
                                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                          ))}
                                        </Select>
                                      ) : (
                                        <Chip
                                          label={row.status}
                                          sx={{
                                            background: `${getStatusColor(row.status)}20`,
                                            color: getStatusColor(row.status),
                                            fontWeight: 600
                                          }}
                                        />
                                      )}
                                    </Box>
                                    
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                      <Typography variant="body2" sx={{ fontWeight: 600, color: theme.text.primary }}>
                                        Assignee:
                                      </Typography>
                                      {editRowIdx === idx ? (
                                        <TextField
                                          size="small"
                                          value={editAssignee}
                                          onChange={(e) => setEditAssignee(e.target.value)}
                                          sx={{ 
                                            minWidth: 150,
                                            '& .MuiOutlinedInput-root': { borderRadius: 2 }
                                          }}
                                        />
                                      ) : (
                                        <Chip
                                          avatar={<Person />}
                                          label={row.officer_assigned || 'Unassigned'}
                                          sx={{
                                            background: 'rgba(37, 99, 235, 0.1)',
                                            color: theme.primary.main,
                                            fontWeight: 500
                                          }}
                                        />
                                      )}
                                    </Box>
                                    
                                    {editRowIdx === idx ? (
                                      <Button
                                        variant="contained"
                                        startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />}
                                        onClick={() => handleSaveClick(row)}
                                        disabled={saving}
                                        sx={{
                                          background: theme.primary.gradient,
                                          borderRadius: 2,
                                          textTransform: 'none',
                                          fontWeight: 600
                                        }}
                                      >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                      </Button>
                                    ) : (
                                      <Button
                                        variant="outlined"
                                        startIcon={<Edit />}
                                        onClick={() => handleEditClick(idx, row)}
                                        sx={{
                                          borderColor: theme.primary.main,
                                          color: theme.primary.main,
                                          borderRadius: 2,
                                          textTransform: 'none',
                                          fontWeight: 600,
                                          '&:hover': {
                                            background: 'rgba(37, 99, 235, 0.1)'
                                          }
                                        }}
                                      >
                                        Edit Case
                                      </Button>
                                    )}
                                  </Box>
                                </CardContent>
                              </Card>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Fade>
        )}

        {tab === 1 && (
          <Fade in timeout={1200}>
            <Card 
              elevation={0}
              sx={{ 
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                borderRadius: 3,
                border: '1px solid rgba(255, 255, 255, 0.2)',
                minHeight: 400
              }}
            >
              <HeatmapTab 
                filters={{
                  searchQuery,
                  severityFilter,
                  crimeTypeFilter,
                  crimeSubTypeFilter,
                  timeFilter,
                  fromDate,
                  toDate
                }}
              />
            </Card>
          </Fade>
        )}
        
        {tab === 2 && (
          <Fade in timeout={1200}>
            <Card 
              elevation={0}
              sx={{ 
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                borderRadius: 3,
                border: '1px solid rgba(255, 255, 255, 0.2)',
                minHeight: 400
              }}
            >
              <VoiceAssistantTab />
            </Card>
          </Fade>
        )}
      </Box>

      {/* Enhanced Upload Summary Modal */}
      <Dialog 
        open={showModal} 
        onClose={() => setShowModal(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: theme.text.primary, 
          fontWeight: 600,
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          background: theme.primary.gradient,
          color: 'white'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CheckCircle />
            Upload Summary
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {uploadSummary.map((item, idx) => (
            <Zoom in key={idx} timeout={300 * (idx + 1)}>
              <Card 
                elevation={0}
                sx={{ 
                  mb: 2, 
                  background: 'rgba(248, 250, 252, 0.8)',
                  borderRadius: 2,
                  border: '1px solid rgba(226, 232, 240, 0.5)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)'
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={8}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.text.primary, mb: 1 }}>
                        📎 {item.file}
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.text.secondary, mb: 1 }}>
                        <strong>Ticket ID:</strong> {item.ticket_id}
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.text.secondary }}>
                        <strong>Caller:</strong> {item.analysis?.caller_name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Alert 
                        severity={item.db_status === 'inserted' ? 'success' : 'error'}
                        sx={{ borderRadius: 2 }}
                      >
                        {item.db_status === 'inserted' ? 'Successfully Processed' : 'Processing Failed'}
                      </Alert>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Zoom>
          ))}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(0, 0, 0, 0.1)' }}>
          <Button 
            onClick={() => setShowModal(false)}
            variant="contained"
            sx={{
              background: theme.primary.gradient,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enhanced Error Snackbar */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity="error" 
          onClose={() => setError('')}
          sx={{ 
            borderRadius: 2,
            boxShadow: '0 8px 20px rgba(239, 68, 68, 0.3)'
          }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AudioUploaderDashboard;
