import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const BackIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;

const recipeData = {
    "Low Fat Yogurt": { baseIngredient: 'Low Fat Milk', shelfLife: 75, ratios: { 'NFDM': 0.0324, 'Precisa Cream': 0.0294, 'MPC 85': 0.0182, 'Lactonat EN': 0.0091, 'Culture AGAR': 0.0011, 'Polartex 06748': 0.0013, 'Culture Trans': 0.0002 }, special: { 'YoFlex (Mild 2.0)': '*500U (Units)', 'Q9 (FreshQ®)': '*500U (Units)' } },
    "Esti Low fat": { baseIngredient: 'Low Fat Milk', shelfLife: 75, ratios: { 'NFDM': 0.0325, 'Precisa Cream': 0.0309, 'MPC 85': 0.0223, 'Lactonat EN': 0.0119, 'Culture AGAR': 0.0011, 'Trans Culture': 0.0002 }, special: { 'YoFlex (Mild 2.0)': '*500U (Units)', 'Q9 (FreshQ®)': '*500U (Units)' } },
    "Esti Whole Greek Yogurt": { baseIngredient: 'Whole Milk', shelfLife: 75, ratios: { 'NFDM': 0.03, 'MPC 85': 0.04, 'Whey Protein': 0.02, 'Cream 40%': 0.19, 'Culture AGAR': 0.0008 }, special: { 'JOG 431 B': '10 Packs', 'Choozit MY800': '4 Packs', 'Q9 (FreshQ®)': '*500U (Units)' } },
};

function FormDetail({ form, onBack }) {
    const [formData, setFormData] = useState({});
    const [ingredients, setIngredients] = useState([]);
    const [calculatedValues, setCalculatedValues] = useState({});

    useEffect(() => {
        const recipe = recipeData[form.title];
        if (!recipe) return;

        const allIngredients = Object.entries({...recipe.ratios, ...recipe.special}).map(([name, value]) => ({
            name,
            isRatio: typeof value === 'number',
            targetAmount: typeof value === 'number' ? 0 : value,
            actualUse: '',
            lot: ''
        }));
        setIngredients(allIngredients);

        setFormData({
            recipeName: form.title,
            category: form.category,
            status: 'In Progress',
            baseIngredientAmount: '',
        });

    }, [form]);

    useEffect(() => {
        const recipe = recipeData[form.title];
        if (!recipe) return;

        const baseAmount = parseFloat(formData.baseIngredientAmount) || 0;
        let totalYield = baseAmount;

        const newIngredients = ingredients.map(ing => {
            if (ing.isRatio) {
                const calculatedAmount = baseAmount * (recipe.ratios[ing.name] || 0);
                totalYield += calculatedAmount;
                return { ...ing, targetAmount: calculatedAmount.toFixed(2) };
            }
            return ing;
        });
        setIngredients(newIngredients);
        
        const batchDate = formData.batchDate ? new Date(formData.batchDate + 'T00:00:00') : null;
        let expiryDate = '';
        if(batchDate) {
            const exp = new Date(batchDate);
            exp.setDate(exp.getDate() + recipe.shelfLife);
            expiryDate = exp.toISOString().split('T')[0];
        }

        setCalculatedValues({
            theoreticalYield: totalYield.toFixed(2),
            expiryDate: expiryDate
        });

    }, [formData.baseIngredientAmount, formData.batchDate, form.title]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };
    
    const handleIngredientChange = (index, field, value) => {
        const newIngredients = [...ingredients];
        newIngredients[index][field] = value;
        setIngredients(newIngredients);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const finalData = {
            ...formData,
            ingredients,
            calculatedValues,
            submittedAt: serverTimestamp(),
            status: "Pending Review"
        };

        try {
            await setDoc(doc(db, "completedForms", form.id), finalData);
            alert("Form submitted for review!");
            onBack();
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
                    <h1 className="text-xl font-bold text-white truncate">{form.title}</h1>
                    <div className="w-6"></div>
                </div>
            </header>
            <main className="p-4">
                <form onSubmit={handleSubmit}>
                    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
                        <h2 className="text-lg font-bold mb-2">Batch Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="date" name="batchDate" onChange={handleInputChange} className="w-full border p-2 rounded" placeholder="Batch Date" />
                            <input type="text" name="batchBy" onChange={handleInputChange} className="w-full border p-2 rounded" placeholder="Batched By (Initials)" />
                            <input type="number" name="baseIngredientAmount" onChange={handleInputChange} className="w-full border p-2 rounded" placeholder={`${recipeData[form.title]?.baseIngredient} Amount (kg)`} />
                            <input type="text" value={calculatedValues.expiryDate || ''} readOnly className="w-full border p-2 rounded bg-gray-200" placeholder="Expiry Date" />
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md">
                         <h2 className="text-lg font-bold mb-2">Ingredients</h2>
                         {ingredients.map((ing, index) => (
                             <div key={index} className="mb-4 p-3 border rounded-md">
                                 <p className="font-semibold">{ing.name}</p>
                                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                                     <input type="text" value={`${ing.targetAmount} ${ing.isRatio ? 'kg' : ''}`} readOnly className="w-full border p-2 rounded bg-gray-200" placeholder="Target" />
                                     <input type="text" onChange={(e) => handleIngredientChange(index, 'actualUse', e.target.value)} className="w-full border p-2 rounded" placeholder="Actual Use" />
                                     <input type="text" onChange={(e) => handleIngredientChange(index, 'lot', e.target.value)} className="w-full border p-2 rounded" placeholder="Lot #" />
                                 </div>
                             </div>
                         ))}
                    </div>
                    <button type="submit" className="mt-6 w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-blue-600">
                        Submit Batch Sheet
                    </button>
                </form>
            </main>
        </div>
    );
}

export default FormDetail;
