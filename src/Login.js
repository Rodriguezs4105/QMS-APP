import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        const auth = getAuth();
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            setError('Failed to log in. Please check your email and password.');
            console.error("Login error:", err);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-purple-600 to-pink-500 p-4">
            <div className="w-full max-w-sm bg-white/20 backdrop-blur-lg rounded-2xl shadow-2xl p-8">
                <h1 className="text-3xl font-bold text-white mb-2 text-center">
                    Welcome Back
                </h1>
                <p className="text-white/80 mb-6 text-center">
                    Sign in to your QMS
                </p>
                <form onSubmit={handleLogin} className="space-y-4">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email Address"
                        className="w-full px-4 py-3 bg-white/30 text-white rounded-lg placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white"
                        required
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full px-4 py-3 bg-white/30 text-white rounded-lg placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white"
                        required
                    />
                    {error && <p className="text-red-300 text-sm text-center">{error}</p>}
                    <button
                        type="submit"
                        className="w-full bg-white text-purple-600 font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;
