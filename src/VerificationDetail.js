import React, { useRef, useState } from 'react';
import { db, doc, updateDoc, deleteDoc, auth } from './firebase';
import { logAuditTrail, AUDIT_ACTIONS } from './utils/auditTrail';
import AuditTrailViewer from './components/AuditTrailViewer';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';

function VerificationDetail({ form, onBack }) {
    const pdfRef = useRef();
    const [showAuditTrail, setShowAuditTrail] = useState(false);
    const [rejectionDialog, setRejectionDialog] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const managerName = auth.currentUser?.displayName || auth.currentUser?.email || "Manager";

    const handleApprove = async () => {
        if (!window.confirm("Are you sure you want to approve this form?")) return;
        const formRef = doc(db, "completedForms", form.id);
        try {
            await updateDoc(formRef, { status: "Approved", verifiedBy: managerName, verifiedAt: new Date() });
            
            // Log audit trail
            await logAuditTrail(
                managerName,
                AUDIT_ACTIONS.APPROVE,
                form.formTitle || 'Unknown Form',
                form.id,
                {
                    recipeName: form.recipeName,
                    batchNumber: form.batchNumber,
                    batchDate: form.batchDate,
                    verifiedBy: managerName
                }
            );
            
            setSnackbar({ open: true, message: 'Form approved successfully!', severity: 'success' });
            setTimeout(() => onBack(), 1500);
        } catch (error) {
            console.error("Error approving form: ", error);
            setSnackbar({ open: true, message: 'Failed to approve form.', severity: 'error' });
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            setSnackbar({ open: true, message: 'Please provide a reason for rejection.', severity: 'warning' });
            return;
        }
        
        const formRef = doc(db, "completedForms", form.id);
        try {
            await updateDoc(formRef, { 
                status: "Rejected", 
                rejectionReason: rejectionReason, 
                rejectedBy: managerName, 
                rejectedAt: new Date() 
            });
            
            // Log audit trail
            await logAuditTrail(
                managerName,
                AUDIT_ACTIONS.REJECT,
                form.formTitle || 'Unknown Form',
                form.id,
                {
                    recipeName: form.recipeName,
                    batchNumber: form.batchNumber,
                    batchDate: form.batchDate,
                    rejectedBy: managerName,
                    rejectionReason: rejectionReason
                }
            );
            
            setSnackbar({ open: true, message: 'Form rejected and sent back for corrective action.', severity: 'success' });
            setRejectionDialog(false);
            setRejectionReason('');
            setTimeout(() => onBack(), 1500);
        } catch (error) {
            console.error("Error rejecting form: ", error);
            setSnackbar({ open: true, message: 'Failed to reject form.', severity: 'error' });
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this form? This action cannot be undone.")) return;
        const formRef = doc(db, "completedForms", form.id);
        try {
            await deleteDoc(formRef);
            
            // Log audit trail
            await logAuditTrail(
                managerName,
                AUDIT_ACTIONS.DELETE,
                form.formTitle || 'Unknown Form',
                form.id,
                {
                    recipeName: form.recipeName,
                    batchNumber: form.batchNumber,
                    batchDate: form.batchDate,
                    deletedBy: managerName
                }
            );
            
            setSnackbar({ open: true, message: 'Form deleted successfully!', severity: 'success' });
            setTimeout(() => onBack(), 1500);
        } catch (error) {
            console.error("Error deleting form: ", error);
            setSnackbar({ open: true, message: 'Failed to delete form.', severity: 'error' });
        }
    };

    const handleDownloadPDF = () => {
        if (!pdfRef.current) return;
        
        html2canvas(pdfRef.current).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF();
            const imgWidth = 210;
            const pageHeight = 295;
            const imgHeight = canvas.height * imgWidth / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
            pdf.save(`${form.formTitle || 'form'}.pdf`);
        });
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
                                bgcolor: 'warning.main',
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
                                Form Verification
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                {form.formTitle || "F-06: Dynamic Yogurt Batch Sheet"}
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="outlined"
                            startIcon={<VisibilityIcon />}
                            onClick={() => setShowAuditTrail(true)}
                            sx={{
                                borderRadius: 3,
                                px: 3,
                                fontWeight: 600,
                            }}
                        >
                            Audit Trail
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={handleDownloadPDF}
                            sx={{
                                borderRadius: 3,
                                px: 3,
                                fontWeight: 600,
                            }}
                        >
                            Download PDF
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ py: 3 }}>
                <Grid container spacing={3}>
                    {/* Form Status */}
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
                                                Current status and submission details
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
                                                    color={form.status === 'Approved' ? 'success' : form.status === 'Rejected' ? 'error' : 'warning'} 
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
                                    </Grid>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Action Buttons */}
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
                                            <WarningIcon sx={{ color: 'white', fontSize: 20 }} />
                                        </Box>
                                        <Box>
                                            <Typography variant="h6" component="h2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                                Verification Actions
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Approve, reject, or delete this form
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                                <Divider />
                                <Box sx={{ p: 3 }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={4}>
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                color="success"
                                                onClick={handleApprove}
                                                sx={{
                                                    borderRadius: 3,
                                                    py: 1.5,
                                                    fontWeight: 600,
                                                }}
                                            >
                                                Approve Form
                                            </Button>
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                color="error"
                                                onClick={() => setRejectionDialog(true)}
                                                sx={{
                                                    borderRadius: 3,
                                                    py: 1.5,
                                                    fontWeight: 600,
                                                }}
                                            >
                                                Reject Form
                                            </Button>
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <Button
                                                fullWidth
                                                variant="outlined"
                                                color="error"
                                                onClick={handleDelete}
                                                sx={{
                                                    borderRadius: 3,
                                                    py: 1.5,
                                                    fontWeight: 600,
                                                }}
                                            >
                                                Delete Form
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>

            {/* Rejection Dialog */}
            <Dialog open={rejectionDialog} onClose={() => setRejectionDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>
                    Reject Form
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Please provide a reason for rejecting this form. This will be sent back to the employee for corrective action.
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Rejection Reason"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Enter the reason for rejection..."
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button 
                        onClick={() => setRejectionDialog(false)}
                        sx={{ borderRadius: 3, px: 3, fontWeight: 600 }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleReject}
                        variant="contained"
                        color="error"
                        sx={{ borderRadius: 3, px: 3, fontWeight: 600 }}
                    >
                        Reject Form
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Audit Trail Dialog */}
            <Dialog 
                open={showAuditTrail} 
                onClose={() => setShowAuditTrail(false)} 
                maxWidth="md" 
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 700 }}>
                    Audit Trail
                </DialogTitle>
                <DialogContent>
                    <AuditTrailViewer formId={form.id} />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button 
                        onClick={() => setShowAuditTrail(false)}
                        sx={{ borderRadius: 3, px: 3, fontWeight: 600 }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

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

export default VerificationDetail;