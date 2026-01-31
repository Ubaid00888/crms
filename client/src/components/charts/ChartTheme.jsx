import React from 'react';

/**
 * Standard colors for the Crime Management System
 */
export const CHART_COLORS = [
    '#00d4ff', // Cyan
    '#8b5cf6', // Purple
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#10b981', // green
];

/**
 * Custom High-Fidelity Tooltip for Recharts
 */
export const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#0a0f1d]/90 backdrop-blur-md border border-white/10 p-3 rounded-lg shadow-2xl">
                <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1 border-b border-white/5 pb-1">
                    {label}
                </p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2 mt-1">
                        <div
                            className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]"
                            style={{ backgroundColor: entry.color || entry.fill || CHART_COLORS[0] }}
                        />
                        <p className="text-sm font-bold text-white uppercase tracking-tight">
                            <span className="opacity-60">{entry.name}:</span> {entry.value}
                        </p>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

/**
 * Reusable Gradients for Bar / Area charts
 */
export const ChartGradients = () => (
    <defs>
        <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#00d4ff" stopOpacity={0.2} />
        </linearGradient>
        <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.2} />
        </linearGradient>
        <linearGradient id="amberGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.2} />
        </linearGradient>
        <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#ef4444" stopOpacity={0.2} />
        </linearGradient>
    </defs>
);

/**
 * Common Axis configurations
 */
export const commonAxisStyles = {
    stroke: '#6b7280',
    fontSize: 10,
    tickLine: false,
    axisLine: false,
    tick: { fill: '#6b7280' },
};
