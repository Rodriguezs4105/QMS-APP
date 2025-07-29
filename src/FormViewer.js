import React, { useState } from 'react';
import { db, doc, deleteDoc } from './firebase';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  Container,
  Divider,
  Alert,
  Snackbar,
  Avatar,
  Chip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

function FormViewer({ form, onBack, onDelete }) {
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this archived form? This action cannot be undone.')) {
            try {
                await deleteDoc(doc(db, "completedForms", form.id));
                setSnackbar({ open: true, message: 'Form deleted successfully!', severity: 'success' });
                setTimeout(() => {
                    onDelete && onDelete();
                    onBack();
                }, 1500);
            } catch (error) {
                console.error("Error deleting form: ", error);
                setSnackbar({ open: true, message: 'Error deleting form. Please try again.', severity: 'error' });
            }
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        if (date.toDate) {
            return date.toDate().toLocaleString();
        }
        return date;
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
                        <IconButton 
                            onClick={onBack}
                            sx={{ 
                                color: 'text.secondary',
                                '&:hover': {
                                    bgcolor: 'rgba(0, 0, 0, 0.04)',
                                }
                            }}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        <Avatar 
                            sx={{ 
                                bgcolor: 'success.main',
                                width: 40,
                                height: 40,
                                fontSize: '1.2rem',
                                fontWeight: 600,
                            }}
                        >
                            <AssignmentIcon />
                        </Avatar>
                        <Box>
                            <Typography variant="h6" component="h1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                Archived Form
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                {form.formTitle || "F-06: Dynamic Yogurt Batch Sheet"}
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton 
                        onClick={handleDelete}
                        sx={{ 
                            color: 'error.main',
                            '&:hover': {
                                bgcolor: 'error.main',
                                color: 'white',
                            }
                        }}
                    >
                        <DeleteIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ py: 3 }}>
                <Grid container spacing={3}>
                    {/* Form Header Info */}
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
                                                bgcolor: 'primary.main',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <CheckCircleIcon sx={{ color: 'white', fontSize: 20 }} />
                                        </Box>
                                        <Box>
                                            <Typography variant="h6" component="h2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                                Form Status
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {form.formTitle || "F-06: Dynamic Yogurt Batch Sheet"}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                                <Divider />
                                <Box sx={{ p: 3 }}>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} sm={4}>
                                            <Box>
                                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                                    Status
                                                </Typography>
                                                <Chip 
                                                    label={form.status} 
                                                    color="success" 
                                                    size="small"
                                                    sx={{ mt: 1 }}
                                                />
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <Box>
                                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                                    Submitted by
                                                </Typography>
                                                <Typography variant="body1" sx={{ mt: 1 }}>
                                                    {form.submittedBy || form.batchBy || 'N/A'}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <Box>
                                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                                    Submitted at
                                                </Typography>
                                                <Typography variant="body1" sx={{ mt: 1 }}>
                                                    {formatDate(form.submittedAt)}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Form Information */}
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
                                            <InfoIcon sx={{ color: 'white', fontSize: 20 }} />
                                        </Box>
                                        <Box>
                                            <Typography variant="h6" component="h2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                                Form Information
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Batch details and specifications
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                                <Divider />
                                <Box sx={{ p: 3 }}>
                                    <Grid container spacing={3}>
                                        {form.recipeName && (
                                            <Grid item xs={12} sm={6}>
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                                        Recipe
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ mt: 1 }}>
                                                        {form.recipeName}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        )}
                                        {form.batchDate && (
                                            <Grid item xs={12} sm={6}>
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                                        Batch Date
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ mt: 1 }}>
                                                        {form.batchDate}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        )}
                                        {form.batchBy && (
                                            <Grid item xs={12} sm={6}>
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                                        Batch By
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ mt: 1 }}>
                                                        {form.batchBy}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        )}
                                        {form.batchNumber && (
                                            <Grid item xs={12} sm={6}>
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                                        Batch Number
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ mt: 1 }}>
                                                        {form.batchNumber}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        )}
                                        {form.date && (
                                            <Grid item xs={12} sm={6}>
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                                        Date
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ mt: 1 }}>
                                                        {form.date}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        )}
                                        {form.batchSize && (
                                            <Grid item xs={12} sm={6}>
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                                        Batch Size
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ mt: 1 }}>
                                                        {form.batchSize}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        )}
                                        {form.batchRecipe && (
                                            <Grid item xs={12}>
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                                        Batch Recipe
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ mt: 1 }}>
                                                        {form.batchRecipe}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        )}
                                        {form.lotNumbers && form.lotNumbers.length > 0 && (
                                            <Grid item xs={12}>
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                                                        Lot Numbers
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                        {form.lotNumbers.map((lot, index) => (
                                                            <Chip 
                                                                key={index}
                                                                label={lot} 
                                                                variant="outlined" 
                                                                size="small"
                                                            />
                                                        ))}
                                                    </Box>
                                                </Box>
                                            </Grid>
                                        )}
                                    </Grid>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Calculated Values */}
                    {form.calculatedValues && (
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
                                                    bgcolor: 'success.main',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <CheckCircleIcon sx={{ color: 'white', fontSize: 20 }} />
                                            </Box>
                                            <Box>
                                                <Typography variant="h6" component="h2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                                    Calculated Values
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Automatically calculated parameters
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                    <Divider />
                                    <Box sx={{ p: 3 }}>
                                        <Grid container spacing={3}>
                                            {form.calculatedValues.shelfLife && (
                                                <Grid item xs={12} sm={6}>
                                                    <Box>
                                                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                                            Shelf Life
                                                        </Typography>
                                                        <Typography variant="body1" sx={{ mt: 1 }}>
                                                            {form.calculatedValues.shelfLife}
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                            )}
                                            {form.calculatedValues.expiryDate && (
                                                <Grid item xs={12} sm={6}>
                                                    <Box>
                                                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                                            Expiry Date
                                                        </Typography>
                                                        <Typography variant="body1" sx={{ mt: 1 }}>
                                                            {form.calculatedValues.expiryDate}
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                            )}
                                            {form.calculatedValues.lotNumber && (
                                                <Grid item xs={12} sm={6}>
                                                    <Box>
                                                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                                            Lot Number
                                                        </Typography>
                                                        <Typography variant="body1" sx={{ mt: 1 }}>
                                                            {form.calculatedValues.lotNumber}
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                            )}
                                            {form.calculatedValues.theoreticalYield && (
                                                <Grid item xs={12} sm={6}>
                                                    <Box>
                                                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                                            Theoretical Yield
                                                        </Typography>
                                                        <Typography variant="body1" sx={{ mt: 1 }}>
                                                            {form.calculatedValues.theoreticalYield}
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                            )}
                                        </Grid>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    )}

                    {/* Additional form data sections would go here */}
                    {/* This is a simplified version - you can add more sections as needed */}
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

export default FormViewer; 