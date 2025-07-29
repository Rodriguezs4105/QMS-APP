import React from 'react';
import { Box, Typography, Card, CardContent, Chip } from '@mui/material';
import { Description as DescriptionIcon, Assignment as AssignmentIcon } from '@mui/icons-material';

const FormCard = ({ form, onSelect, categoryColor = '#007AFF' }) => {
  const getFormIcon = (formType) => {
    switch (formType) {
      case 'batchSheet':
        return <AssignmentIcon />;
      default:
        return <DescriptionIcon />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'draft':
        return 'warning';
      case 'archived':
        return 'default';
      default:
        return 'success';
    }
  };

  return (
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
        border: '1px solid rgba(0, 0, 0, 0.04)',
      }}
      onClick={() => onSelect(form)}
    >
      <Box
        sx={{
          height: 80,
          background: `linear-gradient(135deg, ${categoryColor} 0%, ${categoryColor}80 100%)`,
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
              {getFormIcon(form.formType)}
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
                {form.id}
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
          {form.title}
        </Typography>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 2,
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {form.description}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip 
            label={form.status || 'Active'} 
            size="small" 
            color={getStatusColor(form.status)}
            sx={{ 
              height: 20, 
              fontSize: '0.7rem',
              fontWeight: 600,
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
            Ready to use
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default FormCard;
