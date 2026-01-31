import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Shield, Eye, Database, Terminal, Cpu } from 'lucide-react';

const MostWantedCard = ({ criminal, onReadMore }) => {
    const hasMultipleImages = criminal.images && criminal.images.length > 1;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="group bg-[#0a0f1d] border border-white/10 rounded-xl overflow-hidden shadow-2xl hover:border-accent-blue/40 transition-all duration-300 flex flex-col h-full"
        >
            {/* Intelligence Matrix Header (Replacing Image) */}
            <div className="relative h-48 overflow-hidden bg-[#0d1425] border-b border-white/5 flex flex-col items-center justify-center p-6 group-hover:bg-[#111a30] transition-colors">
                {/* Tech Background Elements */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#00d4ff_1px,transparent_1px)] [background-size:16px_16px]" />
                </div>

                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-accent-blue/30 flex items-center justify-center mb-3 group-hover:border-accent-blue transition-colors">
                        <Database className="w-8 h-8 text-accent-blue opacity-50 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-accent-blue uppercase tracking-[0.3em]">ID_CRYPTO_HASH</p>
                        <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest truncate max-w-[150px]">
                            {criminal._id.toUpperCase()}
                        </p>
                    </div>
                </div>

                {/* Status Badges */}
                <div className="absolute top-3 left-3">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-[0.15em] border ${criminal.sourceAgency === 'FBI'
                            ? 'bg-danger-red/10 text-danger-red border-danger-red/20'
                            : 'bg-accent-blue/10 text-accent-blue border-accent-blue/20'
                        }`}>
                        {criminal.sourceAgency} // CORE_DB
                    </span>
                </div>

                {/* Reward Badge if exists */}
                {criminal.reward && (
                    <div className="absolute bottom-3 right-3">
                        <div className="flex items-center gap-1.5 bg-accent-yellow/10 border border-accent-yellow/20 px-2 py-0.5 rounded">
                            <Cpu className="w-2.5 h-2.5 text-accent-yellow" />
                            <span className="text-[8px] font-black text-accent-yellow uppercase tracking-tighter">Bounty_Active</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Matrix Data section */}
            <div className="p-5 flex-1 flex flex-col bg-dark-surface/30">
                <div className="mb-4">
                    <h3 className="text-sm font-black text-white mb-1 uppercase tracking-tight italic group-hover:text-accent-blue transition-colors whitespace-nowrap overflow-hidden text-ellipsis">
                        {criminal.fullName}
                    </h3>
                    <div className="flex items-center gap-2">
                        <Terminal className="w-3 h-3 text-gray-600" />
                        <p className="text-danger-red text-[9px] font-black uppercase tracking-widest truncate">
                            {criminal.wantedFor && criminal.wantedFor.length > 0 ? criminal.wantedFor[0] : 'Intelligence Target'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-6">
                    <div className="space-y-1">
                        <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Nationality</p>
                        <p className="text-[10px] font-bold text-gray-300 uppercase">{criminal.nationality || 'UNIDENTIFIED'}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Current_Loc</p>
                        <p className="text-[10px] font-bold text-gray-300 truncate uppercase">{criminal.lastKnownLocation || 'UNKNOWN'}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">File_Status</p>
                        <p className="text-[10px] font-bold text-success-green uppercase">ACTIVE_INGEST</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Image_Rel</p>
                        <p className="text-[10px] font-bold text-accent-blue uppercase">{hasMultipleImages ? `MULTI_SRC (${criminal.images.length})` : 'SINGLE_SRC'}</p>
                    </div>
                </div>

                <div className="mt-auto pt-4 border-t border-white/5 flex gap-2">
                    <button
                        onClick={() => onReadMore && onReadMore(criminal)}
                        className="flex-1 bg-accent-blue hover:bg-accent-blue-light text-black text-[10px] font-black py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 uppercase tracking-widest shadow-lg shadow-accent-blue/10"
                    >
                        <Eye className="w-3.5 h-3.5" /> View Profile
                    </button>
                    <a
                        href={criminal.detailsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg border border-white/5 transition-all"
                        title="OFFICIAL HUB ACCESS"
                    >
                        <Globe className="w-4 h-4" />
                    </a>
                </div>
            </div>
        </motion.div>
    );
};

export default MostWantedCard;
