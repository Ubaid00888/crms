import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Swal from 'sweetalert2';
import { summarizeText, extractKeyPoints } from '../utils/nlpUtils';

const CaseManagement = () => {
    const [cases, setCases] = useState([]);
    const [selectedCase, setSelectedCase] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newTimelineEvent, setNewTimelineEvent] = useState({ event: '', description: '' });

    useEffect(() => {
        fetchCases();
    }, []);

    const fetchCases = async () => {
        try {
            const { data } = await api.get('/cases');
            setCases(data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching cases:', error);
            setLoading(false);
        }
    };

    const viewCaseDetails = async (caseId) => {
        try {
            const { data } = await api.get(`/cases/${caseId}`);
            setSelectedCase(data.data);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load case details',
                background: '#1a1f35',
                color: '#fff',
            });
        }
    };

    const addTimelineEvent = async () => {
        if (!newTimelineEvent.event || !newTimelineEvent.description) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please fill in both event and description',
                background: '#1a1f35',
                color: '#fff',
            });
            return;
        }

        try {
            await api.post(`/cases/${selectedCase._id}/timeline`, newTimelineEvent);
            Swal.fire({
                icon: 'success',
                title: 'Timeline Updated',
                text: 'Event added successfully',
                background: '#1a1f35',
                color: '#fff',
                timer: 2000,
            });
            setNewTimelineEvent({ event: '', description: '' });
            viewCaseDetails(selectedCase._id);
        } catch (error) {
            console.error('Error adding timeline event:', error);
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Urgent': return 'bg-danger-red/20 text-danger-red border-danger-red';
            case 'High': return 'bg-warning-amber/20 text-warning-amber border-warning-amber';
            case 'Medium': return 'bg-accent-blue/20 text-accent-blue border-accent-blue';
            default: return 'bg-success-green/20 text-success-green border-success-green';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Open': return 'text-accent-cyan';
            case 'Under Investigation': return 'text-warning-amber';
            case 'Solved': return 'text-success-green';
            case 'Closed': return 'text-gray-500';
            default: return 'text-gray-400';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-bg flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent-blue"></div>
                    <p className="mt-4 text-gray-400">Loading Cases...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Case Management</h1>
                <p className="text-gray-400">Track and manage investigation cases</p>
            </div>

            {/* Cases Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cases.map((caseItem, index) => (
                    <motion.div
                        key={caseItem._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="glass-card p-6 hover:border-accent-blue/50 transition-all cursor-pointer"
                        onClick={() => viewCaseDetails(caseItem._id)}
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <p className="text-xs text-gray-500 mb-1">{caseItem.caseNumber}</p>
                                <h3 className="text-lg font-bold text-white mb-2">{caseItem.title}</h3>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(caseItem.priority)}`}>
                                {caseItem.priority}
                            </span>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-400 mb-4 line-clamp-2">{caseItem.description}</p>

                        {/* Details */}
                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Status:</span>
                                <span className={`font-medium ${getStatusColor(caseItem.status)}`}>
                                    {caseItem.status}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Type:</span>
                                <span className="text-white">{caseItem.caseType}</span>
                            </div>
                            {caseItem.leadInvestigator && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Lead:</span>
                                    <span className="text-white">{caseItem.leadInvestigator.fullName}</span>
                                </div>
                            )}
                        </div>

                        {/* Timeline Count */}
                        {caseItem.timeline && (
                            <div className="pt-4 border-t border-white/10">
                                <p className="text-xs text-gray-500">
                                    {caseItem.timeline.length} timeline events
                                </p>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {cases.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-400">No cases found</p>
                </div>
            )}

            {/* Case Detail Modal with Timeline */}
            {selectedCase && (
                <div
                    className="fixed inset-0 bg-black/80 flex items-center justify-center z-[2000] p-4"
                    onClick={() => setSelectedCase(null)}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex-1">
                                <p className="text-sm text-gray-500 mb-1">{selectedCase.caseNumber}</p>
                                <h2 className="text-2xl font-bold text-white mb-2">{selectedCase.title}</h2>
                                <div className="flex gap-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(selectedCase.priority)}`}>
                                        {selectedCase.priority}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedCase.status)}`}>
                                        {selectedCase.status}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedCase(null)}
                                className="text-gray-400 hover:text-white"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* AI Summary */}
                        <div className="mb-6 bg-accent-blue/10 border border-accent-blue/30 rounded-lg p-4">
                            <h3 className="text-sm font-semibold text-accent-blue mb-2 flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                AI-Generated Summary
                            </h3>
                            <p className="text-gray-300 text-sm">{summarizeText(selectedCase.description)}</p>
                        </div>

                        {/* Description */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                            <p className="text-gray-300">{selectedCase.description}</p>
                        </div>

                        {/* Key Points */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-white mb-3">Key Points</h3>
                            <ul className="space-y-2">
                                {extractKeyPoints(selectedCase.description).map((point, idx) => (
                                    <li key={idx} className="flex items-start">
                                        <span className="text-accent-cyan mr-2">•</span>
                                        <span className="text-gray-300 text-sm">{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Team */}
                        {selectedCase.leadInvestigator && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-white mb-3">Investigation Team</h3>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-accent-purple/20 text-accent-purple rounded-lg text-sm">
                                        Lead: {selectedCase.leadInvestigator.fullName}
                                    </span>
                                    {selectedCase.team && selectedCase.team.map((member) => (
                                        <span key={member._id} className="px-3 py-1 bg-dark-elevated text-gray-300 rounded-lg text-sm">
                                            {member.fullName}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Interactive Timeline */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Case Timeline</h3>

                            {/* Add Timeline Event */}
                            <div className="mb-4 p-4 bg-dark-elevated rounded-lg">
                                <h4 className="text-sm font-medium text-gray-400 mb-3">Add Timeline Event</h4>
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        placeholder="Event title..."
                                        value={newTimelineEvent.event}
                                        onChange={(e) => setNewTimelineEvent({ ...newTimelineEvent, event: e.target.value })}
                                        className="w-full px-3 py-2 bg-dark-bg border border-white/10 rounded-lg 
                             text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue text-sm"
                                    />
                                    <textarea
                                        placeholder="Event description..."
                                        value={newTimelineEvent.description}
                                        onChange={(e) => setNewTimelineEvent({ ...newTimelineEvent, description: e.target.value })}
                                        rows="2"
                                        className="w-full px-3 py-2 bg-dark-bg border border-white/10 rounded-lg 
                             text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue text-sm"
                                    />
                                    <button
                                        onClick={addTimelineEvent}
                                        className="px-4 py-2 bg-accent-blue text-dark-bg rounded-lg hover:bg-accent-blue/80 
                             transition text-sm font-medium"
                                    >
                                        Add Event
                                    </button>
                                </div>
                            </div>

                            {/* Timeline Display */}
                            <div className="relative">
                                {/* Timeline Line */}
                                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-accent-blue/30"></div>

                                {/* Timeline Events */}
                                <div className="space-y-4">
                                    {selectedCase.timeline && selectedCase.timeline
                                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                                        .map((event, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="relative pl-12"
                                            >
                                                {/* Timeline Dot */}
                                                <div className="absolute left-2.5 top-2 w-3 h-3 bg-accent-blue rounded-full border-2 border-dark-bg"></div>

                                                {/* Event Card */}
                                                <div className="bg-dark-elevated p-4 rounded-lg">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="text-white font-semibold">{event.event}</h4>
                                                        <span className="text-xs text-gray-500">
                                                            {new Date(event.date).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-400">{event.description}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                </div>
                            </div>
                        </div>

                        {/* Related Crimes */}
                        {selectedCase.crimes && selectedCase.crimes.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-3">Related Crimes</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {selectedCase.crimes.map((crime) => (
                                        <div key={crime._id} className="bg-dark-elevated p-3 rounded-lg">
                                            <p className="text-white font-medium text-sm mb-1">{crime.title}</p>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-gray-400">{crime.crimeType}</span>
                                                <span className={`text-xs px-2 py-1 rounded ${crime.severity === 'Critical' ? 'bg-danger-red/20 text-danger-red' :
                                                    crime.severity === 'High' ? 'bg-warning-amber/20 text-warning-amber' :
                                                        'bg-accent-blue/20 text-accent-blue'
                                                    }`}>
                                                    {crime.severity}
                                                </span>
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

export default CaseManagement;
