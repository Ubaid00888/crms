import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { CustomTooltip, ChartGradients, commonAxisStyles, CHART_COLORS } from '../components/charts/ChartTheme';
import { Shield, AlertTriangle, CheckCircle, Activity, ChevronRight, MapPin } from 'lucide-react';
import MostWantedDashboardGrid from '../components/Dashboard/MostWantedDashboardGrid';

const Dashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const [stats, setStats] = useState(null);
    const [recentCrimes, setRecentCrimes] = useState([]);
    const [jurisdictionCrimes, setJurisdictionCrimes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, [user?.city]);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, crimesRes] = await Promise.all([
                api.get('/crimes/stats/overview'),
                api.get('/crimes?limit=5'),
            ]);

            setStats(statsRes.data.data);
            setRecentCrimes(crimesRes.data.data);

            // Fetch local jurisdiction news for agents/admins
            if (user?.city) {
                const localRes = await api.get(`/crimes?city=${user.city}&limit=3`);
                setJurisdictionCrimes(localRes.data.data);
            }

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
                {[
                    { label: 'Total Crimes', val: stats?.totalCrimes, icon: Activity, color: 'text-accent-blue', bg: 'bg-accent-blue/10' },
                    {
                        label: 'Active Cases',
                        val: stats?.crimesByStatus?.find(s => s._id === 'Under Investigation')?.count || 0,
                        icon: Shield,
                        color: 'text-accent-purple',
                        bg: 'bg-accent-purple/10'
                    },
                    {
                        label: 'Critical Priority',
                        val: stats?.crimesBySeverity?.find(s => s._id === 'Critical')?.count || 0,
                        icon: AlertTriangle,
                        color: 'text-danger-red',
                        bg: 'bg-danger-red/10'
                    },
                    {
                        label: 'Solved Cases',
                        val: stats?.crimesByStatus?.find(s => s._id === 'Solved')?.count || 0,
                        icon: CheckCircle,
                        color: 'text-success-green',
                        bg: 'bg-success-green/10'
                    }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                        className="glass-card p-6 border-b-2 border-transparent hover:border-accent-blue/30 transition-all duration-300"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] uppercase font-black tracking-widest text-gray-500 mb-1">{stat.label}</p>
                                <p className={`text-4xl font-black ${stat.color} tracking-tighter`}>{stat.val || 0}</p>
                            </div>
                            <div className={`p-4 ${stat.bg} rounded-2xl border border-white/5 shadow-inner`}>
                                <stat.icon className={`w-6 h-6 ${stat.color} opacity-80`} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Most Wanted Priority Intelligence */}
            <MostWantedDashboardGrid limit={4} />



            {/* Jurisdiction Watch for Agents */}
            {user?.role === 'agent' && user?.city && (
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <MapPin className="w-5 h-5 text-accent-blue" />
                        <h2 className="text-xl font-black text-white italic uppercase tracking-tight">Jurisdiction Watch: {user.city}</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {jurisdictionCrimes.map((crime) => (
                            <div key={crime._id} className="glass-card p-6 border border-white/5 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-100 transition-opacity">
                                    <Shield className="w-12 h-12 text-accent-blue" />
                                </div>
                                <div className="relative z-10">
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest mb-3 inline-block ${crime.severity === 'Critical' ? 'bg-danger-red/20 text-danger-red' : 'bg-accent-blue/20 text-accent-blue'
                                        }`}>
                                        {crime.severity} ALERT
                                    </span>
                                    <h3 className="text-white font-black text-sm mb-2 uppercase italic leading-tight">{crime.title}</h3>
                                    <p className="text-gray-500 text-xs line-clamp-2 mb-4">{crime.description}</p>
                                    <div className="text-[10px] text-gray-400 font-mono uppercase">
                                        {new Date(crime.occurredAt).toLocaleDateString()} • {crime.crimeType}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Crime Types Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass-card p-8 border border-white/5"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-white tracking-tight uppercase italic">Crime Distribution</h3>
                            <p className="text-[10px] text-gray-500 font-bold tracking-[0.2em] uppercase">Tactical incident classification</p>
                        </div>
                        <div className="w-10 h-10 bg-accent-blue/5 rounded-lg flex items-center justify-center border border-accent-blue/10">
                            <Activity className="w-5 h-5 text-accent-blue" />
                        </div>
                    </div>
                    <div className="h-[300px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.crimesByType?.slice(0, 5) || []}>
                                <ChartGradients />
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis dataKey="_id" {...commonAxisStyles} />
                                <YAxis {...commonAxisStyles} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff05' }} />
                                <Bar
                                    dataKey="count"
                                    name="Incidents"
                                    fill="url(#cyanGradient)"
                                    radius={[8, 8, 0, 0]}
                                    barSize={45}
                                    animationDuration={1500}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Severity Distribution */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="glass-card p-8 border border-white/5 flex flex-col"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-white tracking-tight uppercase italic">Threat Matrix</h3>
                            <p className="text-[10px] text-gray-500 font-bold tracking-[0.2em] uppercase">Severity level saturation</p>
                        </div>
                        <div className="w-10 h-10 bg-danger-red/5 rounded-lg flex items-center justify-center border border-danger-red/10">
                            <AlertTriangle className="w-5 h-5 text-danger-red" />
                        </div>
                    </div>
                    <div className="flex-1 min-h-[300px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats?.crimesBySeverity || []}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={8}
                                    dataKey="count"
                                    nameKey="_id"
                                    stroke="none"
                                >
                                    {stats?.crimesBySeverity?.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                                            style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    verticalAlign="bottom"
                                    align="center"
                                    iconType="circle"
                                    formatter={(value) => <span className="text-[10px] uppercase font-black tracking-widest text-gray-400 ml-2">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text for Donut */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none mb-4">
                            <div className="text-center">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Global</p>
                                <p className="text-2xl font-black text-white italic">LEVELS</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Recent Crimes Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="glass-card p-8 border border-white/5"
            >
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-1.5 h-6 bg-accent-blue rounded-full" />
                        <h3 className="text-xl font-black text-white tracking-tight uppercase italic">Live Intel Reports</h3>
                    </div>
                    <Link to="/crimes" className="text-[10px] font-black uppercase text-accent-blue hover:underline tracking-widest flex items-center gap-1 group">
                        VIEW ENTIRE LOG <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

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
