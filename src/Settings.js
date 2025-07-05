import React, { useState } from 'react';
import { getAuth, signOut } from 'firebase/auth';

const ChevronRightIcon = () => <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>;
const BellIcon = () => <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
const PaintBrushIcon = () => <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 14.88a2.89 2.89 0 0 0 4.12 0l1.38-1.38a2.89 2.89 0 0 0 0-4.12l-1.38-1.38a2.89 2.89 0 0 0-4.12 0L10.5 9.5l-6 6 2.5 2.5 2.22-2.12z"></path><path d="m14.5 6.5 2 2"></path><path d="M7.5 12.5 9 14"></path><path d="M16 16l-1.5-1.5"></path><path d="M10 10l-1.5-1.5"></path></svg>;
const LogoutIcon = () => <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;

const ToggleSwitch = () => {
    const [isOn, setIsOn] = useState(true);
    return (
        <button onClick={() => setIsOn(!isOn)} className={`relative inline-flex items-center h-8 w-14 rounded-full transition-colors duration-300 ease-in-out ${isOn ? 'bg-green-500' : 'bg-gray-300'}`}>
            <span className={`inline-block w-6 h-6 transform bg-white rounded-full transition-transform duration-300 ease-in-out ${isOn ? 'translate-x-7' : 'translate-x-1'}`} />
        </button>
    );
};

function Settings({ handleSignOut }) {
    return (
        <div>
            <header className="bg-gradient-to-r from-purple-600 to-pink-500 p-4 pt-6 shadow-lg sticky top-0 z-10">
                <div className="flex justify-center items-center">
                    <h1 className="text-2xl font-bold text-white">Settings</h1>
                </div>
            </header>
            <main className="p-4">
                <div className="bg-white rounded-2xl shadow-md p-4 flex items-center mb-6">
                    <img 
                        className="h-16 w-16 rounded-full object-cover" 
                        src="https://placehold.co/100x100/E2E8F0/4A5568?text=VD"
                        alt="User Avatar"
                    />
                    <div className="ml-4">
                        <p className="text-xl font-semibold text-gray-900">Vedika Desai</p>
                        <p className="text-md text-gray-600">Administrator</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-md">
                    <ul className="divide-y divide-gray-200">
                        <li className="p-4 flex items-center">
                            <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center mr-4">
                                <BellIcon />
                            </div>
                            <span className="text-lg text-gray-800">Notifications</span>
                            <span className="ml-auto"><ToggleSwitch /></span>
                        </li>
                        <li className="p-4 flex items-center">
                            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center mr-4">
                                <PaintBrushIcon />
                            </div>
                            <span className="text-lg text-gray-800">Appearance</span>
                            <span className="ml-auto"><ChevronRightIcon /></span>
                        </li>
                         <li onClick={handleSignOut} className="p-4 flex items-center justify-center text-red-500 font-semibold text-lg cursor-pointer hover:bg-gray-50 rounded-b-2xl">
                            <LogoutIcon />
                            <span className="ml-2">Sign Out</span>
                        </li>
                    </ul>
                </div>
            </main>
        </div>
    );
}

export default Settings;
