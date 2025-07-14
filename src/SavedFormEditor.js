import React, { useState, useEffect } from 'react';
import { db, auth, doc, updateDoc, deleteDoc, serverTimestamp } from './firebase';
import FormRenderer from './FormRenderer';

// --- ICONS ---
const BackIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const DeleteIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

function SavedFormEditor({ savedForm, onBack }) {
    const [formTemplate, setFormTemplate] = useState(null);
    const [currentFormData, setCurrentFormData] = useState(null);

    useEffect(() => {
        // Create a form template object from the saved form data
        setFormTemplate({
            id: savedForm.formType,
            title: savedForm.formTitle,
            formType: savedForm.formType
        });
    }, [savedForm]);

    const handleSave = async (updatedFormData) => {
        try {
            const formRef = doc(db, "savedForms", savedForm.id);
            await updateDoc(formRef, {
                ...updatedFormData,
                savedAt: serverTimestamp()
            });
            setCurrentFormData(updatedFormData);
            alert("Form updated and saved!");
        } catch (error) {
            console.error("Error updating saved form: ", error);
            alert("Error updating form. See console for details.");
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this saved form? This action cannot be undone.")) return;
        try {
            await deleteDoc(doc(db, "savedForms", savedForm.id));
            alert("Saved form deleted successfully!");
            onBack();
        } catch (error) {
            console.error("Error deleting saved form: ", error);
            alert("Failed to delete saved form.");
        }
    };

    const handleSubmit = async () => {
        if (!currentFormData) {
            alert("Please save your changes first before submitting.");
            return;
        }
        
        try {
            // Delete from saved forms
            await deleteDoc(doc(db, "savedForms", savedForm.id));
            
            // Add to completed forms
            const { addDoc, collection } = await import('./firebase');
            await addDoc(collection(db, "completedForms"), {
                ...currentFormData,
                status: "Pending Review",
                submittedAt: serverTimestamp()
            });
            
            alert("Form submitted for review!");
            onBack();
        } catch (error) {
            console.error("Error submitting form: ", error);
            alert("Error submitting form. See console for details.");
        }
    };

    if (!formTemplate) {
        return <div className="p-4 text-center">Loading form...</div>;
    }

    return (
        <div>
            <header className="bg-gradient-to-r from-yellow-500 to-orange-500 p-4 pt-6 shadow-lg sticky top-0 z-20">
                <div className="flex justify-between items-center">
                    <button onClick={onBack} className="text-white p-2 -ml-2"><BackIcon /></button>
                    <h1 className="text-xl font-bold text-white truncate">Continue Editing: {savedForm.recipeName || savedForm.formTitle}</h1>
                    <button 
                        onClick={handleDelete}
                        className="text-white p-2 hover:bg-red-500 rounded-lg transition-colors"
                        title="Delete Saved Form"
                    >
                        <DeleteIcon />
                    </button>
                </div>
            </header>
            
            <div className="p-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-yellow-800 font-medium">This form was saved for later. You can continue editing or submit it when ready.</p>
                    </div>
                </div>
                
                <FormRenderer 
                    form={formTemplate} 
                    onBack={onBack}
                    isEditing={true}
                    onSave={handleSave}
                    originalForm={savedForm}
                    onSubmit={handleSubmit}
                />
            </div>
        </div>
    );
}

export default SavedFormEditor; 