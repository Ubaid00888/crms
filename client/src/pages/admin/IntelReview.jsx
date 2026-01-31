import React from 'react';
import { motion } from 'framer-motion';
import IntelligenceReview from '../../components/IntelligenceReview';

const IntelReview = () => {
    return (
        <div className="p-8 pb-32">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-1 bg-accent-blue rounded-full" />
                    <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">
                        Global Intelligence Hub
                    </h1>
                </div>
                <p className="text-gray-500 text-sm font-bold tracking-[0.2em] uppercase ml-16">
                    Real-time AI Ingestion Analysis & Validation
                </p>
            </motion.div>

            <div className="space-y-8">
                <IntelligenceReview />
            </div>
        </div>
    );
};

export default IntelReview;
