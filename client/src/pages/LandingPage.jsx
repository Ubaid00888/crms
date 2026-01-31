import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Shield, X, Calendar, MapPin, ExternalLink, Globe, AlertCircle } from 'lucide-react';

// Fix for leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const API_BASE = 'http://localhost:5000/api/public';

const SAMPLE_BREAKING = [
    { city: 'LONDON', title: 'MAJOR CYBER INFRASTRUCTURE BREACH DETECTED IN FINANCIAL DISTRICT' },
    { city: 'TOKYO', title: 'INTERPOL ISSUES RED NOTICE FOR HIGH-PROFILE CRYPTO FUGITIVE' },
    { city: 'NEW YORK', title: 'FEDERAL AUTHORITIES DISMANTLE INTERNATIONAL MONEY LAUNDERING RING' },
    { city: 'PARIS', title: 'ADVANCED ARTIFICIAL INTELLIGENCE USED TO TRACK ILLEGAL SMUGGLING ROUTES' },
    { city: 'BERLIN', title: 'CROSS-BORDER POLICE OPERATION RECOVERS STOLEN HISTORICAL ARTIFACTS' }
];

const NEWS_CARDS = [
    {
        category: 'CYBER CRIME',
        title: 'The Rise of Quantum Ransomware',
        excerpt: 'How emerging quantum computing is threatening traditional encryption standards globally.',
        image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800',
        date: '2H AGO'
    },
    {
        category: 'INTELLIGENCE',
        title: 'Deepfake Forensics: The New Frontier',
        excerpt: 'New AI models developed to detect synthetic media in high-stakes criminal investigations.',
        image: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=800',
        date: '4H AGO'
    },
    {
        category: 'GLOBAL SECURITY',
        title: 'Maritime Smuggling Routes Exposed',
        excerpt: 'Satellite imagery reveals shifting patterns in illegal international trade waters.',
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
        date: '6H AGO'
    },
    {
        category: 'TECH JUSTICE',
        title: 'Smart City Surveillance Ethics',
        excerpt: 'Balancing public safety with privacy in the age of omnipresent digital monitoring.',
        image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800',
        date: '1D AGO'
    }
];

