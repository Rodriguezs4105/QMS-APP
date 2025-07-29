import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, query, collection, where, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

// Material UI imports
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, CircularProgress, Typography, Button, Paper, BottomNavigation, BottomNavigationAction, Badge, Container } from '@mui/material';
import { Home, List, Archive as ArchiveIcon, Settings as SettingsIcon } from '@mui/icons-material';
import theme from './theme';

// --- Page Components ---
import Login from './Login';
import EmployeeDashboard from './EmployeeDashboard';
import ManagerDashboard from './ManagerDashboard';
import FormsList from './FormsList';
import Settings from './Settings';
import FormRenderer from './FormRenderer';
import VerificationDetail from './VerificationDetail';
import Archive from './Archive';
import FormEditor from './FormEditor';
import FormViewer from './FormViewer';
import SavedFormEditor from './SavedFormEditor';

function App() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState('Dashboard');
  const [selectedForm, setSelectedForm] = useState(null);
  const [formToVerify, setFormToVerify] = useState(null);
  const [formToEdit, setFormToEdit] = useState(null);
  const [savedFormToEdit, setSavedFormToEdit] = useState(null);
  const [archivedForm, setArchivedForm] = useState(null);
  const [pendingReviewCount, setPendingReviewCount] = useState(0);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          setUserProfile(userDoc.exists() ? { user: currentUser, role: userDoc.data().role } : { user: currentUser, role: null });
        } catch (error) {
          setUserProfile({ user: currentUser, role: null });
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (userProfile?.role === 'manager') {
      const q = query(collection(db, "completedForms"), where("status", "==", "Pending Review"));
      const unsubscribe = onSnapshot(q, (snapshot) => setPendingReviewCount(snapshot.size));
      return () => unsubscribe();
    } else {
      setPendingReviewCount(0);
    }
  }, [userProfile]);

  const handleSignOut = () => signOut(getAuth());
  const handleFormSelect = (form) => setSelectedForm(form);
  const handleVerificationSelect = (form) => setFormToVerify(form);
  const handleFormEdit = (form) => setFormToEdit(form);
  const handleSavedFormEdit = (form) => setSavedFormToEdit(form);
  const handleArchivedFormSelect = (form) => setArchivedForm(form);
  const handleBack = () => {
    setSelectedForm(null);
    setFormToVerify(null);
    setFormToEdit(null);
    setSavedFormToEdit(null);
    setArchivedForm(null);
  };
  const handleNavigate = (targetPage) => setPage(targetPage);

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          sx={{
            background: 'linear-gradient(135deg, #F2F2F7 0%, #FFFFFF 100%)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <CircularProgress size={48} thickness={4} />
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
              Loading QMS...
            </Typography>
          </Box>
        </Box>
      </ThemeProvider>
    );
  }

  if (!userProfile) return <Login />;

  if (userProfile.user && !userProfile.role) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
          textAlign="center"
          sx={{
            background: 'linear-gradient(135deg, #F2F2F7 0%, #FFFFFF 100%)',
            p: 3,
          }}
        >
          <Container maxWidth="sm">
            <Box
              sx={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                borderRadius: 4,
                p: 4,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                Verification Incomplete
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 3, lineHeight: 1.6 }}>
                Your user profile is not set up correctly. Please contact an administrator to complete your account setup.
              </Typography>
              <Button
                variant="contained"
                color="error"
                onClick={handleSignOut}
                sx={{ 
                  px: 4, 
                  py: 1.5,
                  borderRadius: 3,
                  fontWeight: 600,
                }}
              >
                Sign Out
              </Button>
            </Box>
          </Container>
        </Box>
      </ThemeProvider>
    );
  }

  if (formToEdit) return <FormEditor form={formToEdit} onBack={handleBack} />;
  if (savedFormToEdit) return <SavedFormEditor savedForm={savedFormToEdit} onBack={handleBack} />;
  if (formToVerify) return <VerificationDetail form={formToVerify} onBack={handleBack} />;
  if (archivedForm) return <FormViewer form={archivedForm} onBack={handleBack} onDelete={() => setArchivedForm(null)} />;
  if (selectedForm) return <FormRenderer form={selectedForm} onBack={handleBack} />;

  const renderPage = () => {
    const role = userProfile.role;
    if (page === 'Dashboard') {
      return role === 'manager' 
        ? <ManagerDashboard onFormSelect={handleVerificationSelect} onSavedFormSelect={handleSavedFormEdit} /> 
        : <EmployeeDashboard onNavigate={handleNavigate} onFormSelect={handleFormEdit} onSavedFormSelect={handleSavedFormEdit} />;
    }
    if (page === 'Forms') return <FormsList onFormSelect={handleFormSelect} />;
    if (page === 'Archive') return <Archive onFormSelect={handleArchivedFormSelect} />;
    if (page === 'Settings') return <Settings handleSignOut={handleSignOut} />;
    return role === 'manager' 
      ? <ManagerDashboard onFormSelect={handleVerificationSelect} onSavedFormSelect={handleSavedFormEdit} /> 
      : <EmployeeDashboard onNavigate={handleNavigate} onFormSelect={handleFormEdit} />;
  };

  const getNavigationValue = () => {
    switch (page) {
      case 'Dashboard': return 0;
      case 'Archive': return 1;
      case 'Forms': return 2;
      case 'Settings': return 3;
      default: return 0;
    }
  };

  const handleNavigationChange = (event, newValue) => {
    switch (newValue) {
      case 0: setPage('Dashboard'); break;
      case 1: setPage('Archive'); break;
      case 2: setPage('Forms'); break;
      case 3: setPage('Settings'); break;
      default: setPage('Dashboard');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          minHeight: '100vh', 
          bgcolor: 'background.default',
          background: 'linear-gradient(135deg, #F2F2F7 0%, #FFFFFF 100%)',
        }}
      >
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            pb: 8,
            pt: 1,
          }}
        >
          {renderPage()}
        </Box>
        
        <Paper 
          sx={{ 
            position: 'fixed', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            zIndex: 1000,
            borderRadius: '20px 20px 0 0',
            mx: 1,
            mb: 1,
          }} 
          elevation={0}
        >
          <BottomNavigation
            value={getNavigationValue()}
            onChange={handleNavigationChange}
            showLabels
            sx={{
              '& .MuiBottomNavigationAction-root': {
                minWidth: 'auto',
                padding: '8px 12px',
                '&.Mui-selected': {
                  color: 'primary.main',
                },
              },
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.75rem',
                fontWeight: 600,
                marginTop: '4px',
              },
            }}
          >
            <BottomNavigationAction
              label="Dashboard"
              icon={
                <Badge 
                  badgeContent={userProfile.role === 'manager' ? pendingReviewCount : 0} 
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': {
                      fontSize: '0.7rem',
                      height: '18px',
                      minWidth: '18px',
                    },
                  }}
                >
                  <Home />
                </Badge>
              }
            />
            {userProfile.role === 'manager' && (
              <BottomNavigationAction
                label="Archive"
                icon={<ArchiveIcon />}
              />
            )}
            <BottomNavigationAction
              label="Forms"
              icon={<List />}
            />
            <BottomNavigationAction
              label="Settings"
              icon={<SettingsIcon />}
            />
          </BottomNavigation>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}

export default App;
