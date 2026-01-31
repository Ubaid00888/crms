import React from 'react';
import Sidebar from './Sidebar';
import { motion } from 'framer-motion';

const DashboardLayout = ({ children }) => {
    return (
        <div className="flex h-screen bg-dark-bg overflow-hidden">
            <Sidebar />

            <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* Global Top Bar */}
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-dark-bg/50 backdrop-blur-md z-40">
                    <div className="flex items-center space-x-4">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className={`w-8 h-8 rounded-full border-2 border-dark-bg bg-accent-blue/20 flex items-center justify-center`}>
                                    <div className="w-1.5 h-1.5 bg-accent-blue rounded-full animate-pulse" />
                                </div>
                            ))}
                        </div>
                        <span className="text-xs text-gray-500 font-mono">LIVE INTELLIGENCE FEED ACTIVE</span>
                    </div>

                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                            <div className="w-2 h-2 bg-success-green rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                            <span className="text-xs font-semibold text-gray-300">SYSTEM SECURE</span>
                        </div>

                        <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-danger-red border-2 border-dark-bg rounded-full" />
                        </button>
                    </div>
                </header>

                {/* Sub-Header / Breadcrumbs (Optional but adds pro look) */}
                <div className="px-8 py-4 bg-dark-bg/30">
                    <div className="flex items-center space-x-2 text-xs font-mono text-gray-500 uppercase tracking-widest">
                        <span>NETWORK</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="text-accent-blue">SECURE_DASHBOARD</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="text-white">ACCESS_POINT_01</span>
                    </div>
                </div>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        {children}
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
