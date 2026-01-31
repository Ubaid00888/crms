import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { motion } from 'framer-motion';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Shield, Activity, Map, AlertTriangle } from 'lucide-react';

const AnalystDashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const [stats, setStats] = useState(null);
    const [recentCrimes, setRecentCrimes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, crimesRes] = await Promise.all([
                api.get('/crimes/stats/overview'),
                api.get('/crimes?limit=10'),
            ]);

            if (statsRes.data?.success) setStats(statsRes.data.data);
            if (crimesRes.data?.success) setRecentCrimes(crimesRes.data.data);

            setError(null);
        } catch (err) {
            console.error('Data fetch error:', err);
            setError(err.response?.data?.message || err.message || 'Failed to load intelligence data');
        } finally {
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
                <div className="flex flex-col items-center">
                    <Activity className="w-12 h-12 text-accent-blue animate-pulse mb-4" />
                    <p className="text-gray-400 font-mono tracking-widest text-sm">INITIALIZING INTEL STREAM...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
                <div className="glass-card p-8 border-danger-red/30 max-w-md w-full text-center">
                    <AlertTriangle className="w-16 h-16 text-danger-red mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">Connection Failure</h2>
                    <p className="text-danger-red font-mono text-sm mb-6">{error}</p>
                    <button
                        onClick={() => { setLoading(true); fetchData(); }}
                        className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded font-bold uppercase tracking-widest text-xs transition-colors"
                    >
                        Retry Connection
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full bg-dark-bg p-6 text-white font-sans selection:bg-accent-blue selection:text-dark-bg">

            {/* Main Title Section */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-accent-blue/10 rounded-lg flex items-center justify-center border border-accent-blue/20">
                        <Shield className="w-6 h-6 text-accent-blue" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                            ANALYST COMMAND
                            <span className="px-2 py-0.5 bg-accent-blue text-[10px] text-dark-bg font-bold rounded uppercase tracking-widest">
                                READ ONLY
                            </span>
                        </h1>
                        <p className="text-xs text-gray-400 font-mono uppercase tracking-widest">
                            Authorized: {user?.fullName} | ID: {user?.id?.slice(-6)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left Column (Stats & Charts) */}
                <div className="lg:col-span-8 space-y-6">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { label: 'TOTAL INCIDENTS', val: stats?.totalCrimes, icon: Activity, color: 'text-accent-blue' },
                            { label: 'CRITICAL ALERTS', val: stats?.crimesBySeverity?.find(s => s._id === 'Critical')?.count || 0, icon: AlertTriangle, color: 'text-danger-red' },
                            { label: 'ACTIVE ZONES', val: stats?.affectedRegions || 0, icon: Map, color: 'text-accent-purple' }
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-card p-6 border-l-2 border-accent-blue/30"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
                                        <p className={`text-3xl font-black ${stat.color}`}>{stat.val}</p>
                                    </div>
                                    <stat.icon className={`w-5 h-5 ${stat.color} opacity-50`} />
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Analytics Chart */}
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <Activity className="w-4 h-4 text-accent-blue" />
                                Crime Trend Analysis
                            </h3>
                            <span className="text-[10px] text-gray-500 font-mono uppercase">Last 7 Days</span>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats?.crimesByType || []}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                    <XAxis dataKey="_id" stroke="#6b7280" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0a0e1a', border: '1px solid #ffffff20', borderRadius: '4px' }}
                                        labelStyle={{ color: '#9ca3af', fontSize: '10px', textTransform: 'uppercase' }}
                                    />
                                    <Bar dataKey="count" fill="#00d4ff" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Severity Distribution */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass-card p-6">
                            <h3 className="font-bold text-sm mb-4 uppercase tracking-widest text-gray-400">Threat Levels</h3>
                            <div className="h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats?.crimesBySeverity || []}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="count"
                                        >
                                            {stats?.crimesBySeverity?.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0a0e1a', border: '1px solid #ffffff20', borderRadius: '4px' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="glass-card p-6">
                            <h3 className="font-bold text-sm mb-4 uppercase tracking-widest text-gray-400">System Status</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400">Database Connection</span>
                                    <span className="text-success-green font-bold">Stable</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400">Live Feed Latency</span>
                                    <span className="text-accent-blue font-bold">~24ms</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400">Predictive Engine</span>
                                    <span className="text-accent-purple font-bold">Training (94%)</span>
                                </div>
                                <div className="mt-6 p-3 bg-white/5 rounded border border-white/5 text-xs text-gray-500 font-mono leading-relaxed">
                                    System running in READ-ONLY mode for analyst session. Administrative actions are disabled.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column (Live Feed) */}
                <div className="lg:col-span-4">
                    <div className="glass-card h-full flex flex-col">
                        <div className="p-6 border-b border-white/10">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <div className="w-2 h-2 bg-danger-red rounded-full animate-ping"></div>
                                Live Intel Feed
                            </h3>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                            {recentCrimes.map((crime, i) => (
                                <div key={i} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${crime.severity === 'Critical' ? 'bg-danger-red/20 text-danger-red' : 'bg-accent-blue/20 text-accent-blue'
                                            }`}>
                                            {crime.severity}
                                        </span>
                                        <span className="text-[10px] text-gray-500 font-mono">
                                            {new Date(crime.occurredAt).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-sm text-gray-200 mb-1 leading-snug">{crime.title}</h4>
                                    <p className="text-xs text-gray-500 mb-2 truncate">{crime.location?.city || 'Unknown Location'}</p>
                                    <div className="flex gap-2 text-[10px] text-gray-600">
                                        <span>ID: {crime._id.slice(-6).toUpperCase()}</span>
                                        <span>•</span>
                                        <span>TYPE: {crime.crimeType.toUpperCase()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalystDashboard;
