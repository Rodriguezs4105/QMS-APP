import React, { useState, useEffect } from 'react';
// 🔧 FIX: Added 'query' to the import list from Firebase.
import { db, auth, collection, query, where, onSnapshot } from './firebase';
import { getAuditTrailByDateRange } from './utils/auditTrail';

const CheckBadgeIcon = () => <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>;
const ChevronRightIcon = () => <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>;

function ManagerDashboard({ onFormSelect, onSavedFormSelect }) {
    const [pendingForms, setPendingForms] = useState([]);
    const [savedForms, setSavedForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savedFormsLoading, setSavedFormsLoading] = useState(true);
    const [auditStats, setAuditStats] = useState({
        totalActions: 0,
        todayActions: 0,
        approvals: 0,
        rejections: 0
    });
    const [rejectedForms, setRejectedForms] = useState([]);

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

    // Load saved forms for the current manager
    useEffect(() => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const q = query(
            collection(db, "savedForms"), 
            where("savedBy", "==", currentUser.email)
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const savedFormsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSavedForms(savedFormsData);
            setSavedFormsLoading(false);
        }, (error) => {
            console.error("Error fetching saved forms: ", error);
            setSavedFormsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Load audit trail statistics
    useEffect(() => {
        const loadAuditStats = async () => {
            try {
                const today = new Date();
                const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
                
                const todayEntries = await getAuditTrailByDateRange(startOfDay, endOfDay);
                
                const stats = {
                    totalActions: todayEntries.length,
                    todayActions: todayEntries.length,
                    approvals: todayEntries.filter(entry => entry.action === 'FORM_APPROVED').length,
                    rejections: todayEntries.filter(entry => entry.action === 'FORM_REJECTED').length
                };
                
                setAuditStats(stats);
            } catch (error) {
                console.error('Error loading audit stats:', error);
            }
        };

        loadAuditStats();
    }, []);

    // Load rejected forms for the current manager
    useEffect(() => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        const q = query(
            collection(db, "completedForms"),
            where("status", "==", "Rejected"),
            where("submittedBy", "==", currentUser.email)
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const rejectedFormsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setRejectedForms(rejectedFormsData);
        }, (error) => {
            console.error("Error fetching rejected forms: ", error);
        });
        return () => unsubscribe();
    }, []);

    return (
        <div>
            <header className="bg-gradient-to-r from-orange-600 to-red-500 p-4 pt-6 shadow-lg sticky top-0 z-10">
                <div className="flex justify-center items-center">
                    <h1 className="text-2xl font-bold text-white">Manager Hub</h1>
                </div>
            </header>
            <main className="p-4">
                {rejectedForms.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-3">Rejected Forms (Action Required)</h2>
                        <div className="bg-white rounded-2xl shadow-md">
                            <ul className="divide-y divide-gray-200">
                                {rejectedForms.map(form => (
                                    <li key={form.id} onClick={() => onFormSelect(form)} className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50">
                                        <div className="flex items-center">
                                            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-1.414 1.414M6.343 17.657l-1.415 1.415M5.636 5.636l1.415 1.414M17.657 17.657l1.414 1.415M12 8v4m0 4h.01" /></svg>
                                            <div className="ml-3">
                                                <p className="font-bold text-gray-800">{form.formTitle || form.recipeName}</p>
                                                <p className="text-sm text-red-600">Rejected: {form.rejectionReason}</p>
                                                <p className="text-xs text-gray-500">Click to edit and resubmit</p>
                                            </div>
                                        </div>
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
                {/* Audit Trail Statistics */}
                <div className="bg-white rounded-2xl shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Today's Activity</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{auditStats.totalActions}</div>
                            <div className="text-sm text-gray-600">Total Actions</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{auditStats.approvals}</div>
                            <div className="text-sm text-gray-600">Approvals</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{auditStats.rejections}</div>
                            <div className="text-sm text-gray-600">Rejections</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{pendingForms.length}</div>
                            <div className="text-sm text-gray-600">Pending Review</div>
                        </div>
                    </div>
                </div>

                {/* Pending Forms */}
                <div className="bg-white rounded-2xl shadow-md">
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800">Forms Pending Review</h2>
                    </div>
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

                {/* Saved Forms */}
                <div className="bg-white rounded-2xl shadow-md">
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800">My Saved Forms</h2>
                    </div>
                    <ul className="divide-y divide-gray-200">
                        {savedFormsLoading && <li className="p-4 text-center text-gray-500">Loading saved forms...</li>}
                        {!savedFormsLoading && savedForms.length === 0 && (
                            <li className="p-4 text-center text-gray-500">No saved forms found.</li>
                        )}
                        {savedForms.map(form => (
                            <li key={form.id} onClick={() => onSavedFormSelect(form)} className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50">
                                <div>
                                    <p className="font-bold text-gray-800">{form.recipeName}</p>
                                    <p className="text-sm text-gray-600">Saved by: {form.savedBy || 'N/A'}</p>
                                    <p className="text-xs text-gray-400">Date: {form.batchDate}</p>
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        Saved for Later
                                    </span>
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