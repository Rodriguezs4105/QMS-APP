import React, { useState, useEffect } from 'react';
// 🔧 FIX: Ensured 'query', 'where', and 'onSnapshot' are imported.
import { db, collection, query, where, onSnapshot } from './firebase';

const FolderIcon = () => <svg className="w-16 h-16 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path></svg>;
const DocumentIcon = () => <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>;
const BackIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const SearchIcon = () => <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path></svg>;

function Archive({ onFormSelect }) {
    const [approvedForms, setApprovedForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [view, setView] = useState('formTypes');
    const [selectedFormType, setSelectedFormType] = useState('');
    const [selectedDate, setSelectedDate] = useState('');

    useEffect(() => {
        const q = query(collection(db, "completedForms"), where("status", "==", "Approved"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const formsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setApprovedForms(formsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching approved forms: ", error);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const filteredForms = approvedForms.filter(form => 
        (form.recipeName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (form.batchBy?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (form.batchDate?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const getFormTypes = () => {
        const types = filteredForms.map(form => form.recipeName);
        return [...new Set(types)];
    };

    const getDatesForFormType = (formType) => {
        const dates = filteredForms
            .filter(form => form.recipeName === formType)
            .map(form => form.batchDate);
        return [...new Set(dates)].sort((a, b) => new Date(b) - new Date(a));
    };
    
    const getFormsForDate = (formType, date) => {
        return filteredForms.filter(form => form.recipeName === formType && form.batchDate === date);
    };

    const handleFormTypeClick = (type) => {
        setSelectedFormType(type);
        setView('dates');
    };

    const handleDateClick = (date) => {
        setSelectedDate(date);
        setView('forms');
    };

    const handleBack = () => {
        if (view === 'forms') setView('dates');
        else if (view === 'dates') setView('formTypes');
    };

    let headerTitle = "Form Archive";
    if (view === 'dates') headerTitle = selectedFormType;
    if (view === 'forms') headerTitle = selectedDate;

    return (
        <div>
            <header className="bg-gradient-to-r from-purple-600 to-pink-500 p-4 pt-6 shadow-lg sticky top-0 z-10">
                <div className="flex justify-between items-center mb-4">
                    {view !== 'formTypes' ? (
                        <button onClick={handleBack} className="text-white p-2 -ml-2"><BackIcon /></button>
                    ) : <div className="w-6"></div>}
                    <h1 className="text-2xl font-bold text-white">{headerTitle}</h1>
                    <div className="w-6"></div>
                </div>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by name, date, user..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                </div>
            </header>
            <main className="p-4">
                {loading && <p className="text-center text-gray-500">Loading archive...</p>}

                {view === 'formTypes' && !loading && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {getFormTypes().map(type => (
                            <div key={type} onClick={() => handleFormTypeClick(type)} className="p-4 rounded-2xl bg-white shadow-md flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-lg hover:bg-gray-50 transition-all">
                                <FolderIcon />
                                <p className="mt-2 font-bold text-gray-700">{type}</p>
                            </div>
                        ))}
                    </div>
                )}

                {view === 'dates' && !loading && (
                     <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {getDatesForFormType(selectedFormType).map(date => (
                            <div key={date} onClick={() => handleDateClick(date)} className="p-4 rounded-2xl bg-white shadow-md flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-lg hover:bg-gray-50 transition-all">
                                <FolderIcon />
                                <p className="mt-2 font-bold text-gray-700">{date}</p>
                            </div>
                        ))}
                    </div>
                )}

                {view === 'forms' && !loading && (
                    <div className="bg-white rounded-2xl shadow-md">
                        <ul className="divide-y divide-gray-200">
                            {getFormsForDate(selectedFormType, selectedDate).map(form => (
                                <li key={form.id} className="p-4 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <DocumentIcon />
                                        <div className="ml-3">
                                            <p className="font-bold text-gray-800">{form.recipeName}</p>
                                            <p className="text-sm text-gray-600">Submitted by: {form.batchBy || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400">ID: {form.id.substring(0, 6)}...</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </main>
        </div>
    );
}

export default Archive;