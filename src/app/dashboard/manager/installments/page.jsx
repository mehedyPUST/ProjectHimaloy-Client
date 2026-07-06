// client/src/app/dashboard/manager/installments/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { fetchAPI } from '@/lib/api';
import {
    Wallet, Search, CheckCircle2, XCircle, Clock, Calendar, Check, X, Eye,
    Lock, RotateCcw, HandCoins, User, MessageSquare,
} from 'lucide-react';
import toast from 'react-hot-toast';

const InstallmentsPageForManager = () => {
    const { data: session } = useSession();
    const user = session?.user;

    const [loading, setLoading] = useState(true);
    const [installments, setInstallments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // PIN + Reject reason modal
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmPin, setConfirmPin] = useState('');
    const [confirmItemId, setConfirmItemId] = useState(null);
    const [confirmAction, setConfirmAction] = useState('confirm');
    const [rejectReason, setRejectReason] = useState('');

    useEffect(() => { fetchInstallments(); }, []);

    const fetchInstallments = async () => {
        try {
            const data = await fetchAPI('/api/loans/installments');
            if (data.success) setInstallments(data.installments || []);
        } catch (error) { console.error('Error fetching installments:', error); }
        finally { setLoading(false); }
    };

    const filteredInstallments = installments.filter(inst => {
        const matchesSearch =
            (inst.member_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (inst.loan_id || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || inst.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const pendingCount = installments.filter(i => i.status === 'pending').length;
    const confirmedCount = installments.filter(i => i.status === 'confirmed').length;

    const handleConfirmClick = (id, action = 'confirm') => {
        setConfirmItemId(id);
        setConfirmPin('');
        setRejectReason('');
        setConfirmAction(action);
        setShowConfirmModal(true);
    };

    const handleConfirmWithPin = async () => {
        if (!confirmPin || confirmPin.length !== 6) {
            toast.error('Please enter your 6-digit Manager PIN');
            return;
        }
        if (confirmAction === 'reject' && !rejectReason.trim()) {
            toast.error('Please provide a rejection reason');
            return;
        }

        try {
            const data = await fetchAPI(`/api/loans/installments/${confirmItemId}/confirm`, {
                method: 'PATCH',
                body: JSON.stringify({
                    managerId: user?._id || user?.id,
                    pin: confirmPin,
                    status: confirmAction === 'reject' ? 'rejected' : 'confirmed',
                    rejectReason: confirmAction === 'reject' ? rejectReason : null,
                }),
            });

            if (data.success) {
                toast.success(confirmAction === 'reject' ? 'Installment rejected!' : 'Installment confirmed!');
                setShowConfirmModal(false);
                setConfirmPin('');
                setRejectReason('');
                fetchInstallments();
                if (isDetailModalOpen) setIsDetailModalOpen(false);
            } else {
                toast.error(data.message || 'Invalid PIN');
            }
        } catch (error) { toast.error('Failed'); }
    };

    const openDetailModal = (inst) => {
        setSelectedRequest(inst);
        setIsDetailModalOpen(true);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'confirmed': return { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2, label: 'Confirmed' };
            case 'rejected': return { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Rejected' };
            case 'pending': return { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock, label: 'Pending' };
            default: return { bg: 'bg-gray-100', text: 'text-gray-700', icon: Clock, label: status };
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div><p className="mt-4 text-gray-600">Loading installments...</p></div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Loan Installments</h1>
                    <p className="text-gray-500 mt-1">Review and confirm member loan repayments</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-xs text-gray-500">Total Submissions</p>
                    <p className="text-2xl font-bold text-gray-900">{installments.length}</p>
                </div>
                <div className="bg-white rounded-xl border border-yellow-200 p-4">
                    <div className="flex items-center gap-2"><Clock className="size-4 text-yellow-600" /><p className="text-xs text-gray-500">Pending</p></div>
                    <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                </div>
                <div className="bg-white rounded-xl border border-green-200 p-4">
                    <div className="flex items-center gap-2"><CheckCircle2 className="size-4 text-green-600" /><p className="text-xs text-gray-500">Confirmed</p></div>
                    <p className="text-2xl font-bold text-green-600">{confirmedCount}</p>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                        <input type="text" placeholder="Search by member name, loan ID..." value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" />
                    </div>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none bg-white">
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Installments Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Member</th>
                                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Loan ID</th>
                                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Installment</th>
                                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Amount</th>
                                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 hidden md:table-cell">Date</th>
                                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 hidden lg:table-cell">Method</th>
                                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Status</th>
                                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredInstallments.map((inst, index) => {
                                const statusBadge = getStatusBadge(inst.status);
                                const StatusIcon = statusBadge.icon;
                                return (
                                    <tr key={inst._id || index} className={`hover:bg-gray-50 transition-colors ${inst.status === 'pending' ? 'bg-yellow-50/30' : ''
                                        }`}>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                                                    {(inst.member_name || '?').charAt(0)}
                                                </div>
                                                <span className="text-sm font-medium text-gray-900">{inst.member_name || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-500">{inst.loan_id?.slice(-8) || inst.loan_id}</td>
                                        <td className="py-3 px-4 text-sm font-medium">
                                            #{inst.installment_no || '?'} of {inst.total_installments || '?'}
                                        </td>
                                        <td className="py-3 px-4"><span className="text-sm font-semibold text-gray-900">৳{inst.amount.toLocaleString()}</span></td>
                                        <td className="py-3 px-4 hidden md:table-cell text-sm text-gray-500">
                                            {inst.date || new Date(inst.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-4 hidden lg:table-cell">
                                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                                                {inst.paid_through || inst.method || '-'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge.bg} ${statusBadge.text}`}>
                                                <StatusIcon className="size-3" /> {statusBadge.label}
                                            </span>
                                            {inst.status === 'rejected' && inst.reject_reason && (
                                                <p className="text-xs text-red-500 mt-1 max-w-[150px] truncate" title={inst.reject_reason}>
                                                    {inst.reject_reason}
                                                </p>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => openDetailModal(inst)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="View Details">
                                                    <Eye className="size-4 text-gray-500" />
                                                </button>
                                                {inst.status === 'pending' && (
                                                    <>
                                                        <button onClick={() => handleConfirmClick(inst._id, 'confirm')} className="p-1.5 hover:bg-green-50 rounded-lg transition-colors" title="Confirm">
                                                            <Check className="size-4 text-green-600" />
                                                        </button>
                                                        <button onClick={() => handleConfirmClick(inst._id, 'reject')} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" title="Reject">
                                                            <X className="size-4 text-red-500" />
                                                        </button>
                                                    </>
                                                )}
                                                {inst.status === 'rejected' && (
                                                    <button onClick={() => handleConfirmClick(inst._id, 'confirm')} className="p-1.5 hover:bg-green-50 rounded-lg transition-colors" title="Re-confirm">
                                                        <RotateCcw className="size-4 text-green-600" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {filteredInstallments.length === 0 && (
                    <div className="p-12 text-center">
                        <Wallet className="size-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900">No installments found</h3>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {isDetailModalOpen && selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setIsDetailModalOpen(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Installment Details</h3>
                            <button onClick={() => setIsDetailModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="size-5 text-gray-500" /></button>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-lg font-bold text-blue-600">
                                    {(selectedRequest.member_name || '?').charAt(0)}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">{selectedRequest.member_name || 'Unknown'}</p>
                                    <p className="text-sm text-gray-500">Loan: {selectedRequest.loan_id?.slice(-8)}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-xl">
                                <div><p className="text-xs text-gray-500">Installment No</p><p className="font-medium">#{selectedRequest.installment_no}</p></div>
                                <div><p className="text-xs text-gray-500">Amount</p><p className="font-medium text-lg">৳{selectedRequest.amount.toLocaleString()}</p></div>
                                <div><p className="text-xs text-gray-500">Date</p><p className="font-medium">{selectedRequest.date || new Date(selectedRequest.created_at).toLocaleDateString()}</p></div>
                                <div><p className="text-xs text-gray-500">Method</p><p className="font-medium">{selectedRequest.paid_through || selectedRequest.method || '-'}</p></div>
                                {selectedRequest.transaction_id && selectedRequest.transaction_id !== '-' && (
                                    <div className="col-span-2"><p className="text-xs text-gray-500">Transaction ID</p><p className="font-medium">#{selectedRequest.transaction_id}</p></div>
                                )}
                                {selectedRequest.note && (
                                    <div className="col-span-2"><p className="text-xs text-gray-500">Note</p><p className="font-medium">{selectedRequest.note}</p></div>
                                )}
                                {selectedRequest.reject_reason && (
                                    <div className="col-span-2"><p className="text-xs text-red-500">Rejection Reason</p><p className="font-medium text-red-600">{selectedRequest.reject_reason}</p></div>
                                )}
                            </div>
                            {(selectedRequest.status === 'pending' || selectedRequest.status === 'rejected') && (
                                <div className="flex gap-3">
                                    <button onClick={() => { handleConfirmClick(selectedRequest._id, 'confirm'); setIsDetailModalOpen(false); }}
                                        className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 flex items-center justify-center gap-2"><Check className="size-4" /> Confirm</button>
                                    {selectedRequest.status === 'pending' && (
                                        <button onClick={() => { handleConfirmClick(selectedRequest._id, 'reject'); setIsDetailModalOpen(false); }}
                                            className="flex-1 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl font-medium hover:bg-red-100 flex items-center justify-center gap-2"><X className="size-4" /> Reject</button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* PIN Confirm Modal with Reject Reason */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowConfirmModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
                        <div className="text-center mb-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${confirmAction === 'reject' ? 'bg-red-100' : 'bg-green-100'}`}>
                                {confirmAction === 'reject' ? <XCircle className="size-6 text-red-600" /> : <CheckCircle2 className="size-6 text-green-600" />}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">{confirmAction === 'reject' ? 'Reject Installment?' : 'Confirm Installment?'}</h3>
                            <p className="text-sm text-gray-500 mt-1">Enter your 6-digit Manager PIN</p>
                        </div>

                        {confirmAction === 'reject' && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <MessageSquare className="size-4 inline mr-1" />
                                    Rejection Reason <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    placeholder="Why are you rejecting this installment?"
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none resize-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>
                        )}

                        <div className="relative mb-4">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                            <input type="password" maxLength={6} placeholder="6-digit Manager PIN" value={confirmPin}
                                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-center text-2xl tracking-[0.5em] outline-none focus:ring-2 focus:ring-blue-500" autoFocus
                                onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmWithPin(); }} />
                            <p className="text-xs text-gray-400 mt-1 text-center">{confirmPin.length}/6 digits</p>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => { setShowConfirmModal(false); setConfirmPin(''); setRejectReason(''); }}
                                className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">Cancel</button>
                            <button onClick={handleConfirmWithPin}
                                disabled={confirmPin.length !== 6 || (confirmAction === 'reject' && !rejectReason.trim())}
                                className={`flex-1 py-2.5 text-white rounded-xl font-semibold transition-all disabled:bg-gray-300 disabled:cursor-not-allowed ${confirmAction === 'reject' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                                    }`}>
                                {confirmAction === 'reject' ? 'Reject' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InstallmentsPageForManager;