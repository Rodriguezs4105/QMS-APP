import React, { useState, useEffect } from 'react';
import { db, doc, updateDoc, serverTimestamp, auth } from './firebase';
import BatchSheet from './BatchSheet';

const BackIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;

function FormEditor({ form, onBack }) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(null);

    useEffect(() => {
        // Prepare the form data for editing
        if (form) {
            setFormData({
                ...form,
                // Reset status and remove rejection info
                status: "Pending Review",
                rejectionReason: null,
                rejectedBy: null,
                rejectedAt: null,
                // Update submission info
                submittedAt: serverTimestamp(),
                resubmittedBy: auth.currentUser?.email || 'Unknown User',
                resubmittedAt: serverTimestamp()
            });
        }
    }, [form]);

    const handleSave = async (updatedFormData) => {
        try {
            const formRef = doc(db, "completedForms", form.id);
            await updateDoc(formRef, {
                ...updatedFormData,
                status: "Pending Review",
                rejectionReason: null,
                rejectedBy: null,
                rejectedAt: null,
                resubmittedBy: auth.currentUser?.email || 'Unknown User',
                resubmittedAt: serverTimestamp()
            });
            alert("Form updated and resubmitted for review!");
            onBack();
        } catch (error) {
            console.error("Error updating form: ", error);
            alert("Error updating form. See console for details.");
        }
    };

    if (!formData) {
        return <div className="p-4 text-center">Loading form data...</div>;
    }

    return (
        <div>
            <header className="bg-gradient-to-r from-orange-600 to-red-500 p-4 pt-6 shadow-lg sticky top-0 z-20">
                <div className="flex justify-between items-center">
                    <button onClick={onBack} className="text-white p-2 -ml-2"><BackIcon /></button>
                    <h1 className="text-xl font-bold text-white truncate">Edit Rejected Form</h1>
                    <div className="w-6"></div>
                </div>
                <div className="mt-2 text-white/90 text-sm">
                    <p>Rejection Reason: {form.rejectionReason}</p>
                    <p>Rejected by: {form.rejectedBy}</p>
                </div>
            </header>
            
            <BatchSheet 
                formTemplate={formData} 
                onBack={onBack}
                isEditing={true}
                onSave={handleSave}
                originalForm={form}
            />
        </div>
    );
}

export default FormEditor; 