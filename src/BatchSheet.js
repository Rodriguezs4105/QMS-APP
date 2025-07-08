import React, { useState, useEffect, useCallback } from 'react';
import { db, auth, doc, setDoc, serverTimestamp, collection } from './firebase';

// --- ICONS ---
const BackIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;

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

// --- COMPONENT ---
function BatchSheet({ formTemplate, onBack, isEditing = false, onSave, originalForm }) {
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
            isRatio: typeof value === 'number',
            targetAmount: typeof value === 'number' ? 0 : value,
            actualUse: '',
            lot: ''
        }));
        setIngredients(allIngredients);
        setFormData(prev => ({ // Reset form data but keep recipe name
            ...prev,
            baseIngredientAmount: '',
            batchNumber: '',
        })); 
    };

    useEffect(() => {
        if (!recipeName) return;
        const recipe = recipeData[recipeName];
        const baseAmount = parseFloat(formData.baseIngredientAmount) || 0;
        let totalYield = baseAmount;

        const updatedIngredients = ingredients.map(ing => {
            if (ing.isRatio) {
                const calculatedAmount = baseAmount * (recipe.ratios[ing.name] || 0);
                totalYield += calculatedAmount;
                return { ...ing, targetAmount: calculatedAmount.toFixed(2) };
            }
            return ing;
        });

        setIngredients(updatedIngredients);
        setCalculatedValues(prev => ({
            ...prev,
            theoreticalYield: totalYield > 0 ? totalYield.toFixed(2) + ' kg' : ''
        }));
    }, [formData.baseIngredientAmount, recipeName]);

    useEffect(() => {
        const { batchDate, batchNumber } = formData;
        const recipe = recipeData[recipeName];
        let newLot = '';
        let newExpiry = '';
        let newShelfLife = '';

        if (batchDate && recipe) {
            const date = new Date(batchDate + 'T00:00:00');
            newShelfLife = `${recipe.shelfLife} days`;
            date.setDate(date.getDate() + recipe.shelfLife);
            newExpiry = date.toISOString().split('T')[0];
        }

        if (batchDate && batchNumber) {
            const date = new Date(batchDate + 'T00:00:00');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const year = date.getFullYear().toString().slice(-2);
            const batch = batchNumber.toString().padStart(2, '0');
            newLot = `${batch}${month}${day}${year}`;
        }
        
        setCalculatedValues(prev => ({
            ...prev,
            lotNumber: newLot,
            expiryDate: newExpiry,
            shelfLife: newShelfLife
        }));

    }, [formData.batchDate, formData.batchNumber, recipeName]);


    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => {
                const newValues = checked ? [...prev[name], value] : prev[name].filter(v => v !== value);
                return { ...prev, [name]: newValues };
            });
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleIngredientChange = (index, field, value) => {
        const newIngredients = [...ingredients];
        newIngredients[index][field] = value;
        setIngredients(newIngredients);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const user = auth.currentUser;

        const finalData = {
            ...formData,
            recipeName,
            ingredients,
            calculatedValues,
            formTitle: formTemplate.title,
            submittedBy: user?.email || 'Unknown User',
            submittedAt: serverTimestamp(),
            status: "Pending Review"
        };
        
        try {
            if (isEditing && onSave) {
                // Update existing form
                await onSave(finalData);
            } else {
                // Create new form
                const newFormRef = doc(collection(db, "completedForms"));
                await setDoc(newFormRef, finalData);
                alert("Form submitted for review!");
                onBack();
            }
        } catch (error) {
            console.error("Error submitting form: ", error);
            alert("Error submitting form. See console for details.");
        }
    };

    return (
        <div>
            <header className="bg-gradient-to-r from-purple-600 to-pink-500 p-4 pt-6 shadow-lg sticky top-0 z-20">
                <div className="flex justify-between items-center">
                    <button onClick={onBack} className="text-white p-2 -ml-2"><BackIcon /></button>
                    <h1 className="text-xl font-bold text-white truncate">F-06: Dynamic Yogurt Batch Sheet</h1>
                    <div className="w-6"></div>
                </div>
            </header>
            
            <main className="p-4">
                <form onSubmit={handleSubmit} className="max-w-5xl mx-auto bg-white p-4 sm:p-8 rounded-lg shadow-lg border">
                    <div className="space-y-6">
                        <div className="bg-gray-100 p-4 rounded-lg border">
                            <label htmlFor="recipe-select" className="block text-lg font-medium text-gray-700 mb-2">Select Recipe</label>
                            <select id="recipe-select" value={recipeName} onChange={(e) => handleRecipeChange(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900" required>
                                <option value="">-- Choose a Recipe --</option>
                                {Object.keys(recipeData).map(name => <option key={name} value={name}>{name}</option>)}
                            </select>
                        </div>

                        {recipeName && (
                            <div className="space-y-6 text-sm">
                                {/* Batch Info Table */}
                                <table className="w-full border-collapse">
                                    <tbody>
                                        <tr className="flex flex-col md:table-row">
                                            <td className="p-2 border md:border-b flex justify-between md:table-cell"><span className="font-bold md:hidden">Date:</span><input type="date" name="batchDate" value={formData.batchDate} onChange={handleInputChange} className="border-b text-right md:text-left" required/></td>
                                            <td className="p-2 border md:border-b flex justify-between md:table-cell"><span className="font-bold md:hidden">Batch By:</span><input type="text" name="batchBy" value={formData.batchBy} onChange={handleInputChange} placeholder="Initials" className="border-b text-right md:text-left" required/></td>
                                            <td className="p-2 border md:border-b flex justify-between md:table-cell" colSpan="2"><span className="font-bold md:hidden">Recipe:</span><span className="text-right md:text-left">{recipeName}</span></td>
                                        </tr>
                                        <tr className="flex flex-col md:table-row">
                                            <td className="p-2 border md:border-b flex justify-between md:table-cell"><span className="font-bold md:hidden">Shelf Life:</span><input type="text" value={calculatedValues.shelfLife} className="bg-gray-200 text-right md:text-left" readOnly/></td>
                                            <td className="p-2 border md:border-b flex justify-between md:table-cell"><span className="font-bold md:hidden">Expiry:</span><input type="date" value={calculatedValues.expiryDate} className="bg-gray-200 text-right md:text-left" readOnly/></td>
                                            <td className="p-2 border md:border-b flex justify-between md:table-cell"><span className="font-bold md:hidden">Batch #:</span><input type="number" name="batchNumber" value={formData.batchNumber} onChange={handleInputChange} placeholder="e.g., 1" className="border-b text-right md:text-left" required/></td>
                                            <td className="p-2 border md:border-b flex justify-between md:table-cell"><span className="font-bold md:hidden">Lot #:</span><input type="text" value={calculatedValues.lotNumber} className="bg-gray-200 text-right md:text-left" readOnly/></td>
                                        </tr>
                                    </tbody>
                                </table>

                                {/* Mixing Tank */}
                                <div className="flex items-center gap-4">
                                    <strong>Mixing Tank No:</strong>
                                    <label className="flex items-center"><input type="checkbox" name="mixingTank" value="1" onChange={handleInputChange} className="w-4 h-4 mr-2"/> 1</label>
                                    <label className="flex items-center"><input type="checkbox" name="mixingTank" value="2" onChange={handleInputChange} className="w-4 h-4 mr-2"/> 2</label>
                                </div>

                                {/* Mix Preparation */}
                                <div>
                                    <h3 className="text-lg font-semibold text-center mb-2">MIX PREPARATION</h3>
                                    <div className="mt-4">
                                        <label htmlFor="base-ingredient-amount" className="block text-md font-medium text-gray-700 mb-2">{recipeData[recipeName]?.baseIngredient} Amount (kg)</label>
                                        <input type="number" step="any" name="baseIngredientAmount" value={formData.baseIngredientAmount} onChange={handleInputChange} className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-gray-900" required/>
                                    </div>
                                    <table className="w-full text-sm text-left border-collapse mt-4">
                                        <thead className="bg-gray-200 text-gray-800 hidden md:table-header-group">
                                            <tr>
                                                <th className="p-2 border w-1/6 text-center">CODE</th>
                                                <th className="p-2 border w-2/6">INGREDIENT</th>
                                                <th className="p-2 border w-1/6">TARGET AMOUNT</th>
                                                <th className="p-2 border w-1/6">ACTUAL USE</th>
                                                <th className="p-2 border w-1/6">LOT #</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ingredients.map((ing, index) => (
                                                <tr key={index} className="block md:table-row mb-4 md:mb-0 border md:border-none rounded-lg overflow-hidden">
                                                    <td className="p-2 border-b md:border flex justify-between items-center"><span className="font-bold md:hidden">Code:</span>{ing.code}</td>
                                                    <td className="p-2 border-b md:border flex justify-between items-center"><span className="font-bold md:hidden">Ingredient:</span>{ing.name}</td>
                                                    <td className="p-2 border-b md:border flex justify-between items-center"><span className="font-bold md:hidden">Target:</span><input type="text" value={`${ing.targetAmount} ${ing.isRatio ? 'kg' : ''}`} className="w-1/2 md:w-full bg-gray-200 text-right md:text-left" readOnly /></td>
                                                    <td className="p-2 border-b md:border flex justify-between items-center"><span className="font-bold md:hidden">Actual:</span><input type="text" value={ing.actualUse} onChange={(e) => handleIngredientChange(index, 'actualUse', e.target.value)} className="w-1/2 md:w-full border-b text-right md:text-left" required /></td>
                                                    <td className="p-2 md:border flex justify-between items-center"><span className="font-bold md:hidden">Lot #:</span><input type="text" value={ing.lot} onChange={(e) => handleIngredientChange(index, 'lot', e.target.value)} className="w-1/2 md:w-full border-b text-right md:text-left" required /></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="hidden md:table-footer-group">
                                            <tr className="bg-gray-200 font-bold">
                                                <td colSpan="2" className="p-2 border text-right">Theoretical Batch Yield</td>
                                                <td className="p-2 border"><input type="text" value={calculatedValues.theoreticalYield} className="w-full bg-gray-100" readOnly/></td>
                                                <td colSpan="2" className="border"></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>

                                {/* Transfer and Yield */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <strong>Batch transferred to:</strong>
                                        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2">
                                            {['FT1', 'FT2', 'FT3', 'FT4', 'FT5'].map(tank => (
                                                <label key={tank} className="flex items-center"><input type="checkbox" name="transferTo" value={tank} onChange={handleInputChange} className="w-4 h-4 mr-2"/> {tank}</label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block"><strong>BATCH YIELD:</strong><input type="text" name="batchYield" value={formData.batchYield} onChange={handleInputChange} className="w-full border-b" /></label>
                                        <label className="block"><strong>Performed by (Initials):</strong><input type="text" name="yieldPerformedBy" value={formData.yieldPerformedBy} onChange={handleInputChange} className="w-full border-b" /></label>
                                    </div>
                                </div>
                                
                                <button type="submit" className="mt-6 w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-blue-600">
                                    {isEditing ? 'Update and Resubmit' : 'Submit Batch Sheet'}
                                </button>
                            </div>
                        )}
                    </div>
                </form>
            </main>
        </div>
    );
}

export default BatchSheet;