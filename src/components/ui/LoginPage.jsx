import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Tabs,
  Tab,
  TextField,
  Snackbar,
  Alert,
  Container,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axios from 'axios';

const LoginPage = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Only one theme: #B6D0E2 background, black text, header #000927 with white text
  const mainBgColor = '#B6D0E2';
  const headerBgColor = '#000927';
  const headerTextColor = '#fff';
  const cardBgColor = '#fff';
  const cardTextColor = '#000';

  const handleAuth = async (e) => {
    e.preventDefault();
    console.log('handleAuth called with:', { username, password, activeTab });
    
    if (!username || !password || (activeTab === 1 && !email)) {
      setError('Please fill all fields');
      return;
    }

    setLoading(true);
    setError('');

    // For testing purposes, simulate a successful login without making an actual API call
    console.log('Simulating login...');
    
    // Remove the timeout to make it immediate for testing
    if (activeTab === 0) {
      // Simulate successful login
      console.log('Calling onLogin with:', username, password);
      if (onLogin) {
        onLogin(username, password);
        console.log('onLogin called successfully');
      } else {
        console.error('onLogin is not defined!');
      }
      setUsername('');
      setPassword('');
    } else {
      // Simulate successful registration
      setError('Registration successful! Please login.');
      setActiveTab(0);
      setUsername('');
      setPassword('');
      setEmail('');
    }
    setLoading(false);

    // Comment out the actual API call for testing
    /*
    const url = activeTab === 0
      ? 'http://127.0.0.1:8007/login'
      : 'http://127.0.0.1:8007/register';

    const payload = activeTab === 0
      ? { username, password }
      : { username, password, email };

    try {
      const response = await axios.post(url, payload);
      if (response.data && (response.data.username || response.data.email)) {
        if (onLogin && activeTab === 0) onLogin(response.data.username, password);
        setUsername('');
        setPassword('');
        setEmail('');
      } else {
        setError('Unexpected response from server');
      }
    } catch (err) {
      setError('Request failed. Please try again.');
    } finally {
      setLoading(false);
    }
    */
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: mainBgColor, color: cardTextColor }}>
      {/* Navbar */}
      <AppBar position="static" sx={{ backgroundColor: headerBgColor }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold', color: headerTextColor }}>
            Dial 112 - AI Analyzer
          </Typography>
          <Button sx={{ color: headerTextColor }}>Home</Button>
          <Button sx={{ color: headerTextColor }}>About</Button>
          <Button sx={{ color: headerTextColor }}>Support</Button>
        </Toolbar>
      </AppBar>

      {/* Main Section */}
      <Container
        maxWidth="lg"
        sx={{
          py: 6,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          gap: 4,
          alignItems: 'center',
        }}
      >
        {/* Left */}
        <Box sx={{ flex: 1.5, display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-start' }, height: '100%' }}>
          <img
            src="src/assets/back-img-1.png"
            alt="AP Police Emblem"
            style={{ maxWidth: 350, marginLeft: 0, marginRight: 0, display: 'block' }}
          />
        </Box>

        {/* Right - Auth Card */}
        <Box sx={{ flex: 1, maxWidth: 400, ml: 'auto' }}>
          <Card sx={{ width: '100%', borderRadius: 2, boxShadow: 3, backgroundColor: cardBgColor, color: cardTextColor }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  color: cardTextColor,
                },
                '& .Mui-selected': {
                  color: cardTextColor,
                  fontWeight: 'bold',
                }
              }}
            >
              <Tab label="Login" />
              <Tab label="Register" />
            </Tabs>
            <CardContent>
              <Typography variant="h6" sx={{ textAlign: 'center', mb: 3, color: cardTextColor }}>
                {activeTab === 0 ? 'Login to your account' : 'Create a new account'}
              </Typography>
              <form onSubmit={handleAuth} autoComplete="on">
                <TextField
                  label="Username"
                  variant="outlined"
                  fullWidth
                  sx={{
                    mb: 2,
                    '& input': {
                      color: cardTextColor,
                      backgroundColor: '#fff',
                    },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: cardTextColor },
                      '& input::placeholder': {
                        color: cardTextColor,
                        opacity: 1,
                      },
                    },
                    '& input:-webkit-autofill': {
                      WebkitBoxShadow: '0 0 0 100px #fff inset',
                      WebkitTextFillColor: cardTextColor,
                      backgroundColor: '#fff',
                      color: cardTextColor,
                    },
                  }}
                  InputProps={{
                    style: { color: cardTextColor },
                  }}
                  InputLabelProps={{
                    style: { color: cardTextColor },
                  }}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
                {activeTab === 1 && (
                  <TextField
                    label="Email"
                    variant="outlined"
                    fullWidth
                    sx={{
                      mb: 2,
                      '& input': {
                        color: cardTextColor,
                        backgroundColor: '#fff',
                      },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: cardTextColor },
                        '& input::placeholder': {
                          color: cardTextColor,
                          opacity: 1,
                        },
                      },
                      '& input:-webkit-autofill': {
                        WebkitBoxShadow: '0 0 0 100px #fff inset',
                        WebkitTextFillColor: cardTextColor,
                        backgroundColor: '#fff',
                        color: cardTextColor,
                      },
                    }}
                    InputProps={{
                      style: { color: cardTextColor },
                    }}
                    InputLabelProps={{
                      style: { color: cardTextColor },
                    }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                )}
                <TextField
                  label="Password"
                  type="password"
                  variant="outlined"
                  fullWidth
                  sx={{
                    mb: 3,
                    '& input': {
                      color: cardTextColor,
                      backgroundColor: '#fff',
                    },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: cardTextColor },
                      '& input::placeholder': {
                        color: cardTextColor,
                        opacity: 1,
                      },
                    },
                    '& input:-webkit-autofill': {
                      WebkitBoxShadow: '0 0 0 100px #fff inset',
                      WebkitTextFillColor: cardTextColor,
                      backgroundColor: '#fff',
                      color: cardTextColor,
                    },
                  }}
                  InputProps={{
                    style: { color: cardTextColor },
                  }}
                  InputLabelProps={{
                    style: { color: cardTextColor },
                  }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={loading}
                  sx={{ textTransform: 'none', fontWeight: 'bold', backgroundColor: headerBgColor, color: headerTextColor, '&:hover': { backgroundColor: '#222e4c' } }}
                >
                  {loading
                    ? activeTab === 0
                      ? 'Logging in...'
                      : 'Registering...'
                    : activeTab === 0
                      ? 'Login'
                      : 'Register'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </Box>
      </Container>

      {/* Challenges vs Solution */}
      <Box sx={{ backgroundColor: mainBgColor, py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 4, color: cardTextColor }}>
            Current Challenges vs Our Solution
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 4,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: cardTextColor }}>
                Current Challenges
              </Typography>
              <List>
                {[
                  'Manual Ticketing – Operators type and tag calls in real-time—prone to errors and delays.',
                  'Outdated Analytics – Heatmaps only after the fact—no live view of district-wide incidents.',
                  'No AI Support – No suggestions or automation for fields, categories, or follow-ups.',
                  'Disconnected Calls – Once logged, calls end—even when situations are still evolving.',
                ].map((item, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircleIcon color="error" />
                    </ListItemIcon>
                    <ListItemText primary={item} sx={{ color: cardTextColor }} />
                  </ListItem>
                ))}
              </List>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: cardTextColor }}>
                Our Solution
              </Typography>
              <List>
                {[
                  'Auto-transcribe and categorize voice calls in seconds.',
                  'Generate live incident maps and dashboards.',
                  'Suggest tags, severity, and subtypes automatically.',
                  'Provide insights to commanders, and support operators in real time.',
                  'Keep callers informed with proactive response flows.',
                ].map((item, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={item} sx={{ color: cardTextColor }} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Divider />
      <Box sx={{ textAlign: 'center', py: 2, backgroundColor: headerBgColor }}>
        <Typography variant="body2" sx={{ color: headerTextColor }}>
          © {new Date().getFullYear()} AP Police. All rights reserved. | Contact: support@dail112.gov.in
        </Typography>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LoginPage;



// import React, { useState } from 'react';
// import {
//   AppBar,
//   Toolbar,
//   Typography,
//   Box,
//   Button,
//   Card,
//   CardContent,
//   Tabs,
//   Tab,
//   TextField,
//   Snackbar,
//   Alert,
//   Container,
//   Divider,
//   List,
//   ListItem,
//   ListItemIcon,
//   ListItemText
// } from '@mui/material';
// import CheckCircleIcon from '@mui/icons-material/CheckCircle';
// import axios from 'axios';

// const LoginPage = ({ onLogin }) => {
//   const [activeTab, setActiveTab] = useState(0); // 0 = Login, 1 = Register
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [email, setEmail] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleAuth = async (e) => {
//     e.preventDefault();
//     if (!username || !password || (activeTab === 1 && !email)) {
//       setError('Please fill all fields');
//       return;
//     }

//     setLoading(true);
//     setError('');

//     const url = activeTab === 0
//       ? 'http://127.0.0.1:8007/login'
//       : 'http://127.0.0.1:8007/register';

//     const payload = activeTab === 0
//       ? { username, password }
//       : { username, password, email };

//     try {
//       const response = await axios.post(url, payload);
//       if (response.data && (response.data.username || response.data.email)) {
//         if (onLogin && activeTab === 0) onLogin(response.data.username, password);
//         setUsername('');
//         setPassword('');
//         setEmail('');
//       } else {
//         setError('Unexpected response from server');
//       }
//     } catch (err) {
//       setError('Request failed. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Box sx={{ backgroundColor: '#f1f5f9', minHeight: '100vh' }}>
//       {/* Navbar */}
//       <AppBar position="static" sx={{ backgroundColor: '#000927' }}>
//         <Toolbar>
//           <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
//             Dial 112 - AI Analyzer
//           </Typography>
//           <Button color="inherit">Home</Button>
//           <Button color="inherit">About</Button>
//           <Button color="inherit">Support</Button>
//         </Toolbar>
//       </AppBar>

//       {/* Hero + Auth Section */}
//       <Container maxWidth="lg" sx={{ py: 6, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center' }}>
//         <Box sx={{ flex: 1, mb: { xs: 4, md: 0 }, textAlign: { xs: 'center', md: 'left' } }}>
//           <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
//             Empowering AP Police with AI
//           </Typography>
//           <Typography variant="body1" sx={{ mb: 2 }}>
// Let AI Listen—And Act—When Every Second Counts          </Typography>
//     <Typography variant="body1" sx={{ mb: 2 }}>
// Operators handle hundreds of emergency calls a day. Legacy tools can't keep up. Our AI solution extracts, analyzes, and maps incident data in real time—so no detail goes unheard
//        </Typography>
//           <img
//             src="src/assets/AP_Police_Emblem_112.png"
//             alt="AP Police Emblem"
//             style={{ maxWidth: 200 }}
//           />
//         </Box>

//         {/* Login/Register */}
//         <Box sx={{ flex: 1, px: { md: 2 } }}>
//           <Card sx={{ maxWidth: 400, mx: 'auto', borderRadius: 2, boxShadow: 3 }}>
//             <Tabs
//               value={activeTab}
//               onChange={(e, newValue) => setActiveTab(newValue)}
//               indicatorColor="primary"
//               textColor="primary"
//               variant="fullWidth"
//             >
//               <Tab label="Login" />
//               <Tab label="Register" />
//             </Tabs>
//             <CardContent>
//               <Typography variant="h6" sx={{ textAlign: 'center', mb: 3 }}>
//                 {activeTab === 0 ? 'Login to your account' : 'Create a new account'}
//               </Typography>
//               <form onSubmit={handleAuth}>
//                 <TextField
//                   label="Username"
//                   variant="outlined"
//                   fullWidth
//                   sx={{ mb: 2 }}
//                   value={username}
//                   onChange={(e) => setUsername(e.target.value)}
//                 />
//                 {activeTab === 1 && (
//                   <TextField
//                     label="Email"
//                     variant="outlined"
//                     fullWidth
//                     sx={{ mb: 2 }}
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                   />
//                 )}
//                 <TextField
//                   label="Password"
//                   type="password"
//                   variant="outlined"
//                   fullWidth
//                   sx={{ mb: 3 }}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                 />
//                 <Button
//                   type="submit"
//                   variant="contained"
//                   fullWidth
//                   disabled={loading}
//                   sx={{ textTransform: 'none', fontWeight: 'bold' }}
//                 >
//                   {loading
//                     ? activeTab === 0
//                       ? 'Logging in...'
//                       : 'Registering...'
//                     : activeTab === 0
//                       ? 'Login'
//                       : 'Register'}
//                 </Button>
//               </form>
//             </CardContent>
//           </Card>
//         </Box>
//       </Container>

//       {/* Challenges vs Solution Section */}
//       <Box sx={{ backgroundColor: '#ffffff', py: 6, px: 2 }}>
//         <Container maxWidth="lg">
//           <Typography
//             variant="h5"
//             sx={{ fontWeight: 'bold', textAlign: 'center', mb: 4 }}
//           >
//             Current Challenges vs Our Solution
//           </Typography>

//           <Box
//             sx={{
//               display: 'flex',
//               flexDirection: { xs: 'column', md: 'row' },
//               gap: 4,
//             }}
//           >
//             {/* Left - Challenges */}
//             <Box sx={{ flex: 1 }}>
//               <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
//                 Current Challenges
//               </Typography>
//               <List>
//                 {[
//                   'Manual Ticketing – Operators type and tag calls in real-time—prone to errors and delays.',
//                   'Outdated Analytics – Heatmaps only after the fact—no live view of district-wide incidents.',
//                   'No AI Support – No suggestions or automation for fields, categories, or follow-ups.',
//                   'Disconnected Calls – Once logged, calls end—even when situations are still evolving.',
//                 ].map((item, index) => (
//                   <ListItem key={index}>
//                     <ListItemIcon>
//                       <CheckCircleIcon color="error" />
//                     </ListItemIcon>
//                     <ListItemText primary={item} />
//                   </ListItem>
//                 ))}
//               </List>
//             </Box>

//             {/* Right - Solutions */}
//             <Box sx={{ flex: 1 }}>
//               <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
//                 Our Solution
//               </Typography>
//               <List>
//                 {[
//                   'Auto-transcribe and categorize voice calls in seconds.',
//                   'Generate live incident maps and dashboards.',
//                   'Suggest tags, severity, and subtypes automatically.',
//                   'Provide insights to commanders, and support operators in real time.',
//                   'Keep callers informed with proactive response flows.',
//                 ].map((item, index) => (
//                   <ListItem key={index}>
//                     <ListItemIcon>
//                       <CheckCircleIcon color="primary" />
//                     </ListItemIcon>
//                     <ListItemText primary={item} />
//                   </ListItem>
//                 ))}
//               </List>
//             </Box>
//           </Box>
//         </Container>
//       </Box>

//       {/* Footer */}
//       <Divider />
//       <Box sx={{ textAlign: 'center', py: 2, backgroundColor: '#000927' }}>
//         <Typography variant="body2">
//           © {new Date().getFullYear()} AP Police. All rights reserved. | Contact: support@dail112.gov.in
//         </Typography>
//       </Box>

//       {/* Error Snackbar */}
//       <Snackbar
//         open={!!error}
//         autoHideDuration={4000}
//         onClose={() => setError('')}
//         anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
//       >
//         <Alert severity="error" onClose={() => setError('')}>
//           {error}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// };

// export default LoginPage;
