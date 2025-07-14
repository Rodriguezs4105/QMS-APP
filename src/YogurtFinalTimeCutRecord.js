import React, { useState } from 'react';
import { db, auth, doc, setDoc, serverTimestamp, collection, addDoc } from './firebase';

// --- ICONS ---
const BackIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const PlusIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
const TrashIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

function YogurtFinalTimeCutRecord({ onBack, isEditing = false, onSave, originalForm, onSubmit }) {
    const [formData, setFormData] = useState({
        date: originalForm?.date || new Date().toISOString().split('T')[0],
        lotNumbers: originalForm?.lotNumbers || [''],
        performedByCut: originalForm?.performedByCut || '',
        performedByPh: originalForm?.performedByPh || ''
    });

    const [finalCutData, setFinalCutData] = useState(originalForm?.finalCutData || Array(5).fill().map(() => ({
        timeCut: '',
        phCut: '',
        processComments: ''
    })));

    const [phMonitoringData, setPhMonitoringData] = useState(() => {
        if (originalForm?.phMonitoringData) {
            // Convert flattened data back to nested structure
            const nestedData = Array(5).fill().map(() => Array(5).fill().map(() => ({ time: '', ph: '' })));
            originalForm.phMonitoringData.forEach(reading => {
                if (reading.tankIndex !== undefined && reading.readingIndex !== undefined) {
                    nestedData[reading.tankIndex][reading.readingIndex] = {
                        time: reading.time || '',
                        ph: reading.ph || ''
                    };
                }
            });
            return nestedData;
        }
        return Array(5).fill().map(() => Array(5).fill().map(() => ({ time: '', ph: '' })));
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLotNumberChange = (index, value) => {
        const newLotNumbers = [...formData.lotNumbers];
        newLotNumbers[index] = value;
        setFormData(prev => ({ ...prev, lotNumbers: newLotNumbers }));
    };

    const addLotNumber = () => {
        setFormData(prev => ({ 
            ...prev, 
            lotNumbers: [...prev.lotNumbers, ''] 
        }));
    };

    const removeLotNumber = (index) => {
        if (formData.lotNumbers.length > 1) {
            const newLotNumbers = formData.lotNumbers.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, lotNumbers: newLotNumbers }));
        }
    };

    const handleFinalCutChange = (tankIndex, field, value) => {
        const newFinalCutData = [...finalCutData];
        newFinalCutData[tankIndex] = { ...newFinalCutData[tankIndex], [field]: value };
        setFinalCutData(newFinalCutData);
    };

    const handlePhMonitoringChange = (tankIndex, rowIndex, field, value) => {
        const newPhMonitoringData = [...phMonitoringData];
        newPhMonitoringData[tankIndex][rowIndex] = { 
            ...newPhMonitoringData[tankIndex][rowIndex], 
            [field]: value 
        };
        setPhMonitoringData(newPhMonitoringData);
    };

    const setToday = () => {
        setFormData(prev => ({ ...prev, date: new Date().toISOString().split('T')[0] }));
    };

    const handleSaveForLater = async () => {
        const user = auth.currentUser;

        // Convert nested arrays to a flat structure for Firestore
        const flattenedPhMonitoringData = phMonitoringData.map((tank, tankIndex) => 
            tank.map((reading, readingIndex) => ({
                tankIndex,
                readingIndex,
                time: reading.time,
                ph: reading.ph
            }))
        ).flat();

        const savedData = {
            ...formData,
            finalCutData,
            phMonitoringData: flattenedPhMonitoringData,
            formTitle: "F-03: Yogurt Final Time and Cut Record",
            formType: 'yogurtFinalTimeCut',
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

        // Convert nested arrays to a flat structure for Firestore
        const flattenedPhMonitoringData = phMonitoringData.map((tank, tankIndex) => 
            tank.map((reading, readingIndex) => ({
                tankIndex,
                readingIndex,
                time: reading.time,
                ph: reading.ph
            }))
        ).flat();

        const finalData = {
            ...formData,
            finalCutData,
            phMonitoringData: flattenedPhMonitoringData,
            formTitle: "F-03: Yogurt Final Time and Cut Record",
            formType: 'yogurtFinalTimeCut',
            submittedBy: user?.email || 'Unknown User',
            submittedAt: serverTimestamp(),
            status: "Pending Review"
        };
        
        if (onSubmit) {
            await onSubmit(finalData);
            return;
        }
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
                    <h1 className="text-xl font-bold text-white truncate">F-03: Yogurt Final Time and Cut Record</h1>
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
                                    <label className="block text-sm font-medium text-gray-600">Performed by (Cut)</label>
                                    <input 
                                        type="text" 
                                        name="performedByCut" 
                                        value={formData.performedByCut} 
                                        onChange={handleInputChange} 
                                        placeholder="Enter initials" 
                                        className="w-full bg-white border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors" 
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Lot Numbers */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg border">
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-700">Lot Number(s)</h3>
                                <button 
                                    type="button" 
                                    onClick={addLotNumber}
                                    className="flex items-center space-x-1 px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                                >
                                    <PlusIcon />
                                    <span>Add Lot</span>
                                </button>
                            </div>
                            <div className="space-y-3">
                                {formData.lotNumbers.map((lotNumber, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        <input 
                                            type="text" 
                                            value={lotNumber} 
                                            onChange={(e) => handleLotNumberChange(index, e.target.value)} 
                                            placeholder={`Lot Number ${index + 1}`} 
                                            className="flex-1 bg-white border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors" 
                                            required
                                        />
                                        {formData.lotNumbers.length > 1 && (
                                            <button 
                                                type="button" 
                                                onClick={() => removeLotNumber(index)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <TrashIcon />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Yogurt Final Cut */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg border">
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                            <h3 className="text-lg font-semibold mb-4 text-gray-700">Yogurt Final Cut</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm border-collapse">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="p-3 border border-gray-300 text-left font-semibold text-gray-700">Tank</th>
                                            <th className="p-3 border border-gray-300 text-left font-semibold text-gray-700">Time Cut</th>
                                            <th className="p-3 border border-gray-300 text-left font-semibold text-gray-700">pH Cut</th>
                                            <th className="p-3 border border-gray-300 text-left font-semibold text-gray-700">Process Comments</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {finalCutData.map((tank, index) => (
                                            <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                                <td className="p-3 border border-gray-300 bg-gray-50 font-medium text-center">
                                                    {index + 1}
                                                </td>
                                                <td className="p-3 border border-gray-300">
                                                    <input 
                                                        type="time" 
                                                        value={tank.timeCut} 
                                                        onChange={(e) => handleFinalCutChange(index, 'timeCut', e.target.value)} 
                                                        className="w-full bg-white border-2 border-gray-300 rounded px-2 py-1 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors" 
                                                    />
                                                </td>
                                                <td className="p-3 border border-gray-300">
                                                    <input 
                                                        type="text" 
                                                        value={tank.phCut} 
                                                        onChange={(e) => handleFinalCutChange(index, 'phCut', e.target.value)} 
                                                        placeholder="pH value" 
                                                        className="w-full bg-white border-2 border-gray-300 rounded px-2 py-1 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors" 
                                                    />
                                                </td>
                                                <td className="p-3 border border-gray-300">
                                                    <input 
                                                        type="text" 
                                                        value={tank.processComments} 
                                                        onChange={(e) => handleFinalCutChange(index, 'processComments', e.target.value)} 
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

                    {/* pH Monitoring - Mobile Optimized */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg border">
                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-700">Yogurt pH Monitoring</h3>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-600">Performed by (pH)</label>
                                    <input 
                                        type="text" 
                                        name="performedByPh" 
                                        value={formData.performedByPh} 
                                        onChange={handleInputChange} 
                                        placeholder="Enter initials" 
                                        className="w-full bg-white border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-colors" 
                                        required
                                    />
                                </div>
                            </div>
                            
                            {/* Mobile-friendly pH monitoring grid */}
                            <div className="space-y-4">
                                {phMonitoringData.map((tank, tankIndex) => (
                                    <div key={tankIndex} className="bg-white p-4 rounded-lg border border-orange-200">
                                        <h4 className="font-bold text-center mb-3 text-gray-700">Tank {tankIndex + 1}</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                                            {tank.map((reading, readingIndex) => (
                                                <div key={readingIndex} className="bg-gray-50 p-2 rounded border">
                                                    <div className="text-xs font-medium text-gray-600 mb-1">Reading {readingIndex + 1}</div>
                                                    <div className="space-y-1">
                                                        <input 
                                                            type="time" 
                                                            value={reading.time} 
                                                            onChange={(e) => handlePhMonitoringChange(tankIndex, readingIndex, 'time', e.target.value)} 
                                                            className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-xs focus:border-orange-500 focus:ring-1 focus:ring-orange-200 transition-colors" 
                                                            placeholder="Time"
                                                        />
                                                        <input 
                                                            type="text" 
                                                            value={reading.ph} 
                                                            onChange={(e) => handlePhMonitoringChange(tankIndex, readingIndex, 'ph', e.target.value)} 
                                                            className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-xs focus:border-orange-500 focus:ring-1 focus:ring-orange-200 transition-colors" 
                                                            placeholder="pH"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg border">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button 
                                type="button"
                                onClick={handleSaveForLater}
                                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:from-yellow-600 hover:to-orange-600 transform hover:scale-105 transition-all duration-200 text-lg"
                            >
                                Save for Later
                            </button>
                            <button 
                                type="submit" 
                                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 text-lg"
                            >
                                Submit for Review
                            </button>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
}

export default YogurtFinalTimeCutRecord; 