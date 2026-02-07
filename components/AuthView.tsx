
import React, { useState } from 'react';
import { User } from '../types';

interface AuthViewProps {
    onLogin: (user: User) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
    const [view, setView] = useState<'login' | 'register' | 'forgot'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Mock "Database" in localStorage
    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        setTimeout(() => {
            const existingUsers = JSON.parse(localStorage.getItem('onyx_users') || '{}');
            if (existingUsers[email]) {
                setError('User already exists');
                setLoading(false);
                return;
            }

            const newUser: User = { email, password };
            existingUsers[email] = newUser;
            localStorage.setItem('onyx_users', JSON.stringify(existingUsers));

            // Initialize fresh user preferences if needed, or just login
            onLogin(newUser);
            setLoading(false);
        }, 800);
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        setTimeout(() => {
            const existingUsers = JSON.parse(localStorage.getItem('onyx_users') || '{}');
            const user = existingUsers[email];

            if (!user || user.password !== password) {
                setError('Invalid credentials');
                setLoading(false);
                return;
            }

            onLogin(user);
            setLoading(false);
        }, 800);
    };

    const handleForgot = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate email sending
        setTimeout(() => {
            alert(`Password reset link sent to ${email} (Simulation)`);
            setView('login');
            setLoading(false);
        }, 1000);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black p-6 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black opacity-50" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

            <div className="max-w-md w-full bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 relative z-10 shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none mb-2">WAVE</h1>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Audio Intelligence Suite</p>
                </div>

                {view === 'login' && (
                    <form onSubmit={handleLogin} className="space-y-6">
                        <h2 className="text-xl font-black italic text-white uppercase text-center">Identity Verification</h2>
                        {error && <p className="text-red-500 text-xs font-bold text-center uppercase tracking-widest bg-red-500/10 py-2 rounded">{error}</p>}

                        <div className="space-y-4">
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/20 focus:border-primary focus:outline-none transition-all text-sm font-medium"
                                required
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/20 focus:border-primary focus:outline-none transition-all text-sm font-medium"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-black font-black italic uppercase tracking-widest py-4 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Authenticating...' : 'Enter System'}
                        </button>

                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-white/40 mt-6">
                            <button type="button" onClick={() => setView('register')} className="hover:text-white transition-colors">Create Identity</button>
                            <button type="button" onClick={() => setView('forgot')} className="hover:text-white transition-colors">Lost Access?</button>
                        </div>
                    </form>
                )}

                {view === 'register' && (
                    <form onSubmit={handleRegister} className="space-y-6">
                        <h2 className="text-xl font-black italic text-white uppercase text-center">New Identity Protocol</h2>
                        {error && <p className="text-red-500 text-xs font-bold text-center uppercase tracking-widest bg-red-500/10 py-2 rounded">{error}</p>}

                        <div className="space-y-4">
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/20 focus:border-primary focus:outline-none transition-all text-sm font-medium"
                                required
                            />
                            <input
                                type="password"
                                placeholder="Set Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/20 focus:border-primary focus:outline-none transition-all text-sm font-medium"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-black font-black italic uppercase tracking-widest py-4 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Initializing...' : 'Initialize Profile'}
                        </button>

                        <div className="text-center mt-6">
                            <button type="button" onClick={() => setView('login')} className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">
                                Return to Login
                            </button>
                        </div>
                    </form>
                )}

                {view === 'forgot' && (
                    <form onSubmit={handleForgot} className="space-y-6">
                        <h2 className="text-xl font-black italic text-white uppercase text-center">Recovery Protocol</h2>
                        <p className="text-center text-xs text-white/40 mb-4 px-4">Enter your registered email frequency to receive access token.</p>

                        <div className="space-y-4">
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/20 focus:border-primary focus:outline-none transition-all text-sm font-medium"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white/10 text-white font-black italic uppercase tracking-widest py-4 rounded-2xl hover:bg-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Transmitting...' : 'Send Reset Link'}
                        </button>

                        <div className="text-center mt-6">
                            <button type="button" onClick={() => setView('login')} className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">
                                Cancel Protocol
                            </button>
                        </div>
                    </form>
                )}
            </div>

            <div className="absolute bottom-6 text-center">
                <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.5em]">WAVE Systems v2.1</p>
            </div>
        </div>
    );
};

export default AuthView;
