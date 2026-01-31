import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    UserPlus, Search, Shield, Trash2, Key, QrCode,
    Download, Printer, X, Check, AlertTriangle, Building,
    Mail, User as UserIcon, BadgeCheck
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import api from '../../services/api';
import Swal from 'sweetalert2';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showIDCardModal, setShowIDCardModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [newUserQR, setNewUserQR] = useState(null);

    const [form, setForm] = useState({
        username: '',
        email: '',
        fullName: '',
        role: 'agent',
        department: '',
        password: ''
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/admin/users');
            setUsers(data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching users:', error);
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/admin/users', form);
            setUsers([data.data, ...users]);
            setShowCreateModal(false);

            // Show the newly generated ID card (Only for non-admin users)
            if (data.data.role !== 'admin') {
                setSelectedUser(data.data);
                setNewUserQR(data.qrToken);
                setShowIDCardModal(true);
            }

            Swal.fire({
                icon: 'success',
                title: 'User Created',
                text: data.data.role === 'admin'
                    ? 'Administrator account created successfully.'
                    : 'System ID and QR Code generated successfully.',
                background: '#1a1f35',
                color: '#fff'
            });

            // Reset form
            setForm({
                username: '',
                email: '',
                fullName: '',
                role: 'agent',
                department: '',
                password: ''
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Creation Failed',
                text: error.response?.data?.message || 'Error creating user',
                background: '#1a1f35',
                color: '#fff'
            });
        }
    };

    const handleRegenerateQR = async (userId) => {
        const result = await Swal.fire({
            title: 'Regenerate QR ID?',
            text: "The previous ID card will be invalidated immediately.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#00d4ff',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Yes, regenerate',
            background: '#1a1f35',
            color: '#fff'
        });

        if (result.isConfirmed) {
            try {
                const { data } = await api.post(`/admin/users/${userId}/regenerate-qr`);
                const user = users.find(u => u._id === userId);
                setSelectedUser(user);
                setNewUserQR(data.qrToken);
                setShowIDCardModal(true);
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'Failed', text: 'Error regenerating QR code', background: '#1a1f35', color: '#fff' });
            }
        }
    };

    const handleRevokeQR = async (userId) => {
        const result = await Swal.fire({
            title: 'Revoke Access?',
            text: "The user will not be able to login via QR until a new code is issued.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Yes, revoke',
            background: '#1a1f35',
            color: '#fff'
        });

        if (result.isConfirmed) {
            try {
                await api.post(`/admin/users/${userId}/revoke-qr`);
                fetchUsers();
                Swal.fire({ icon: 'success', title: 'Revoked', text: 'QR ID access invalidated.', background: '#1a1f35', color: '#fff' });
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'Failed', text: 'Error revoking QR code', background: '#1a1f35', color: '#fff' });
            }
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.patch(`/admin/users/${editingUser._id}`, editingUser);
            setUsers(users.map(u => u._id === editingUser._id ? data.data : u));
            setShowEditModal(false);
            Swal.fire({
                icon: 'success',
                title: 'User Updated',
                text: 'Personnel details updated successfully.',
                background: '#1a1f35',
                color: '#fff'
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: error.response?.data?.message || 'Error updating user',
                background: '#1a1f35',
                color: '#fff'
            });
        }
    };

    const handleViewCard = (user) => {
        setSelectedUser(user);
        setNewUserQR(user.qrToken);
        setShowIDCardModal(true);
    };

    const handleDeleteUser = async (userId) => {
        const result = await Swal.fire({
            title: 'Delete User?',
            text: "This action cannot be undone. All audit logs for this user will remain.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Yes, delete',
            background: '#1a1f35',
            color: '#fff'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/admin/users/${userId}`);
                setUsers(users.filter(u => u._id !== userId));
                Swal.fire({ icon: 'success', title: 'Deleted', text: 'User removed from system.', background: '#1a1f35', color: '#fff' });
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'Failed', text: 'Error deleting user', background: '#1a1f35', color: '#fff' });
            }
        }
    };

    const filteredUsers = users.filter(u =>
        u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const IDCardModal = () => {
        if (!selectedUser) return null;

        const qrPayload = JSON.stringify({
            userId: selectedUser._id,
            token: newUserQR,
            expiry: selectedUser.qrExpiry,
            role: selectedUser.role
        });

        const downloadAsPNG = async () => {
            try {
                // 1. Prepare Export Data
                const qrCanvas = document.querySelector('#id-card-capture canvas');
                const qrImage = qrCanvas ? qrCanvas.toDataURL('image/png') : '';

                // 2. Create Temporary Off-screen Container
                const offscreenContainer = document.createElement('div');
                offscreenContainer.style.position = 'absolute';
                offscreenContainer.style.left = '-9999px';
                offscreenContainer.style.top = '0';
                offscreenContainer.innerHTML = `
                    <div id="ideal-capture-target" style="
                        width: 400px; 
                        background: #0f172a; 
                        color: white; 
                        padding: 24px; 
                        border-radius: 16px; 
                        font-family: sans-serif;
                        border: 1px solid rgba(255,255,255,0.1);
                    ">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <div style="width: 40px; height: 40px; background: #00d4ff; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #0f172a; font-weight: bold;">S</div>
                                <div>
                                    <p style="margin: 0; font-size: 10px; font-weight: 900; color: #00d4ff; text-transform: uppercase; letter-spacing: -0.5px;">Global Monitor</p>
                                    <p style="margin: 0; font-size: 8px; color: #64748b; text-transform: uppercase;">Identity Services</p>
                                </div>
                            </div>
                        </div>
                        <div style="display: flex; gap: 24px; align-items: center;">
                            <div style="flex: 1;">
                                <h4 style="margin: 0 0 2px 0; font-size: 18px; font-weight: bold;">${selectedUser.fullName}</h4>
                                <p style="margin: 0 0 16px 0; color: #00d4ff; font-size: 12px; font-family: monospace; text-transform: uppercase;">${selectedUser.role}</p>
                                <div style="display: flex; flex-direction: column; gap: 8px;">
                                    <div>
                                        <p style="margin: 0; font-size: 8px; color: #64748b; text-transform: uppercase; font-weight: bold;">System ID</p>
                                        <p style="margin: 0; font-size: 10px; font-family: monospace;">${selectedUser._id.slice(-12).toUpperCase()}</p>
                                    </div>
                                    <div>
                                        <p style="margin: 0; font-size: 8px; color: #64748b; text-transform: uppercase; font-weight: bold;">Department</p>
                                        <p style="margin: 0; font-size: 10px; text-transform: uppercase;">${selectedUser.department || 'UNCATEGORIZED'}</p>
                                    </div>
                                </div>
                            </div>
                            <div style="background: white; padding: 8px; border-radius: 12px; border: 2px solid rgba(0,212,255,0.3);">
                                <img src="${qrImage}" style="width: 100px; height: 100px; display: block;" />
                            </div>
                        </div>
                        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; font-size: 8px; color: #64748b; font-family: monospace; font-style: italic;">
                            <span>ISSUE_DATE: ${new Date().toLocaleDateString()}</span>
                            <span style="color: #ef4444;">EXP: ${new Date(selectedUser.qrExpiry).toLocaleDateString()}</span>
                        </div>
                    </div>
                `;
                document.body.appendChild(offscreenContainer);

                // 3. Snapshot the simplified off-screen target
                const target = document.getElementById('ideal-capture-target');
                const canvas = await html2canvas(target, {
                    backgroundColor: '#0f172a',
                    scale: 2,
                    useCORS: true,
                    logging: false
                });

                // 4. Cleanup and Download
                document.body.removeChild(offscreenContainer);

                canvas.toBlob((blob) => {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.download = `ID_CARD_${selectedUser.username.toUpperCase()}.png`;
                    link.href = url;
                    document.body.appendChild(link);
                    link.click();
                    setTimeout(() => {
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                    }, 100);
                }, 'image/png', 1.0);

            } catch (error) {
                console.error("Critical Export Error:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Strategic Export Error',
                    text: 'The card failed to render due to local environment constraints. Please try refreshing or using the browser print function.',
                    background: '#1a1f35',
                    color: '#fff'
                });
            }
        };

        const downloadAsPDF = async () => {
            try {
                // Use the same robust canvas generation logic
                const qrCanvas = document.querySelector('#id-card-capture canvas');
                const qrImage = qrCanvas ? qrCanvas.toDataURL('image/png') : '';

                const offscreenContainer = document.createElement('div');
                offscreenContainer.style.position = 'absolute';
                offscreenContainer.style.left = '-9999px';
                offscreenContainer.innerHTML = `<div id="ideal-pdf-target" style="width: 400px; background: #0f172a; color: white; padding: 24px; border-radius: 16px; font-family: sans-serif;">
                    <h4 style="color: #00d4ff;">SYSTEM ID CARD</h4>
                    <p>${selectedUser.fullName}</p>
                    <img src="${qrImage}" style="width: 100px;" />
                </div>`;
                document.body.appendChild(offscreenContainer);

                const canvas = await html2canvas(document.getElementById('ideal-pdf-target'), {
                    backgroundColor: '#0f172a',
                    scale: 1.5
                });

                document.body.removeChild(offscreenContainer);

                const imgData = canvas.toDataURL('image/png', 1.0);
                const pdf = new jsPDF({
                    orientation: 'landscape',
                    unit: 'px',
                    format: [canvas.width, canvas.height]
                });
                pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
                pdf.save(`ID_CARD_${selectedUser.username.toUpperCase()}.pdf`);
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'PDF Failure', text: 'Document generation failed.', background: '#1a1f35', color: '#fff' });
            }
        };

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
            >
                <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-8 max-w-md w-full relative shadow-2xl shadow-cyan-500/20">
                    <button onClick={() => setShowIDCardModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>

                    <div className="text-center mb-8">
                        <span className="px-3 py-1 bg-accent-blue/10 text-accent-blue text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-accent-blue/20">
                            Secure Digital ID Issued
                        </span>
                        <h3 className="text-2xl font-bold text-white mt-4 tracking-tight">System Credential Card</h3>
                    </div>

                    {/* The ID Card Preview Container */}
                    <div className="relative group p-1 bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-3xl">
                        {/* Decorative blurs moved OUTSIDE capture container */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-blue/10 rounded-full -mr-8 -mt-8 blur-3xl pointer-events-none" />

                        <div id="id-card-capture" className="bg-[#0f172a] rounded-2xl p-6 border border-white/5 relative overflow-hidden">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-accent-blue rounded flex items-center justify-center">
                                        <Shield className="text-[#0f172a]" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-accent-blue tracking-tighter uppercase">Global Monitor</p>
                                        <p className="text-[8px] text-gray-500 font-bold uppercase">Identity Services</p>
                                    </div>
                                </div>
                                <BadgeCheck className="text-success-green opacity-50" size={20} />
                            </div>

                            <div className="flex gap-6 items-center">
                                <div className="flex-1">
                                    <h4 className="text-white font-bold text-lg mb-0.5">{selectedUser.fullName}</h4>
                                    <p className="text-accent-blue text-xs font-mono mb-4 uppercase tracking-tighter">{selectedUser.role}</p>

                                    <div className="space-y-2">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] text-gray-500 font-bold uppercase">System ID</span>
                                            <span className="text-[10px] text-white font-mono">{selectedUser._id.slice(-12).toUpperCase()}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[8px] text-gray-500 font-bold uppercase">Department</span>
                                            <span className="text-[10px] text-white uppercase">{selectedUser.department || 'UNCATEGORIZED'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-2 rounded-xl shadow-lg border-2 border-accent-blue/30">
                                    <QRCodeCanvas value={qrPayload} size={100} level="H" includeMargin />
                                </div>
                            </div>

                            <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-center text-[8px] text-gray-500 font-mono italic">
                                <span>ISSUE_DATE: {new Date().toLocaleDateString()}</span>
                                <span className="text-danger-red">EXP: {new Date(selectedUser.qrExpiry).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <button
                            onClick={downloadAsPNG}
                            className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl border border-white/10 transition-all text-sm"
                        >
                            <Download size={16} />
                            PNG
                        </button>
                        <button
                            onClick={downloadAsPDF}
                            className="flex items-center justify-center gap-2 bg-accent-blue hover:bg-accent-blue/90 text-[#0f172a] font-bold py-3 rounded-xl transition-all text-sm"
                        >
                            <Printer size={16} />
                            PDF
                        </button>
                    </div>

                    <p className="text-[10px] text-gray-500 mt-6 text-center italic">
                        QR login simulates secure credential exchange for academic purposes only.
                    </p>
                </div>
            </motion.div >
        );
    };

    if (loading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-blue"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">System Access Control</h1>
                    <p className="text-gray-400 text-sm">Secure identity management and credential issuance portal.</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 bg-accent-blue hover:bg-accent-blue/90 text-[#0f172a] px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-accent-blue/20"
                >
                    <UserPlus size={18} />
                    Onboard Personnel
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="glass-card p-6 border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Active Personnel</p>
                        <BadgeCheck size={16} className="text-success-green" />
                    </div>
                    <p className="text-3xl font-bold text-white">{users.length}</p>
                </div>
                <div className="glass-card p-6 border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Access Nodes</p>
                        <Shield size={16} className="text-accent-blue" />
                    </div>
                    <p className="text-3xl font-bold text-white">Encrypted / JWT</p>
                </div>
                <div className="glass-card p-6 border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Revocation Queue</p>
                        <AlertTriangle size={16} className="text-danger-red" />
                    </div>
                    <p className="text-3xl font-bold text-white">{users.filter(u => u.qrRevoked).length}</p>
                </div>
            </div>

            {/* Search & Table */}
            <div className="glass-card border border-white/5 overflow-hidden">
                <div className="p-6 border-b border-white/5 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search by ID, name or role..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-accent-blue/50 text-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Personnel</th>
                                <th className="px-6 py-4">Operational Role</th>
                                <th className="px-6 py-4">Agency / Dept</th>
                                <th className="px-6 py-4">Security Credentials</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.map((user) => (
                                <tr key={user._id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-success-green shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gray-600'}`} />
                                            <span className="text-[10px] text-gray-300 font-bold uppercase">{user.isActive ? 'Active' : 'Offline'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent-blue/20 to-accent-purple/20 flex items-center justify-center text-accent-blue font-bold text-xs">
                                                {user.fullName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">{user.fullName}</p>
                                                <p className="text-[10px] text-gray-500 font-mono">{user.username}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter ${user.role === 'admin' ? 'bg-danger-red/10 text-danger-red border border-danger-red/20' :
                                            user.role === 'analyst' ? 'bg-accent-blue/10 text-accent-blue border border-accent-blue/20' :
                                                'bg-gray-800 text-gray-400'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-gray-400 font-medium">
                                        {user.department || 'GLOBAL_COMMAND'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {user.role !== 'admin' && (
                                                <button
                                                    onClick={() => handleRegenerateQR(user._id)}
                                                    className={`p-1.5 rounded-lg border transition-all ${user.qrRevoked ? 'bg-danger-red/10 border-danger-red/20 text-danger-red hover:bg-danger-red/20' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20'}`}
                                                    title={user.qrRevoked ? "ID Revoked - Click to Reissue" : "Generate ID Card"}
                                                >
                                                    <QrCode size={16} />
                                                </button>
                                            )}
                                            <div className="flex flex-col">
                                                <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Expiry</span>
                                                <span className={`text-[10px] font-mono ${user.qrRevoked ? 'text-danger-red' : 'text-gray-300'}`}>
                                                    {user.role === 'admin' ? 'N/A' : (user.qrRevoked ? 'VOID' : (user.qrExpiry ? new Date(user.qrExpiry).toLocaleDateString() : 'NO_ID'))}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {user.role !== 'admin' && !user.qrRevoked && (
                                                <button
                                                    onClick={() => handleViewCard(user)}
                                                    className="p-2 text-gray-400 hover:text-accent-blue hover:bg-accent-blue/10 rounded-lg transition-all"
                                                    title="View Card"
                                                >
                                                    <QrCode size={16} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    setEditingUser({ ...user });
                                                    setShowEditModal(true);
                                                }}
                                                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                                                title="Edit Personnel"
                                            >
                                                <Key size={16} />
                                            </button>
                                            {user.role !== 'admin' && !user.qrRevoked && (
                                                <button
                                                    onClick={() => handleRevokeQR(user._id)}
                                                    className="p-2 text-gray-500 hover:text-danger-red hover:bg-danger-red/10 rounded-lg transition-all"
                                                    title="Revoke Credentials"
                                                >
                                                    <AlertTriangle size={16} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDeleteUser(user._id)}
                                                className="p-2 text-gray-500 hover:text-danger-red hover:bg-danger-red/10 rounded-lg transition-all"
                                                title="Hard Deletion"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-[#0f172a] border border-white/10 rounded-3xl p-8 max-w-lg w-full relative"
                        >
                            <button onClick={() => setShowCreateModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white">
                                <X size={24} />
                            </button>

                            <h2 className="text-2xl font-bold text-white mb-2">Issue New Credentials</h2>
                            <p className="text-gray-400 text-sm mb-8 font-medium">Onboard new intelligence personnel to the system.</p>

                            <form onSubmit={handleCreateUser} className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Full Identity</label>
                                        <div className="relative">
                                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                            <input
                                                required
                                                type="text"
                                                placeholder="John Doe"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-accent-blue/50 text-sm"
                                                value={form.fullName}
                                                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Access Alias</label>
                                        <div className="relative">
                                            <BadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                            <input
                                                required
                                                type="text"
                                                placeholder="jdoe_intel"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-accent-blue/50 text-sm"
                                                value={form.username}
                                                onChange={(e) => setForm({ ...form, username: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Official Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                        <input
                                            required
                                            type="email"
                                            placeholder="j.doe@gov.intel"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-accent-blue/50 text-sm"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Command Role</label>
                                        <select
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-accent-blue/50 text-sm"
                                            value={form.role}
                                            onChange={(e) => setForm({ ...form, role: e.target.value })}
                                        >
                                            <option value="agent" className="bg-[#0f172a]">Field Agent</option>
                                            <option value="analyst" className="bg-[#0f172a]">Intelligence Analyst</option>
                                            <option value="admin" className="bg-[#0f172a]">System Administrator</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Division</label>
                                        <div className="relative">
                                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                            <input
                                                type="text"
                                                placeholder="Cyber Forensics"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-accent-blue/50 text-sm"
                                                value={form.department}
                                                onChange={(e) => setForm({ ...form, department: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <p className="text-[10px] text-gray-500 italic flex items-start gap-2 bg-accent-blue/5 p-4 rounded-xl border border-accent-blue/10">
                                    <Key size={14} className="mt-0.5 text-accent-blue shrink-0" />
                                    <span>If password is left blank, a secure random override will be generated. The QR Digital ID will be the primary login method for Analysts and Agents.</span>
                                </p>

                                <button
                                    type="submit"
                                    className="w-full bg-accent-blue hover:bg-accent-blue/90 text-[#0f172a] font-bold py-4 rounded-xl transition-all shadow-lg shadow-accent-blue/20 mt-4"
                                >
                                    Confirm Personnel Onboarding
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}

                {showIDCardModal && <IDCardModal />}

                {showEditModal && editingUser && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-[#0f172a] border border-white/10 rounded-3xl p-8 max-w-lg w-full relative"
                        >
                            <button onClick={() => setShowEditModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white">
                                <X size={24} />
                            </button>

                            <h2 className="text-2xl font-bold text-white mb-2">Refine Personnel Details</h2>
                            <p className="text-gray-400 text-sm mb-8 font-medium">Update identities and system clearance levels.</p>

                            <form onSubmit={handleUpdateUser} className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Full Identity</label>
                                        <div className="relative">
                                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                            <input
                                                required
                                                type="text"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-accent-blue/50 text-sm"
                                                value={editingUser.fullName}
                                                onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Access Alias</label>
                                        <div className="relative">
                                            <BadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                            <input
                                                required
                                                type="text"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-accent-blue/50 text-sm"
                                                value={editingUser.username}
                                                onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Official Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                        <input
                                            required
                                            type="email"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-accent-blue/50 text-sm"
                                            value={editingUser.email}
                                            onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Command Role</label>
                                        <select
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-accent-blue/50 text-sm"
                                            value={editingUser.role}
                                            onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                                        >
                                            <option value="agent" className="bg-[#0f172a]">Field Agent</option>
                                            <option value="analyst" className="bg-[#0f172a]">Intelligence Analyst</option>
                                            <option value="admin" className="bg-[#0f172a]">System Administrator</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Division</label>
                                        <div className="relative">
                                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                            <input
                                                type="text"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-accent-blue/50 text-sm"
                                                value={editingUser.department}
                                                onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-accent-blue hover:bg-accent-blue/90 text-[#0f172a] font-bold py-4 rounded-xl transition-all shadow-lg shadow-accent-blue/20 mt-4"
                                >
                                    Apply Changes
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserManagement;
