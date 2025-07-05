import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

import Login from './Login';
import EmployeeDashboard from './EmployeeDashboard';
import ManagerDashboard from './ManagerDashboard';
import FormsList from './FormsList';
import Settings from './Settings';
import FormDetail from './FormDetail';

const HomeIcon = ({ isActive }) => <svg viewBox="0 0 24 24" className={`w-6 h-6 ${isActive ? 'text-purple-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const ListIcon = ({ isActive }) => <svg viewBox="0 0 24 24" className={`w-6 h-6 ${isActive ? 'text-purple-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>;
const SettingsIcon = ({ isActive }) => <svg viewBox="0 0 24 24" className={`w-6 h-6 ${isActive ? 'text-purple-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06-.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"></path><circle cx="12" cy="12" r="3"></circle></svg>;

function App() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState('Dashboard');
  const [selectedForm, setSelectedForm] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUserProfile({ user: currentUser, role: userDoc.data().role });
          } else {
            setUserProfile({ user: currentUser, role: null });
          }
        } catch (error) {
            setUserProfile({ user: currentUser, role: null });
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = () => signOut(getAuth());
  const handleFormSelect = (form) => setSelectedForm(form);
  const handleBack = () => setSelectedForm(null);
  const handleNavigate = (targetPage) => setPage(targetPage);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!userProfile) {
    return <Login />;
  }
  
  if (userProfile.user && !userProfile.role) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
            <h2 className="text-2xl font-bold mb-2">Verification Incomplete</h2>
            <p className="text-gray-600">Your user profile is not set up correctly. Please contact an administrator.</p>
            <button onClick={handleSignOut} className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg">Sign Out</button>
        </div>
    );
  }

  if (selectedForm) {
    return <FormDetail form={selectedForm} onBack={handleBack} />;
  }

  const renderPage = () => {
    const role = userProfile.role;
    if (page === 'Dashboard') {
        return role === 'manager' ? <ManagerDashboard /> : <EmployeeDashboard onNavigate={handleNavigate} />;
    }
    if (page === 'Forms') {
        return <FormsList onFormSelect={handleFormSelect} />;
    }
    if (page === 'Settings') {
        return <Settings handleSignOut={handleSignOut} />;
    }
    return role === 'manager' ? <ManagerDashboard /> : <EmployeeDashboard onNavigate={handleNavigate} />;
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <main className="flex-grow pb-20">{renderPage()}</main>
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200">
        <div className="max-w-md mx-auto flex justify-around h-16 items-center">
          <button onClick={() => setPage('Dashboard')} className="flex flex-col items-center justify-center text-xs gap-1 w-20">
            <HomeIcon isActive={page === 'Dashboard'} />
            <span className={page === 'Dashboard' ? 'text-purple-600' : 'text-gray-500'}>Dashboard</span>
          </button>
          <button onClick={() => setPage('Forms')} className="flex flex-col items-center justify-center text-xs gap-1 w-20">
            <ListIcon isActive={page === 'Forms'} />
            <span className={page === 'Forms' ? 'text-purple-600' : 'text-gray-500'}>Forms</span>
          </button>
          <button onClick={() => setPage('Settings')} className="flex flex-col items-center justify-center text-xs gap-1 w-20">
            <SettingsIcon isActive={page === 'Settings'} />
            <span className={page === 'Settings' ? 'text-purple-600' : 'text-gray-500'}>Settings</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default App;
