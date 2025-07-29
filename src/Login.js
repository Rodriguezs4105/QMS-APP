import React, { useState } from 'react';
import { auth, signInWithEmailAndPassword } from './firebase';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  ThemeProvider,
  createTheme,
  Avatar,
  InputAdornment,
} from '@mui/material';
import { LockOutlined, Email, Visibility, VisibilityOff } from '@mui/icons-material';

// Create a custom theme for the login page
const loginTheme = createTheme({
  palette: {
    primary: {
      main: '#007AFF',
      light: '#5AC8FA',
      dark: '#0051D5',
    },
    background: {
      default: 'linear-gradient(135deg, #F2F2F7 0%, #FFFFFF 100%)',
    },
    text: {
      primary: '#1D1D1F',
      secondary: '#86868B',
    },
  },
  typography: {
    fontFamily: '"SF Pro Display", "SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    body1: {
      fontWeight: 400,
      lineHeight: 1.6,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      fontSize: '1rem',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          borderRadius: 20,
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#007AFF',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#007AFF',
              borderWidth: '2px',
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '1rem',
          padding: '14px 32px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #007AFF 0%, #5AC8FA 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #0051D5 0%, #007AFF 100%)',
          },
        },
      },
    },
  },
});

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError('Failed to log in. Please check your email and password.');
      console.error("Login error:", err);
    }
  };

  return (
    <ThemeProvider theme={loginTheme}>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #F2F2F7 0%, #FFFFFF 100%)',
          p: 3,
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={0}
            sx={{
              p: 5,
              textAlign: 'center',
              maxWidth: 450,
              mx: 'auto',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23007AFF" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                borderRadius: 20,
              }
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ mb: 4 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'primary.main',
                    mx: 'auto',
                    mb: 3,
                    boxShadow: '0 8px 32px rgba(0, 122, 255, 0.3)',
                  }}
                >
                  <LockOutlined sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 1 }}>
                  Welcome Back
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  Sign in to your Quality Management System
                </Typography>
              </Box>

              {error && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3, 
                    borderRadius: 3,
                    fontWeight: 500,
                  }}
                >
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleLogin} sx={{ textAlign: 'left' }}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: 'text.secondary', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  sx={{ mb: 4 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          onClick={() => setShowPassword(!showPassword)}
                          sx={{ 
                            minWidth: 'auto', 
                            p: 0.5,
                            color: 'text.secondary',
                            '&:hover': {
                              bgcolor: 'rgba(0, 0, 0, 0.04)',
                            }
                          }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                  }}
                >
                  Sign In
                </Button>
              </Box>

              <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid rgba(0, 0, 0, 0.06)' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Esti Foods Quality Management System
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Secure access to your quality control workflows
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default Login;
