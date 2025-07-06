import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Snackbar, Alert, AppBar, Toolbar, IconButton, Tooltip } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

import axios from 'axios';

const RegisterPage = ({ onRegister, darkMode, setDarkMode }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password || !confirmPassword) {
      setError('Please fill all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await axios.post('http://127.0.0.1:8007/register', { username, password });
      if (response.data && response.data.success) {
        setSuccess('Registration successful!');
        if (onRegister) onRegister(username, password);
      } else {
        setError(response.data?.message || 'Registration failed');
      }
    } catch (err) {
      setError('Registration failed! Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: darkMode ? '#0c101b' : 'linear-gradient(to right, #000927, #bbdefb)' }}>
      <AppBar position="static" sx={{ backgroundColor: '#000927' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Register
          </Typography>
          <Tooltip title="Toggle Dark Mode">
            <IconButton color="inherit" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card sx={{ minWidth: 350, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h5" sx={{ mb: 2, color: '#000927', fontWeight: 'bold' }}>Register</Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                label="Username"
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
              <TextField
                label="Password"
                type="password"
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <TextField
                label="Confirm Password"
                type="password"
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
              <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Box>
      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError('')}>
        <Alert severity="error" onClose={() => setError('')}>{error}</Alert>
      </Snackbar>
      <Snackbar open={!!success} autoHideDuration={4000} onClose={() => setSuccess('')}>
        <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>
      </Snackbar>
    </Box>
  );
};

export default RegisterPage;
