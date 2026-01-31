import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { logout } from '../../store/authSlice';

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { user } = useSelector((state) => state.auth);
    const location = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const menuItems = {
        common: [
            { path: '/dashboard', label: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
            { path: '/analytics', label: 'Intelligence', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
            { path: '/most-wanted', label: 'Most Wanted', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
        ],
        agent: [
            { path: '/cases', label: 'My Cases', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
        ],
        analyst: [
            { path: '/criminals', label: 'Criminal Database', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
            { path: '/cases', label: 'Case Management', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
        ],
        admin: [
            { path: '/admin/users', label: 'User Management', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
            { path: '/admin/intelligence', label: 'Intelligence Review', icon: 'M12 2L3 7v9c0 5 9 11 9 11s9-6 9-11V7l-9-5z' },
            { path: '/users', label: 'Legacy Access', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
            { path: '/logs', label: 'System Logs', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
        ]
    };

    const currentMenuItems = [
        ...menuItems.common,
        ...(menuItems[user?.role] || [])
    ];

    const handleLogout = () => {
        // Navigate first to unmount strict ProtectedRoutes, then clear token
        navigate('/');
        setTimeout(() => dispatch(logout()), 50);
    };

    return (
        <motion.div
            initial={false}
            animate={{ width: isCollapsed ? '80px' : '280px' }}
            className="flex flex-col h-screen bg-dark-surface border-r border-white/10 relative z-50 shadow-2xl transition-all duration-300 ease-in-out"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-6 h-20">
                <AnimatePresence mode="wait">
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex items-center space-x-3"
                        >
                            <div className="w-8 h-8 bg-accent-blue rounded flex items-center justify-center shadow-lg shadow-accent-blue/20">
                                <svg className="w-5 h-5 text-dark-bg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold text-white tracking-wider">CRMS</span>
                        </motion.div>
                    )}
                </AnimatePresence>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isCollapsed ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7m8 14l-7-7 7-7"} />
                    </svg>
                </button>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 px-4 space-y-2 py-4 overflow-y-auto custom-scrollbar">
                {currentMenuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center p-3 rounded-xl transition-all duration-200 group relative ${isActive
                                ? 'bg-accent-blue/10 text-accent-blue border border-accent-blue/20 shadow-lg shadow-accent-blue/10'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <svg className={`w-6 h-6 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-accent-blue' : 'text-gray-400 group-hover:text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                            </svg>
                            {!isCollapsed && (
                                <span className="ml-4 font-medium whitespace-nowrap">{item.label}</span>
                            )}
                            {isActive && !isCollapsed && (
                                <motion.div
                                    layoutId="active-pill"
                                    className="absolute right-2 w-1.5 h-1.5 bg-accent-blue rounded-full shadow-lg shadow-accent-blue/50"
                                />
                            )}

                            {/* Tooltip for collapsed state */}
                            {isCollapsed && (
                                <div className="absolute left-full ml-6 px-3 py-2 bg-dark-elevated text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-xl border border-white/10 pointer-events-none">
                                    {item.label}
                                </div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile Section */}
            <div className="p-4 border-t border-white/10">
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-4'} p-2`}>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent-blue to-accent-purple flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {user?.fullName?.charAt(0) || 'U'}
                    </div>
                    {!isCollapsed && (
                        <div className="flex-1 overflow-hidden">
                            <h4 className="text-sm font-semibold text-white truncate">{user?.fullName}</h4>
                            <p className="text-xs text-gray-500 uppercase tracking-tighter">{user?.role}</p>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleLogout}
                    className={`mt-4 w-full flex items-center p-3 rounded-xl text-gray-400 hover:bg-danger-red/10 hover:text-danger-red transition-all group relative`}
                >
                    <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {!isCollapsed && <span className="ml-4 font-medium">Sign Out</span>}
                    {isCollapsed && (
                        <div className="absolute left-full ml-6 px-3 py-2 bg-danger-red text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-xl pointer-events-none">
                            Sign Out
                        </div>
                    )}
                </button>
            </div>
        </motion.div>
    );
};

export default Sidebar;
