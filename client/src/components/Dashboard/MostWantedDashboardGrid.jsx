import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ChevronRight, X, User, Globe, MapPin, Calendar, ExternalLink, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getMostWanted } from '../../services/publicService';
import MostWantedCard from '../MostWantedCard';

const DetailsModal = ({ criminal, onClose }) => {
    if (!criminal) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl relative"
                onClick={e => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-all border border-white/10"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Left Side: Image Gallery */}
                <div className="w-full md:w-1/2 bg-black/40 flex flex-col border-r border-white/5">
                    <div className="flex-1 overflow-auto p-4 flex flex-col gap-4 custom-scrollbar">
                        {criminal.images && criminal.images.length > 0 ? (
                            criminal.images.map((img, idx) => (
                                <div key={idx} className="relative group">
                                    <img
                                        src={img.original}
                                        alt={img.caption || criminal.fullName}
                                        className="w-full rounded-lg border border-white/5"
                                    />
                                    {img.caption && (
                                        <p className="mt-2 text-[10px] text-gray-500 italic uppercase tracking-wider text-center">
                                            {img.caption}
                                        </p>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-800">
                                <Globe className="w-20 h-20 opacity-10" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Details */}
                <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto bg-[#0a0f1d] custom-scrollbar">
                    <div className="mb-6">
                        <span className="px-2 py-1 bg-accent-blue/10 text-accent-blue text-[10px] font-black uppercase rounded border border-accent-blue/20 mb-2 inline-block tracking-widest">
                            {criminal.sourceAgency} INTELLIGENCE FILE
                        </span>
                        <h2 className="text-3xl font-black text-white leading-tight uppercase italic">{criminal.fullName}</h2>
                        {criminal.aliases && criminal.aliases.length > 0 && (
                            <p className="text-gray-500 text-[10px] font-black mt-2 italic uppercase tracking-wider">
                                ALIASES: {criminal.aliases.join(', ')}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <User className="w-4 h-4 text-accent-blue mt-1" />
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Gender</p>
                                    <p className="text-sm text-gray-300 font-bold">{criminal.gender || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Globe className="w-4 h-4 text-accent-blue mt-1" />
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Nationality</p>
                                    <p className="text-sm text-gray-300 font-bold">{criminal.nationality || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 text-accent-blue mt-1" />
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Last Location</p>
                                    <p className="text-sm text-gray-300 font-bold truncate">{criminal.lastKnownLocation || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Calendar className="w-4 h-4 text-accent-blue mt-1" />
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Published</p>
                                    <p className="text-sm text-gray-300 font-bold">{new Date(criminal.publishedAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {criminal.reward && (
                        <div className="bg-accent-yellow/5 border border-accent-yellow/20 p-4 rounded-xl mb-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-accent-yellow/5 rounded-full -mr-12 -mt-12 blur-2xl" />
                            <p className="text-accent-yellow font-black text-[10px] mb-1 uppercase tracking-[0.2em] relative z-10">OFFICIAL REWARD</p>
                            <p className="text-white text-lg font-black relative z-10">{criminal.reward}</p>
                        </div>
                    )}

                    <div className="space-y-6 pb-8">
                        <div>
                            <h4 className="text-white font-black text-xs uppercase mb-3 flex items-center gap-2 tracking-widest">
                                <Shield className="w-4 h-4 text-accent-blue" />
                                Crime Description
                            </h4>
                            <div className="text-xs text-gray-400 leading-relaxed bg-white/5 p-4 rounded-lg border border-white/5 font-medium italic">
                                {criminal.crimeDescription || 'No detailed description available in the public record.'}
                            </div>
                        </div>

                        {criminal.wantedFor && criminal.wantedFor.length > 0 && (
                            <div>
                                <h4 className="text-white font-black text-xs uppercase mb-3 tracking-widest">Wanted For</h4>
                                <div className="flex flex-wrap gap-2">
                                    {criminal.wantedFor.map((item, i) => (
                                        <span key={i} className="px-3 py-1 bg-danger-red/10 text-danger-red text-[10px] font-black rounded border border-danger-red/20 uppercase tracking-tighter">
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-4">
                        <a
                            href={criminal.detailsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-accent-blue hover:bg-accent-blue-light text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-accent-blue/20 uppercase tracking-[0.2em] text-xs"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Official Source
                        </a>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

const MostWantedDashboardGrid = ({ limit = 4, title = "Priority Intelligence: Most Wanted" }) => {
    const [criminals, setCriminals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCriminal, setSelectedCriminal] = useState(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const data = await getMostWanted(1, limit);
                setCriminals(data.criminals);
            } catch (err) {
                console.error('Failed to fetch most wanted for dashboard:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [limit]);

    if (loading) {
        return (
            <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                    <Activity className="w-5 h-5 text-accent-blue animate-pulse" />
                    <div className="h-6 w-48 bg-white/5 animate-pulse rounded" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(limit)].map((_, i) => (
                        <div key={i} className="bg-[#1a1f35] border border-white/5 rounded-xl h-[400px] animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (!criminals || criminals.length === 0) return null;

    return (
        <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Shield className="w-6 h-6 text-accent-blue" />
                        <div className="absolute inset-0 bg-accent-blue/20 blur-lg rounded-full animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white italic uppercase tracking-tight">{title}</h2>
                        <p className="text-[10px] text-gray-500 font-bold tracking-[0.2em] uppercase">Global Public Intelligence Feed</p>
                    </div>
                </div>
                <Link
                    to="/most-wanted"
                    className="flex items-center gap-2 text-[10px] font-black text-accent-blue uppercase tracking-widest hover:gap-3 transition-all group"
                >
                    View Global Directory
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {criminals.map((criminal) => (
                    <MostWantedCard
                        key={criminal._id}
                        criminal={criminal}
                        onReadMore={(c) => setSelectedCriminal(c)}
                    />
                ))}
            </div>

            <AnimatePresence>
                {selectedCriminal && (
                    <DetailsModal
                        criminal={selectedCriminal}
                        onClose={() => setSelectedCriminal(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default MostWantedDashboardGrid;
