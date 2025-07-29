import React, { useState, useEffect } from 'react';
import { db, auth, collection, query, where, onSnapshot } from './firebase';
import { getAuditTrailByDateRange } from './utils/auditTrail';
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
  AppBar,
  Toolbar,
  Divider,
  Chip,
  Container,
  Avatar,
  IconButton,
} from '@mui/material';
import {
  ChevronRight as ChevronRightIcon,
  Bookmark as BookmarkIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Notifications as NotificationsIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';

function ManagerDashboard({ onFormSelect, onSavedFormSelect }) {
  const [pendingForms, setPendingForms] = useState([]);
  const [savedForms, setSavedForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedFormsLoading, setSavedFormsLoading] = useState(true);
  const [auditStats, setAuditStats] = useState({
    totalActions: 0,
    todayActions: 0,
    approvals: 0,
    rejections: 0
  });
  const [rejectedForms, setRejectedForms] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "completedForms"), 
      where("status", "==", "Pending Review")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const formsToReview = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPendingForms(formsToReview);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching forms for review: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load saved forms for the current manager
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const q = query(
      collection(db, "savedForms"), 
      where("savedBy", "==", currentUser.email)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const savedFormsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSavedForms(savedFormsData);
      setSavedFormsLoading(false);
    }, (error) => {
      console.error("Error fetching saved forms: ", error);
      setSavedFormsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load audit trail statistics
  useEffect(() => {
    const loadAuditStats = async () => {
      try {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
        
        const todayEntries = await getAuditTrailByDateRange(startOfDay, endOfDay);
        
        const stats = {
          totalActions: todayEntries.length,
          todayActions: todayEntries.length,
          approvals: todayEntries.filter(entry => entry.action === 'APPROVED').length,
          rejections: todayEntries.filter(entry => entry.action === 'REJECTED').length
        };
        
        setAuditStats(stats);
      } catch (error) {
        console.error("Error loading audit stats: ", error);
      }
    };

    loadAuditStats();
  }, []);

  // Load rejected forms
  useEffect(() => {
    const q = query(
      collection(db, "completedForms"), 
      where("status", "==", "Rejected")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rejectedFormsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRejectedForms(rejectedFormsData);
    });

    return () => unsubscribe();
  }, []);

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
                bgcolor: 'secondary.main',
                width: 40,
                height: 40,
                fontSize: '1.2rem',
                fontWeight: 600,
              }}
            >
              M
            </Avatar>
            <Box>
              <Typography variant="h6" component="h1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Manager Hub
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
          {/* Statistics Overview */}
          <Grid item xs={12}>
            <Card 
              sx={{ 
                background: 'linear-gradient(135deg, #5856D6 0%, #7B61FF 100%)',
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
                  Today's Overview
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
                  Quality management activity summary
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                        {pendingForms.length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                        Pending Review
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                        {auditStats.approvals}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                        Approved Today
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                        {auditStats.rejections}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                        Rejected Today
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                        {auditStats.totalActions}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                        Total Actions
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Pending Forms Section */}
          {pendingForms.length > 0 && (
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
                        <AssignmentIcon sx={{ color: 'white', fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography variant="h6" component="h2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          Pending Review
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {pendingForms.length} form{pendingForms.length !== 1 ? 's' : ''} awaiting your review
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <List sx={{ p: 0 }}>
                    {pendingForms.map((form, index) => (
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
                            onClick={() => onFormSelect(form)}
                            sx={{ 
                              borderRadius: 2,
                              '&:hover': {
                                bgcolor: 'rgba(255, 149, 0, 0.08)',
                              }
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              <AssignmentIcon color="warning" />
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
                                    label="Pending" 
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
                        {index < pendingForms.length - 1 && (
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
                          bgcolor: 'info.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <BookmarkIcon sx={{ color: 'white', fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography variant="h6" component="h2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          Your Saved Forms
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
                              bgcolor: 'rgba(0, 122, 255, 0.04)',
                            }
                          }}
                        >
                          <ListItemButton 
                            onClick={() => onSavedFormSelect(form)}
                            sx={{ 
                              borderRadius: 2,
                              '&:hover': {
                                bgcolor: 'rgba(0, 122, 255, 0.08)',
                              }
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              <BookmarkIcon color="info" />
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
                                    color="info" 
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
          {pendingForms.length === 0 && savedForms.length === 0 && !loading && (
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 4, textAlign: 'center', py: 6 }}>
                <CardContent>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: 'secondary.light',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                    }}
                  >
                    <DashboardIcon sx={{ color: 'white', fontSize: 40 }} />
                  </Box>
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
                    All Caught Up!
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
                    No forms are pending review and you have no saved drafts. The team is doing great!
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: 2,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Box
                      component="button"
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
                      <TrendingUpIcon />
                      View Analytics
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
}

export default ManagerDashboard;