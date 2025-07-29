import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#007AFF',
      light: '#5AC8FA',
      dark: '#0051D5',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#5856D6',
      light: '#7B61FF',
      dark: '#3634A3',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#34C759',
      light: '#30D158',
      dark: '#248A3D',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#FF9500',
      light: '#FFB340',
      dark: '#C93400',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#FF3B30',
      light: '#FF6961',
      dark: '#D70015',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F2F2F7',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1D1D1F',
      secondary: '#86868B',
    },
    divider: '#E5E5EA',
  },
  typography: {
    fontFamily: '"SF Pro Display", "SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0.01em',
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0.01em',
    },
    button: {
      fontSize: '1rem',
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          fontWeight: 600,
          fontSize: '1rem',
          padding: '12px 24px',
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
        outlined: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.04)',
          backdropFilter: 'blur(20px)',
          '&:hover': {
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-2px)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 20px rgba(0, 0, 0, 0.08)',
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        },
        elevation2: {
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
        },
        elevation3: {
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
          boxShadow: 'none',
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(0, 0, 0, 0.06)',
          boxShadow: '0 -2px 20px rgba(0, 0, 0, 0.08)',
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
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: '4px 0',
          '&:hover': {
            backgroundColor: 'rgba(0, 122, 255, 0.04)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          fontWeight: 600,
          fontSize: '0.875rem',
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          borderRadius: 10,
          fontSize: '0.75rem',
          fontWeight: 600,
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: '#007AFF',
        },
      },
    },
  },
});

export default theme; 