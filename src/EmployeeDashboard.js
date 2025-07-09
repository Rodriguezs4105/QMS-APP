import React, { useState, useEffect } from 'react';
// 🔧 FIX: Ensured 'query', 'where', and 'onSnapshot' are imported.
import { db, addDoc, collection, serverTimestamp, query, where, onSnapshot } from './firebase';

const DocumentPlusIcon = () => <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const ClipboardIcon = () => <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>;
const AlertTriangleIcon = () => <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;

function EmployeeDashboard({ onNavigate, onFormSelect }) {
    const [rejectedForms, setRejectedForms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "completedForms"), where("status", "==", "Rejected"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setRejectedForms(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleAddBatchSheetTemplate = async () => {
        try {
            await addDoc(collection(db, "forms"), {
                title: "Dynamic Yogurt Batch Sheet",
                category: "Yogurt",
                formType: "batchSheet",
                status: "template",
                createdAt: serverTimestamp()
            });
            alert("Batch Sheet template added to the 'Yogurt' category.");
        } catch (error) {
            console.error("Error adding template: ", error);
            alert("Failed to add template.");
        }
    };

    return (
        <div>
            <header className="bg-gradient-to-r from-purple-600 to-pink-500 p-4 pt-6 shadow-lg sticky top-0 z-10">
                <div className="flex justify-center items-center">
                    <h1 className="text-2xl font-bold text-white">Employee Hub</h1>
                </div>
            </header>
            <main className="p-4">
                {rejectedForms.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-3">Action Required</h2>
                        <div className="bg-white rounded-2xl shadow-md">
                            <ul className="divide-y divide-gray-200">
                                {rejectedForms.map(form => (
                                    <li key={form.id} onClick={() => onFormSelect(form)} className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50">
                                        <div className="flex items-center">
                                            <AlertTriangleIcon />
                                            <div className="ml-3">
                                                <p className="font-bold text-gray-800">{form.recipeName}</p>
                                                <p className="text-sm text-red-600">Rejected: {form.rejectionReason}</p>
                                                <p className="text-xs text-gray-500">Click to edit and resubmit</p>
                                            </div>
                                        </div>
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
                <div className="grid grid-cols-1 gap-4">
                    <div onClick={() => onNavigate('Forms')} className="p-6 rounded-2xl shadow-lg text-white bg-gradient-to-r from-blue-500 to-cyan-500 cursor-pointer">
                        <div className="flex items-center">
                            <DocumentPlusIcon />
                            <p className="ml-4 text-2xl font-bold">Start a New Form</p>
                        </div>
                    </div>
                    <div className="p-6 rounded-2xl shadow-lg text-white bg-gradient-to-r from-green-500 to-emerald-500">
                        <div className="flex items-center">
                            <ClipboardIcon />
                            <p className="ml-4 text-2xl font-bold">View My Recent Forms</p>
                        </div>
                    </div>
                </div>
                {/* Developer Tools removed as requested */}
            </main>
        </div>
    );
}

export default EmployeeDashboard;