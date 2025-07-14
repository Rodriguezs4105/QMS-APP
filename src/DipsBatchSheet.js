import React, { useState, useEffect } from 'react';
import { db, auth, doc, setDoc, serverTimestamp, collection } from './firebase';

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

const BackIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;

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
            const totalYield = Object.values(recipe.ingredients).reduce((sum, amount) => sum + parseFloat(amount), 0);
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
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleLotChange = (ingredient, value) => {
        setIngredientLots(prev => ({ ...prev, [ingredient]: value }));
    };

    const handleToday = (field) => {
        setFormData(prev => ({ ...prev, [field]: new Date().toISOString().split('T')[0] }));
    };

    const handleSaveForLater = async () => {
        const user = auth.currentUser;
        const recipe = hummusRecipeData[recipeName];
        const savedData = {
            ...formData,
            recipeName,
            ingredients: Object.entries(recipe?.ingredients || {}).map(([name, amount]) => ({
                name,
                code: ingredientCodes[name] || 'N/A',
                amount,
                lot: ingredientLots[name] || ''
            })),
            calculatedValues,
            formTitle: formTemplate?.title || 'Dynamic Hummus/Dips Batch Sheet',
            formType: 'dynamicHummusDipsBatchSheet',
            savedBy: user?.email || 'Unknown User',
            savedAt: serverTimestamp(),
            status: "Saved for Later"
        };
        
        try {
            await addDoc(collection(db, "savedForms"), savedData);
            alert("Form saved for later! You can continue editing it from your dashboard.");
            onBack();
        } catch (error) {
            console.error("Error saving form: ", error);
            alert("Error saving form. See console for details.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        const recipe = hummusRecipeData[recipeName];
        const finalData = {
            ...formData,
            recipeName,
            ingredients: Object.entries(recipe?.ingredients || {}).map(([name, amount]) => ({
                name,
                code: ingredientCodes[name] || 'N/A',
                amount,
                lot: ingredientLots[name] || ''
            })),
            calculatedValues,
            formTitle: formTemplate?.title || 'Dynamic Hummus/Dips Batch Sheet',
            submittedBy: user?.email || 'Unknown User',
            submittedAt: serverTimestamp(),
            status: 'Pending Review'
        };
        
        try {
            if (isEditing && onSave) {
                // Update existing form
                await onSave(finalData);
            } else if (onSubmit) {
                // Handle saved form submission
                await onSubmit(finalData);
            } else {
                // Create new form
                const newFormRef = doc(collection(db, 'completedForms'));
                await setDoc(newFormRef, finalData);
                alert('Form submitted for review!');
                onBack();
            }
        } catch (error) {
            console.error('Error submitting form: ', error);
            alert('Error submitting form. See console for details.');
        }
    };

    const recipe = hummusRecipeData[recipeName];

    return (
        <div>
            <header className="bg-gradient-to-r from-purple-600 to-pink-500 p-4 pt-6 shadow-lg sticky top-0 z-20">
                <div className="flex justify-between items-center">
                    <button onClick={onBack} className="text-white p-2 -ml-2"><BackIcon /></button>
                    <h1 className="text-xl font-bold text-white truncate">Dynamic Hummus/Dips Batch Sheet</h1>
                    <div className="w-6"></div>
                </div>
            </header>
            <main className="p-4">
                <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6">
                    {/* Recipe Selection */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg border">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                            <label htmlFor="recipe-select" className="block text-lg font-semibold text-gray-700 mb-3">Select Recipe</label>
                            <select id="recipe-select" value={recipeName} onChange={handleRecipeChange} className="w-full bg-white border-2 border-blue-300 rounded-lg px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors" required>
                                <option value="">-- Choose a Recipe --</option>
                                {Object.keys(hummusRecipeData).map(name => <option key={name} value={name}>{name}</option>)}
                            </select>
                        </div>
                    </div>
                    {recipe && (
                        <div className="space-y-6">
                            {/* Recipe Information */}
                            <div className="bg-white p-6 rounded-2xl shadow-lg border">
                                <table className="w-full table-bordered responsive-table mb-4">
                                    <tbody>
                                        <tr>
                                            <td className="p-2"><input type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full bg-white border-b border-gray-400 p-1" /></td>
                                            <td className="p-2"><input type="text" name="batchBy" value={formData.batchBy} onChange={handleInputChange} placeholder="Batch By" className="w-full bg-white border-b border-gray-400 p-1" /></td>
                                            <td className="p-2"><input type="number" name="batchNumber" value={formData.batchNumber} onChange={handleInputChange} placeholder="Batch #" className="w-full bg-white border-b border-gray-400 p-1" /></td>
                                        </tr>
                                        <tr>
                                            <td colSpan="3" className="p-2 font-bold"><input type="text" name="lotNumber" value={formData.lotNumber} readOnly className="w-full bg-gray-200 text-gray-500 p-1 font-bold" /></td>
                                        </tr>
                                    </tbody>
                                </table>
                                {/* Calculated Values Section */}
                                <div className="flex flex-wrap gap-4 mb-4">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex-1 min-w-[180px]">
                                        <div className="text-xs text-gray-500 font-semibold mb-1">Theoretical Batch Yield</div>
                                        <div className="text-lg font-bold text-blue-700">{calculatedValues.theoreticalYield}</div>
                                    </div>
                                </div>
                                <div className="section-title my-4 font-bold">PRE-PROCESS INSPECTION</div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center mb-4">
                                    <div><label className="flex flex-col items-center"><span className="font-bold mb-1">CIP ACID FLUSH</span><input type="checkbox" name="cipFlush" checked={formData.cipFlush} onChange={handleInputChange} className="h-6 w-6" /></label></div>
                                    <div><label className="flex flex-col items-center"><span className="font-bold mb-1">VISUAL CHECK</span><input type="checkbox" name="visualCheck" checked={formData.visualCheck} onChange={handleInputChange} className="h-6 w-6" /></label></div>
                                    <div><label className="flex flex-col items-center"><span className="font-bold mb-1">CHANGEOVER</span><input type="checkbox" name="changeover" checked={formData.changeover} onChange={handleInputChange} className="h-6 w-6" /></label></div>
                                </div>
                                <div className="section-title my-4 font-bold">MIX PREPARATION</div>
                                <table className="w-full bordered-table text-sm mb-4 responsive-table">
                                    <thead><tr><th>CODE</th><th>INGREDIENT</th><th>Amount (Kg)</th><th>LOT #:</th></tr></thead>
                                    <tbody>
                                        {Object.entries(recipe.ingredients).map(([name, amount]) => (
                                            <tr key={name} className="bg-gray-50">
                                                <td className="p-2 table-bordered">{ingredientCodes[name] || 'N/A'}</td>
                                                <td className="p-2 table-bordered text-left">{name}</td>
                                                <td className="p-2 table-bordered">{amount}</td>
                                                <td className="p-2 table-bordered"><input type="text" value={ingredientLots[name] || ''} onChange={e => handleLotChange(name, e.target.value)} className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-gray-900" /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="section-title my-4 font-bold">PROCESS CONTROL</div>
                                <table className="w-full bordered-table text-sm mb-4 responsive-table">
                                    <tbody>
                                        <tr><td className="font-bold p-2">pH</td><td className="p-1"><input type="text" name="phValue" value={formData.phValue} onChange={handleInputChange} className="input-field w-full bg-white rounded border border-gray-300 p-1" /></td></tr>
                                        <tr><td className="p-2">SCALE TESTED WITH CERTIFIED WEIGHT BEFORE BATCH START?</td><td className="p-1"><input type="checkbox" name="scaleTested" checked={formData.scaleTested} onChange={handleInputChange} className="w-6 h-6" /></td></tr>
                                        <tr><td className="p-2">MIXER AND FILLER CHECKED FOR MISSING PIECES OR METAL SHAVINGS?</td><td className="p-1"><input type="checkbox" name="mixerChecked" checked={formData.mixerChecked} onChange={handleInputChange} className="w-6 h-6" /></td></tr>
                                        <tr><td className="p-2">DOES THE PRODUCT MEET SPECIFICATIONS? (LOOK, TASTE, CONSTISTENCY)</td><td className="p-1"><input type="checkbox" name="specMet" checked={formData.specMet} onChange={handleInputChange} className="w-6 h-6" /></td></tr>
                                        <tr><td className="p-2">CALIBRATION NEEDED?</td><td className="p-1"><input type="checkbox" name="calibNeeded" checked={formData.calibNeeded} onChange={handleInputChange} className="w-6 h-6" /></td></tr>
                                        <tr><td className="p-2 font-bold">ACTUAL BATCH YIELD:</td><td className="p-1"><input type="text" name="actualYield" value={formData.actualYield} onChange={handleInputChange} className="input-field w-full bg-white rounded border border-gray-300 p-1" /></td></tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button 
                                    type="button" 
                                    onClick={handleSaveForLater}
                                    className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-lg shadow-md hover:from-yellow-600 hover:to-orange-600 transition-colors"
                                >
                                    Save for Later
                                </button>
                                <button type="submit" className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-lg shadow-md hover:from-green-600 hover:to-emerald-600 transition-colors">Submit for Review</button>
                            </div>
                        </div>
                    )}
                </form>
            </main>
        </div>
    );
}

export default DipsBatchSheet; 