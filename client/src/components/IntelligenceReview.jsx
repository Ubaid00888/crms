import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Check, X, ExternalLink, MapPin, AlertTriangle, Eye } from 'lucide-react';
import api from '../services/api';

const IntelligenceReview = () => {
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        fetchPending();
    }, []);

    const fetchPending = async () => {
        try {
            const res = await api.get('/crimes?pending=true&limit=50');
            setPending(res.data.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching pending intel:', err);
            setLoading(false);
        }
    };

    const handleAction = async (id, approved) => {
        try {
            await api.patch(`/crimes/${id}/approve`, { approved });
            setPending(pending.filter(p => p._id !== id));
            setSelected(null);
        } catch (err) {
            console.error('Error approving/rejecting:', err);
        }
    };

    if (loading) return null;
    if (pending.length === 0) return null;

    return (
        <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Shield className="w-6 h-6 text-accent-blue" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-danger-red rounded-full animate-pulse flex items-center justify-center text-[8px] text-white font-bold">
                            {pending.length}
                        </span>
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white italic uppercase tracking-tight">Intelligence Review</h2>
                        <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Pending AI ingestions from global sources</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                    {pending.map((item) => (
                        <motion.div
                            key={item._id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="glass-card overflow-hidden border border-white/5 hover:border-accent-blue/30 transition-colors group"
                        >
                            <div className="h-40 relative">
                                <img
                                    src={item.evidence?.[0]?.url || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800'}
                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                    alt="Intel"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1d] to-transparent" />
                                <div className="absolute top-3 left-3 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded text-[10px] font-bold text-accent-blue border border-accent-blue/20">
                                    {item.location.city || 'INTERNATIONAL'}
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="text-white font-black text-sm mb-2 line-clamp-2 uppercase tracking-tight italic">
                                    {item.title}
                                </h3>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3 text-danger-red" />
                                        <span className="text-[10px] font-black text-danger-red uppercase">{item.severity}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-accent-blue" />
                                        <span className="text-[10px] font-black text-gray-400 uppercase">{item.crimeType}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAction(item._id, true)}
                                        className="flex-1 py-2 bg-accent-blue/10 hover:bg-accent-blue text-accent-blue hover:text-black transition-all rounded-lg text-[10px] font-black uppercase tracking-widest border border-accent-blue/20 flex items-center justify-center gap-2"
                                    >
                                        <Check className="w-3 h-3" /> Approve
                                    </button>
                                    <button
                                        onClick={() => handleAction(item._id, false)}
                                        className="py-2 px-3 bg-danger-red/10 hover:bg-danger-red text-danger-red hover:text-white transition-all rounded-lg border border-danger-red/20"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                    <a
                                        href={item.sourceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="py-2 px-3 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg border border-white/5"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default IntelligenceReview;
