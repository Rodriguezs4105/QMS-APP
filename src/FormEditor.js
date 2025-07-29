import React, { useState, useEffect } from 'react';
import { db, doc, updateDoc, serverTimestamp, auth } from './firebase';
import BatchSheet from './BatchSheet';
import {
  Box,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Container,
  Alert,
  Snackbar,
  Avatar,
  Chip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

function FormEditor({ form, onBack }) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        // Prepare the form data for editing
        if (form) {
            setFormData({
                ...form,
                // Reset status and remove rejection info
                status: "Pending Review",
                rejectionReason: null,
                rejectedBy: null,
                rejectedAt: null,
                // Update submission info
                submittedAt: serverTimestamp(),
                resubmittedBy: auth.currentUser?.email || 'Unknown User',
                resubmittedAt: serverTimestamp()
            });
        }
    }, [form]);

    const handleSave = async (updatedFormData) => {
        try {
            const formRef = doc(db, "completedForms", form.id);
            await updateDoc(formRef, {
                ...updatedFormData,
                status: "Pending Review",
                rejectionReason: null,
                rejectedBy: null,
                rejectedAt: null,
                resubmittedBy: auth.currentUser?.email || 'Unknown User',
                resubmittedAt: serverTimestamp()
            });
            setSnackbar({ open: true, message: 'Form updated and resubmitted for review!', severity: 'success' });
            setTimeout(() => onBack(), 1500);
        } catch (error) {
            console.error("Error updating form: ", error);
            setSnackbar({ open: true, message: 'Error updating form. Please try again.', severity: 'error' });
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    if (!formData) {
        return (
            <Box sx={{ 
                minHeight: '100vh', 
                background: 'linear-gradient(135deg, #F2F2F7 0%, #FFFFFF 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Typography variant="h6" color="text.secondary">
                    Loading form data...
                </Typography>
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
                                bgcolor: 'warning.main',
                                width: 40,
                                height: 40,
                                fontSize: '1.2rem',
                                fontWeight: 600,
                            }}
                        >
                            <EditIcon />
                        </Avatar>
                        <Box>
                            <Typography variant="h6" component="h1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                Edit Rejected Form
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                {form.formTitle || "F-06: Dynamic Yogurt Batch Sheet"}
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip 
                            label="Rejected" 
                            color="error" 
                            size="small"
                            icon={<WarningIcon />}
                        />
                    </Box>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ py: 3 }}>
                <Box sx={{ mb: 3 }}>
                    <Alert 
                        severity="warning" 
                        sx={{ 
                            borderRadius: 3,
                            fontWeight: 600,
                        }}
                    >
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                            Rejection Details:
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Reason:</strong> {form.rejectionReason}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Rejected by:</strong> {form.rejectedBy}
                        </Typography>
                    </Alert>
                </Box>
            </Container>
            
            <BatchSheet 
                formTemplate={formData} 
                onBack={onBack}
                isEditing={true}
                onSave={handleSave}
                originalForm={form}
            />

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

export default FormEditor; 