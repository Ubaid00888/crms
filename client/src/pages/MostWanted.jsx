import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, AlertCircle, Globe, Shield, RefreshCw, X, User, MapPin, Calendar, ExternalLink } from 'lucide-react';
import MostWantedCard from '../components/MostWantedCard';
import { getMostWanted, searchMostWanted } from '../services/publicService';

const DetailsModal = ({ criminal, onClose }) => {
    if (!criminal) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-[#0f172a] border border-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-all"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Left Side: Image Gallery */}
                <div className="w-full md:w-1/2 bg-black flex flex-col">
                    <div className="flex-1 overflow-auto p-4 flex flex-col gap-4 scrollbar-hide">
                        {criminal.images && criminal.images.length > 0 ? (
                            criminal.images.map((img, idx) => (
                                <div key={idx} className="relative group">
                                    <img
                                        src={img.original}
                                        alt={img.caption || criminal.fullName}
                                        className="w-full rounded-lg border border-gray-800"
                                    />
                                    {img.caption && (
                                        <p className="mt-2 text-[10px] text-gray-500 italic uppercase tracking-wider">
                                            {img.caption}
                                        </p>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-700">
                                <Globe className="w-20 h-20 opacity-20" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Details */}
                <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto bg-[#0f172a]">
                    <div className="mb-6">
                        <span className="px-2 py-1 bg-cyan-500/10 text-cyan-500 text-[10px] font-bold uppercase rounded border border-cyan-500/20 mb-2 inline-block">
                            {criminal.sourceAgency} INTELLIGENCE FILE
                        </span>
                        <h2 className="text-3xl font-black text-white leading-tight">{criminal.fullName}</h2>
                        {criminal.aliases && criminal.aliases.length > 0 && (
                            <p className="text-gray-500 text-xs mt-2 italic">
                                ALIASES: {criminal.aliases.join(', ')}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <User className="w-4 h-4 text-cyan-500 mt-1" />
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold">Gender</p>
                                    <p className="text-sm text-gray-300">{criminal.gender || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Globe className="w-4 h-4 text-cyan-500 mt-1" />
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold">Nationality</p>
                                    <p className="text-sm text-gray-300">{criminal.nationality || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 text-cyan-500 mt-1" />
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold">Last Known Location</p>
                                    <p className="text-sm text-gray-300 truncate">{criminal.lastKnownLocation || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Calendar className="w-4 h-4 text-cyan-500 mt-1" />
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold">Published At</p>
                                    <p className="text-sm text-gray-300">{new Date(criminal.publishedAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {criminal.reward && (
                        <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl mb-8">
                            <p className="text-yellow-500 font-black text-sm mb-1 uppercase tracking-tighter">OFFICIAL REWARD</p>
                            <p className="text-white text-lg font-bold">{criminal.reward}</p>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div>
                            <h4 className="text-white font-bold text-sm uppercase mb-3 flex items-center gap-2">
                                <Shield className="w-4 h-4 text-cyan-500" />
                                CRIME DESCRIPTION
                            </h4>
                            <div className="text-sm text-gray-400 leading-relaxed bg-black/20 p-4 rounded-lg border border-gray-800">
                                {criminal.crimeDescription || 'No detailed description available in the public record.'}
                            </div>
                        </div>

                        {criminal.wantedFor && criminal.wantedFor.length > 0 && (
                            <div>
                                <h4 className="text-white font-bold text-sm uppercase mb-3">WANTED FOR</h4>
                                <div className="flex flex-wrap gap-2">
                                    {criminal.wantedFor.map((item, i) => (
                                        <span key={i} className="px-3 py-1 bg-red-500/10 text-red-500 text-[10px] font-bold rounded border border-red-500/20">
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-12 flex gap-4">
                        <a
                            href={criminal.detailsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
                        >
                            <ExternalLink className="w-4 h-4" />
                            OFFICIAL SOURCE
                        </a>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

const MostWanted = () => {
    const [criminals, setCriminals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [agency, setAgency] = useState('');
    const [pagination, setPagination] = useState({ current: 1, total: 1 });
    const [error, setError] = useState(null);
    const [selectedCriminal, setSelectedCriminal] = useState(null);

    const fetchMostWanted = async (page = 1, searchQuery = '', agencyFilter = '') => {
        setLoading(true);
        setError(null);
        try {
            let data;
            if (searchQuery) {
                data = await searchMostWanted(searchQuery, page);
            } else {
                data = await getMostWanted(page, 12, agencyFilter);
            }
            setCriminals(data.criminals);
            setPagination({ current: data.currentPage, total: data.totalPages });
        } catch (err) {
            setError('Failed to fetch most wanted data. Please try again later.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMostWanted(1, searchTerm, agency);
    }, [agency]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchMostWanted(1, searchTerm, agency);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.total) {
            fetchMostWanted(newPage, searchTerm, agency);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0f1d] text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="max-w-7xl mx-auto mb-12">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-4xl md:text-5xl font-black tracking-tight mb-2"
                        >
                            MOST <span className="text-cyan-500">WANTED</span>
                        </motion.h1>
                        <p className="text-gray-400 max-w-2xl text-sm md:text-base border-l-2 border-cyan-500 pl-4">
                            Official public intelligence feed aggregating data from FBI, INTERPOL, and global law enforcement agencies.
                            <span className="block mt-1 text-xs text-gray-500 italic">
                                Data sourced from public law enforcement releases for academic purposes only.
                            </span>
                        </p>
                    </div>

                    <div className="flex items-center gap-4 bg-[#161b2e] p-2 rounded-lg border border-gray-800">
                        <div className="p-2 bg-cyan-500/10 rounded-md">
                            <Shield className="text-cyan-500 w-5 h-5" />
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Global Status</p>
                            <p className="text-sm font-mono text-green-400">ACTIVE MONITORING</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="bg-[#161b2e]/50 backdrop-blur-md border border-gray-800 p-4 rounded-xl flex flex-col lg:flex-row gap-4">
                    <form onSubmit={handleSearch} className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name, alias, or crime..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#0a0f1d] border border-gray-700 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all text-sm"
                        />
                    </form>

                    <div className="flex gap-2">
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                            <select
                                value={agency}
                                onChange={(e) => setAgency(e.target.value)}
                                className="bg-[#0a0f1d] border border-gray-700 rounded-lg py-3 pl-10 pr-8 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all text-sm appearance-none"
                            >
                                <option value="">All Agencies</option>
                                <option value="FBI">FBI</option>
                                <option value="INTERPOL">INTERPOL</option>
                            </select>
                        </div>

                        <button
                            onClick={() => fetchMostWanted(1, searchTerm, agency)}
                            className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-lg font-bold transition-all text-sm flex items-center gap-2"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            SYNC
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-lg flex items-center gap-3 text-red-500 mb-8">
                        <AlertCircle className="w-5 h-5" />
                        <p>{error}</p>
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        >
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="bg-[#1a1f35] border border-gray-800 rounded-xl h-[400px] animate-pulse">
                                    <div className="h-64 bg-gray-800/50 rounded-t-xl" />
                                    <div className="p-5 space-y-3">
                                        <div className="h-6 bg-gray-800/50 rounded w-3/4" />
                                        <div className="h-4 bg-gray-800/50 rounded w-1/2" />
                                        <div className="h-4 bg-gray-800/50 rounded w-full" />
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    ) : criminals.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20 border-2 border-dashed border-gray-800 rounded-2xl"
                        >
                            <Globe className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-400">No Records Found</h3>
                            <p className="text-gray-600">Try adjusting your search or filters.</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        >
                            {criminals.map((criminal) => (
                                <MostWantedCard
                                    key={criminal._id}
                                    criminal={criminal}
                                    onReadMore={(c) => setSelectedCriminal(c)}
                                />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Pagination */}
                {!loading && pagination.total > 1 && (
                    <div className="flex justify-center mt-12 gap-2">
                        <button
                            disabled={pagination.current === 1}
                            onClick={() => handlePageChange(pagination.current - 1)}
                            className="px-4 py-2 bg-[#161b2e] border border-gray-800 rounded-lg hover:bg-[#1a1f35] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Previous
                        </button>
                        <div className="flex items-center px-4 text-sm font-mono">
                            Page {pagination.current} of {pagination.total}
                        </div>
                        <button
                            disabled={pagination.current === pagination.total}
                            onClick={() => handlePageChange(pagination.current + 1)}
                            className="px-4 py-2 bg-[#161b2e] border border-gray-800 rounded-lg hover:bg-[#1a1f35] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Academic Footer */}
            <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-gray-600 text-xs">
                    © 2026 Crime Management System (CMS) | Academic Final Year Project
                </p>
                <div className="flex gap-6">
                    <a href="https://www.fbi.gov/wanted" target="_blank" rel="noreferrer" className="text-gray-600 hover:text-cyan-500 transition-colors text-xs">FBI Wanted List</a>
                    <a href="https://www.interpol.int/en/How-we-work/Notices/View-Red-Notices" target="_blank" rel="noreferrer" className="text-gray-600 hover:text-cyan-500 transition-colors text-xs">INTERPOL Red Notices</a>
                </div>
            </div>
            {/* Details Modal */}
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

export default MostWanted;
