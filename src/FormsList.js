import React, { useState, useEffect } from 'react';
import { db, collection, onSnapshot, query, where, orderBy } from './firebase';
import FormCard from './FormCard';

const YogurtIcon = () => <svg className="w-16 h-16 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v3a3 3 0 01-3 3z" /></svg>;
const DipIcon = () => <svg className="w-16 h-16 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const BackIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;

function FormsList({ onFormSelect }) {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const colorClasses = ["bg-gradient-to-r from-cyan-400 to-blue-500", "bg-gradient-to-r from-red-400 to-pink-500", "bg-gradient-to-r from-sky-400 to-cyan-400", "bg-gradient-to-r from-amber-400 to-orange-500", "bg-gradient-to-r from-emerald-400 to-teal-500", "bg-gradient-to-r from-indigo-400 to-purple-500"];

    useEffect(() => {
        if (!selectedCategory) {
            setForms([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const q = query(
            collection(db, "forms"), 
            where("category", "==", selectedCategory)
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const formsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setForms(formsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching filtered forms: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [selectedCategory]);

    if (!selectedCategory) {
        return (
            <div>
                <header className="bg-gradient-to-r from-purple-600 to-pink-500 p-4 pt-6 shadow-lg sticky top-0 z-10">
                    <div className="flex justify-center items-center">
                        <h1 className="text-2xl font-bold text-white">Select a Category</h1>
                    </div>
                </header>
                <main className="p-4 grid grid-cols-1 gap-4">
                    <div onClick={() => setSelectedCategory('Yogurt')} className="h-40 rounded-2xl p-6 flex flex-col justify-between items-center bg-gradient-to-r from-blue-400 to-blue-600 shadow-lg cursor-pointer">
                        <YogurtIcon />
                        <p className="text-2xl font-bold text-white">Yogurt</p>
                    </div>
                    <div onClick={() => setSelectedCategory('Hummus/Dips')} className="h-40 rounded-2xl p-6 flex flex-col justify-between items-center bg-gradient-to-r from-green-400 to-green-600 shadow-lg cursor-pointer">
                        <DipIcon />
                        <p className="text-2xl font-bold text-white">Hummus/Dips</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div>
            <header className="bg-gradient-to-r from-purple-600 to-pink-500 p-4 pt-6 shadow-lg sticky top-0 z-10">
                <div className="flex justify-between items-center">
                    <button onClick={() => setSelectedCategory(null)} className="text-white p-2 -ml-2">
                        <BackIcon />
                    </button>
                    <h1 className="text-2xl font-bold text-white">{selectedCategory}</h1>
                    <div className="w-6"></div>
                </div>
            </header>
            <main className="p-4">
                {loading && <p className="text-center text-gray-500">Loading Forms...</p>}
                {!loading && forms.length === 0 && <p className="text-center text-gray-500">No forms found in this category.</p>}
                {forms.map((form, index) => (
                    <div key={form.id} onClick={() => onFormSelect(form)} className="cursor-pointer">
                        <FormCard 
                            rank={index + 1}
                            title={form.title}
                            user={form.status}
                            avatarUrl={`https://placehold.co/100x100/FFFFFF/333333?text=${form.title.charAt(0)}&font=sans`}
                            colorClass={colorClasses[index % colorClasses.length]}
                        />
                    </div>
                ))}
            </main>
        </div>
    );
}

export default FormsList;
