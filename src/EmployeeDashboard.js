import React, { useState, useEffect } from 'react';
import { db, addDoc, collection, serverTimestamp, query, where, onSnapshot } from './firebase';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Grid,
  Alert,
  Snackbar,
  AppBar,
  Toolbar,
  Divider,
  Container,
  Chip,
  Avatar,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
  Bookmark as BookmarkIcon,
  ChevronRight as ChevronRightIcon,
  Description as DescriptionIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';

function EmployeeDashboard({ onNavigate, onFormSelect, onSavedFormSelect }) {
  const [rejectedForms, setRejectedForms] = useState([]);
  const [savedForms, setSavedForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    // Fetch rejected forms
    const rejectedQuery = query(collection(db, "completedForms"), where("status", "==", "Rejected"));
    const rejectedUnsubscribe = onSnapshot(rejectedQuery, (snapshot) => {
      setRejectedForms(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch saved forms
    const savedQuery = query(collection(db, "savedForms"), where("status", "==", "Saved for Later"));
    const savedUnsubscribe = onSnapshot(savedQuery, (snapshot) => {
      setSavedForms(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => {
      rejectedUnsubscribe();
      savedUnsubscribe();
    };
  }, []);

  const handleAddBatchSheetTemplate = async () => {
    try {
      await addDoc(collection(db, "forms"), {
        title: "Dynamic Yogurt Batch Sheet",
        category: "Yogurt",
        formType: "batchSheet",
        status: "template",
        createdAt: serverTimestamp()
      });
      setSnackbar({ open: true, message: "Batch Sheet template added to the 'Yogurt' category.", severity: 'success' });
    } catch (error) {
      console.error("Error adding template: ", error);
      setSnackbar({ open: true, message: "Failed to add template.", severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #F2F2F7 0%, #FFFFFF 100%)' }}>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
              sx={{ 
                bgcolor: 'primary.main',
                width: 40,
                height: 40,
                fontSize: '1.2rem',
                fontWeight: 600,
              }}
            >
              E
            </Avatar>
            <Box>
              <Typography variant="h6" component="h1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Employee Hub
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Quality Management System
              </Typography>
            </Box>
          </Box>
          <IconButton sx={{ color: 'text.secondary' }}>
            <NotificationsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Grid container spacing={3}>
          {/* Quick Actions */}
          <Grid item xs={12}>
            <Card 
              sx={{ 
                background: 'linear-gradient(135deg, #007AFF 0%, #5AC8FA 100%)',
                color: 'white',
                borderRadius: 4,
                overflow: 'hidden',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                }
              }}
            >
              <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mb: 2 }}>
                  Quick Actions
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
                  Start a new form or access your saved work
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Box
                    component="button"
                    onClick={() => onNavigate('Forms')}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      px: 3,
                      py: 1.5,
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: 3,
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      backdropFilter: 'blur(10px)',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.3)',
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    <AddIcon sx={{ fontSize: 20 }} />
                    <Typography variant="button" sx={{ fontWeight: 600 }}>
                      New Form
                    </Typography>
                  </Box>
                  <Box
                    component="button"
                    onClick={handleAddBatchSheetTemplate}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      px: 3,
                      py: 1.5,
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: 3,
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      backdropFilter: 'blur(10px)',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.3)',
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    <AssignmentIcon sx={{ fontSize: 20 }} />
                    <Typography variant="button" sx={{ fontWeight: 600 }}>
                      Add Template
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Action Required Section */}
          {rejectedForms.length > 0 && (
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ p: 3, pb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor: 'error.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <WarningIcon sx={{ color: 'white', fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography variant="h6" component="h2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          Action Required
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {rejectedForms.length} form{rejectedForms.length !== 1 ? 's' : ''} need{rejectedForms.length !== 1 ? '' : 's'} attention
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <List sx={{ p: 0 }}>
                    {rejectedForms.map((form, index) => (
                      <React.Fragment key={form.id}>
                        <ListItem 
                          disablePadding 
                          sx={{ 
                            px: 3, 
                            py: 1,
                            '&:hover': {
                              bgcolor: 'rgba(255, 59, 48, 0.04)',
                            }
                          }}
                        >
                          <ListItemButton 
                            onClick={() => onFormSelect(form)}
                            sx={{ 
                              borderRadius: 2,
                              '&:hover': {
                                bgcolor: 'rgba(255, 59, 48, 0.08)',
                              }
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              <WarningIcon color="error" />
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                  {form.formTitle || 'Untitled Form'}
                                </Typography>
                              }
                              secondary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                                  <Typography variant="body2" color="text.secondary">
                                    {formatDate(form.submittedAt)}
                                  </Typography>
                                  <Chip 
                                    label="Rejected" 
                                    size="small" 
                                    color="error" 
                                    sx={{ 
                                      height: 20, 
                                      fontSize: '0.7rem',
                                      fontWeight: 600,
                                    }}
                                  />
                                </Box>
                              }
                            />
                            <ChevronRightIcon sx={{ color: 'text.secondary' }} />
                          </ListItemButton>
                        </ListItem>
                        {index < rejectedForms.length - 1 && (
                          <Divider sx={{ mx: 3 }} />
                        )}
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Saved Forms Section */}
          {savedForms.length > 0 && (
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ p: 3, pb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor: 'warning.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <BookmarkIcon sx={{ color: 'white', fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography variant="h6" component="h2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          Saved for Later
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {savedForms.length} draft{savedForms.length !== 1 ? 's' : ''} ready to continue
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <List sx={{ p: 0 }}>
                    {savedForms.map((form, index) => (
                      <React.Fragment key={form.id}>
                        <ListItem 
                          disablePadding 
                          sx={{ 
                            px: 3, 
                            py: 1,
                            '&:hover': {
                              bgcolor: 'rgba(255, 149, 0, 0.04)',
                            }
                          }}
                        >
                          <ListItemButton 
                            onClick={() => onSavedFormSelect(form)}
                            sx={{ 
                              borderRadius: 2,
                              '&:hover': {
                                bgcolor: 'rgba(255, 149, 0, 0.08)',
                              }
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              <BookmarkIcon color="warning" />
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                  {form.formTitle || 'Untitled Form'}
                                </Typography>
                              }
                              secondary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                                  <Typography variant="body2" color="text.secondary">
                                    {formatDate(form.savedAt)}
                                  </Typography>
                                  <Chip 
                                    label="Draft" 
                                    size="small" 
                                    color="warning" 
                                    sx={{ 
                                      height: 20, 
                                      fontSize: '0.7rem',
                                      fontWeight: 600,
                                    }}
                                  />
                                </Box>
                              }
                            />
                            <ChevronRightIcon sx={{ color: 'text.secondary' }} />
                          </ListItemButton>
                        </ListItem>
                        {index < savedForms.length - 1 && (
                          <Divider sx={{ mx: 3 }} />
                        )}
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Empty State */}
          {rejectedForms.length === 0 && savedForms.length === 0 && !loading && (
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 4, textAlign: 'center', py: 6 }}>
                <CardContent>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: 'primary.light',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                    }}
                  >
                    <DescriptionIcon sx={{ color: 'white', fontSize: 40 }} />
                  </Box>
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
                    All Caught Up!
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
                    You have no pending actions or saved drafts. Ready to start a new form?
                  </Typography>
                  <Box
                    component="button"
                    onClick={() => onNavigate('Forms')}
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 1,
                      px: 4,
                      py: 2,
                      bgcolor: 'primary.main',
                      color: 'white',
                      border: 'none',
                      borderRadius: 3,
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '1rem',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)',
                      },
                    }}
                  >
                    <AddIcon />
                    Start New Form
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Container>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%',
            borderRadius: 3,
            fontWeight: 600,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default EmployeeDashboard;