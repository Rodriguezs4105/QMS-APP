import React, { useState, useEffect } from 'react';
import { db, doc, setDoc } from './firebase';
import PhotoAttachment from './components/PhotoAttachment';
import { prepareFormDataForFirestore } from './utils/formSubmission';

// Material UI imports
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
  Container,
  Divider,
  Alert,
  Snackbar,
  Avatar,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Send as SendIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

// --- FORM DATA AND LOGIC ---
const recipeData = {
    "Low Fat Yogurt": { baseIngredient: 'Low Fat Milk', shelfLife: 75, ratios: { 'NFDM': 0.0324, 'Precisa Cream': 0.0294, 'MPC 85': 0.0182, 'Lactonat EN': 0.0091, 'Culture AGAR': 0.0011, 'Polartex 06748': 0.0013, 'Culture Trans': 0.0002 }, special: { 'YoFlex (Mild 2.0)': '*500U (Units)', 'Q9 (FreshQ®)': '*500U (Units)' } },
    "Esti Low fat": { baseIngredient: 'Low Fat Milk', shelfLife: 75, ratios: { 'NFDM': 0.0325, 'Precisa Cream': 0.0309, 'MPC 85': 0.0223, 'Lactonat EN': 0.0119, 'Culture AGAR': 0.0011, 'Trans Culture': 0.0002 }, special: { 'YoFlex (Mild 2.0)': '*500U (Units)', 'Q9 (FreshQ®)': '*500U (Units)' } },
    "Esti Whole Greek Yogurt": { baseIngredient: 'Whole Milk', shelfLife: 75, ratios: { 'NFDM': 0.03, 'MPC 85': 0.04, 'Whey Protein': 0.02, 'Cream 40%': 0.19, 'Culture AGAR': 0.0008 }, special: { 'JOG 431 B': '10 Packs', 'Choozit MY800': '4 Packs', 'Q9 (FreshQ®)': '*500U (Units)' } },
    "HEB Whole Greek Yogurt": { baseIngredient: 'Whole Milk', shelfLife: 75, ratios: { 'NFDM': 0.0301, 'MPC 85': 0.04, 'Whey Protein': 0.02, 'Cream 40%': 0.2031, 'Culture AGAR': 0.0008 }, special: { 'JOG 431 B': '10 Packs', 'Choozit MY800': '4 Packs', 'Q9 (FreshQ®)': '*500U (Units)' } },
    "Sprouts 5%": { baseIngredient: 'Whole Milk', shelfLife: 75, ratios: { 'NFDM': 0.026, 'Polartex 06748': 0.0135, 'Colflo': 0.0026, 'MPC 85': 0.019, 'Whey Protein': 0.0073, 'Lactonat EN': 0.0096, 'Culture AGAR': 0.001, 'Cream 40%': 0.0644 }, special: { 'YoFlex (Mild 2.0)': '500U (Units)', 'Q9 (FreshQ®)': '500U (Units)' } },
    "Dairy Free": { baseIngredient: 'Coconut Cream', shelfLife: 150, ratios: { 'Agar': 0.0033, 'Maple syrup': 0.05, 'Lyofast SYAB 1': 0, 'Culture CA': 0.003, 'Culture SA': 0.0005, 'Culture SM': 0.0033 }, special: {} }
};

const ingredientCodes = { 'Whole Milk': '6012', 'Low Fat Milk': '6012', 'Cream 40%': '6011', 'Precisa Cream': '6014', 'NFDM': '6004', 'MPC 85': '6002', 'Whey Protein': '6001', 'Lactonat EN': '6003', 'Culture AGAR': '6033', 'Q9 (FreshQ®)': '6024', 'Culture Trans': '6033', 'Trans Culture': '6033' };

const bagSizes = {
    'NFDM': 22.7,
    'MPC85': 20,
    'MPC 85': 20,
    'WPC85': 20,
    'WPC 85': 20,
    'WHEYPROTEIN': 20,
    'WHEY PROTEIN': 20,
    'COLFLO': 22.7,
    'COLFLO ': 22.7,
    'PRECISA': 22.7,
    'PRECISA CREAM': 22.7,
    'POLARTEX': 22.7,
    'POLARTEX 06748': 22.7,
    'LACTONAT': 25,
    'LACTONAT EN': 25
};

