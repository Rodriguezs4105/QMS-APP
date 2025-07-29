import React, { useState, useEffect } from 'react';
import { db, collection, query, where, onSnapshot } from './firebase';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Container,
  Avatar,
  Chip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  Folder as FolderIcon,
  Description as DescriptionIcon,
  Archive as ArchiveIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

function Archive({ onFormSelect }) {
  const [approvedForms, setApprovedForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [view, setView] = useState('formTypes');
  const [selectedFormType, setSelectedFormType] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    const q = query(collection(db, "completedForms"), where("status", "==", "Approved"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const formsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setApprovedForms(formsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching approved forms: ", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredForms = approvedForms.filter(form => 
    (form.formTitle?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (form.recipeName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (form.batchBy?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (form.batchDate?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const getFormTypes = () => {
    const types = filteredForms.map(form => {
      // For existing forms without formTitle, use a default title
      if (!form.formTitle) {
        return "F-06: Dynamic Yogurt Batch Sheet";
      }
      return form.formTitle;
    });
    return [...new Set(types)];
  };

  const getDatesForFormType = (formType) => {
    const dates = filteredForms
      .filter(form => {
        const formTitle = form.formTitle || "F-06: Dynamic Yogurt Batch Sheet";
        return formTitle === formType;
      })
      .map(form => form.batchDate);
    return [...new Set(dates)].sort((a, b) => new Date(b) - new Date(a));
  };
  
  const getFormsForDate = (formType, date) => {
    return filteredForms.filter(form => {
      const formTitle = form.formTitle || "F-06: Dynamic Yogurt Batch Sheet";
      return formTitle === formType && form.batchDate === date;
    });
  };

  const handleFormTypeClick = (type) => {
    setSelectedFormType(type);
    setView('dates');
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setView('forms');
  };

  const handleBack = () => {
    if (view === 'forms') setView('dates');
    else if (view === 'dates') setView('formTypes');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };

  const getFormTypeIcon = (formTitle) => {
    if (formTitle.includes('Yogurt')) return <DescriptionIcon />;
    if (formTitle.includes('Hummus') || formTitle.includes('Dips')) return <FolderIcon />;
    return <DescriptionIcon />;
  };

  const getFormTypeColor = (formTitle) => {
    if (formTitle.includes('Yogurt')) return '#007AFF';
    if (formTitle.includes('Hummus') || formTitle.includes('Dips')) return '#34C759';
    return '#5856D6';
  };

  if (loading) {
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
          <Toolbar>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar 
                sx={{ 
                  bgcolor: 'warning.main',
                  width: 40,
                  height: 40,
                  fontSize: '1.2rem',
                  fontWeight: 600,
                }}
              >
                <ArchiveIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" component="h1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  Archive
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Browse approved forms
                </Typography>
              </Box>
            </Box>
          </Toolbar>
        </AppBar>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={48} thickness={4} />
        </Box>
      </Box>
    );
  }

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
            {view !== 'formTypes' && (
              <IconButton 
                onClick={handleBack}
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.04)',
                  }
                }}
              >
                <ArrowBackIcon />
              </IconButton>
            )}
            <Avatar 
              sx={{ 
                bgcolor: 'warning.main',
                width: 40,
                height: 40,
                fontSize: '1.2rem',
                fontWeight: 600,
              }}
            >
              <ArchiveIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" component="h1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {view === 'formTypes' ? 'Archive' : 
                 view === 'dates' ? selectedFormType : 
                 formatDate(selectedDate)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {view === 'formTypes' ? 'Browse approved forms' :
                 view === 'dates' ? 'Select a date' :
                 `${getFormsForDate(selectedFormType, selectedDate).length} form${getFormsForDate(selectedFormType, selectedDate).length !== 1 ? 's' : ''} available`}
              </Typography>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* Search Bar */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search forms by title, recipe, or date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
              },
            }}
          />
        </Box>

        {view === 'formTypes' && (
          <Grid container spacing={3}>
            {getFormTypes().map((formType) => {
              const formCount = filteredForms.filter(form => {
                const formTitle = form.formTitle || "F-06: Dynamic Yogurt Batch Sheet";
                return formTitle === formType;
              }).length;
              
              return (
                <Grid item xs={12} sm={6} md={4} key={formType}>
                  <Card 
                    sx={{ 
                      borderRadius: 4,
                      cursor: 'pointer',
                      overflow: 'hidden',
                      position: 'relative',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                    onClick={() => handleFormTypeClick(formType)}
                  >
                    <Box
                      sx={{
                        height: 80,
                        background: `linear-gradient(135deg, ${getFormTypeColor(formType)} 0%, ${getFormTypeColor(formType)}80 100%)`,
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
                      <Box sx={{ position: 'relative', zIndex: 1, p: 2, color: 'white' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              bgcolor: 'rgba(255, 255, 255, 0.2)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backdropFilter: 'blur(10px)',
                            }}
                          >
                            {getFormTypeIcon(formType)}
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontWeight: 600, 
                                opacity: 0.9,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {formCount} form{formCount !== 1 ? 's' : ''}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                    
                    <CardContent sx={{ p: 3 }}>
                      <Typography 
                        variant="h6" 
                        component="h3" 
                        sx={{ 
                          fontWeight: 700, 
                          mb: 1,
                          color: 'text.primary',
                          lineHeight: 1.3,
                        }}
                      >
                        {formType}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          label="Approved" 
                          size="small" 
                          color="success"
                          icon={<CheckCircleIcon />}
                          sx={{ 
                            height: 20, 
                            fontSize: '0.7rem',
                            fontWeight: 600,
                          }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                          Ready to view
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {view === 'dates' && (
          <Grid container spacing={3}>
            {getDatesForFormType(selectedFormType).map((date) => {
              const formsForDate = getFormsForDate(selectedFormType, date);
              
              return (
                <Grid item xs={12} sm={6} md={4} key={date}>
                  <Card 
                    sx={{ 
                      borderRadius: 4,
                      cursor: 'pointer',
                      overflow: 'hidden',
                      position: 'relative',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                    onClick={() => handleDateClick(date)}
                  >
                    <Box
                      sx={{
                        height: 80,
                        background: 'linear-gradient(135deg, #5856D6 0%, #7B61FF 100%)',
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
                      <Box sx={{ position: 'relative', zIndex: 1, p: 2, color: 'white' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              bgcolor: 'rgba(255, 255, 255, 0.2)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backdropFilter: 'blur(10px)',
                            }}
                          >
                            <CalendarIcon />
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontWeight: 600, 
                                opacity: 0.9,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {formsForDate.length} form{formsForDate.length !== 1 ? 's' : ''}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                    
                    <CardContent sx={{ p: 3 }}>
                      <Typography 
                        variant="h6" 
                        component="h3" 
                        sx={{ 
                          fontWeight: 700, 
                          mb: 1,
                          color: 'text.primary',
                          lineHeight: 1.3,
                        }}
                      >
                        {formatDate(date)}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          label="Approved" 
                          size="small" 
                          color="success"
                          icon={<CheckCircleIcon />}
                          sx={{ 
                            height: 20, 
                            fontSize: '0.7rem',
                            fontWeight: 600,
                          }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                          Ready to view
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {view === 'forms' && (
          <Grid container spacing={3}>
            {getFormsForDate(selectedFormType, selectedDate).map((form) => (
              <Grid item xs={12} sm={6} md={4} key={form.id}>
                <Card 
                  sx={{ 
                    borderRadius: 4,
                    cursor: 'pointer',
                    overflow: 'hidden',
                    position: 'relative',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  onClick={() => onFormSelect(form)}
                >
                  <Box
                    sx={{
                      height: 80,
                      background: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)',
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
                    <Box sx={{ position: 'relative', zIndex: 1, p: 2, color: 'white' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backdropFilter: 'blur(10px)',
                          }}
                        >
                          <DescriptionIcon />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 600, 
                              opacity: 0.9,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {form.batchBy || 'Unknown'}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                  
                  <CardContent sx={{ p: 3 }}>
                    <Typography 
                      variant="h6" 
                      component="h3" 
                      sx={{ 
                        fontWeight: 700, 
                        mb: 1,
                        color: 'text.primary',
                        lineHeight: 1.3,
                      }}
                    >
                      {form.recipeName || form.formTitle || 'Untitled Form'}
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 2,
                        lineHeight: 1.5,
                      }}
                    >
                      Submitted by {form.batchBy || 'Unknown'} on {formatDate(form.batchDate)}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label="Approved" 
                        size="small" 
                        color="success"
                        icon={<CheckCircleIcon />}
                        sx={{ 
                          height: 20, 
                          fontSize: '0.7rem',
                          fontWeight: 600,
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                        Ready to view
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Empty State */}
        {filteredForms.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'warning.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <ArchiveIcon sx={{ color: 'white', fontSize: 40 }} />
            </Box>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
              No Forms Found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
              {searchTerm ? 'No forms match your search criteria.' : 'No approved forms are available in the archive.'}
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default Archive;