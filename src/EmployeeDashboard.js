import React from 'react';

const DocumentPlusIcon = () => <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const ClipboardIcon = () => <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>;

function EmployeeDashboard({ onNavigate }) {
    return (
        <div>
            <header className="bg-gradient-to-r from-purple-600 to-pink-500 p-4 pt-6 shadow-lg sticky top-0 z-10">
                <div className="flex justify-center items-center">
                    <h1 className="text-2xl font-bold text-white">Employee Hub</h1>
                </div>
            </header>
            <main className="p-4">
                <p className="text-center text-gray-600 mb-6">Welcome! What would you like to do today?</p>
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
            </main>
        </div>
    );
}

export default EmployeeDashboard;
