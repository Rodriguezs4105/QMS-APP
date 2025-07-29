import React, { useState, useEffect } from 'react';
import FormCard from './FormCard';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  CircularProgress,
  Container,
  Avatar,
  Chip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  LocalDining as LocalDiningIcon,
  Restaurant as RestaurantIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';

function FormsList({ onFormSelect }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const categories = [
    {
      id: 'Yogurt',
      title: 'Yogurt Production',
      description: 'Quality control forms for yogurt manufacturing',
      icon: LocalDiningIcon,
      color: '#007AFF',
      gradient: 'linear-gradient(135deg, #007AFF 0%, #5AC8FA 100%)',
    },
    {
      id: 'Hummus/Dips',
      title: 'Hummus & Dips',
      description: 'Quality control forms for hummus and dips production',
      icon: RestaurantIcon,
      color: '#34C759',
      gradient: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)',
    }
  ];

  // Define available forms for each category
  const availableForms = {
    'Yogurt': [
      {
        id: 'batch-sheet',
        title: 'F-06: Dynamic Yogurt Batch Sheet',
        formType: 'batchSheet',
        description: 'Complete batch sheet for yogurt production',
        status: 'active'
      },
      {
        id: 'yogurt-final-time-cut',
        title: 'F-03: Yogurt Final Time and Cut Record',
        formType: 'yogurtFinalTimeCut',
        description: 'Final time and cut record with pH monitoring',
        status: 'active'
      },
      {
        id: 'yogurt-pasteurization-monitoring',
        title: 'F-04: Yogurt Pasteurization to Fermentation Monitoring Record',
        formType: 'yogurtPasteurizationMonitoring',
        description: 'Pasteurization to fermentation monitoring with cut time calculation',
        status: 'active'
      },
      {
        id: 'yogurt-batching-process',
        title: 'F-05: Yogurt Batching Process Record',
        formType: 'yogurtBatchingProcess',
        description: 'Yogurt batching process with mixing and sheer steps',
        status: 'active'
      }
    ],
    'Hummus/Dips': [
      {
        id: 'dynamic-hummus-dips-batch-sheet',
        title: 'Dynamic Hummus/Dips Batch Sheet',
        formType: 'dynamicHummusDipsBatchSheet',
        description: 'Dynamic batch sheet for all hummus and dips recipes',
        status: 'active'
      },
      {
        id: 'chickpeas-batching-process',
        title: 'F-10: Chickpeas Batching Process',
        formType: 'chickpeasBatchingProcess',
        description: 'Batching process record for cooked chickpeas',
        status: 'active'
      }
    ]
  };

  useEffect(() => {
    if (!selectedCategory) {
      setForms([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    // Use the predefined forms instead of fetching from Firestore
    const categoryForms = availableForms[selectedCategory] || [];
    setForms(categoryForms);
    setLoading(false);
  }, [selectedCategory]);

  if (!selectedCategory) {
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
                <CategoryIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" component="h1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  Form Categories
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Select a category to view available forms
                </Typography>
              </Box>
            </Box>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Grid container spacing={3}>
            {categories.map((category) => (
              <Grid item xs={12} sm={6} key={category.id}>
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
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <Box
                    sx={{
                      background: category.gradient,
                      height: 120,
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
                    <Box sx={{ position: 'relative', zIndex: 1, p: 3, color: 'white' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Box
                          sx={{
                            width: 50,
                            height: 50,
                            borderRadius: '50%',
                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backdropFilter: 'blur(10px)',
                          }}
                        >
                          <category.icon sx={{ fontSize: 24 }} />
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                            {category.title}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                            {availableForms[category.id]?.length || 0} forms available
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {category.description}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                      <Chip 
                        label="Active" 
                        size="small" 
                        color="success" 
                        sx={{ 
                          height: 20, 
                          fontSize: '0.7rem',
                          fontWeight: 600,
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        Ready to use
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  }

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);

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
            <IconButton 
              onClick={() => setSelectedCategory(null)}
              sx={{ 
                color: 'text.secondary',
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.04)',
                }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h6" component="h1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {selectedCategoryData?.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {forms.length} form{forms.length !== 1 ? 's' : ''} available
              </Typography>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={48} thickness={4} />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {forms.map((form) => (
              <Grid item xs={12} sm={6} md={4} key={form.id}>
                <FormCard 
                  form={form} 
                  onSelect={onFormSelect}
                  categoryColor={selectedCategoryData?.color}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}

export default FormsList;
