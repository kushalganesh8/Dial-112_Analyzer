import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import AudioUploaderDashboard from './components/ui/Dashboard';
import LoginPage from './components/ui/LoginPage';
import RegisterPage from './components/ui/RegisterPage';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';

function App() {
  // On first load, check localStorage for login
  const [page, setPage] = useState(() => {
    if (localStorage.getItem('isLoggedIn')) return 'dashboard';
    return 'login';
  });
  const [user, setUser] = useState(() => {
    if (localStorage.getItem('isLoggedIn')) {
      // Optionally, you can store user info in localStorage as well
      return { username: localStorage.getItem('username') || '' };
    }
    return null;
  });

  // Theme logic
  const [darkMode, setDarkMode] = useState(true);
  const theme = useMemo(() =>
    createTheme({
      palette: {
        mode: darkMode ? 'dark' : 'light',
        primary: { main: '#000927' },
        background: {
          default: darkMode ? '#0c101b' : '#000927',
          paper: darkMode ? '#121a2a' : '#ffffff'
        },
      },
    }), [darkMode]);

  // When logging in, set localStorage
  const handleLogin = (username, password) => {
    setUser({ username });
    setPage('dashboard');
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('username', username);
  };

  const handleRegister = (username, password) => {
    setPage('login');
  };

  // On logout, clear localStorage
  const handleLogout = () => {
    setUser(null);
    setPage('login');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
  };

  // Optionally, listen for storage changes (multi-tab logout)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'isLoggedIn' && e.newValue !== 'true') {
        setUser(null);
        setPage('login');
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        {page === 'login' && (
          <>
            <LoginPage onLogin={handleLogin} darkMode={darkMode} setDarkMode={setDarkMode} />
            <div style={{ marginTop: 16 }}>
              <span>Don't have an account? </span>
              <button onClick={() => setPage('register')}>Register</button>
            </div>
          </>
        )}
        {page === 'register' && (
          <>
            <RegisterPage onRegister={handleRegister} darkMode={darkMode} setDarkMode={setDarkMode} />
            <div style={{ marginTop: 16 }}>
              <span>Already have an account? </span>
              <button onClick={() => setPage('login')}>Login</button>
            </div>
          </>
        )}
        {page === 'dashboard' && user && (
          <AudioUploaderDashboard onLogout={handleLogout} darkMode={darkMode} setDarkMode={setDarkMode} username={user.username} />
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;
