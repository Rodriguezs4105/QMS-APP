import React from 'react';
import { db, doc, deleteDoc } from './firebase';

// --- ICONS ---
const BackIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const DeleteIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

function FormViewer({ form, onBack, onDelete }) {
    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this archived form? This action cannot be undone.')) {
            try {
                await deleteDoc(doc(db, "completedForms", form.id));
                alert('Form deleted successfully!');
                onDelete && onDelete();
                onBack();
            } catch (error) {
                console.error("Error deleting form: ", error);
                alert("Error deleting form. Please try again.");
            }
        }
    };

    return (
        <div>
            <header className="bg-gradient-to-r from-purple-600 to-pink-500 p-4 pt-6 shadow-lg sticky top-0 z-20">
                <div className="flex justify-between items-center">
                    <button onClick={onBack} className="text-white p-2 -ml-2"><BackIcon /></button>
                    <h1 className="text-xl font-bold text-white truncate">Archived Form</h1>
                    <button 
                        onClick={handleDelete}
                        className="text-white p-2 hover:bg-red-500 rounded-lg transition-colors"
                        title="Delete Form"
                    >
                        <DeleteIcon />
                    </button>
                </div>
            </header>
            
            <main className="p-4">
                <div className="max-w-5xl mx-auto bg-white p-4 sm:p-8 rounded-lg shadow-lg border">
                    <div className="space-y-6">
                        {/* Form Header Info */}
                        <div className="bg-gray-100 p-4 rounded-lg border">
                            <h2 className="text-lg font-medium text-gray-700 mb-2">{form.formTitle || "F-06: Dynamic Yogurt Batch Sheet"}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div><strong>Status:</strong> <span className="text-green-600">{form.status}</span></div>
                                <div><strong>Submitted by:</strong> {form.submittedBy || form.batchBy}</div>
                                <div><strong>Submitted at:</strong> {form.submittedAt?.toDate?.()?.toLocaleString() || 'N/A'}</div>
                            </div>
                        </div>

                        {/* Form Information */}
                        <div className="bg-blue-50 p-4 rounded-lg border">
                            <h3 className="text-lg font-semibold mb-3">Form Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {form.recipeName && <div><strong>Recipe:</strong> {form.recipeName}</div>}
                                {form.batchDate && <div><strong>Batch Date:</strong> {form.batchDate}</div>}
                                {form.batchBy && <div><strong>Batch By:</strong> {form.batchBy}</div>}
                                {form.batchNumber && <div><strong>Batch Number:</strong> {form.batchNumber}</div>}
                                {form.date && <div><strong>Date:</strong> {form.date}</div>}
                                {form.lotNumbers && <div><strong>Lot Numbers:</strong> {form.lotNumbers.join(', ')}</div>}
                                {form.performedByCut && <div><strong>Performed by (Cut):</strong> {form.performedByCut}</div>}
                                {form.performedByPh && <div><strong>Performed by (pH):</strong> {form.performedByPh}</div>}
                                {form.performedByMixing && <div><strong>Performed by (Mixing):</strong> {form.performedByMixing}</div>}
                                {form.performedByPasteurization && <div><strong>Performed by (Pasteurization):</strong> {form.performedByPasteurization}</div>}
                                {form.batchBy && <div><strong>Batch By:</strong> {form.batchBy}</div>}
                                {form.batchSize && <div><strong>Batch Size:</strong> {form.batchSize}</div>}
                                {form.batchRecipe && <div><strong>Batch Recipe:</strong> {form.batchRecipe}</div>}
                            </div>
                        </div>

                        {/* Calculated Values */}
                        {form.calculatedValues && (
                            <div className="bg-green-50 p-4 rounded-lg border">
                                <h3 className="text-lg font-semibold mb-3">Calculated Values</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><strong>Shelf Life:</strong> {form.calculatedValues.shelfLife}</div>
                                    <div><strong>Expiry Date:</strong> {form.calculatedValues.expiryDate}</div>
                                    <div><strong>Lot Number:</strong> {form.calculatedValues.lotNumber}</div>
                                    <div><strong>Theoretical Yield:</strong> {form.calculatedValues.theoreticalYield}</div>
                                </div>
                            </div>
                        )}

                        {/* Mixing Tank */}
                        {form.mixingTank && form.mixingTank.length > 0 && (
                            <div className="bg-yellow-50 p-4 rounded-lg border">
                                <h3 className="text-lg font-semibold mb-3">Mixing Tank</h3>
                                <div className="flex flex-wrap gap-2">
                                    {form.mixingTank.map(tank => (
                                        <span key={tank} className="bg-yellow-200 px-3 py-1 rounded-full text-sm font-medium">
                                            Tank {tank}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Base Ingredient */}
                        {form.baseIngredientAmount && (
                            <div className="bg-purple-50 p-4 rounded-lg border">
                                <h3 className="text-lg font-semibold mb-3">Base Ingredient</h3>
                                <div><strong>Amount:</strong> {form.baseIngredientAmount} kg</div>
                            </div>
                        )}

                        {/* Ingredients Table */}
                        {form.ingredients && form.ingredients.length > 0 && (
                            <div className="bg-white p-4 rounded-lg border">
                                <h3 className="text-lg font-semibold mb-3">Ingredients</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm border-collapse">
                                        <thead className="bg-gray-200">
                                            <tr>
                                                <th className="p-2 border text-left">Code</th>
                                                <th className="p-2 border text-left">Ingredient</th>
                                                <th className="p-2 border text-left">Target Amount</th>
                                                <th className="p-2 border text-left">Actual Use</th>
                                                <th className="p-2 border text-left">Lot #</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {form.ingredients.map((ing, index) => (
                                                <tr key={index} className="border-b">
                                                    <td className="p-2">{ing.code}</td>
                                                    <td className="p-2">{ing.name}</td>
                                                    <td className="p-2">{ing.targetAmount} {ing.isRatio ? 'kg' : ''}</td>
                                                    <td className="p-2">{ing.actualUse}</td>
                                                    <td className="p-2">{ing.lot}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Transfer and Yield */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {form.transferTo && form.transferTo.length > 0 && (
                                <div className="bg-orange-50 p-4 rounded-lg border">
                                    <h3 className="text-lg font-semibold mb-3">Batch Transferred To</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {form.transferTo.map(tank => (
                                            <span key={tank} className="bg-orange-200 px-3 py-1 rounded-full text-sm font-medium">
                                                {tank}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {(form.batchYield || form.yieldPerformedBy) && (
                                <div className="bg-teal-50 p-4 rounded-lg border">
                                    <h3 className="text-lg font-semibold mb-3">Batch Yield</h3>
                                    <div className="space-y-2">
                                        {form.batchYield && <div><strong>Yield:</strong> {form.batchYield}</div>}
                                        {form.yieldPerformedBy && <div><strong>Performed by:</strong> {form.yieldPerformedBy}</div>}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Yogurt Final Cut Data */}
                        {form.finalCutData && (
                            <div className="bg-purple-50 p-4 rounded-lg border">
                                <h3 className="text-lg font-semibold mb-3">Yogurt Final Cut</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm border-collapse">
                                        <thead className="bg-gray-200">
                                            <tr>
                                                <th className="p-2 border text-left">Tank</th>
                                                <th className="p-2 border text-left">Time Cut</th>
                                                <th className="p-2 border text-left">pH Cut</th>
                                                <th className="p-2 border text-left">Process Comments</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {form.finalCutData.map((tank, index) => (
                                                <tr key={index} className="border-b">
                                                    <td className="p-2 border font-medium">{index + 1}</td>
                                                    <td className="p-2 border">{tank.timeCut}</td>
                                                    <td className="p-2 border">{tank.phCut}</td>
                                                    <td className="p-2 border">{tank.processComments}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* pH Monitoring Data */}
                        {form.phMonitoringData && (
                            <div className="bg-orange-50 p-4 rounded-lg border">
                                <h3 className="text-lg font-semibold mb-3">Yogurt pH Monitoring</h3>
                                <div className="space-y-4">
                                    {form.phMonitoringData.map((tank, tankIndex) => (
                                        <div key={tankIndex} className="bg-white p-3 rounded border">
                                            <h4 className="font-bold text-center mb-2">Tank {tankIndex + 1}</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                                                {tank.map((reading, readingIndex) => (
                                                    <div key={readingIndex} className="bg-gray-50 p-2 rounded text-xs">
                                                        <div className="font-medium mb-1">Reading {readingIndex + 1}</div>
                                                        <div><strong>Time:</strong> {reading.time}</div>
                                                        <div><strong>pH:</strong> {reading.ph}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Mixing Tanks Data */}
                        {form.mixingTanksData && (
                            <div className="bg-purple-50 p-4 rounded-lg border">
                                <h3 className="text-lg font-semibold mb-3">Milk Mixing Tanks</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm border-collapse">
                                        <thead className="bg-gray-200">
                                            <tr>
                                                <th className="p-2 border text-left">Tank</th>
                                                <th className="p-2 border text-left">Quantity (Liters)</th>
                                                <th className="p-2 border text-left">Time</th>
                                                <th className="p-2 border text-left">Temp (°C)</th>
                                                <th className="p-2 border text-left">Product Name</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {form.mixingTanksData.map((tank, index) => (
                                                <tr key={index} className="border-b">
                                                    <td className="p-2 border font-medium">{tank.tank}</td>
                                                    <td className="p-2 border">{tank.quantity}</td>
                                                    <td className="p-2 border">{tank.time}</td>
                                                    <td className="p-2 border">{tank.temp}</td>
                                                    <td className="p-2 border">{tank.productName}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Fermentation Tanks Data */}
                        {form.fermentationTanksData && (
                            <div className="bg-orange-50 p-4 rounded-lg border">
                                <h3 className="text-lg font-semibold mb-3">Pasteurization to Fermentation Tanks</h3>
                                <div className="space-y-4">
                                    {form.fermentationTanksData.map((tank, index) => (
                                        <div key={index} className="bg-white p-3 rounded border">
                                            <h4 className="font-bold text-center mb-2">Fermentation Tank {index + 1}</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                                                <div><strong>Product In:</strong> {tank.productInTime}</div>
                                                <div><strong>Culture In:</strong> {tank.cultureInTime}</div>
                                                <div><strong>Stop:</strong> {tank.stopTime}</div>
                                                <div><strong>Agitation:</strong> {tank.agitationTime}</div>
                                                <div><strong>Yogurt Type:</strong> {tank.yogurtType}</div>
                                                <div><strong>Source Tank:</strong> {tank.sourceMixingTank}</div>
                                                {tank.cutTime && (
                                                    <div className="col-span-full bg-yellow-100 p-2 rounded border">
                                                        <strong>Cut Time (Stop + 4h):</strong> {tank.cutTime}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Corrective Actions */}
                        {form.correctiveActions && (
                            <div className="bg-red-50 p-4 rounded-lg border">
                                <h3 className="text-lg font-semibold mb-3">Corrective Actions</h3>
                                <div className="bg-white p-3 rounded border">
                                    <p className="text-sm whitespace-pre-wrap">{form.correctiveActions}</p>
                                </div>
                            </div>
                        )}

                        {/* Main Batching Process Data */}
                        {form.mainBatchingData && (
                            <div className="bg-green-50 p-4 rounded-lg border">
                                <h3 className="text-lg font-semibold mb-3">Yogurt Batching Process</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm border-collapse">
                                        <thead className="bg-gray-200">
                                            <tr>
                                                <th className="p-2 border text-left">Steps</th>
                                                <th className="p-2 border text-left">QC Parameters</th>
                                                <th className="p-2 border text-left">Start Time</th>
                                                <th className="p-2 border text-left">End Time</th>
                                                <th className="p-2 border text-left">Comments</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {form.mainBatchingData.map((step, index) => (
                                                <tr key={index} className="border-b">
                                                    <td className="p-2 border font-medium">{step.step}</td>
                                                    <td className="p-2 border">{step.qc}</td>
                                                    <td className="p-2 border">{step.startTime}</td>
                                                    <td className="p-2 border">{step.endTime}</td>
                                                    <td className="p-2 border">{step.comments}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Mixing / Sheer Data */}
                        {form.mixingSheerData && (
                            <div className="bg-purple-50 p-4 rounded-lg border">
                                <h3 className="text-lg font-semibold mb-3">Mixing / Sheer</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm border-collapse">
                                        <thead className="bg-gray-200">
                                            <tr>
                                                <th className="p-2 border text-left">Steps</th>
                                                <th className="p-2 border text-left">QC Parameters</th>
                                                <th className="p-2 border text-left">Start Time</th>
                                                <th className="p-2 border text-left">End Time</th>
                                                <th className="p-2 border text-left">Comments</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {form.mixingSheerData.map((step, index) => (
                                                <tr key={index} className="border-b">
                                                    <td className="p-2 border font-medium">{step.step}</td>
                                                    <td className="p-2 border">{step.qc}</td>
                                                    <td className="p-2 border">{step.startTime}</td>
                                                    <td className="p-2 border">{step.endTime}</td>
                                                    <td className="p-2 border">{step.comments}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Delete Warning */}
                        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">Delete Form</h3>
                                    <div className="mt-2 text-sm text-red-700">
                                        <p>This action will permanently delete this archived form. This cannot be undone.</p>
                                    </div>
                                    <div className="mt-4">
                                        <button
                                            onClick={handleDelete}
                                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                            Delete Form
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default FormViewer; 