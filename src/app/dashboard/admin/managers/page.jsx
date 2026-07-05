// client/src/app/dashboard/admin/managers/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import {
    UserCheck,
    Shield,
    Calendar,
    Clock,
    ArrowLeftRight,
    CheckCircle2,
    TrendingUp,
    Wallet,
    HandCoins,
    History,
    AlertTriangle,
    X,
} from 'lucide-react';
import toast from 'react-hot-toast';

const ManagersManagementPageForAdmin = () => {
    const [loading, setLoading] = useState(true);
    const [currentManager, setCurrentManager] = useState(null);
    const [managerHistory, setManagerHistory] = useState([]);
    const [eligibleMembers, setEligibleMembers] = useState([]);
    const [showRotationModal, setShowRotationModal] = useState(false);
    const [selectedNewManager, setSelectedNewManager] = useState('');
    const [isRotating, setIsRotating] = useState(false);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);

        // Fetch current manager cycle
        try {
            const cycleRes = await fetchAPI('/api/manager-cycles/current');
            if (cycleRes.success && cycleRes.cycle) {
                const cycle = cycleRes.cycle;
                const startDate = new Date(cycle.start_date);
                const endDate = new Date(cycle.end_date);
                const now = new Date();
                const monthsRemaining = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24 * 30)));

                setCurrentManager({
                    _id: cycle.manager_id,
                    name: cycle.manager_name || 'Manager',
                    cycleNumber: cycle.cycle_number || 1,
                    startDate: cycle.start_date || '',
                    endDate: cycle.end_date || '',
                    monthsRemaining,
                    totalCollection: cycle.total_collection || 0,
                    totalLoansDisbursed: cycle.total_loans_disbursed || 0,
                    totalSavingsGenerated: cycle.total_savings_generated || 0,
                });
            }
        } catch (e) {
            console.error('Current cycle error:', e);
        }

        // Fetch manager history
        try {
            const historyRes = await fetchAPI('/api/manager-cycles');
            if (historyRes.success) {
                setManagerHistory(historyRes.cycles?.filter(c => !c.active) || []);
            }
        } catch (e) {
            console.error('History error:', e);
        }

        // Fetch eligible members
        try {
            const membersRes = await fetchAPI('/api/users?role=member&status=active');
            if (membersRes.success) {
                setEligibleMembers(membersRes.users || []);
            }
        } catch (e) {
            console.error('Members error:', e);
        }

        setLoading(false);
    };

    const handleRotateManager = async () => {
        if (!selectedNewManager) {
            toast.error('Please select a new manager');
            return;
        }

        setIsRotating(true);

        try {
            const data = await fetchAPI('/api/manager-cycles/rotate', {
                method: 'POST',
                body: JSON.stringify({ newManagerId: selectedNewManager }),
            });

            if (data.success) {
                toast.success('Manager rotated successfully!');
                setShowRotationModal(false);
                setSelectedNewManager('');
                fetchAllData();
            } else {
                toast.error(data.message || 'Failed to rotate manager');
            }
        } catch (error) {
            toast.error('Failed to rotate manager');
        } finally {
            setIsRotating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manager Management</h1>
                    <p className="text-gray-500 mt-1">Manage fund managers and rotations</p>
                </div>
                <button
                    onClick={() => setShowRotationModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    <ArrowLeftRight className="size-4" />Rotate Manager
                </button>
            </div>

            {/* Current Manager */}
            {currentManager ? (
                <div className="bg-white rounded-xl border border-blue-200 shadow-sm">
                    <div className="p-5 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <Shield className="size-5 text-blue-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Current Manager</h2>
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                Cycle #{currentManager.cycleNumber}
                            </span>
                        </div>
                    </div>

                    <div className="p-5">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                                        {(currentManager.name || 'M').charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{currentManager.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Calendar className="size-4" />
                                    <span>{currentManager.startDate} - {currentManager.endDate}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="size-4 text-blue-500" />
                                    <span className="text-sm font-medium text-blue-600">{currentManager.monthsRemaining} months remaining</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                        <Wallet className="size-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Total Collection</p>
                                        <p className="text-lg font-bold text-gray-900">৳{currentManager.totalCollection.toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                        <HandCoins className="size-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Loans Disbursed</p>
                                        <p className="text-lg font-bold text-gray-900">৳{currentManager.totalLoansDisbursed.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                                        <TrendingUp className="size-5 text-yellow-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Savings Generated</p>
                                        <p className="text-lg font-bold text-gray-900">৳{currentManager.totalSavingsGenerated.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 pt-5 border-t border-gray-100">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-500">Term Progress</span>
                                <span className="font-medium">{6 - currentManager.monthsRemaining}/6 months completed</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${((6 - currentManager.monthsRemaining) / 6) * 100}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <Shield className="size-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900">No Manager Assigned</h3>
                    <p className="text-gray-500 mt-1">Initialize a manager cycle by selecting a manager below</p>
                    <button onClick={() => setShowRotationModal(true)}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
                        Assign First Manager
                    </button>
                </div>
            )}

            {/* Manager History */}
            {managerHistory.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <History className="size-5 text-gray-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Manager History</h2>
                    </div>

                    <div className="space-y-4">
                        {managerHistory.map((manager, index) => (
                            <div key={manager._id || index} className="border border-gray-200 rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold">
                                            {(manager.manager_name || '?').charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-gray-900">{manager.manager_name || 'Unknown'}</p>
                                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                                                    Cycle #{manager.cycle_number}
                                                </span>
                                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                                                    <CheckCircle2 className="size-3" />completed
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-0.5">{manager.start_date} - {manager.end_date}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-gray-100">
                                    <div>
                                        <p className="text-xs text-gray-500">Collection</p>
                                        <p className="text-sm font-medium">৳{(manager.total_collection || 0).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Loans</p>
                                        <p className="text-sm font-medium">৳{(manager.total_loans_disbursed || 0).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Savings</p>
                                        <p className="text-sm font-medium">৳{(manager.total_savings_generated || 0).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Rotate Manager Modal */}
            {showRotationModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowRotationModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <ArrowLeftRight className="size-5 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        {currentManager ? 'Rotate Manager' : 'Assign Manager'}
                                    </h2>
                                    <p className="text-xs text-gray-500">Select a new manager</p>
                                </div>
                            </div>
                            <button onClick={() => setShowRotationModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                                <X className="size-5 text-gray-500" />
                            </button>
                        </div>

                        {currentManager && (
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="size-4 text-yellow-600 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-yellow-800">Current: {currentManager.name}</p>
                                        <p className="text-xs text-yellow-700">{currentManager.monthsRemaining} months remaining</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!currentManager && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                                <p className="text-sm text-blue-700">Select a member to assign as the first manager</p>
                            </div>
                        )}

                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {eligibleMembers.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-4">No eligible members found</p>
                            ) : (
                                eligibleMembers.map(member => (
                                    <button
                                        key={member._id}
                                        onClick={() => setSelectedNewManager(member._id)}
                                        className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${selectedNewManager === member._id
                                                ? 'border-blue-600 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">
                                                {(member.name || '?').charAt(0)}
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-medium text-gray-900">{member.name}</p>
                                                <p className="text-xs text-gray-500">{member.email}</p>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>

                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => { setShowRotationModal(false); setSelectedNewManager(''); }}
                                className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                                Cancel
                            </button>
                            <button
                                onClick={handleRotateManager}
                                disabled={!selectedNewManager || isRotating}
                                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
                                {isRotating ? (
                                    <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>Rotating...</>
                                ) : (
                                    'Confirm'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagersManagementPageForAdmin;