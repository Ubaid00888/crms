import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Shield } from 'lucide-react';

const MostWantedCard = ({ criminal, onReadMore }) => {
    const mainImage = criminal.images && criminal.images.length > 0
        ? criminal.images[0].original
        : 'https://via.placeholder.com/300x400?text=No+Image+Available';

    const hasMultipleImages = criminal.images && criminal.images.length > 1;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="group bg-[#1a1f35] border border-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-cyan-500/10 transition-all duration-300"
        >
            <div className="relative h-64 overflow-hidden bg-black/40">
                <img
                    src={mainImage}
                    alt={criminal.fullName}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />

                {/* Image Overlay/Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${criminal.sourceAgency === 'FBI' ? 'bg-red-500/20 text-red-500 border border-red-500/50' :
                            'bg-blue-500/20 text-blue-500 border border-blue-500/50'
                        }`}>
                        {criminal.sourceAgency}
                    </span>
                    {hasMultipleImages && (
                        <span className="bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded border border-white/20">
                            +{criminal.images.length - 1} MORE IMAGES
                        </span>
                    )}
                </div>

                {criminal.reward && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-4">
                        <p className="text-yellow-500 font-bold text-xs">
                            REWARD: {criminal.reward}
                        </p>
                    </div>
                )}
            </div>

            <div className="p-5">
                <h3 className="text-lg font-bold text-white mb-1 truncate">{criminal.fullName}</h3>
                <p className="text-cyan-400 text-[11px] font-mono mb-3 uppercase tracking-tighter truncate">
                    {criminal.wantedFor && criminal.wantedFor.length > 0 ? criminal.wantedFor[0] : 'Wanted for Investigation'}
                </p>

                <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between text-[11px]">
                        <span className="text-gray-500">Nationality</span>
                        <span className="text-gray-300">{criminal.nationality}</span>
                    </div>
                    {criminal.lastKnownLocation && (
                        <div className="flex justify-between text-[11px]">
                            <span className="text-gray-500">Location</span>
                            <span className="text-gray-300 truncate ml-2 text-right">{criminal.lastKnownLocation}</span>
                        </div>
                    )}
                </div>

                <div className="flex gap-2 pt-3 border-t border-gray-800">
                    <button
                        onClick={() => onReadMore && onReadMore(criminal)}
                        className="flex-1 bg-gray-800 hover:bg-gray-700 text-white text-[10px] font-bold py-2 rounded transition-colors"
                    >
                        READ MORE
                    </button>
                    <a
                        href={criminal.detailsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-500 rounded border border-cyan-500/30 transition-all"
                        title="Official Profile"
                    >
                        <Globe className="w-3.5 h-3.5" />
                    </a>
                </div>
            </div>
        </motion.div>
    );
};

export default MostWantedCard;
