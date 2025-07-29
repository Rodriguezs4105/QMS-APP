import React, { useState } from 'react';
import { db, auth, doc, setDoc, collection, addDoc } from './firebase';
import { prepareFormDataForFirestore } from './utils/formSubmission';
import { logAuditTrail, AUDIT_ACTIONS } from './utils/auditTrail';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  Divider,
  Alert,
  Snackbar,
  Container,
  Avatar,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon, 
  Save as SaveIcon, 
  Send as SendIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

const processSteps = [
  'Milk Receiving',
  'Pasteurization',
  'Cooling',
  'Culturing',
  'Packaging'
];

const processColumns = [
  { key: 'start_time', label: 'Start Time', type: 'time' },
  { key: 'end_time', label: 'End Time', type: 'time' },
  { key: 'temperature', label: 'Temperature (°C)', type: 'text' },
  { key: 'pressure', label: 'Pressure (bar)', type: 'text' },
  { key: 'operator', label: 'Operator', type: 'text' },
  { key: 'notes', label: 'Notes', type: 'text' }
];

function YogurtBatchingProcess({ formTemplate, onBack, isEditing = false, onSave, originalForm, onSubmit }) {
  const [formData, setFormData] = useState({
    date: originalForm?.date || '',
    batchNumber: originalForm?.batchNumber || '',
    batchSize: originalForm?.batchSize || '',
    productType: originalForm?.productType || '',
    lotNumber: originalForm?.lotNumber || '',
    processSteps: originalForm?.processSteps || processSteps.map(() => ({
      start_time: '',
      end_time: '',
      temperature: '',
      pressure: '',
      operator: '',
      notes: ''
    })),
    qualityChecks: originalForm?.qualityChecks || {
      phCheck: false,
      viscosityCheck: false,
      tasteCheck: false,
      visualCheck: false,
      temperatureCheck: false
    },
    finalYield: originalForm?.finalYield || '',
    operator: originalForm?.operator || ''
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleProcessStepChange = (stepIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      processSteps: prev.processSteps.map((step, idx) => 
        idx === stepIndex ? { ...step, [field]: value } : step
      )
    }));
  };

  const handleQualityCheckChange = (checkName, value) => {
    setFormData(prev => ({
      ...prev,
      qualityChecks: {
        ...prev.qualityChecks,
        [checkName]: value
      }
    }));
  };

  const handleSaveForLater = async () => {
    const user = auth.currentUser;
    const savedData = prepareFormDataForFirestore(
      {
        ...formData,
        formTitle: formTemplate?.title || 'F-12: Yogurt Batching Process',
        formType: 'yogurtBatchingProcess'
      },
      {
        savedBy: user?.email || 'Unknown User',
        status: "Saved for Later",
        isSavedForm: true
      }
    );

    try {
      const docRef = await addDoc(collection(db, "savedForms"), savedData);
      setSnackbar({ open: true, message: "Form saved successfully!", severity: 'success' });
      if (onSave) onSave(docRef.id);
    } catch (error) {
      console.error("Error saving form:", error);
      setSnackbar({ open: true, message: "Failed to save form.", severity: 'error' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    
    const formDataToSubmit = prepareFormDataForFirestore(
      {
        ...formData,
        formTitle: formTemplate?.title || 'F-12: Yogurt Batching Process',
        formType: 'yogurtBatchingProcess'
      },
      {
        submittedBy: user?.email || 'Unknown User',
        status: "Pending Review",
        isCompletedForm: true
      }
    );

    try {
      const docRef = await addDoc(collection(db, "completedForms"), formDataToSubmit);
      
      // Log audit trail
      await logAuditTrail(
        user?.email || 'Unknown User',
        AUDIT_ACTIONS.SUBMIT,
        'F-12: Yogurt Batching Process',
        docRef.id,
        formData
      );

      setSnackbar({ open: true, message: "Form submitted successfully!", severity: 'success' });
      if (onSubmit) onSubmit();
    } catch (error) {
      console.error("Error submitting form:", error);
      setSnackbar({ open: true, message: "Failed to submit form.", severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
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
                bgcolor: 'primary.main',
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
                F-12: Yogurt Batching Process
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {isEditing ? 'Editing form' : 'Create new batch process'}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<SaveIcon />}
              onClick={handleSaveForLater}
              sx={{
                borderRadius: 3,
                px: 3,
                fontWeight: 600,
              }}
            >
              Save
            </Button>
            <Button
              variant="contained"
              startIcon={<SendIcon />}
              onClick={handleSubmit}
              sx={{
                borderRadius: 3,
                px: 3,
                fontWeight: 600,
              }}
            >
              Submit
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Grid container spacing={3}>
          {/* Basic Information */}
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
                        Basic Information
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Enter batch details and specifications
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Divider />
                <Box sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Date"
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Batch Number"
                        name="batchNumber"
                        value={formData.batchNumber}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Batch Size"
                        name="batchSize"
                        value={formData.batchSize}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Product Type"
                        name="productType"
                        value={formData.productType}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Lot Number"
                        name="lotNumber"
                        value={formData.lotNumber}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Operator"
                        name="operator"
                        value={formData.operator}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Final Yield"
                        name="finalYield"
                        value={formData.finalYield}
                        onChange={handleInputChange}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Process Steps */}
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
                        bgcolor: 'secondary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <CheckCircleIcon sx={{ color: 'white', fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" component="h2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        Process Steps
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Record process parameters for each step
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Divider />
                <Box sx={{ p: 3 }}>
                  <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)' }}>
                          <TableCell sx={{ fontWeight: 600, minWidth: 150 }}>Process Step</TableCell>
                          {processColumns.map((col) => (
                            <TableCell key={col.key} sx={{ fontWeight: 600 }}>
                              {col.label}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {processSteps.map((step, stepIndex) => (
                          <TableRow key={step} hover>
                            <TableCell sx={{ fontWeight: 600, bgcolor: 'rgba(0, 0, 0, 0.02)' }}>
                              {step}
                            </TableCell>
                            {processColumns.map((col) => (
                              <TableCell key={col.key}>
                                <TextField
                                  size="small"
                                  type={col.type}
                                  value={formData.processSteps[stepIndex][col.key]}
                                  onChange={(e) => handleProcessStepChange(stepIndex, col.key, e.target.value)}
                                  InputLabelProps={col.type === 'date' ? { shrink: true } : {}}
                                  sx={{ minWidth: 120 }}
                                />
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Quality Checks */}
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
                        Quality Checks
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Complete all required quality checks
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Divider />
                <Box sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.qualityChecks.phCheck}
                            onChange={(e) => handleQualityCheckChange('phCheck', e.target.checked)}
                          />
                        }
                        label="pH Check Completed"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.qualityChecks.viscosityCheck}
                            onChange={(e) => handleQualityCheckChange('viscosityCheck', e.target.checked)}
                          />
                        }
                        label="Viscosity Check Completed"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.qualityChecks.tasteCheck}
                            onChange={(e) => handleQualityCheckChange('tasteCheck', e.target.checked)}
                          />
                        }
                        label="Taste Check Completed"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.qualityChecks.visualCheck}
                            onChange={(e) => handleQualityCheckChange('visualCheck', e.target.checked)}
                          />
                        }
                        label="Visual Check Completed"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.qualityChecks.temperatureCheck}
                            onChange={(e) => handleQualityCheckChange('temperatureCheck', e.target.checked)}
                          />
                        }
                        label="Temperature Check Completed"
                      />
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>
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

export default YogurtBatchingProcess; 