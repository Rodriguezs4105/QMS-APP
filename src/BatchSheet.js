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

// Improved mapping for bag sizes with all possible variations
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
            formTitle: formTemplate?.title || "F-06: Dynamic Yogurt Batch Sheet",
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
                <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6">
                    {/* Recipe Selection */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg border">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                            <label htmlFor="recipe-select" className="block text-lg font-semibold text-gray-700 mb-3">Select Recipe</label>
                            <select 
                                id="recipe-select" 
                                value={recipeName} 
                                onChange={(e) => handleRecipeChange(e.target.value)} 
                                className="w-full bg-white border-2 border-blue-300 rounded-lg px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors" 
                                required
                            >
                                <option value="">-- Choose a Recipe --</option>
                                {Object.keys(recipeData).map(name => <option key={name} value={name}>{name}</option>)}
                            </select>
                        </div>
                        </div>

                        {recipeName && (
                        <div className="space-y-6">
                            {/* Recipe Information */}
                            <div className="bg-white p-6 rounded-2xl shadow-lg border">
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-700">Recipe Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-600">Batch Date</label>
                                            <input 
                                                type="date" 
                                                name="batchDate" 
                                                value={formData.batchDate} 
                                                onChange={handleInputChange} 
                                                className="w-full bg-white border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors" 
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-600">Batch By (Initials)</label>
                                            <input 
                                                type="text" 
                                                name="batchBy" 
                                                value={formData.batchBy} 
                                                onChange={handleInputChange} 
                                                placeholder="Enter initials" 
                                                className="w-full bg-white border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors" 
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-600">Batch Number</label>
                                            <input 
                                                type="number" 
                                                name="batchNumber" 
                                                value={formData.batchNumber} 
                                                onChange={handleInputChange} 
                                                placeholder="e.g., 1" 
                                                className="w-full bg-white border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors" 
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-600">Recipe</label>
                                            <div className="w-full bg-gray-100 border-2 border-gray-300 rounded-lg px-3 py-2 text-gray-700 font-medium">
                                                {recipeName}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Calculated Values */}
                            <div className="bg-white p-6 rounded-2xl shadow-lg border">
                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-700">Calculated Values</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-600">Shelf Life</label>
                                            <input 
                                                type="text" 
                                                value={calculatedValues.shelfLife} 
                                                className="w-full bg-gray-100 border-2 border-gray-300 rounded-lg px-3 py-2 text-gray-700 font-medium" 
                                                readOnly
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-600">Expiry Date</label>
                                            <input 
                                                type="text" 
                                                value={calculatedValues.expiryDate} 
                                                className="w-full bg-gray-100 border-2 border-gray-300 rounded-lg px-3 py-2 text-gray-700 font-medium" 
                                                readOnly
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-600">Lot Number</label>
                                            <input 
                                                type="text" 
                                                value={calculatedValues.lotNumber} 
                                                className="w-full bg-gray-100 border-2 border-gray-300 rounded-lg px-3 py-2 text-gray-700 font-medium" 
                                                readOnly
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-600">Theoretical Yield</label>
                                            <input 
                                                type="text" 
                                                value={calculatedValues.theoreticalYield} 
                                                className="w-full bg-gray-100 border-2 border-gray-300 rounded-lg px-3 py-2 text-gray-700 font-medium" 
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Mixing Tank Selection */}
                            <div className="bg-white p-6 rounded-2xl shadow-lg border">
                                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-700">Mixing Tank Selection</h3>
                                    <div className="flex flex-wrap gap-6">
                                        {[1, 2].map(tank => (
                                            <label key={tank} className="flex items-center space-x-3 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    name="mixingTank" 
                                                    value={tank} 
                                                    onChange={handleInputChange} 
                                                    className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-200"
                                                />
                                                <span className="text-lg font-medium text-gray-700">Tank {tank}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                </div>

                            {/* Base Ingredient */}
                            <div className="bg-white p-6 rounded-2xl shadow-lg border">
                                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-700">Base Ingredient</h3>
                                    <div className="space-y-2">
                                        <label htmlFor="base-ingredient-amount" className="block text-sm font-medium text-gray-600">
                                            {recipeData[recipeName]?.baseIngredient} Amount (kg)
                                        </label>
                                        <input 
                                            type="number" 
                                            step="any" 
                                            name="baseIngredientAmount" 
                                            value={formData.baseIngredientAmount} 
                                            onChange={handleInputChange} 
                                            className="w-full bg-white border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors" 
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Ingredients Table */}
                            <div className="bg-white p-6 rounded-2xl shadow-lg border">
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-700">Ingredients</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm border-collapse">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="p-3 border border-gray-300 text-left font-semibold text-gray-700">Code</th>
                                                    <th className="p-3 border border-gray-300 text-left font-semibold text-gray-700">Ingredient</th>
                                                    <th className="p-3 border border-gray-300 text-left font-semibold text-gray-700">Target Amount</th>
                                                    <th className="p-3 border border-gray-300 text-left font-semibold text-gray-700">Actual Use (Bags)</th>
                                                    <th className="p-3 border border-gray-300 text-left font-semibold text-gray-700">Partial KGs</th>
                                                    <th className="p-3 border border-gray-300 text-left font-semibold text-gray-700">Lot #</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ingredients.map((ing, index) => {
                                                // Normalize ingredient name for matching
                                                const normName = ing.name.replace(/\s+/g, '').toUpperCase();
                                                const bagKey = Object.keys(bagSizes).find(key => normName.includes(key.replace(/\s+/g, '').toUpperCase()));
                                                let bags = '';
                                                let partial = '';
                                                let target = parseFloat(ing.targetAmount);
                                                if (bagKey && !isNaN(target)) {
                                                    const kgPerBag = bagSizes[bagKey];
                                                    bags = Math.floor(target / kgPerBag);
                                                    partial = (target - bags * kgPerBag).toFixed(2);
                                                }
                                                return (
                                                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                                        <td className="p-3 border border-gray-300 bg-gray-50 font-medium">{ing.code}</td>
                                                        <td className="p-3 border border-gray-300 font-medium">{ing.name}</td>
                                                        <td className="p-3 border border-gray-300">
                                                            <input 
                                                                type="text" 
                                                                value={`${ing.targetAmount} ${ing.isRatio ? 'kg' : ''}`} 
                                                                className="w-full bg-gray-100 border border-gray-300 rounded px-2 py-1 text-gray-700 font-medium" 
                                                                readOnly 
                                                            />
                                                        </td>
                                                        <td className="p-3 border border-gray-300">
                                                            <input 
                                                                type="text" 
                                                                value={bagKey ? bags : ing.actualUse} 
                                                                onChange={(e) => handleIngredientChange(index, 'actualUse', e.target.value)} 
                                                                className="w-full bg-white border-2 border-gray-300 rounded px-2 py-1 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors" 
                                                                required 
                                                            />
                                                        </td>
                                                        <td className="p-3 border border-gray-300">
                                                            <input 
                                                                type="text" 
                                                                value={bagKey ? partial : ''} 
                                                                onChange={(e) => handleIngredientChange(index, 'partialKgs', e.target.value)} 
                                                                className="w-full bg-white border-2 border-gray-300 rounded px-2 py-1 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors" 
                                                                readOnly={!!bagKey} 
                                                            />
                                                        </td>
                                                        <td className="p-3 border border-gray-300">
                                                            <input 
                                                                type="text" 
                                                                value={ing.lot} 
                                                                onChange={(e) => handleIngredientChange(index, 'lot', e.target.value)} 
                                                                className="w-full bg-white border-2 border-gray-300 rounded px-2 py-1 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors" 
                                                                required 
                                                            />
                                                        </td>
                                                </tr>
                                            );
                                            })}
                                        </tbody>
                                    </table>
                                    </div>
                                </div>
                                </div>

                                {/* Transfer and Yield */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Transfer Tanks */}
                                <div className="bg-white p-6 rounded-2xl shadow-lg border">
                                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                                        <h3 className="text-lg font-semibold mb-4 text-gray-700">Batch Transfer</h3>
                                        <p className="text-sm text-gray-600 mb-3">Select tanks to transfer batch to:</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            {['FT1', 'FT2', 'FT3', 'FT4', 'FT5'].map(tank => (
                                                <label key={tank} className="flex items-center space-x-3 cursor-pointer">
                                                    <input 
                                                        type="checkbox" 
                                                        name="transferTo" 
                                                        value={tank} 
                                                        onChange={handleInputChange} 
                                                        className="w-4 h-4 text-orange-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-orange-200"
                                                    />
                                                    <span className="text-sm font-medium text-gray-700">{tank}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Batch Yield */}
                                <div className="bg-white p-6 rounded-2xl shadow-lg border">
                                    <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                                        <h3 className="text-lg font-semibold mb-4 text-gray-700">Batch Yield</h3>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-600">Batch Yield</label>
                                                <input 
                                                    type="text" 
                                                    name="batchYield" 
                                                    value={formData.batchYield} 
                                                    onChange={handleInputChange} 
                                                    placeholder="Enter batch yield" 
                                                    className="w-full bg-white border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-colors"
                                                />
                                    </div>
                                    <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-600">Performed by (Initials)</label>
                                                <input 
                                                    type="text" 
                                                    name="yieldPerformedBy" 
                                                    value={formData.yieldPerformedBy} 
                                                    onChange={handleInputChange} 
                                                    placeholder="Enter initials" 
                                                    className="w-full bg-white border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-colors"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    </div>
                                </div>
                                
                            {/* Submit Button */}
                            <div className="bg-white p-6 rounded-2xl shadow-lg border">
                                <button 
                                    type="submit" 
                                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 text-lg"
                                >
                                    {isEditing ? 'Update and Resubmit' : 'Submit Batch Sheet'}
                                </button>
                            </div>
                            </div>
                        )}
                </form>
            </main>
        </div>
    );
}

export default BatchSheet;