import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Shield, X, Calendar, MapPin, ExternalLink, Globe, AlertCircle, Activity, Eye } from 'lucide-react';

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

const FALLBACK_IMAGES = {
    hero: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600&auto=format&fit=crop',
    intel: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop',
    security: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=800&auto=format&fit=crop',
    city: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=800&auto=format&fit=crop',
    tech: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop'
};

const NEWS_CARDS = [
    {
        category: 'CYBER CRIME',
        title: 'The Rise of Quantum Ransomware',
        excerpt: 'How emerging quantum computing is threatening traditional encryption standards globally.',
        image: FALLBACK_IMAGES.security,
        date: '2H AGO'
    },
    {
        category: 'INTELLIGENCE',
        title: 'Deepfake Forensics: The New Frontier',
        excerpt: 'New AI models developed to detect synthetic media in high-stakes criminal investigations.',
        image: FALLBACK_IMAGES.tech,
        date: '4H AGO'
    },
    {
        category: 'GLOBAL SECURITY',
        title: 'Maritime Smuggling Routes Exposed',
        excerpt: 'Satellite imagery reveals shifting patterns in illegal international trade waters.',
        image: FALLBACK_IMAGES.hero,
        date: '6H AGO'
    },
    {
        category: 'TECH JUSTICE',
        title: 'Smart City Surveillance Ethics',
        excerpt: 'Balancing public safety with privacy in the age of omnipresent digital monitoring.',
        image: FALLBACK_IMAGES.city,
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

        const reportImage = report.evidence?.[0]?.url || FALLBACK_IMAGES.hero;

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-[#05070a]/95 backdrop-blur-xl"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="bg-[#0a0f18] border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl shadow-accent-blue/5"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="relative h-72 md:h-96 shrink-0 overflow-hidden">
                        <img
                            src={reportImage}
                            className="w-full h-full object-cover"
                            alt={report.title}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f18] via-transparent to-transparent" />
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 bg-black/50 hover:bg-accent-blue text-white hover:text-black rounded-full transition-all border border-white/10 shadow-lg"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="absolute bottom-8 left-10 right-10">
                            <span className="px-3 py-1 bg-accent-blue text-black font-black text-[10px] uppercase tracking-[0.2em] rounded-md mb-4 inline-block">
                                {report.crimeType || 'INTELLIGENCE REPORT'}
                            </span>
                            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight tracking-tight uppercase italic">{report.title}</h2>
                        </div>
                    </div>

                    <div className="p-10 overflow-y-auto custom-scrollbar">
                        <div className="flex flex-wrap gap-8 mb-10 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-accent-blue" />
                                <span>{new Date(report.occurredAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-accent-cyan" />
                                <span>{report.location?.city || 'GLOBAL'}, {report.location?.country || 'REGION'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-danger-red" />
                                <span className={report.severity === 'Critical' ? 'text-danger-red animate-pulse' : 'text-accent-blue'}>
                                    {report.severity} PRIORITY LEVEL
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            <div className="lg:col-span-2 space-y-8">
                                <div>
                                    <h4 className="text-white font-black text-[10px] uppercase tracking-[0.3em] mb-6 flex items-center gap-4">
                                        <span className="w-8 h-px bg-accent-blue" />
                                        SITUATION OVERVIEW
                                    </h4>
                                    <p className="text-gray-400 text-base leading-relaxed border-l-2 border-white/5 pl-8 italic">
                                        {report.description}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
                                    <p className="text-[10px] text-gray-500 mb-2 uppercase font-black tracking-widest">CURRENT STATUS</p>
                                    <p className="text-sm font-black text-white uppercase tracking-tighter italic">{report.status}</p>
                                </div>
                                <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
                                    <p className="text-[10px] text-gray-500 mb-2 uppercase font-black tracking-widest">VALIDATED SOURCE</p>
                                    <p className="text-sm font-black text-accent-cyan uppercase tracking-tighter italic">{report.source}</p>
                                </div>

                                <div className="pt-4">
                                    <a
                                        href={report.sourceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full bg-accent-blue text-black font-black text-[10px] uppercase tracking-[0.2em] px-6 py-4 rounded-xl hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,212,255,0.2)] transition-all flex items-center justify-center gap-3"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        VIEW ACCESS LOG
                                    </a>
                                </div>
                            </div>
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
            {/* Refined Top Navigation */}
            <nav className="fixed top-0 w-full z-[1000] border-b border-white/[0.03] bg-[#05070a]/90 backdrop-blur-2xl">
                <div className="max-w-[1440px] mx-auto px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center space-x-12">
                        <Link to="/" className="flex items-center space-x-3 group">
                            <div className="w-10 h-10 bg-accent-blue flex items-center justify-center rounded-xl shadow-[0_0_20px_rgba(0,212,255,0.2)] group-hover:scale-105 transition-transform">
                                <Shield className="w-6 h-6 text-dark-bg" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-black tracking-tighter italic leading-none">CMS CORE</span>
                                <span className="text-[8px] font-black tracking-[0.4em] text-accent-blue uppercase">Global Intel</span>
                            </div>
                        </Link>
                        <div className="hidden lg:flex items-center space-x-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                            <Link to="/" className="text-white hover:text-accent-blue transition-colors">Intelligence</Link>
                            <Link to="/most-wanted" className="hover:text-white transition decoration-accent-blue decoration-2 underline-offset-8 hover:underline">Most Wanted</Link>
                            <a href="https://www.fbi.gov" target="_blank" rel="noreferrer" className="hover:text-white transition">FBI Nexus</a>
                            <a href="https://www.interpol.int" target="_blank" rel="noreferrer" className="hover:text-white transition">Interpol</a>
                        </div>
                    </div>
                    <div className="flex items-center space-x-6">
                        {token ? (
                            <Link to="/dashboard" className="px-6 py-2.5 bg-accent-blue text-dark-bg text-[10px] font-black rounded-xl hover:shadow-[0_0_25px_rgba(0,212,255,0.3)] transition-all uppercase tracking-[0.1em]">
                                ACCESS HUB
                            </Link>
                        ) : (
                            <Link to="/login" className="px-6 py-2.5 bg-white text-black text-[10px] font-black rounded-xl hover:bg-accent-cyan transition-all uppercase tracking-[0.1em]">
                                AGENT LOGIN
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* Breaking News Ticker - Refined */}
            <div className="mt-20 bg-danger-red py-2 border-b border-white/5 relative z-50 overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.1)]">
                <div className="flex items-center">
                    <div className="bg-white text-black font-black px-8 py-1 text-[10px] uppercase tracking-[0.3em] z-10 shrink-0 flex items-center space-x-3">
                        <span className="w-2 h-2 bg-danger-red rounded-full animate-ping" />
                        <span>LIVE INTEL</span>
                    </div>
                    <div className="animate-marquee whitespace-nowrap flex space-x-16 pl-16 font-black text-xs italic tracking-tight">
                        {combinedBreaking.map((item, i) => (
                            <span key={i} className="flex items-center space-x-3">
                                <span className="opacity-40 uppercase tracking-widest not-italic font-bold text-[10px]">{item.city}</span>
                                <span className="text-white">{item.title.toUpperCase()}</span>
                                <span className="w-1.5 h-1.5 bg-white/20 rounded-full mx-4" />
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <main className="max-w-[1440px] mx-auto px-8 py-16">
                {/* Hero Highlights */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24">
                    {/* Main Intel Hero */}
                    <div className="lg:col-span-8 space-y-10">
                        <section
                            onClick={() => setSelectedReport(latestCrimes[0] || NEWS_CARDS[0])}
                            className="relative group overflow-hidden rounded-[2.5rem] bg-[#0a0f18] border border-white/5 aspect-[16/9] flex items-end p-12 shadow-2xl cursor-pointer"
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
                            <img
                                src={latestCrimes[0]?.evidence?.[0]?.url || FALLBACK_IMAGES.hero}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-60"
                                alt="Main intel"
                            />
                            <div className="relative z-20 w-full max-w-3xl">
                                <div className="flex items-center space-x-4 mb-6">
                                    <span className="px-4 py-1.5 bg-accent-blue text-black font-black text-[10px] uppercase tracking-[0.3em] rounded-lg shadow-lg">
                                        PRIORITY ALPHA
                                    </span>
                                    <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-lg border border-white/10">
                                        {latestCrimes[0]?.location?.city || 'GLOBAL NETWORK'}
                                    </span>
                                </div>
                                <h1 className="text-5xl md:text-6xl font-black mb-6 uppercase tracking-tighter italic leading-[0.9] group-hover:text-accent-blue transition-colors">
                                    {latestCrimes[0]?.title || 'MONITORING GLOBAL INCIDENTS'}
                                </h1>
                                <p className="text-gray-400 text-xl max-w-2xl line-clamp-2 font-medium leading-relaxed italic">
                                    {latestCrimes[0]?.description || 'A breakthrough in international cooperation: Real-time data streams provide unprecedented visibility into global criminal patterns.'}
                                </p>
                            </div>
                        </section>

                        {/* Public Analytics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { label: 'VETTED REPORTS', val: stats.totalCrimes, color: 'text-white', icon: Shield },
                                { label: 'ACTIVE CASES', val: stats.activeInvestigations, color: 'text-accent-blue', icon: Activity },
                                { label: 'GLOBAL REACH', val: stats.affectedRegions, color: 'text-accent-cyan', icon: Globe }
                            ].map((s, i) => (
                                <div key={i} className="glass-card p-10 border border-white/5 relative overflow-hidden group hover:border-accent-blue/20 transition-all">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <s.icon className="w-20 h-20" />
                                    </div>
                                    <p className="text-[10px] font-black text-gray-500 tracking-[0.3em] mb-4 uppercase">{s.label}</p>
                                    <div className="flex items-baseline space-x-2">
                                        <p className={`text-5xl font-black ${s.color} tracking-tighter italic`}>{s.val.toLocaleString()}</p>
                                        <span className="text-xs font-black text-gray-600 uppercase">Pts</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Desktop Activity Sidebar */}
                    <div className="lg:col-span-4 space-y-10">
                        <div className="glass-card p-10 border border-white/5 h-full flex flex-col">
                            <h2 className="text-[10px] font-black text-accent-blue tracking-[0.4em] uppercase mb-10 flex items-center">
                                <span className="w-10 h-px bg-accent-blue mr-4" /> RECENT ACTIVITY
                            </h2>
                            <div className="space-y-10 flex-1">
                                {(latestCrimes.length > 0 ? latestCrimes.slice(0, 6) : NEWS_CARDS).map((crime, i) => (
                                    <div
                                        key={i}
                                        onClick={() => crime._id && setSelectedReport(crime)}
                                        className="group cursor-pointer border-b border-white/[0.03] pb-6 last:border-0"
                                    >
                                        <div className="flex items-center space-x-4 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3">
                                            <span className="text-accent-blue">{crime.crimeType || crime.category}</span>
                                            <span className="w-1 h-1 bg-white/20 rounded-full" />
                                            <span>{crime.occurredAt ? new Date(crime.occurredAt).toLocaleDateString() : crime.date}</span>
                                        </div>
                                        <h3 className="text-base font-black group-hover:text-accent-blue transition-colors leading-tight uppercase italic tracking-tight">
                                            {crime.title}
                                        </h3>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-10 pt-10 border-t border-white/5">
                                <Link to="/login" className="flex items-center justify-between group">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 group-hover:text-white transition-colors">Access Full Database</span>
                                    <ExternalLink className="w-4 h-4 text-accent-blue group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* News Grid Section - "Specialized Insights" */}
                <section className="mb-32">
                    <div className="flex items-center justify-between mb-12">
                        <div className="flex items-center gap-6">
                            <div className="w-12 h-12 bg-accent-cyan/10 flex items-center justify-center rounded-2xl border border-accent-cyan/20 text-accent-cyan">
                                <Globe className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black italic tracking-tighter uppercase">Intelligence Stream</h2>
                                <p className="text-[10px] text-gray-500 font-black tracking-[0.3em] uppercase mt-1">Global Incident Monitor & Analysis</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                        {(latestCrimes.length > 1 ? latestCrimes.slice(1, 5) : NEWS_CARDS).map((news, i) => (
                            <div
                                key={i}
                                onClick={() => news._id && setSelectedReport(news)}
                                className="group bg-[#0a0f18] rounded-[2rem] border border-white/5 overflow-hidden hover:border-accent-blue/30 transition-all cursor-pointer shadow-xl flex flex-col"
                            >
                                <div className="aspect-[4/3] overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f18] to-transparent z-10 opacity-60" />
                                    <img
                                        src={news.evidence?.[0]?.url || news.image || FALLBACK_IMAGES.intel}
                                        alt={news.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80"
                                    />
                                    <div className="absolute top-4 left-4 z-20">
                                        <span className="px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg text-[8px] font-black text-accent-blue uppercase tracking-[0.2em]">
                                            {news.crimeType || news.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-8 flex-1 flex flex-col">
                                    <div className="text-[10px] font-bold text-gray-500 mb-4 tracking-widest uppercase">
                                        {news.occurredAt ? new Date(news.occurredAt).toLocaleDateString() : news.date}
                                    </div>
                                    <h3 className="text-lg font-black mb-4 group-hover:text-accent-blue transition-colors leading-tight uppercase italic tracking-tight flex-1">
                                        {news.title}
                                    </h3>
                                    <div className="pt-6 border-t border-white/5">
                                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-blue flex items-center gap-2 group-hover:gap-4 transition-all">
                                            <span>Full Intelligence</span>
                                            <div className="h-px w-6 bg-accent-blue" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Geographic Intelligence Interface (Map) */}
                <section className="mb-32">
                    <div className="glass-card p-4 border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl relative">
                        <div className="absolute top-10 left-10 z-20 pointer-events-none">
                            <div className="bg-[#05070a]/80 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl max-w-xs pointer-events-auto">
                                <h2 className="text-2xl font-black tracking-tighter italic uppercase mb-2">Geo-Intelligence</h2>
                                <p className="text-[10px] text-gray-500 font-black tracking-[0.3em] uppercase mb-8">Live Global Heatmap</p>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 bg-danger-red rounded-full shadow-[0_0_10px_#ef4444]" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Critical</span>
                                        </div>
                                        <span className="text-xs font-black italic">{mapData.filter(m => m.severity === 'Critical').length}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 bg-accent-blue rounded-full shadow-[0_0_10px_#00d4ff]" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Regular</span>
                                        </div>
                                        <span className="text-xs font-black italic">{mapData.filter(m => m.severity !== 'Critical').length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="h-[700px] w-full relative z-10 rounded-[2.5rem] overflow-hidden">
                            <MapContainer center={[20, 0]} zoom={3} scrollWheelZoom={false} className="h-full grayscale-[0.5] invert-[0.1]">
                                <TileLayer
                                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors'
                                />
                                {mapData.map((crime, i) => (
                                    <Marker
                                        key={i}
                                        position={crime.location.coordinates.reverse()}
                                        icon={L.divIcon({
                                            className: 'custom-div-icon',
                                            html: `<div class="w-5 h-5 rounded-full border-2 border-white/50 ${crime.severity === 'Critical' ? 'bg-danger-red' : 'bg-accent-blue'} shadow-[0_0_20px_currentColor] flex items-center justify-center animate-pulse"><div class="w-1.5 h-1.5 bg-white rounded-full"></div></div>`,
                                            iconSize: [24, 24],
                                            iconAnchor: [12, 12]
                                        })}
                                    >
                                        <Popup className="auth-popup">
                                            <div className="p-2">
                                                <p className="font-black text-white text-xs uppercase italic mb-1">{crime.title}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[8px] font-black px-1.5 py-0.5 bg-accent-blue text-black rounded uppercase tracking-tighter">
                                                        {crime.crimeType}
                                                    </span>
                                                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{crime.location.city}</span>
                                                </div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                            </MapContainer>
                        </div>
                    </div>
                </section>

                {/* Intelligence Archive (Bottom Grid) */}
                <section>
                    <div className="flex items-center justify-between mb-16 border-b border-white/5 pb-10">
                        <div>
                            <h2 className="text-4xl font-black italic tracking-tighter uppercase">Intelligence Matrix</h2>
                            <p className="text-[10px] text-gray-500 font-black tracking-[0.4em] uppercase mt-2">Historical & Current Incident Database</p>
                        </div>
                        <Link to="/login" className="px-8 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all">
                            View Historical Logs
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                        {latestCrimes.map((crime, i) => (
                            <div key={i} className="group cursor-pointer flex flex-col" onClick={() => setSelectedReport(crime)}>
                                <div className="aspect-square bg-[#0a0f18] rounded-[2.5rem] mb-6 border border-white/5 group-hover:border-accent-cyan/30 transition-all overflow-hidden relative shadow-xl">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10 opacity-40" />
                                    <img
                                        src={crime.evidence?.[0]?.url || FALLBACK_IMAGES.city}
                                        alt={crime.title}
                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700 opacity-40 group-hover:opacity-100"
                                    />
                                    <div className="absolute bottom-6 left-6 right-6 z-20">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                                                <Eye className="w-4 h-4 text-white" />
                                            </div>
                                            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/50 group-hover:text-white transition-colors">VET INTEL</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[8px] font-black text-accent-cyan uppercase tracking-[0.3em] font-mono">{crime.crimeType}</span>
                                        <span className="text-[8px] font-black text-gray-700 uppercase tracking-widest">{crime.location?.city}</span>
                                    </div>
                                    <h3 className="text-sm font-black mb-4 group-hover:text-accent-cyan transition-colors leading-tight uppercase italic tracking-tighter line-clamp-2">{crime.title}</h3>
                                    <p className="text-gray-600 text-[10px] font-medium leading-relaxed line-clamp-2 italic">{crime.description}</p>
                                </div>
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
