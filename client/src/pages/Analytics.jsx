import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import * as d3 from 'd3';
import api from '../services/api';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Analytics = () => {
    const [crimes, setCrimes] = useState([]);
    const [mostWanted, setMostWanted] = useState([]);
    const [patterns, setPatterns] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState('map'); // map, patterns, network
    const networkRef = useRef(null);
    const simulationRef = useRef(null);

    useEffect(() => {
        fetchAnalyticsData();
    }, []);

    useEffect(() => {
        if (selectedTab === 'network' && crimes.length > 0) {
            renderNetworkGraph();
        } else if (simulationRef.current) {
            simulationRef.current.stop();
        }

        return () => {
            if (simulationRef.current) {
                simulationRef.current.stop();
            }
        };
    }, [selectedTab, crimes]);

    const fetchAnalyticsData = async () => {
        try {
            const [crimesRes, patternsRes, mostWantedRes] = await Promise.all([
                api.get('/crimes?limit=100'),
                api.get('/intelligence/patterns'),
                api.get('/public/most-wanted?limit=50')
            ]);

            setCrimes(crimesRes.data.data);
            setPatterns(patternsRes.data.data);
            setMostWanted(mostWantedRes.data.criminals || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching analytics data:', error);
            setLoading(false);
        }
    };

    const renderNetworkGraph = () => {
        if (!networkRef.current) return;

        // Clear previous graph
        d3.select(networkRef.current).selectAll('*').remove();

        const width = networkRef.current.clientWidth;
        const height = 600;

        const nodes = [];
        const links = [];

        // Add crime type nodes from regular crimes
        const crimeTypes = [...new Set(crimes.map(c => c.crimeType))];
        crimeTypes.forEach((type) => {
            nodes.push({ id: type, group: 1, size: 22, color: '#00d4ff', label: type });
        });

        // Add source agencies
        const agencies = [...new Set(mostWanted.map(mw => mw.sourceAgency))];
        agencies.forEach(agency => {
            nodes.push({ id: agency, group: 3, size: 26, color: '#ef4444', label: agency });
        });

        // Add most wanted criminals
        mostWanted.slice(0, 15).forEach(mw => {
            nodes.push({ id: mw.fullName, group: 4, size: 14, color: '#f59e0b', type: 'criminal', label: mw.fullName });
        });

        // Add all cities (from both crimes and most wanted)
        const crimeCities = crimes.map(c => c.location?.city).filter(Boolean);
        const mwCities = mostWanted.map(mw => mw.lastKnownLocation).filter(Boolean);
        const allCities = [...new Set([...crimeCities, ...mwCities])];

        allCities.slice(0, 20).forEach(city => {
            nodes.push({ id: city, group: 2, size: 18, color: '#8b5cf6', label: city });
        });

        // Links logic... (same as before)
        crimes.forEach(crime => {
            if (crime.location?.city && allCities.includes(crime.location.city)) {
                links.push({ source: crime.crimeType, target: crime.location.city, value: 1 });
            }
        });

        mostWanted.slice(0, 15).forEach(mw => {
            links.push({ source: mw.sourceAgency, target: mw.fullName, value: 2 });
            if (mw.lastKnownLocation && allCities.includes(mw.lastKnownLocation)) {
                links.push({ source: mw.fullName, target: mw.lastKnownLocation, value: 2 });
            }
        });

        // Create SVG with Zoom
        const svg = d3.select(networkRef.current)
            .append('svg')
            .attr('width', '100%')
            .attr('height', height)
            .attr('viewBox', `0 0 ${width} ${height}`)
            .attr('style', 'max-width: 100%; height: auto;')
            .call(d3.zoom().on('zoom', (event) => {
                container.attr('transform', event.transform);
            }));

        const container = svg.append('g');

        // Create force simulation
        const simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(links).id(d => d.id).distance(120))
            .force('charge', d3.forceManyBody().strength(-400))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide().radius(50));

        simulationRef.current = simulation;

        // Create links with gradient or stylized line
        const link = container.append('g')
            .selectAll('line')
            .data(links)
            .enter().append('line')
            .attr('stroke', '#ffffff20')
            .attr('stroke-width', 1.5)
            .attr('stroke-dasharray', d => d.value === 2 ? '5,5' : '0');

        // Create nodes
        const node = container.append('g')
            .selectAll('g')
            .data(nodes)
            .enter().append('g')
            .call(d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended));

        // Node circle
        node.append('circle')
            .attr('r', d => d.size)
            .attr('fill', d => d.color)
            .attr('fill-opacity', 0.8)
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
            .attr('class', 'cursor-pointer hover:filter-brightness-125 transition-all');

        // Node labels
        node.append('text')
            .text(d => d.label)
            .attr('fill', '#fff')
            .attr('font-size', '10px')
            .attr('font-weight', 'bold')
            .attr('text-anchor', 'middle')
            .attr('dy', d => d.size + 15)
            .attr('class', 'pointer-events-none select-none drop-shadow-lg');

        // Update positions
        simulation.on('tick', () => {
            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            node.attr('transform', d => `translate(${d.x},${d.y})`);
        });

        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'Critical': return '#ef4444';
            case 'High': return '#f59e0b';
            case 'Medium': return '#00d4ff';
            default: return '#10b981';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-bg flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent-blue"></div>
                    <p className="mt-4 text-gray-400">Loading Analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Analytics & Visualization</h1>
                <p className="text-gray-400">Interactive crime mapping and pattern analysis</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setSelectedTab('map')}
                    className={`px-6 py-3 rounded-lg font-medium transition ${selectedTab === 'map'
                        ? 'bg-accent-blue text-dark-bg'
                        : 'bg-dark-elevated text-gray-400 hover:text-white'
                        }`}
                >
                    Crime Map
                </button>
                <button
                    onClick={() => setSelectedTab('patterns')}
                    className={`px-6 py-3 rounded-lg font-medium transition ${selectedTab === 'patterns'
                        ? 'bg-accent-blue text-dark-bg'
                        : 'bg-dark-elevated text-gray-400 hover:text-white'
                        }`}
                >
                    Pattern Detection
                </button>
                <button
                    onClick={() => setSelectedTab('network')}
                    className={`px-6 py-3 rounded-lg font-medium transition ${selectedTab === 'network'
                        ? 'bg-accent-blue text-dark-bg'
                        : 'bg-dark-elevated text-gray-400 hover:text-white'
                        }`}
                >
                    Network Graph
                </button>
            </div>

            {/* Content */}
            {selectedTab === 'map' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass-card p-6"
                >
                    <h2 className="text-xl font-bold text-white mb-4">Global Crime Map</h2>
                    <div className="h-[600px] rounded-lg overflow-hidden">
                        <MapContainer
                            center={[20, 0]}
                            zoom={2}
                            style={{ height: '100%', width: '100%' }}
                            className="rounded-lg"
                        >
                            <TileLayer
                                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            />
                            {crimes.map((crime) => {
                                if (!crime.location?.coordinates) return null;
                                const [lng, lat] = crime.location.coordinates;

                                return (
                                    <CircleMarker
                                        key={crime._id}
                                        center={[lat, lng]}
                                        radius={crime.severity === 'Critical' ? 10 : crime.severity === 'High' ? 7 : 5}
                                        fillColor={getSeverityColor(crime.severity)}
                                        color="#fff"
                                        weight={1}
                                        opacity={0.8}
                                        fillOpacity={0.6}
                                    >
                                        <Popup>
                                            <div className="text-sm">
                                                <h3 className="font-bold mb-1">{crime.title}</h3>
                                                <p className="text-xs text-gray-600 mb-1">{crime.crimeType}</p>
                                                <p className="text-xs">
                                                    <strong>Severity:</strong> {crime.severity}
                                                </p>
                                                <p className="text-xs">
                                                    <strong>Location:</strong> {crime.location.city}
                                                </p>
                                            </div>
                                        </Popup>
                                    </CircleMarker>
                                );
                            })}
                        </MapContainer>
                    </div>

                    {/* Legend */}
                    <div className="mt-4 flex gap-4 justify-center">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-danger-red"></div>
                            <span className="text-sm text-gray-400">Critical</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-warning-amber"></div>
                            <span className="text-sm text-gray-400">High</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-accent-blue"></div>
                            <span className="text-sm text-gray-400">Medium</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-success-green"></div>
                            <span className="text-sm text-gray-400">Low</span>
                        </div>
                    </div>
                </motion.div>
            )}

            {selectedTab === 'patterns' && patterns && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                >
                    {/* Summary */}
                    <div className="glass-card p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Pattern Detection Results</h2>
                        <p className="text-gray-300 mb-4">{patterns.summary}</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-dark-elevated p-4 rounded-lg">
                                <p className="text-sm text-gray-400 mb-1">Total Patterns</p>
                                <p className="text-3xl font-bold text-accent-blue">{patterns.totalPatterns}</p>
                            </div>
                            <div className="bg-dark-elevated p-4 rounded-lg">
                                <p className="text-sm text-gray-400 mb-1">Hotspots Detected</p>
                                <p className="text-3xl font-bold text-danger-red">{patterns.hotspots.length}</p>
                            </div>
                            <div className="bg-dark-elevated p-4 rounded-lg">
                                <p className="text-sm text-gray-400 mb-1">Analysis Period</p>
                                <p className="text-lg font-bold text-white">Last 30 Days</p>
                            </div>
                        </div>
                    </div>

                    {/* Hotspots */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Crime Hotspots</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {patterns.hotspots.map((hotspot, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-dark-elevated p-4 rounded-lg border-l-4 border-danger-red"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="text-white font-semibold">{hotspot.crimeType}</h4>
                                            <p className="text-sm text-gray-400">{hotspot.location}</p>
                                        </div>
                                        <span className="px-3 py-1 bg-danger-red/20 text-danger-red rounded-full text-sm font-medium">
                                            {hotspot.count} incidents
                                        </span>
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                        {Object.entries(hotspot.severity).map(([severity, count]) => (
                                            <span key={severity} className="text-xs px-2 py-1 bg-dark-bg rounded">
                                                {severity}: {count}
                                            </span>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}

            {selectedTab === 'network' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card overflow-hidden h-[750px] relative flex flex-col"
                >
                    <div className="p-6 border-b border-white/5 bg-dark-surface/50 backdrop-blur-md z-10">
                        <h2 className="text-xl font-bold text-white mb-2">Criminal Intelligence Network</h2>
                        <p className="text-gray-400 text-sm">
                            High-fidelity cognitive map showing relationships between crime types, geo-locations, and tactical targets.
                        </p>
                    </div>

                    <div className="absolute top-28 right-6 z-20 space-y-3 bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-2xl">
                        <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2 border-b border-white/5 pb-1">Legend</p>
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-[#ef4444] shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                            <span className="text-xs text-gray-300 font-medium">Agencies</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-[#f59e0b] shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
                            <span className="text-xs text-gray-300 font-medium">Most Wanted</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-[#8b5cf6] shadow-[0_0_8px_rgba(139,92,246,0.5)]"></div>
                            <span className="text-xs text-gray-300 font-medium">Locations</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-[#00d4ff] shadow-[0_0_8px_rgba(0,212,255,0.5)]"></div>
                            <span className="text-xs text-gray-300 font-medium">Crime Types</span>
                        </div>
                        <div className="pt-3 border-t border-white/5 mt-2">
                            <p className="text-[9px] text-gray-500 italic">Scroll to zoom • Drag to explore</p>
                        </div>
                    </div>

                    <div ref={networkRef} className="flex-1 w-full bg-[#0a0f1d] cursor-move"></div>
                </motion.div>
            )}
        </>
    );
};

export default Analytics;
