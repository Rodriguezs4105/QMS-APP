import React, { useState, useEffect } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  FormControlLabel,
  Checkbox,
  Chip,
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

const hummusRecipeData = {
    "Original Hummus": { baseIngredient: 'Chickpeas (Boiled)', ingredients: { 'Chickpeas (Boiled)': '193.62 kg', 'Ice': '47.60 kg', 'Tahini': '77.27 kg', 'Sugar': '4.40 kg', 'Salt': '4.40 kg', 'Garlic Flakes': '2.80 kg', 'White pepper': '0.64 kg', 'Citric acid': '2.80 kg', 'Sunflower Oil': '66.00 kg' } },
    "Roasted Pepper Hummus": { baseIngredient: 'Chickpeas (Boiled)', ingredients: { 'Chickpeas (Boiled)': '173.47 kg', 'Ice': '30.99 kg', 'Tahini': '69.38 kg', 'White Sugar': '3.92 kg', 'Florina Pepper (Paste)': '26.71 kg', 'Florina Pepper (Strips)': '26.71 kg', 'Salt': '3.92 kg', 'Garlic Flakes': '2.52 kg', 'White Pepper': '0.56 kg', 'Citric acid': '2.32 kg', 'Sunflower Oil': '59.18 kg' } },
    "Caramelized Onion Hummus": { baseIngredient: 'Chickpeas (Boiled)', ingredients: { 'Boiled Chick peas': '155.00 kg', 'Ice': '38.30 kg', 'Tahini': '62.00 kg', 'Sugar': '3.51 kg', 'Salt': '3.53 kg', 'Garlic Flakes': '2.24 kg', 'White pepper': '0.51 kg', 'Citric acid': '2.08 kg', 'Caramelized Onions': '80.00 kg', 'Sunflower Oil': '53.00 kg' } },
    "Lemon Hummus": { baseIngredient: 'Chickpeas (Boiled)', ingredients: { 'Chickpeas (Boiled)': '193.62 kg', 'Ice': '47.60 kg', 'Tahini': '77.27 kg', 'Sugar': '4.40 kg', 'Salt': '4.40 kg', 'Garlic Flakes': '2.80 kg', 'White pepper': '0.64 kg', 'Citric acid': '2.80 kg', 'Sunflower Oil': '66.00 kg', 'Lemon': '1.13 kg' } },
    "Roasted Garlic Hummus": { baseIngredient: 'Chickpeas (Boiled)', ingredients: { 'Chickpeas (Boiled)': '193.00 kg', 'Ice': '47.00 kg', 'Tahini': '76.00 kg', 'Sugar': '4.32 kg', 'Salt': '4.32 kg', 'Garlic Grain': '4.02 kg', 'Garlic Flakes': '7.82 kg', 'Pepper': '0.63 kg', 'Citric acid': '2.55 kg', 'Sunflower Oil': '64.50 kg' } },
    "Kalamata Olive Hummus": { baseIngredient: 'Chickpeas (Boiled)', ingredients: { 'Boiled Chick peas': '193.56 kg', 'Ice': '47.50 kg', 'Tahini': '77.19 kg', 'Sugar': '4.39 kg', 'Salt': '4.39 kg', 'Garlic Flakes': '2.79 kg', 'White pepper': '0.64 kg', 'Citric acid': '2.60 kg', 'Kalamata Paste': '30.02 kg', 'Kalamata Pieces': '40.00 kg', 'Sunflower Oil': '65.97 kg' } },
    "Tzatziki": { baseIngredient: 'Greek Yogurt', ingredients: { 'Greek Yogurt': '341 kg', 'Cucumber': '42 kg', 'Sunflower oil': '11.20 kg', 'Parsley': '0.10 kg', 'Garlic powder': '1.39 kg', 'Sea Salt': '2.99 kg', 'Dill dehydrated': '0.10 kg', 'E 42': '0.35 kg', '*Xanthangum': '0.35 kg' } }
};
const ingredientCodes = { 'Chickpeas (Boiled)': '6064 / 6079', 'Boiled Chick peas': '6064 / 6079', 'Greek Yogurt': 'N/A', 'Cucumber': '1074', 'Tahini': '6075', 'Florina Pepper (Paste)': '6074', 'Kalamata Paste': '1075', 'Caramelized Onions': '1075', 'Sunflower Oil': '6065 / 6072 / 6073', 'Salt': '6034 / 6069', 'Sea Salt': '6034 / 6069', 'White Sugar': '6070', 'Sugar': '6070', 'Garlic Flakes': '1059', 'White pepper': '6068', 'Citric acid': '6035 / 6045.1', 'Parsley': '6607', 'Dill dehydrated': 'N/A', 'Garlic Grain': 'N/A', 'Pepper': 'N/A', 'Florina Pepper (Strips)': '6074', 'Lemon': '6076', 'Kalamata Pieces': 'N/A', 'E 42': '6606', '*Xanthangum': '6602', 'Ice': 'N/A' };