const LandingPage = () => {
    const { token } = useSelector((state) => state.auth);
    const [latestCrimes, setLatestCrimes] = useState([]);
    const [stats, setStats] = useState({ totalCrimes: 0, activeInvestigations: 0, affectedRegions: 0 });
    const [mapData, setMapData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);

    const ReportModal = ({ report, onClose }) => {
        if (!report) return null;

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-[#0a0f18] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl shadow-cyan-500/10"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="relative h-64 md:h-80 overflow-hidden">
                        <img
                            src={report.evidence?.[0]?.url || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200'}
                            className="w-full h-full object-cover"
                            alt={report.title}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f18] to-transparent" />
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black text-white rounded-full transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="absolute bottom-6 left-8 right-8">
                            <span className="px-3 py-1 bg-accent-blue text-black font-black text-[10px] uppercase tracking-widest rounded mb-3 inline-block">
                                {report.crimeType}
                            </span>
                            <h2 className="text-3xl font-black text-white leading-tight">{report.title}</h2>
                        </div>
                    </div>

                    <div className="p-8 overflow-y-auto">
                        <div className="flex flex-wrap gap-6 mb-8 text-xs font-bold uppercase tracking-widest text-gray-500">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-accent-blue" />
                                <span>{new Date(report.occurredAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-accent-blue" />
                                <span>{report.location?.city}, {report.location?.country}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-accent-blue" />
                                <span className={report.severity === 'Critical' ? 'text-danger-red' : 'text-accent-blue'}>
                                    {report.severity} Priority
                                </span>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h4 className="text-white font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span className="w-4 h-px bg-accent-blue" />
                                    Incident Report
                                </h4>
                                <p className="text-gray-400 text-sm leading-relaxed border-l border-white/10 pl-6 italic">
                                    {report.description}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                    <p className="text-[10px] text-gray-500 mb-1 uppercase font-bold">Status</p>
                                    <p className="text-sm font-bold text-white">{report.status}</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                    <p className="text-[10px] text-gray-500 mb-1 uppercase font-bold">Source</p>
                                    <p className="text-sm font-bold text-white uppercase">{report.source}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12">
                            <a
                                href={report.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-accent-blue text-black font-black text-xs uppercase tracking-widest px-8 py-4 rounded hover:scale-105 transition-transform inline-flex items-center gap-2"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Access Verified Source
                            </a>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        );
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [crimesRes, statsRes, mapRes] = await Promise.all([
                    axios.get(`${API_BASE}/crimes/latest`),
                    axios.get(`${API_BASE}/crimes/stats/global`),
                    axios.get(`${API_BASE}/crimes/map`)
                ]);
                setLatestCrimes(crimesRes.data.data);
                setStats(statsRes.data.data);
                setMapData(mapRes.data.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching public data:', error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const combinedBreaking = [
        ...latestCrimes.map(c => ({ city: c.location?.city || 'GLOBAL', title: c.title })),
        ...SAMPLE_BREAKING
    ];

    return (
        <div className="min-h-screen bg-[#05070a] text-white selection:bg-accent-blue selection:text-dark-bg font-sans">
            {/* Professional Top Navigation */}
            <nav className="fixed top-0 w-full z-[1000] border-b border-white/5 bg-[#05070a]/80 backdrop-blur-xl">
                <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-8">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-accent-blue flex items-center justify-center rounded">
                                <svg className="w-5 h-5 text-dark-bg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <span className="text-xl font-black tracking-tighter italic">GLOBAL MONITOR</span>
                        </div>
                        <div className="hidden md:flex items-center space-x-6 text-sm font-bold uppercase tracking-widest text-gray-500">
                            <Link to="/" className="text-white">Overview</Link>
                            <Link to="/most-wanted" className="hover:text-white transition text-[#00f2ff]">Most Wanted</Link>
                            <a href="https://www.fbi.gov" target="_blank" rel="noreferrer" className="hover:text-white transition">FBI</a>
                            <a href="https://www.interpol.int" target="_blank" rel="noreferrer" className="hover:text-white transition">Interpol</a>
                        </div>
                    </div>
                    {token ? (
                        <Link to="/dashboard" className="px-5 py-2 bg-accent-blue text-dark-bg text-sm font-bold rounded hover:opacity-90 transition-opacity uppercase tracking-wider">
                            Dashboard
                        </Link>
                    ) : (
                        <Link to="/login" className="px-5 py-2 bg-white text-black text-sm font-bold rounded hover:bg-accent-blue transition-colors uppercase tracking-wider">
                            Login
                        </Link>
                    )}
                </div>
            </nav>

            {/* Breaking News Ticker */}
            <div className="mt-16 bg-danger-red py-2 border-b border-white/10 relative z-50 overflow-hidden shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                <div className="flex items-center">
                    <div className="bg-white text-black font-black px-6 py-1 text-xs uppercase tracking-widest z-10 shrink-0 flex items-center space-x-2">
                        <span className="w-2 h-2 bg-danger-red rounded-full animate-ping" />
                        <span>BREAKING</span>
                    </div>
                    <div className="animate-marquee whitespace-nowrap flex space-x-12 pl-12 font-bold text-sm">
                        {combinedBreaking.map((item, i) => (
                            <span key={i} className="flex items-center space-x-2">
                                <span className="opacity-60 uppercase">{item.city}:</span>
                                <span>{item.title.toUpperCase()}</span>
                                <span className="w-2 h-2 bg-white rounded-full mx-4" />
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <main className="max-w-[1440px] mx-auto px-6 py-12">
                {/* Hero Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Main Story / Hero */}
                    <div className="lg:col-span-8 space-y-8">
                        <section className="relative group overflow-hidden rounded-2xl bg-[#0a0f18] border border-white/5 aspect-[16/9] flex items-end p-8 shadow-2xl">
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
                            <img
                                src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200"
                                className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700"
                                alt="Hero"
                            />
                            <div className="relative z-20 max-w-2xl">
                                <span className="px-3 py-1 bg-accent-blue text-black font-black text-xs uppercase tracking-widest rounded mb-4 inline-block">Global Intelligence Report</span>
                                <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight group-hover:text-accent-blue transition-colors">
                                    ADVANCED CRIME MONITORING NETWORK GOES LIVE
                                </h1>
                                <p className="text-gray-300 text-lg line-clamp-2">
                                    A breakthrough in international cooperation: Real-time data streams provide unprecedented visibility into global criminal patterns.
                                </p>
                            </div>
                        </section>

                        {/* Middle Content Section - News Cards */}
                        <section className="py-12 border-t border-white/5">
                            <h2 className="text-2xl font-black mb-10 flex items-center space-x-4">
                                <span className="w-8 h-1 bg-accent-blue rounded-full" />
                                <span>INTEL STREAM</span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {NEWS_CARDS.map((news, i) => (
                                    <div key={i} className="group relative bg-[#0a0f18] rounded-2xl border border-white/5 overflow-hidden hover:border-accent-blue/50 transition-all">
                                        <div className="aspect-[16/10] overflow-hidden">
                                            <img src={news.image} alt={news.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-60" />
                                        </div>
                                        <div className="p-6">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-[10px] font-black text-accent-blue uppercase tracking-widest">{news.category}</span>
                                                <span className="text-[10px] font-bold text-gray-500">{news.date}</span>
                                            </div>
                                            <h3 className="text-xl font-bold mb-3 group-hover:text-accent-blue transition-colors leading-snug">
                                                {news.title}
                                            </h3>
                                            <p className="text-gray-400 text-sm leading-relaxed mb-4">
                                                {news.excerpt}
                                            </p>
                                            <button className="text-[10px] font-black uppercase tracking-widest text-white hover:text-accent-blue transition-colors flex items-center space-x-2">
                                                <span>Read Intelligence Report</span>
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Public Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { label: 'CRIMES REPORTED', val: stats.totalCrimes, color: 'text-white' },
                                { label: 'ACTIVE CASES', val: stats.activeInvestigations, color: 'text-accent-blue' },
                                { label: 'COUNTRIES TRACKED', val: stats.affectedRegions, color: 'text-accent-cyan' }
                            ].map((s, i) => (
                                <div key={i} className="bg-[#0a0f18] p-6 border border-white/5 rounded-xl">
                                    <p className="text-[10px] font-bold text-gray-500 tracking-[0.2em] mb-2 uppercase">{s.label}</p>
                                    <p className={`text-4xl font-black ${s.color}`}>{s.val.toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar / Trending */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="border-l border-white/10 pl-8">
                            <h2 className="text-xs font-black text-accent-blue tracking-[0.3em] uppercase mb-6 flex items-center">
                                <span className="w-4 h-px bg-accent-blue mr-3" /> Latest Activity
                            </h2>
                            <div className="space-y-8">
                                {latestCrimes.slice(0, 5).map((crime, i) => (
                                    <div key={i} className="group cursor-pointer">
                                        <div className="flex items-center space-x-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                                            <span className="text-accent-blue">{crime.crimeType}</span>
                                            <span>•</span>
                                            <span>{new Date(crime.occurredAt).toLocaleDateString()}</span>
                                        </div>
                                        <h3 className="text-lg font-bold group-hover:text-accent-blue transition-colors leading-snug">
                                            {crime.title}
                                        </h3>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-accent-blue/10 p-8 rounded-2xl border border-accent-blue/20">
                            <h3 className="text-xl font-black mb-4 italic">JOIN THE COALITION</h3>
                            <p className="text-xs text-gray-400 leading-relaxed mb-6">
                                Registered enforcement agencies can access full forensic data and criminal profile relationships.
                            </p>
                            <Link to="/login" className="block text-center py-3 bg-accent-blue text-black font-black text-xs uppercase tracking-widest rounded hover:scale-105 transition-transform">
                                Request Access
                            </Link>
                        </div>
                    </div>
                </div>

                {/* World Map Section */}
                <section className="mt-20">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-black tracking-tight">GLOBAL EVENT HEATMAP</h2>
                            <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Interactive Geographic Intelligence Interface</p>
                        </div>
                        <div className="flex space-x-4">
                            <div className="flex items-center space-x-2 text-[10px] font-bold">
                                <span className="w-2 h-2 bg-danger-red rounded-full" />
                                <span className="text-gray-400">CRITICAL</span>
                            </div>
                            <div className="flex items-center space-x-2 text-[10px] font-bold">
                                <span className="w-2 h-2 bg-accent-blue rounded-full" />
                                <span className="text-gray-400">STANDARD</span>
                            </div>
                        </div>
                    </div>

                    <div className="map-container relative z-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                        <MapContainer center={[20, 0]} zoom={2} scrollWheelZoom={false} className="h-full">
                            <TileLayer
                                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                            />
                            {mapData.map((crime, i) => (
                                <Marker
                                    key={i}
                                    position={crime.location.coordinates.reverse()}
                                    icon={L.divIcon({
                                        className: 'custom-div-icon',
                                        html: `<div class="w-4 h-4 rounded-full border-2 border-white ${crime.severity === 'Critical' ? 'bg-danger-red' : 'bg-accent-blue'} animate-pulse shadow-[0_0_10px_currentColor]"></div>`,
                                        iconSize: [20, 20],
                                        iconAnchor: [10, 10]
                                    })}
                                >
                                    <Popup className="auth-popup">
                                        <div className="p-1">
                                            <p className="font-bold text-black text-sm">{crime.title}</p>
                                            <p className="text-xs text-gray-500 uppercase">{crime.crimeType} • {crime.location.city}</p>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                </section>

                <section className="mt-24 space-y-12">
                    <h2 className="text-2xl font-black border-l-4 border-accent-blue pl-6">INTEL REPORTS</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {latestCrimes.map((crime, i) => (
                            <div key={i} className="group cursor-pointer" onClick={() => setSelectedReport(crime)}>
                                <div className="aspect-video bg-[#0a0f18] rounded-xl mb-4 border border-white/5 group-hover:border-accent-blue/30 transition-all overflow-hidden">
                                    {crime.evidence?.[0]?.url ? (
                                        <img
                                            src={crime.evidence[0].url}
                                            alt={crime.title}
                                            className="w-full h-full object-cover opacity-60 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Shield className="w-12 h-12 text-white/10 group-hover:text-accent-blue/30 transition-colors" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[10px] font-black text-accent-blue uppercase tracking-widest">{crime.crimeType}</span>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase">{crime.location?.city}</span>
                                </div>
                                <h3 className="font-bold mb-3 group-hover:text-accent-blue transition-colors news-line-clamp">{crime.title}</h3>
                                <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{crime.description}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="mt-20 border-t border-white/5 bg-[#05070a] py-16 px-6">
                <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="col-span-2">
                        <div className="flex items-center space-x-2 mb-6 opacity-30">
                            <div className="w-6 h-6 bg-white flex items-center justify-center rounded">
                                <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <span className="text-lg font-black tracking-tighter italic">GLOBAL MONITOR</span>
                        </div>
                        <p className="text-gray-500 text-xs max-w-md leading-relaxed">
                            DISCLAIMER: This platform is for demonstration and academic purposes only. Real-time data is simulated or sourced from public repositories. No active personal surveillance is conducted. Developed for university Final Year Project.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-black text-xs uppercase tracking-widest mb-6">Data Sources</h4>
                        <ul className="text-xs text-gray-500 space-y-4 font-bold uppercase tracking-wider">
                            <li><a href="https://www.fbi.gov/wanted" target="_blank" rel="noreferrer" className="hover:text-white transition decoration-accent-blue/50 underline-offset-4 hover:underline">FBI Wanted List</a></li>
                            <li><a href="https://www.interpol.int/en/How-we-work/Notices/View-Red-Notices" target="_blank" rel="noreferrer" className="hover:text-white transition decoration-accent-blue/50 underline-offset-4 hover:underline">Interpol Red Notices</a></li>
                            <li><Link to="/most-wanted" className="hover:text-white transition decoration-accent-blue/50 underline-offset-4 hover:underline">Global Aggregator</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-black text-xs uppercase tracking-widest mb-6">Legal</h4>
                        <ul className="text-xs text-gray-500 space-y-4 font-bold uppercase tracking-wider">
                            <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-white transition">Data Usage</a></li>
                            <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>
            </footer>
            {/* Report Modal */}
            <AnimatePresence>
                {selectedReport && (
                    <ReportModal
                        report={selectedReport}
                        onClose={() => setSelectedReport(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default LandingPage;
