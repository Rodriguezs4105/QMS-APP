import React, { useState, useEffect } from 'react';
// 🔧 FIX: Added 'query' to the import list from Firebase.
import { db, collection, query, where, onSnapshot } from './firebase';

const CheckBadgeIcon = () => <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>;
const ChevronRightIcon = () => <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>;

function ManagerDashboard({ onFormSelect }) {
    const [pendingForms, setPendingForms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(
            collection(db, "completedForms"), 
            where("status", "==", "Pending Review")
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const formsToReview = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPendingForms(formsToReview);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching forms for review: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div>
            <header className="bg-gradient-to-r from-purple-600 to-pink-500 p-4 pt-6 shadow-lg sticky top-0 z-10">
                <div className="flex justify-center items-center">
                    <h1 className="text-2xl font-bold text-white">Manager Verification Hub</h1>
                </div>
            </header>
            <main className="p-4">
                <div className="bg-white rounded-2xl shadow-md">
                    <ul className="divide-y divide-gray-200">
                        {loading && <li className="p-4 text-center text-gray-500">Loading forms...</li>}
                        {!loading && pendingForms.length === 0 && (
                            <li className="p-4 text-center text-gray-500">No forms are currently pending review.</li>
                        )}
                        {pendingForms.map(form => (
                            <li key={form.id} onClick={() => onFormSelect(form)} className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50">
                                <div>
                                    <p className="font-bold text-gray-800">{form.recipeName}</p>
                                    <p className="text-sm text-gray-600">Submitted by: {form.batchBy || 'N/A'}</p>
                                    <p className="text-xs text-gray-400">Date: {form.batchDate}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckBadgeIcon />
                                    <ChevronRightIcon />
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </main>
        </div>
    );
}

export default ManagerDashboard;