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

const monitoringParameters = [
  'Temperature',
  'Pressure',
  'Flow Rate',
  'pH Level',
  'Viscosity',
  'Operator',
  'Notes'
];

function YogurtPasteurizationMonitoring({ formTemplate, onBack, isEditing = false, onSave, originalForm, onSubmit }) {
  const [formData, setFormData] = useState({
    date: originalForm?.date || '',
    batchNumber: originalForm?.batchNumber || '',
    productType: originalForm?.productType || '',
    lotNumber: originalForm?.lotNumber || '',
    monitoringData: originalForm?.monitoringData || monitoringParameters.map(() => ({
      time: '',
      value: '',
      unit: '',
      operator: '',
      notes: ''
    })),
    qualityChecks: originalForm?.qualityChecks || {
      temperatureCheck: false,
      pressureCheck: false,
      flowRateCheck: false,
      phCheck: false,
      viscosityCheck: false,
      visualCheck: false
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

  const handleMonitoringChange = (paramIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      monitoringData: prev.monitoringData.map((param, idx) => 
        idx === paramIndex ? { ...param, [field]: value } : param
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
        formTitle: formTemplate?.title || 'F-14: Yogurt Pasteurization Monitoring',
        formType: 'yogurtPasteurizationMonitoring'
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
        formTitle: formTemplate?.title || 'F-14: Yogurt Pasteurization Monitoring',
        formType: 'yogurtPasteurizationMonitoring'
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
        'F-14: Yogurt Pasteurization Monitoring',
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
                F-14: Yogurt Pasteurization Monitoring
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {isEditing ? 'Editing form' : 'Create new monitoring record'}
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

          {/* Monitoring Data */}
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
                        Monitoring Data
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Record pasteurization parameters and measurements
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
                          <TableCell sx={{ fontWeight: 600, minWidth: 150 }}>Parameter</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Time</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Value</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Unit</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Operator</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Notes</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {monitoringParameters.map((param, paramIndex) => (
                          <TableRow key={param} hover>
                            <TableCell sx={{ fontWeight: 600, bgcolor: 'rgba(0, 0, 0, 0.02)' }}>
                              {param}
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                type="time"
                                value={formData.monitoringData[paramIndex].time}
                                onChange={(e) => handleMonitoringChange(paramIndex, 'time', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                sx={{ minWidth: 120 }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                value={formData.monitoringData[paramIndex].value}
                                onChange={(e) => handleMonitoringChange(paramIndex, 'value', e.target.value)}
                                sx={{ minWidth: 100 }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                value={formData.monitoringData[paramIndex].unit}
                                onChange={(e) => handleMonitoringChange(paramIndex, 'unit', e.target.value)}
                                placeholder={param === 'Temperature' ? '°C' : param === 'Pressure' ? 'bar' : ''}
                                sx={{ minWidth: 80 }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                value={formData.monitoringData[paramIndex].operator}
                                onChange={(e) => handleMonitoringChange(paramIndex, 'operator', e.target.value)}
                                sx={{ minWidth: 120 }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                value={formData.monitoringData[paramIndex].notes}
                                onChange={(e) => handleMonitoringChange(paramIndex, 'notes', e.target.value)}
                                sx={{ minWidth: 150 }}
                              />
                            </TableCell>
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
                            checked={formData.qualityChecks.temperatureCheck}
                            onChange={(e) => handleQualityCheckChange('temperatureCheck', e.target.checked)}
                          />
                        }
                        label="Temperature Check Completed"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.qualityChecks.pressureCheck}
                            onChange={(e) => handleQualityCheckChange('pressureCheck', e.target.checked)}
                          />
                        }
                        label="Pressure Check Completed"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.qualityChecks.flowRateCheck}
                            onChange={(e) => handleQualityCheckChange('flowRateCheck', e.target.checked)}
                          />
                        }
                        label="Flow Rate Check Completed"
                      />
                    </Grid>
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
                            checked={formData.qualityChecks.visualCheck}
                            onChange={(e) => handleQualityCheckChange('visualCheck', e.target.checked)}
                          />
                        }
                        label="Visual Check Completed"
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

export default YogurtPasteurizationMonitoring; 