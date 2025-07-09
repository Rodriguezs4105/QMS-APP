import React, { useState } from 'react';
import { db, auth, doc, setDoc, serverTimestamp, collection } from './firebase';

// --- ICONS ---
const BackIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;

function YogurtBatchingProcess({ onBack, isEditing = false, onSave, originalForm }) {
    const [formData, setFormData] = useState({
        date: originalForm?.date || new Date().toISOString().split('T')[0],
        batchSize: originalForm?.batchSize || '',
        batchBy: originalForm?.batchBy || '',
        batchRecipe: originalForm?.batchRecipe || ''
    });

    const [mainBatchingData, setMainBatchingData] = useState(originalForm?.mainBatchingData || [
        { step: 'Heat Milk to:', qc: '45°C - 50°C', startTime: '', endTime: '', comments: '' },
        { step: 'Add Raw Material', qc: '(Add Agar in Between)', startTime: '', endTime: '', comments: '' },
        { step: 'Mix for (Tank Level >2200kg)', qc: '1hr 25min', startTime: '', endTime: '', comments: '' }
    ]);

    const [mixingSheerData, setMixingSheerData] = useState(originalForm?.mixingSheerData || [
        { step: 'Single Batch', qc: '20 Min.', startTime: '', endTime: '', comments: '' },
        { step: 'Double Batch (3850kg)', qc: '25 TO 30 Min', startTime: '', endTime: '', comments: '' },
        { step: 'Cool Milk Down to:', qc: '3°C', startTime: '', endTime: '', comments: '' }
    ]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMainBatchingChange = (index, field, value) => {
        const newMainBatchingData = [...mainBatchingData];
        newMainBatchingData[index] = { ...newMainBatchingData[index], [field]: value };
        setMainBatchingData(newMainBatchingData);
    };

    const handleMixingSheerChange = (index, field, value) => {
        const newMixingSheerData = [...mixingSheerData];
        newMixingSheerData[index] = { ...newMixingSheerData[index], [field]: value };
        setMixingSheerData(newMixingSheerData);
    };

    const setToday = () => {
        setFormData(prev => ({ ...prev, date: new Date().toISOString().split('T')[0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const user = auth.currentUser;

        const finalData = {
            ...formData,
            mainBatchingData,
            mixingSheerData,
            formTitle: "F-05: Yogurt Batching Process Record",
            formType: 'yogurtBatchingProcess',
            submittedBy: user?.email || 'Unknown User',
            submittedAt: serverTimestamp(),
            status: "Pending Review"
        };
        
        try {
            if (isEditing && onSave) {
                await onSave(finalData);
            } else {
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
                    <h1 className="text-xl font-bold text-white truncate">F-05: Yogurt Batching Process Record</h1>
                    <div className="w-6"></div>
                </div>
            </header>
            
            <main className="p-4">
                <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg border">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <h3 className="text-lg font-semibold mb-4 text-gray-700">Basic Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-600">Date</label>
                                    <div className="flex items-center space-x-2">
                                        <input 
                                            type="date" 
                                            name="date" 
                                            value={formData.date} 
                                            onChange={handleInputChange} 
                                            className="flex-1 bg-white border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors" 
                                            required
                                        />
                                        <button 
                                            type="button" 
                                            onClick={setToday}
                                            className="px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                                        >
                                            Today
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-600">Batch Size</label>
                                    <input 
                                        type="text" 
                                        name="batchSize" 
                                        value={formData.batchSize} 
                                        onChange={handleInputChange} 
                                        placeholder="Enter batch size" 
                                        className="w-full bg-white border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors" 
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-600">Batch By</label>
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
                                    <label className="block text-sm font-medium text-gray-600">Batch Recipe</label>
                                    <select 
                                        name="batchRecipe" 
                                        value={formData.batchRecipe} 
                                        onChange={handleInputChange} 
                                        className="w-full bg-white border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors" 
                                        required
                                    >
                                        <option value="">-- Select a Recipe --</option>
                                        <option value="Low Fat Yogurt">Low Fat Yogurt</option>
                                        <option value="Esti Low fat">Esti Low fat</option>
                                        <option value="Esti Whole Greek Yogurt">Esti Whole Greek Yogurt</option>
                                        <option value="HEB Whole Greek Yogurt">HEB Whole Greek Yogurt</option>
                                        <option value="Sprouts 5%">Sprouts 5%</option>
                                        <option value="Dairy Free">Dairy Free</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Yogurt Batching Process */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg border">
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <h3 className="text-lg font-semibold mb-4 text-gray-700">Yogurt Batching Process</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm border-collapse">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="p-3 border border-gray-300 text-left font-semibold text-gray-700">Steps</th>
                                            <th className="p-3 border border-gray-300 text-left font-semibold text-gray-700">QC Parameters</th>
                                            <th className="p-3 border border-gray-300 text-left font-semibold text-gray-700">Start Time</th>
                                            <th className="p-3 border border-gray-300 text-left font-semibold text-gray-700">End Time</th>
                                            <th className="p-3 border border-gray-300 text-left font-semibold text-gray-700">Comments</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {mainBatchingData.map((step, index) => (
                                            <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                                <td className="p-3 border border-gray-300 bg-gray-50 font-medium">
                                                    {step.step}
                                                </td>
                                                <td className="p-3 border border-gray-300 bg-gray-50">
                                                    {step.qc}
                                                </td>
                                                <td className="p-3 border border-gray-300">
                                                    <input 
                                                        type="time" 
                                                        value={step.startTime} 
                                                        onChange={(e) => handleMainBatchingChange(index, 'startTime', e.target.value)} 
                                                        className="w-full bg-white border-2 border-gray-300 rounded px-2 py-1 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors" 
                                                    />
                                                </td>
                                                <td className="p-3 border border-gray-300">
                                                    <input 
                                                        type="time" 
                                                        value={step.endTime} 
                                                        onChange={(e) => handleMainBatchingChange(index, 'endTime', e.target.value)} 
                                                        className="w-full bg-white border-2 border-gray-300 rounded px-2 py-1 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors" 
                                                    />
                                                </td>
                                                <td className="p-3 border border-gray-300">
                                                    <input 
                                                        type="text" 
                                                        value={step.comments} 
                                                        onChange={(e) => handleMainBatchingChange(index, 'comments', e.target.value)} 
                                                        placeholder="Comments" 
                                                        className="w-full bg-white border-2 border-gray-300 rounded px-2 py-1 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors" 
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Mixing / Sheer */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg border">
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                            <h3 className="text-lg font-semibold mb-4 text-gray-700">Mixing / Sheer</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm border-collapse">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="p-3 border border-gray-300 text-left font-semibold text-gray-700">Steps</th>
                                            <th className="p-3 border border-gray-300 text-left font-semibold text-gray-700">QC Parameters</th>
                                            <th className="p-3 border border-gray-300 text-left font-semibold text-gray-700">Start Time</th>
                                            <th className="p-3 border border-gray-300 text-left font-semibold text-gray-700">End Time</th>
                                            <th className="p-3 border border-gray-300 text-left font-semibold text-gray-700">Comments</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {mixingSheerData.map((step, index) => (
                                            <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                                <td className="p-3 border border-gray-300 bg-gray-50 font-medium">
                                                    {step.step}
                                                </td>
                                                <td className="p-3 border border-gray-300 bg-gray-50">
                                                    {step.qc}
                                                </td>
                                                <td className="p-3 border border-gray-300">
                                                    <input 
                                                        type="time" 
                                                        value={step.startTime} 
                                                        onChange={(e) => handleMixingSheerChange(index, 'startTime', e.target.value)} 
                                                        className="w-full bg-white border-2 border-gray-300 rounded px-2 py-1 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors" 
                                                    />
                                                </td>
                                                <td className="p-3 border border-gray-300">
                                                    <input 
                                                        type="time" 
                                                        value={step.endTime} 
                                                        onChange={(e) => handleMixingSheerChange(index, 'endTime', e.target.value)} 
                                                        className="w-full bg-white border-2 border-gray-300 rounded px-2 py-1 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors" 
                                                    />
                                                </td>
                                                <td className="p-3 border border-gray-300">
                                                    <input 
                                                        type="text" 
                                                        value={step.comments} 
                                                        onChange={(e) => handleMixingSheerChange(index, 'comments', e.target.value)} 
                                                        placeholder="Comments" 
                                                        className="w-full bg-white border-2 border-gray-300 rounded px-2 py-1 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors" 
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg border">
                        <button 
                            type="submit" 
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 text-lg"
                        >
                            {isEditing ? 'Update and Resubmit' : 'Submit Form'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}

export default YogurtBatchingProcess; 