import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const [stats, setStats] = useState(null);
    const [recentCrimes, setRecentCrimes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, crimesRes] = await Promise.all([
                api.get('/crimes/stats/overview'),
                api.get('/crimes?limit=5'),
            ]);

            setStats(statsRes.data.data);
            setRecentCrimes(crimesRes.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    const handleLogout = () => {
        dispatch(logout());
    };

    const COLORS = ['#00d4ff', '#8b5cf6', '#f59e0b', '#ef4444'];

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-bg flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent-blue"></div>
                    <p className="mt-4 text-gray-400">Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Welcome Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h2 className="text-3xl font-bold text-white mb-2">
                    Welcome back, {user?.fullName}
                </h2>
                <p className="text-gray-400">Here's what's happening in the system today</p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-6 cyber-border"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Total Crimes</p>
                            <p className="text-3xl font-bold text-white mt-2">{stats?.totalCrimes || 0}</p>
                        </div>
                        <div className="p-3 bg-accent-blue/20 rounded-lg">
                            <svg className="w-8 h-8 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card p-6 cyber-border"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Active Cases</p>
                            <p className="text-3xl font-bold text-white mt-2">
                                {stats?.crimesByStatus?.find(s => s._id === 'Under Investigation')?.count || 0}
                            </p>
                        </div>
                        <div className="p-3 bg-accent-purple/20 rounded-lg">
                            <svg className="w-8 h-8 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card p-6 cyber-border"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Critical Severity</p>
                            <p className="text-3xl font-bold text-white mt-2">
                                {stats?.crimesBySeverity?.find(s => s._id === 'Critical')?.count || 0}
                            </p>
                        </div>
                        <div className="p-3 bg-danger-red/20 rounded-lg">
                            <svg className="w-8 h-8 text-danger-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="glass-card p-6 cyber-border"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Solved Cases</p>
                            <p className="text-3xl font-bold text-white mt-2">
                                {stats?.crimesByStatus?.find(s => s._id === 'Solved')?.count || 0}
                            </p>
                        </div>
                        <div className="p-3 bg-success-green/20 rounded-lg">
                            <svg className="w-8 h-8 text-success-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Crime Types Chart */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass-card p-6"
                >
                    <h3 className="text-xl font-bold text-white mb-4">Crime Types Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stats?.crimesByType?.slice(0, 5) || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                            <XAxis dataKey="_id" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1a1f35', border: '1px solid #ffffff20', borderRadius: '8px' }}
                                labelStyle={{ color: '#fff' }}
                            />
                            <Bar dataKey="count" fill="#00d4ff" />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Severity Distribution */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="glass-card p-6"
                >
                    <h3 className="text-xl font-bold text-white mb-4">Severity Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={stats?.crimesBySeverity || []}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ _id, percent }) => `${_id}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="count"
                                nameKey="_id"
                            >
                                {stats?.crimesBySeverity?.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1a1f35', border: '1px solid #ffffff20', borderRadius: '8px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* Recent Crimes Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="glass-card p-6"
            >
                <h3 className="text-xl font-bold text-white mb-4">Recent Crime Events</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left py-3 px-4 text-gray-400 font-medium">Title</th>
                                <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                                <th className="text-left py-3 px-4 text-gray-400 font-medium">Severity</th>
                                <th className="text-left py-3 px-4 text-gray-400 font-medium">Location</th>
                                <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentCrimes.map((crime, index) => (
                                <tr key={crime._id} className="border-b border-white/5 hover:bg-white/5 transition">
                                    <td className="py-3 px-4 text-white">{crime.title}</td>
                                    <td className="py-3 px-4 text-gray-300">{crime.crimeType}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${crime.severity === 'Critical' ? 'bg-danger-red/20 text-danger-red' :
                                            crime.severity === 'High' ? 'bg-warning-amber/20 text-warning-amber' :
                                                crime.severity === 'Medium' ? 'bg-accent-blue/20 text-accent-blue' :
                                                    'bg-success-green/20 text-success-green'
                                            }`}>
                                            {crime.severity}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-gray-300">{crime.location?.city || 'Unknown'}</td>
                                    <td className="py-3 px-4">
                                        <span className="px-2 py-1 rounded text-xs font-medium bg-accent-purple/20 text-accent-purple">
                                            {crime.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </>
    );
};

export default Dashboard;