function DipsBatchSheet({ formTemplate, onBack, isEditing = false, onSave, originalForm, onSubmit }) {
    const [recipeName, setRecipeName] = useState(originalForm?.recipeName || '');
    const [formData, setFormData] = useState({
        date: originalForm?.date || '',
        batchBy: originalForm?.batchBy || '',
        batchNumber: originalForm?.batchNumber || '',
        lotNumber: originalForm?.lotNumber || '',
        actualYield: originalForm?.actualYield || '',
        phValue: originalForm?.phValue || '',
        cipFlush: originalForm?.cipFlush || false,
        visualCheck: originalForm?.visualCheck || false,
        changeover: originalForm?.changeover || false,
        scaleTested: originalForm?.scaleTested || false,
        mixerChecked: originalForm?.mixerChecked || false,
        specMet: originalForm?.specMet || false,
        calibNeeded: originalForm?.calibNeeded || false
    });
    const [ingredientLots, setIngredientLots] = useState(originalForm?.ingredientLots || {});
    const [calculatedValues, setCalculatedValues] = useState(originalForm?.calculatedValues || {
        theoreticalYield: '',
    });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        // Update lot number when date or batch number changes
        const { date, batchNumber } = formData;
        if (date && batchNumber) {
            const d = new Date(date + 'T00:00:00');
            const month = (d.getMonth() + 1).toString().padStart(2, '0');
            const day = d.getDate().toString().padStart(2, '0');
            const year = d.getFullYear().toString().slice(-2);
            const batch = batchNumber.toString().padStart(2, '0');
            setFormData(f => ({ ...f, lotNumber: `${batch}${month}${day}${year}` }));
        } else {
            setFormData(f => ({ ...f, lotNumber: '' }));
        }
    }, [formData.date, formData.batchNumber]);

    useEffect(() => {
        // Calculate theoretical yield
        const recipe = hummusRecipeData[recipeName];
        if (recipe) {
            const totalYield = Object.values(recipe.ingredients).reduce((sum, amount) => {
                const numValue = parseFloat(amount.replace(' kg', ''));
                return sum + (isNaN(numValue) ? 0 : numValue);
            }, 0);
            setCalculatedValues({ theoreticalYield: totalYield.toFixed(2) + ' kg' });
        } else {
            setCalculatedValues({ theoreticalYield: '' });
        }
    }, [recipeName]);

    const handleRecipeChange = (e) => {
        setRecipeName(e.target.value);
        setIngredientLots({});
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleLotChange = (ingredient, value) => {
        setIngredientLots(prev => ({
            ...prev,
            [ingredient]: value
        }));
    };

    const handleSaveForLater = async () => {
        const user = auth.currentUser;
        const savedData = prepareFormDataForFirestore(
            {
                ...formData,
                recipeName,
                ingredientLots,
                calculatedValues,
                formTitle: formTemplate?.title || 'F-11: Dips Batch Sheet',
                formType: 'dipsBatchSheet'
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
                recipeName,
                ingredientLots,
                calculatedValues,
                formTitle: formTemplate?.title || 'F-11: Dips Batch Sheet',
                formType: 'dipsBatchSheet'
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
                'F-11: Dips Batch Sheet',
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
                                F-11: Dips Batch Sheet
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                {isEditing ? 'Editing form' : 'Create new batch sheet'}
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
                    {/* Recipe Selection */}
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
                                                Recipe Selection
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Choose the dip recipe for this batch
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                                <Divider />
                                <Box sx={{ p: 3 }}>
                                    <FormControl fullWidth>
                                        <InputLabel>Select Recipe</InputLabel>
                                        <Select
                                            value={recipeName}
                                            onChange={handleRecipeChange}
                                            label="Select Recipe"
                                        >
                                            {Object.keys(hummusRecipeData).map((recipe) => (
                                                <MenuItem key={recipe} value={recipe}>
                                                    {recipe}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

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
                                                label="Batch By"
                                                name="batchBy"
                                                value={formData.batchBy}
                                                onChange={handleInputChange}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Lot Number"
                                                name="lotNumber"
                                                value={formData.lotNumber}
                                                InputProps={{ readOnly: true }}
                                                sx={{ '& .MuiInputBase-input': { bgcolor: 'rgba(0, 0, 0, 0.04)' } }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Actual Yield"
                                                name="actualYield"
                                                value={formData.actualYield}
                                                onChange={handleInputChange}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="pH Value"
                                                name="phValue"
                                                value={formData.phValue}
                                                onChange={handleInputChange}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Theoretical Yield"
                                                value={calculatedValues.theoreticalYield}
                                                InputProps={{ readOnly: true }}
                                                sx={{ '& .MuiInputBase-input': { bgcolor: 'rgba(0, 0, 0, 0.04)' } }}
                                            />
                                        </Grid>
                                    </Grid>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Ingredients Table */}
                    {recipeName && (
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
                                                    Ingredients
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {Object.keys(hummusRecipeData[recipeName]?.ingredients || {}).length} ingredient{Object.keys(hummusRecipeData[recipeName]?.ingredients || {}).length !== 1 ? 's' : ''} for this recipe
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
                                                        <TableCell sx={{ fontWeight: 600 }}>Ingredient</TableCell>
                                                        <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
                                                        <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                                                        <TableCell sx={{ fontWeight: 600 }}>Lot Number</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {Object.entries(hummusRecipeData[recipeName]?.ingredients || {}).map(([ingredient, amount]) => (
                                                        <TableRow key={ingredient} hover>
                                                            <TableCell sx={{ fontWeight: 600 }}>
                                                                {ingredient}
                                                            </TableCell>
                                                            <TableCell>
                                                                {ingredientCodes[ingredient] || 'N/A'}
                                                            </TableCell>
                                                            <TableCell>
                                                                {amount}
                                                            </TableCell>
                                                            <TableCell>
                                                                <TextField
                                                                    size="small"
                                                                    value={ingredientLots[ingredient] || ''}
                                                                    onChange={(e) => handleLotChange(ingredient, e.target.value)}
                                                                    placeholder="Enter lot number"
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
                    )}

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
                                                        checked={formData.cipFlush}
                                                        onChange={handleInputChange}
                                                        name="cipFlush"
                                                    />
                                                }
                                                label="CIP Flush Completed"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={4}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={formData.visualCheck}
                                                        onChange={handleInputChange}
                                                        name="visualCheck"
                                                    />
                                                }
                                                label="Visual Check Completed"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={4}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={formData.changeover}
                                                        onChange={handleInputChange}
                                                        name="changeover"
                                                    />
                                                }
                                                label="Changeover Completed"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={4}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={formData.scaleTested}
                                                        onChange={handleInputChange}
                                                        name="scaleTested"
                                                    />
                                                }
                                                label="Scale Tested"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={4}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={formData.mixerChecked}
                                                        onChange={handleInputChange}
                                                        name="mixerChecked"
                                                    />
                                                }
                                                label="Mixer Checked"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={4}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={formData.specMet}
                                                        onChange={handleInputChange}
                                                        name="specMet"
                                                    />
                                                }
                                                label="Specifications Met"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={4}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={formData.calibNeeded}
                                                        onChange={handleInputChange}
                                                        name="calibNeeded"
                                                    />
                                                }
                                                label="Calibration Needed"
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

export default DipsBatchSheet; 