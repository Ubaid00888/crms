import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isLoading, error, user, token } = useSelector((state) => state.auth);

    const [credentials, setCredentials] = useState({
        username: '',
        password: '',
    });

    // Clear previous errors and redirect if already authenticated
    useEffect(() => {
        dispatch(clearError());
        if (token && user) {
            navigate(user.role === 'analyst' ? '/analyst-dashboard' : '/dashboard');
        }
    }, [token, user, navigate, dispatch]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await dispatch(login(credentials)).unwrap();

            Swal.fire({
                icon: 'success',
                title: 'System Access Granted',
                text: `Welcome, ${result.user?.fullName}`,
                background: '#0a0e1a',
                color: '#fff',
                timer: 1500,
                showConfirmButton: false,
                backdrop: `rgba(0,212,255,0.1)`
            });

            // Role-based routing happens automatically via useEffect, 
            // but we can trigger it here for faster response
            if (result.user?.role === 'analyst') {
                navigate('/analyst-dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Authorization Failure',
                text: err.message || 'Invalid credentials or connection error.',
                background: '#0a0e1a',
                color: '#fff',
                confirmButtonColor: '#ef4444'
            });
        }
    };

    return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4 relative overflow-hidden">
            {/* Cybernetic Accents */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute w-96 h-96 bg-accent-blue/5 rounded-full blur-3xl -top-48 -left-48 animate-pulse" />
                <div className="absolute w-96 h-96 bg-accent-purple/5 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-10 w-full max-w-md relative z-20 cyber-border pointer-events-auto"
            >
                <div className="text-center mb-10">
                    <div className="inline-flex p-4 bg-accent-blue/10 rounded-2xl border border-accent-blue/20 mb-6">
                        <svg className="w-10 h-10 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tight uppercase mb-2">Internal Clearance</h1>
                    <p className="text-gray-500 text-xs font-mono tracking-widest uppercase">CRMS Command Interface</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-accent-blue/70 uppercase tracking-widest ml-1">Operator ID</label>
                        <input
                            type="text"
                            name="username"
                            value={credentials.username}
                            onChange={handleChange}
                            disabled={isLoading}
                            required
                            autoComplete="username"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-accent-blue focus:bg-white/10 transition-all font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                            placeholder="Enter username"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-accent-blue/70 uppercase tracking-widest ml-1">Access Protocol</label>
                        <input
                            type="password"
                            name="password"
                            value={credentials.password}
                            onChange={handleChange}
                            disabled={isLoading}
                            required
                            autoComplete="current-password"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-accent-blue focus:bg-white/10 transition-all font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div className="bg-danger-red/10 border border-danger-red/20 rounded-xl p-3 text-danger-red text-[10px] font-bold uppercase tracking-wider animate-shake">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-accent-blue text-dark-bg font-black uppercase tracking-[0.2em] rounded-xl hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] disabled:opacity-50 transition-all"
                    >
                        {isLoading ? 'Verifying...' : 'Initialize Session'}
                    </button>

                    <div className="relative flex items-center justify-center py-2">
                        <div className="absolute w-full h-px bg-white/5" />
                        <span className="relative px-4 text-[9px] font-bold text-gray-600 uppercase tracking-[0.4em] bg-dark-bg">Alternative Authentication</span>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate('/qr-login')}
                        className="w-full py-4 bg-white/5 hover:bg-white/10 text-accent-cyan font-bold uppercase tracking-widest rounded-xl border border-white/5 transition-all text-[11px] flex items-center justify-center gap-3"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h2M4 8h16" />
                        </svg>
                        Deploy Digital ID Card
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-white/5 text-center">
                    <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-4">Development Environment Bypass</p>
                    <div className="grid grid-cols-3 gap-2">
                        {['admin', 'analyst1', 'agent1'].map(u => (
                            <button
                                key={u}
                                onClick={() => setCredentials({ username: u, password: u === 'admin' ? 'admin123' : u === 'analyst1' ? 'analyst123' : 'agent123' })}
                                className="px-2 py-2 bg-white/5 hover:bg-accent-blue/10 rounded border border-white/5 text-[10px] font-mono text-gray-400 hover:text-accent-blue transition-colors"
                            >
                                {u}
                            </button>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
