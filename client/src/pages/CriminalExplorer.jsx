import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Swal from 'sweetalert2';

const CriminalExplorer = () => {
    const [criminals, setCriminals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCriminal, setSelectedCriminal] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDanger, setFilterDanger] = useState('');

    useEffect(() => {
        fetchCriminals();
    }, []);

    const fetchCriminals = async () => {
        try {
            const { data } = await api.get('/criminals');
            setCriminals(data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching criminals:', error);
            setLoading(false);
        }
    };

    const viewCriminalDetails = async (criminalId) => {
        try {
            const { data } = await api.get(`/criminals/${criminalId}`);
            setSelectedCriminal(data.data);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load criminal details',
                background: '#1a1f35',
                color: '#fff',
            });
        }
    };

    const calculateRisk = async (criminalId) => {
        try {
            const { data } = await api.post(`/criminals/${criminalId}/calculate-risk`);
            Swal.fire({
                icon: 'success',
                title: 'Risk Calculated',
                html: `<div class="text-left">
          <p><strong>Risk Score:</strong> ${data.data.riskScore}/100</p>
          <p><strong>Danger Level:</strong> ${data.data.dangerLevel}</p>
        </div>`,
                background: '#1a1f35',
                color: '#fff',
                confirmButtonColor: '#00d4ff',
            });
            fetchCriminals();
        } catch (error) {
            console.error('Error calculating risk:', error);
        }
    };

    const filteredCriminals = criminals.filter(criminal => {
        const matchesSearch =
            criminal.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            criminal.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (criminal.aliases && criminal.aliases.some(alias =>
                alias.toLowerCase().includes(searchTerm.toLowerCase())
            ));

        const matchesDanger = filterDanger ? criminal.dangerLevel === filterDanger : true;

        return matchesSearch && matchesDanger;
    });

    const getDangerColor = (level) => {
        switch (level) {
            case 'Critical': return 'bg-danger-red/20 text-danger-red border-danger-red';
            case 'High': return 'bg-warning-amber/20 text-warning-amber border-warning-amber';
            case 'Medium': return 'bg-accent-blue/20 text-accent-blue border-accent-blue';
            default: return 'bg-success-green/20 text-success-green border-success-green';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-bg flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent-blue"></div>
                    <p className="mt-4 text-gray-400">Loading Criminal Database...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Criminal Database</h1>
                <p className="text-gray-400">Search and manage criminal profiles</p>
            </div>

            {/* Search and Filters */}
            <div className="glass-card p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <input
                            type="text"
                            placeholder="Search by name or alias..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-3 bg-dark-elevated border border-white/10 rounded-lg 
                         text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue"
                        />
                    </div>
                    <select
                        value={filterDanger}
                        onChange={(e) => setFilterDanger(e.target.value)}
                        className="px-4 py-3 bg-dark-elevated border border-white/10 rounded-lg 
                       text-white focus:outline-none focus:border-accent-blue"
                    >
                        <option value="">All Danger Levels</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                    </select>
                </div>
            </div>

            {/* Criminal Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCriminals.map((criminal, index) => (
                    <motion.div
                        key={criminal._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="glass-card p-6 hover:border-accent-blue/50 transition-all cursor-pointer"
                        onClick={() => viewCriminalDetails(criminal._id)}
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-white mb-1">
                                    {criminal.firstName} {criminal.lastName}
                                </h3>
                                {criminal.aliases && criminal.aliases.length > 0 && (
                                    <p className="text-sm text-gray-400">
                                        aka: {criminal.aliases.join(', ')}
                                    </p>
                                )}
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDangerColor(criminal.dangerLevel)}`}>
                                {criminal.dangerLevel}
                            </span>
                        </div>

                        {/* Details */}
                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Risk Score:</span>
                                <span className="text-white font-semibold">{criminal.riskScore}/100</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Status:</span>
                                <span className={`font-medium ${criminal.status === 'At Large' ? 'text-danger-red' :
                                    criminal.status === 'Incarcerated' ? 'text-success-green' :
                                        'text-gray-300'
                                    }`}>
                                    {criminal.status}
                                </span>
                            </div>
                            {criminal.nationality && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Nationality:</span>
                                    <span className="text-white">{criminal.nationality}</span>
                                </div>
                            )}
                        </div>

                        {/* MO */}
                        {criminal.modusOperandi && (
                            <div className="mb-4">
                                <p className="text-xs text-gray-500 mb-1">Modus Operandi:</p>
                                <p className="text-sm text-gray-300 line-clamp-2">{criminal.modusOperandi}</p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    calculateRisk(criminal._id);
                                }}
                                className="flex-1 px-3 py-2 bg-accent-blue/20 text-accent-blue rounded-lg 
                           hover:bg-accent-blue/30 transition text-sm font-medium"
                            >
                                Calculate Risk
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {filteredCriminals.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-400">No criminals found matching your criteria</p>
                </div>
            )}

            {/* Criminal Detail Modal */}
            {selectedCriminal && (
                <div
                    className="fixed inset-0 bg-black/80 flex items-center justify-center z-[2000] p-4"
                    onClick={() => setSelectedCriminal(null)}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    {selectedCriminal.firstName} {selectedCriminal.lastName}
                                </h2>
                                {selectedCriminal.aliases && selectedCriminal.aliases.length > 0 && (
                                    <p className="text-gray-400">Aliases: {selectedCriminal.aliases.join(', ')}</p>
                                )}
                            </div>
                            <button
                                onClick={() => setSelectedCriminal(null)}
                                className="text-gray-400 hover:text-white"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <p className="text-sm text-gray-400 mb-1">Risk Score</p>
                                <p className="text-2xl font-bold text-accent-blue">{selectedCriminal.riskScore}/100</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 mb-1">Danger Level</p>
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getDangerColor(selectedCriminal.dangerLevel)}`}>
                                    {selectedCriminal.dangerLevel}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 mb-1">Status</p>
                                <p className="text-white font-medium">{selectedCriminal.status}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 mb-1">Gender</p>
                                <p className="text-white">{selectedCriminal.gender || 'Unknown'}</p>
                            </div>
                        </div>

                        {selectedCriminal.modusOperandi && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-white mb-2">Modus Operandi</h3>
                                <p className="text-gray-300">{selectedCriminal.modusOperandi}</p>
                            </div>
                        )}

                        {selectedCriminal.lastKnownLocation && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-white mb-2">Last Known Location</h3>
                                <p className="text-gray-300">
                                    {selectedCriminal.lastKnownLocation.city}, {selectedCriminal.lastKnownLocation.country}
                                </p>
                            </div>
                        )}

                        {selectedCriminal.convictions && selectedCriminal.convictions.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-3">Convictions</h3>
                                <div className="space-y-2">
                                    {selectedCriminal.convictions.map((conviction, idx) => (
                                        <div key={idx} className="bg-dark-elevated p-3 rounded-lg">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-white font-medium">{conviction.charge}</p>
                                                    <p className="text-sm text-gray-400">{conviction.sentence}</p>
                                                </div>
                                                <span className="text-xs text-accent-cyan">{conviction.status}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </>
    );
};

export default CriminalExplorer;
