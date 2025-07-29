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
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon, 
  Save as SaveIcon, 
  Send as SendIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

const cookingParamsRows = [
  'Soaking Chickpeas',
  '*Boiling of Chickpeas'
];
const cookingParamsCols = [
  { key: 'start_time', label: 'Start Time', type: 'time' },
  { key: 'end_time', label: 'End Time', type: 'time' },
  { key: 'temperature', label: 'Temperature', type: 'text' },
  { key: 'comments', label: 'Comments', type: 'text' },
  { key: 'initials', label: 'Initials', type: 'text' }
];
const storageRecordRows = [
  'Entered into Blast Chiller',
  'Removed from Blast Chiller and Before Mixing'
];
const storageRecordCols = [
  { key: 'date', label: 'Date', type: 'date' },
  { key: 'time', label: 'Time', type: 'time' },
  { key: 'temperature', label: 'Temperature', type: 'text' },
  { key: 'comments', label: 'Comments', type: 'text' },
  { key: 'initials', label: 'Initials', type: 'text' }
];

function ChickpeasBatchingProcess({ formTemplate, onBack, isEditing = false, onSave, originalForm, onSubmit }) {
  const [formData, setFormData] = useState({
    date: originalForm?.date || '',
    quantity_cooked: originalForm?.quantity_cooked || '',
    batched_by: originalForm?.batched_by || '',
    batch_name: originalForm?.batch_name || '',
    lot_cooked: originalForm?.lot_cooked || '',
    lot_raw: originalForm?.lot_raw || '',
    qc_ph: originalForm?.qc_ph || '',
    cooking_params: originalForm?.cooking_params || cookingParamsRows.map(() => ({ start_time: '', end_time: '', temperature: '', comments: '', initials: '' })),
    storage_record: originalForm?.storage_record || storageRecordRows.map(() => ({ date: '', time: '', temperature: '', comments: '', initials: '' }))
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTableChange = (table, rowIdx, key, value) => {
    setFormData(prev => ({
      ...prev,
      [table]: prev[table].map((row, idx) => idx === rowIdx ? { ...row, [key]: value } : row)
    }));
  };

  const handleSaveForLater = async () => {
    const user = auth.currentUser;
    const savedData = prepareFormDataForFirestore(
      {
        ...formData,
        formTitle: formTemplate?.title || 'F-10: Chickpeas Batching Process',
        formType: 'chickpeasBatchingProcess'
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
        formTitle: formTemplate?.title || 'F-10: Chickpeas Batching Process',
        formType: 'chickpeasBatchingProcess'
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
        'F-10: Chickpeas Batching Process',
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

  const renderTable = (rows, cols, tableName) => (
    <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)' }}>
            <TableCell sx={{ fontWeight: 600, minWidth: 200 }}>Process Step</TableCell>
            {cols.map((col) => (
              <TableCell key={col.key} sx={{ fontWeight: 600 }}>
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, rowIdx) => (
            <TableRow key={rowIdx} hover>
              <TableCell sx={{ fontWeight: 600, bgcolor: 'rgba(0, 0, 0, 0.02)' }}>
                {row}
              </TableCell>
              {cols.map((col) => (
                <TableCell key={col.key}>
                  <TextField
                    size="small"
                    type={col.type}
                    value={formData[tableName][rowIdx][col.key]}
                    onChange={(e) => handleTableChange(tableName, rowIdx, col.key, e.target.value)}
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
  );

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
                F-10: Chickpeas Batching Process
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
                        label="Batch Name"
                        name="batch_name"
                        value={formData.batch_name}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Batched By"
                        name="batched_by"
                        value={formData.batched_by}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Quantity Cooked"
                        name="quantity_cooked"
                        value={formData.quantity_cooked}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Lot Cooked"
                        name="lot_cooked"
                        value={formData.lot_cooked}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Lot Raw"
                        name="lot_raw"
                        value={formData.lot_raw}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="QC pH"
                        name="qc_ph"
                        value={formData.qc_ph}
                        onChange={handleInputChange}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Cooking Parameters */}
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
                        Cooking Parameters
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Record cooking process details and measurements
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Divider />
                <Box sx={{ p: 3 }}>
                  {renderTable(cookingParamsRows, cookingParamsCols, 'cooking_params')}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Storage Record */}
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
                      <CheckCircleIcon sx={{ color: 'white', fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" component="h2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        Storage Record
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Track storage and temperature conditions
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Divider />
                <Box sx={{ p: 3 }}>
                  {renderTable(storageRecordRows, storageRecordCols, 'storage_record')}
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

export default ChickpeasBatchingProcess; 