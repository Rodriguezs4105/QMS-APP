import React, { useState, useEffect } from 'react';
import { db, auth, doc, setDoc, serverTimestamp, collection } from './firebase';

// --- ICONS ---
const BackIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const PlusIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
const TrashIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const ClockIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

function YogurtPasteurizationMonitoring({ onBack, isEditing = false, onSave, originalForm }) {
    const [formData, setFormData] = useState({
        date: originalForm?.date || new Date().toISOString().split('T')[0],
        lotCodes: originalForm?.lotCodes || [''],
        performedByMixing: originalForm?.performedByMixing || '',
        performedByPasteurization: originalForm?.performedByPasteurization || '',
        correctiveActions: originalForm?.correctiveActions || ''
    });

    const [mixingTanksData, setMixingTanksData] = useState(originalForm?.mixingTanksData || [
        { tank: 'MIXING TANK-1', quantity: '', time: '', temp: '', productName: '' },
        { tank: 'MIXING TANK-2', quantity: '', time: '', temp: '', productName: '' }
    ]);

    const [fermentationTanksData, setFermentationTanksData] = useState(originalForm?.fermentationTanksData || 
        Array(5).fill().map(() => ({
            productInTime: '',
            cultureInTime: '',
            stopTime: '',
            agitationTime: '',
            yogurtType: '',
            sourceMixingTank: '',
            cutTime: ''
        }))
    );

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLotCodeChange = (index, value) => {
        const newLotCodes = [...formData.lotCodes];
        newLotCodes[index] = value;
        setFormData(prev => ({ ...prev, lotCodes: newLotCodes }));
    };

    const addLotCode = () => {
        setFormData(prev => ({ 
            ...prev, 
            lotCodes: [...prev.lotCodes, ''] 
        }));
    };

    const removeLotCode = (index) => {
        if (formData.lotCodes.length > 1) {
            const newLotCodes = formData.lotCodes.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, lotCodes: newLotCodes }));
        }
    };

    const handleMixingTankChange = (index, field, value) => {
        const newMixingTanksData = [...mixingTanksData];
        newMixingTanksData[index] = { ...newMixingTanksData[index], [field]: value };
        setMixingTanksData(newMixingTanksData);
    };

    const handleFermentationTankChange = (index, field, value) => {
        const newFermentationTanksData = [...fermentationTanksData];
        newFermentationTanksData[index] = { ...newFermentationTanksData[index], [field]: value };
        
        // Calculate cut time when stop time changes (stop time + 4 hours)
        if (field === 'stopTime' && value) {
            const stopTime = new Date(`2000-01-01T${value}`);
            stopTime.setHours(stopTime.getHours() + 4);
            const cutTime = stopTime.toTimeString().slice(0, 5);
            newFermentationTanksData[index].cutTime = cutTime;
        }
        
        setFermentationTanksData(newFermentationTanksData);
    };

    const setToday = () => {
        setFormData(prev => ({ ...prev, date: new Date().toISOString().split('T')[0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const user = auth.currentUser;

        const finalData = {
            ...formData,
            mixingTanksData,
            fermentationTanksData,
            formTitle: "F-04: Yogurt Pasteurization to Fermentation Monitoring Record",
            formType: 'yogurtPasteurizationMonitoring',
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
                    <h1 className="text-xl font-bold text-white truncate">F-04: Yogurt Pasteurization to Fermentation Monitoring Record</h1>
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
                                    <label className="block text-sm font-medium text-gray-600">Performed by (Mixing)</label>
                                    <input 
                                        type="text" 
                                        name="performedByMixing" 
                                        value={formData.performedByMixing} 
                                        onChange={handleInputChange} 
                                        placeholder="Enter initials" 
                                        className="w-full bg-white border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors" 
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Lot Codes */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg border">
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-700">Lot Code(s)</h3>
                                <button 
                                    type="button" 
                                    onClick={addLotCode}
                                    className="flex items-center space-x-1 px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                                >
                                    <PlusIcon />
                                    <span>Add Lot</span>
                                </button>
                            </div>
                            <div className="space-y-3">
                                {formData.lotCodes.map((lotCode, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        <input 
                                            type="text" 
                                            value={lotCode} 
                                            onChange={(e) => handleLotCodeChange(index, e.target.value)} 
                                            placeholder={`Lot Code ${index + 1}`} 
                                            className="flex-1 bg-white border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors" 
                                            required
                                        />
                                        {formData.lotCodes.length > 1 && (
                                            <button 
                                                type="button" 
                                                onClick={() => removeLotCode(index)}
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

                    {/* Milk Mixing Tanks */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg border">
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                            <h3 className="text-lg font-semibold mb-4 text-gray-700">Milk Mixing Tanks</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm border-collapse">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="p-3 border border-gray-300 text-left font-semibold text-gray-700">Tank</th>
                                            <th className="p-3 border border-gray-300 text-left font-semibold text-gray-700">Quantity (Liters)</th>
                                            <th className="p-3 border border-gray-300 text-left font-semibold text-gray-700">Time</th>
                                            <th className="p-3 border border-gray-300 text-left font-semibold text-gray-700">Temp (°C)</th>
                                            <th className="p-3 border border-gray-300 text-left font-semibold text-gray-700">Product Name</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {mixingTanksData.map((tank, index) => (
                                            <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                                <td className="p-3 border border-gray-300 bg-gray-50 font-medium">
                                                    {tank.tank}
                                                </td>
                                                <td className="p-3 border border-gray-300">
                                                    <input 
                                                        type="number" 
                                                        value={tank.quantity} 
                                                        onChange={(e) => handleMixingTankChange(index, 'quantity', e.target.value)} 
                                                        placeholder="Liters" 
                                                        className="w-full bg-white border-2 border-gray-300 rounded px-2 py-1 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors" 
                                                    />
                                                </td>
                                                <td className="p-3 border border-gray-300">
                                                    <input 
                                                        type="time" 
                                                        value={tank.time} 
                                                        onChange={(e) => handleMixingTankChange(index, 'time', e.target.value)} 
                                                        className="w-full bg-white border-2 border-gray-300 rounded px-2 py-1 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors" 
                                                    />
                                                </td>
                                                <td className="p-3 border border-gray-300">
                                                    <input 
                                                        type="text" 
                                                        value={tank.temp} 
                                                        onChange={(e) => handleMixingTankChange(index, 'temp', e.target.value)} 
                                                        placeholder="°C" 
                                                        className="w-full bg-white border-2 border-gray-300 rounded px-2 py-1 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors" 
                                                    />
                                                </td>
                                                <td className="p-3 border border-gray-300">
                                                    <input 
                                                        type="text" 
                                                        value={tank.productName} 
                                                        onChange={(e) => handleMixingTankChange(index, 'productName', e.target.value)} 
                                                        placeholder="Product name" 
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

                    {/* Pasteurization to Fermentation Tanks - Mobile Optimized */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg border">
                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-700">Pasteurization to Fermentation Tanks</h3>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-600">Performed by (Pasteurization)</label>
                                    <input 
                                        type="text" 
                                        name="performedByPasteurization" 
                                        value={formData.performedByPasteurization} 
                                        onChange={handleInputChange} 
                                        placeholder="Enter initials" 
                                        className="w-full bg-white border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-colors" 
                                        required
                                    />
                                </div>
                            </div>
                            
                            {/* Mobile-friendly fermentation tanks */}
                            <div className="space-y-4">
                                {fermentationTanksData.map((tank, index) => (
                                    <div key={index} className="bg-white p-4 rounded-lg border border-orange-200">
                                        <h4 className="font-bold text-center mb-3 text-gray-700">Fermentation Tank {index + 1}</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            <div className="space-y-2">
                                                <label className="block text-xs font-medium text-gray-600">Product In (Time)</label>
                                                <input 
                                                    type="time" 
                                                    value={tank.productInTime} 
                                                    onChange={(e) => handleFermentationTankChange(index, 'productInTime', e.target.value)} 
                                                    className="w-full bg-white border-2 border-gray-300 rounded px-2 py-1 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-colors" 
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-xs font-medium text-gray-600">Culture In (Time)</label>
                                                <input 
                                                    type="time" 
                                                    value={tank.cultureInTime} 
                                                    onChange={(e) => handleFermentationTankChange(index, 'cultureInTime', e.target.value)} 
                                                    className="w-full bg-white border-2 border-gray-300 rounded px-2 py-1 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-colors" 
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-xs font-medium text-gray-600">Stop (Time)</label>
                                                <input 
                                                    type="time" 
                                                    value={tank.stopTime} 
                                                    onChange={(e) => handleFermentationTankChange(index, 'stopTime', e.target.value)} 
                                                    className="w-full bg-white border-2 border-gray-300 rounded px-2 py-1 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-colors" 
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-xs font-medium text-gray-600">Agitation (Time)</label>
                                                <input 
                                                    type="time" 
                                                    value={tank.agitationTime} 
                                                    onChange={(e) => handleFermentationTankChange(index, 'agitationTime', e.target.value)} 
                                                    className="w-full bg-white border-2 border-gray-300 rounded px-2 py-1 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-colors" 
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-xs font-medium text-gray-600">Yogurt Type (Name)</label>
                                                <input 
                                                    type="text" 
                                                    value={tank.yogurtType} 
                                                    onChange={(e) => handleFermentationTankChange(index, 'yogurtType', e.target.value)} 
                                                    placeholder="Yogurt type" 
                                                    className="w-full bg-white border-2 border-gray-300 rounded px-2 py-1 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-colors" 
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-xs font-medium text-gray-600">Source Mixing Tank</label>
                                                <select 
                                                    value={tank.sourceMixingTank} 
                                                    onChange={(e) => handleFermentationTankChange(index, 'sourceMixingTank', e.target.value)} 
                                                    className="w-full bg-white border-2 border-gray-300 rounded px-2 py-1 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-colors"
                                                >
                                                    <option value="">Select Tank</option>
                                                    <option value="MIXING TANK-1">MIXING TANK-1</option>
                                                    <option value="MIXING TANK-2">MIXING TANK-2</option>
                                                </select>
                                            </div>
                                        </div>
                                        
                                        {/* Cut Time Display */}
                                        {tank.stopTime && tank.cutTime && (
                                            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                <div className="flex items-center space-x-2">
                                                    <ClockIcon className="text-yellow-600" />
                                                    <div>
                                                        <span className="text-sm font-medium text-yellow-800">Cut Time (Stop + 4 hours):</span>
                                                        <span className="ml-2 text-lg font-bold text-yellow-900">{tank.cutTime}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Corrective Actions */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg border">
                        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                            <h3 className="text-lg font-semibold mb-4 text-gray-700">Corrective Actions</h3>
                            <textarea 
                                name="correctiveActions" 
                                value={formData.correctiveActions} 
                                onChange={handleInputChange}
                                rows="4" 
                                placeholder="Enter any corrective actions taken..." 
                                className="w-full bg-white border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-colors"
                            />
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

export default YogurtPasteurizationMonitoring; 