function BatchSheet({ formTemplate, onBack, isEditing = false, onSave, originalForm, onSubmit }) {
    const [recipeName, setRecipeName] = useState(originalForm?.recipeName || '');
    const [formData, setFormData] = useState({
        batchDate: originalForm?.batchDate || '',
        batchBy: originalForm?.batchBy || '',
        batchNumber: originalForm?.batchNumber || '',
        baseIngredientAmount: originalForm?.baseIngredientAmount || '',
        mixingTank: originalForm?.mixingTank || [],
        transferTo: originalForm?.transferTo || [],
        batchYield: originalForm?.batchYield || '',
        yieldPerformedBy: originalForm?.yieldPerformedBy || ''
    });
    const [ingredients, setIngredients] = useState(originalForm?.ingredients || []);
    const [calculatedValues, setCalculatedValues] = useState({
        theoreticalYield: originalForm?.calculatedValues?.theoreticalYield || '',
        lotNumber: originalForm?.calculatedValues?.lotNumber || '',
        expiryDate: originalForm?.calculatedValues?.expiryDate || '',
        shelfLife: originalForm?.calculatedValues?.shelfLife || ''
    });
    const [photos, setPhotos] = useState(originalForm?.photos || {});
    const [formId] = useState(() => originalForm?.id || `temp_${Date.now()}`);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const handleRecipeChange = (name) => {
        const recipe = recipeData[name];
        setRecipeName(name);
        if (!recipe) {
            setIngredients([]);
            return;
        }

        const allIngredients = Object.entries({ ...recipe.ratios, ...recipe.special }).map(([ingName, value]) => ({
            name: ingName,
            code: ingredientCodes[ingName] || 'N/A',
            ratio: value,
            calculatedAmount: '',
            actualAmount: '',
            bagSize: bagSizes[ingName.toUpperCase()] || 25,
            bagsUsed: '',
            lotNumber: '',
            notes: ''
        }));

        setIngredients(allIngredients);
        setCalculatedValues(prev => ({
            ...prev,
            shelfLife: recipe.shelfLife
        }));
    };

    // Auto-calculate ingredients when base amount changes
    useEffect(() => {
        if (!recipeName || !formData.baseIngredientAmount) return;
        
        const recipe = recipeData[recipeName];
        if (!recipe) return;

        const baseAmount = parseFloat(formData.baseIngredientAmount) || 0;
        
        const updatedIngredients = ingredients.map(ingredient => {
            const ratio = recipe.ratios[ingredient.name];
            if (ratio && typeof ratio === 'number') {
                const calculatedAmount = (baseAmount * ratio).toFixed(2);
                return { ...ingredient, calculatedAmount };
            }
            return ingredient;
        });

        setIngredients(updatedIngredients);

        // Calculate theoretical yield
        const totalYield = baseAmount + updatedIngredients.reduce((sum, ing) => {
            return sum + (parseFloat(ing.calculatedAmount) || 0);
        }, 0);

        setCalculatedValues(prev => ({
            ...prev,
            theoreticalYield: totalYield.toFixed(2)
        }));
    }, [recipeName, formData.baseIngredientAmount, ingredients.length]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleIngredientChange = (index, field, value) => {
        const updatedIngredients = [...ingredients];
        updatedIngredients[index] = { ...updatedIngredients[index], [field]: value };
        setIngredients(updatedIngredients);
    };

    const handleSaveForLater = async () => {
        try {
            const formDataToSave = {
                id: formId,
                formTitle: "F-06: Dynamic Yogurt Batch Sheet",
                recipeName,
                ...formData,
                ingredients,
                calculatedValues,
                photos,
                status: "Saved for Later",
                savedAt: new Date(),
                savedBy: "currentUser@example.com" // Replace with actual user
            };

            await setDoc(doc(db, "savedForms", formId), formDataToSave);
            setSnackbar({ open: true, message: "Form saved successfully!", severity: 'success' });
        } catch (error) {
            console.error("Error saving form:", error);
            setSnackbar({ open: true, message: "Failed to save form.", severity: 'error' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formDataToSubmit = prepareFormDataForFirestore({
                formTitle: "F-06: Dynamic Yogurt Batch Sheet",
                recipeName,
                ...formData,
                ingredients,
                calculatedValues,
                photos
            });

            await setDoc(doc(db, "completedForms", formId), formDataToSubmit);
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
                                F-06: Dynamic Yogurt Batch Sheet
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
                                            <AssignmentIcon sx={{ color: 'white', fontSize: 20 }} />
                                        </Box>
                                        <Box>
                                            <Typography variant="h6" component="h2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                                Recipe Selection
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Choose the yogurt recipe for this batch
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
                                            onChange={(e) => handleRecipeChange(e.target.value)}
                                            label="Select Recipe"
                                        >
                                            {Object.keys(recipeData).map((recipe) => (
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
                                                label="Batch Date"
                                                name="batchDate"
                                                type="date"
                                                value={formData.batchDate}
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
                                                label="Base Ingredient Amount"
                                                name="baseIngredientAmount"
                                                value={formData.baseIngredientAmount}
                                                onChange={handleInputChange}
                                            />
                                        </Grid>
                                    </Grid>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Ingredients Table */}
                    {ingredients.length > 0 && (
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
                                                    {ingredients.length} ingredient{ingredients.length !== 1 ? 's' : ''} for this recipe
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
                                                        <TableCell sx={{ fontWeight: 600 }}>Ratio</TableCell>
                                                        <TableCell sx={{ fontWeight: 600 }}>Calculated Amount</TableCell>
                                                        <TableCell sx={{ fontWeight: 600 }}>Actual Amount</TableCell>
                                                        <TableCell sx={{ fontWeight: 600 }}>Bags Used</TableCell>
                                                        <TableCell sx={{ fontWeight: 600 }}>Lot Number</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {ingredients.map((ingredient, index) => (
                                                        <TableRow key={index} hover>
                                                            <TableCell>{ingredient.name}</TableCell>
                                                            <TableCell>{ingredient.code}</TableCell>
                                                            <TableCell>{ingredient.ratio}</TableCell>
                                                            <TableCell>
                                                                <TextField
                                                                    size="small"
                                                                    value={ingredient.calculatedAmount}
                                                                    onChange={(e) => handleIngredientChange(index, 'calculatedAmount', e.target.value)}
                                                                    sx={{ minWidth: 100 }}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <TextField
                                                                    size="small"
                                                                    value={ingredient.actualAmount}
                                                                    onChange={(e) => handleIngredientChange(index, 'actualAmount', e.target.value)}
                                                                    sx={{ minWidth: 100 }}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <TextField
                                                                    size="small"
                                                                    value={ingredient.bagsUsed}
                                                                    onChange={(e) => handleIngredientChange(index, 'bagsUsed', e.target.value)}
                                                                    sx={{ minWidth: 80 }}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <TextField
                                                                    size="small"
                                                                    value={ingredient.lotNumber}
                                                                    onChange={(e) => handleIngredientChange(index, 'lotNumber', e.target.value)}
                                                                    sx={{ minWidth: 120 }}
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

                    {/* Additional Information */}
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
                                                Additional Information
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Complete batch details and yield information
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
                                                label="Batch Yield"
                                                name="batchYield"
                                                value={formData.batchYield}
                                                onChange={handleInputChange}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Yield Performed By"
                                                name="yieldPerformedBy"
                                                value={formData.yieldPerformedBy}
                                                onChange={handleInputChange}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Theoretical Yield"
                                                value={calculatedValues.theoreticalYield}
                                                onChange={(e) => setCalculatedValues(prev => ({ ...prev, theoreticalYield: e.target.value }))}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Lot Number"
                                                value={calculatedValues.lotNumber}
                                                onChange={(e) => setCalculatedValues(prev => ({ ...prev, lotNumber: e.target.value }))}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Expiry Date"
                                                type="date"
                                                value={calculatedValues.expiryDate}
                                                onChange={(e) => setCalculatedValues(prev => ({ ...prev, expiryDate: e.target.value }))}
                                                InputLabelProps={{ shrink: true }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Shelf Life (days)"
                                                value={calculatedValues.shelfLife}
                                                onChange={(e) => setCalculatedValues(prev => ({ ...prev, shelfLife: e.target.value }))}
                                            />
                                        </Grid>
                                    </Grid>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Photo Attachments */}
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
                                            <CheckCircleIcon sx={{ color: 'white', fontSize: 20 }} />
                                        </Box>
                                        <Box>
                                            <Typography variant="h6" component="h2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                                Photo Attachments
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Add photos to document the batch process
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                                <Divider />
                                <Box sx={{ p: 3 }}>
                                    <PhotoAttachment
                                        photos={photos}
                                        setPhotos={setPhotos}
                                        formId={formId}
                                    />
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

export default BatchSheet; 