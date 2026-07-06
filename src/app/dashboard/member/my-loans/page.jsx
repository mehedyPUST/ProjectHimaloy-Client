'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { fetchAPI } from '@/lib/api';
import {
    HandCoins,
    Clock,
    CheckCircle2,
    Calendar,
    TrendingUp,
    History,
    BadgeCheck,
    X,
    Send,
    FileText,
    Vote,
    Users,
    Wallet,
    Smartphone,
    Hash,
    Banknote,
    XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const MyLoansPageForMember = () => {
    const { data: session } = useSession();
    const user = session?.user;

    const [loading, setLoading] = useState(true);
    const [activeLoan, setActiveLoan] = useState(null);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loanHistory, setLoanHistory] = useState([]);
    const [historyFilter, setHistoryFilter] = useState('all');

    // Installment history state
    const [installmentHistory, setInstallmentHistory] = useState([]);
    const [loadingInstallments, setLoadingInstallments] = useState(false);

    const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
    const [isInstallmentModalOpen, setIsInstallmentModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loanForm, setLoanForm] = useState({
        amount: '',
        tenure: '',
        reason: '',
    });
    const [installmentForm, setInstallmentForm] = useState({
        paidThrough: '',
        transactionId: '',
        amount: '',
        note: '',
        date: new Date().toISOString().split('T')[0],
    });

    const hasActiveLoan = !!activeLoan;

    // ===== Fetch installment history for a loan =====
    const fetchInstallments = async (loanId) => {
        if (!loanId) return;
        setLoadingInstallments(true);
        try {
            const data = await fetchAPI(`/api/loans/installments?loanId=${loanId}`);
            if (data.success) {
                setInstallmentHistory(data.installments || []);
            }
        } catch (error) {
            console.error('Error fetching installments:', error);
        } finally {
            setLoadingInstallments(false);
        }
    };

    // ===== Fetch loans data =====
    useEffect(() => {
        const fetchLoans = async () => {
            const memberId = user?._id || user?.id;
            if (!memberId) return;

            try {
                const data = await fetchAPI(`/api/loans/my?memberId=${memberId}`);
                if (data.success) {
                    // Set active loan
                    setActiveLoan(data.active || null);

                    // Pending requests
                    setPendingRequests(data.pending || []);

                    // ===== FIX: Include active loan in history =====
                    let history = data.history || [];
                    if (data.active) {
                        // Check if already in history (avoid duplicates)
                        const exists = history.some(item => item._id === data.active._id);
                        if (!exists) {
                            // Add active loan at the beginning with _type = 'loan'
                            history = [{ ...data.active, _type: 'loan' }, ...history];
                        }
                    }
                    setLoanHistory(history);
                }
            } catch (error) {
                console.error('Error fetching loans:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLoans();
    }, [user]);

    // ===== Fetch installments when active loan changes =====
    useEffect(() => {
        if (activeLoan?._id) {
            fetchInstallments(activeLoan._id);
        } else {
            setInstallmentHistory([]);
        }
    }, [activeLoan]);

    const calculateLoan = (amount, tenure) => {
        if (!amount || !tenure) return null;
        const principalInstallments = tenure;
        const extraInstallments = tenure === 5 ? 1 : 2;
        const totalInstallments = principalInstallments + extraInstallments;
        const installmentAmount = Math.ceil(amount / principalInstallments);
        const savingsAmount = installmentAmount * extraInstallments;
        return { principalInstallments, extraInstallments, totalInstallments, installmentAmount, savingsAmount };
    };

    const loanPreview = calculateLoan(parseInt(loanForm.amount), parseInt(loanForm.tenure));

    const paymentMethods = [
        { value: 'bkash', label: 'bKash' },
        { value: 'nagad', label: 'Nagad' },
        { value: 'cellfin', label: 'Cell-Fin' },
        { value: 'rocket', label: 'Rocket' },
        { value: 'others', label: 'Others' },
        { value: 'hand-cash', label: 'Hand Cash (No Transaction)' },
    ];

    const handleOpenInstallmentModal = () => {
        setInstallmentForm({
            paidThrough: '',
            transactionId: '',
            amount: activeLoan?.installment_amount?.toString() || '',
            note: '',
            date: new Date().toISOString().split('T')[0],
        });
        setIsInstallmentModalOpen(true);
    };

    const handleInstallmentChange = (e) => {
        const { name, value } = e.target;
        setInstallmentForm(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'paidThrough' && value === 'hand-cash' ? { transactionId: '' } : {})
        }));
    };

    const handleSubmitInstallment = async (e) => {
        e.preventDefault();

        if (!installmentForm.paidThrough || !installmentForm.amount) {
            toast.error('Please fill all required fields');
            return;
        }
        if (installmentForm.paidThrough !== 'hand-cash' && !installmentForm.transactionId) {
            toast.error('Please enter Transaction ID');
            return;
        }

        const memberId = user?._id || user?.id;
        if (!memberId || !activeLoan?._id) {
            toast.error('Loan not found');
            return;
        }

        setIsSubmitting(true);
        try {
            const data = await fetchAPI('/api/loans/pay-installment', {
                method: 'POST',
                body: JSON.stringify({
                    memberId,
                    loanId: activeLoan._id,
                    date: installmentForm.date,
                    paidThrough: installmentForm.paidThrough,
                    transactionId: installmentForm.paidThrough === 'hand-cash' ? '-' : installmentForm.transactionId,
                    amount: parseInt(installmentForm.amount),
                    note: installmentForm.note,
                }),
            });

            if (data.success) {
                toast.success('Installment submitted! Pending manager confirmation.');
                setIsInstallmentModalOpen(false);

                // Refresh loans
                const refreshed = await fetchAPI(`/api/loans/my?memberId=${memberId}`);
                if (refreshed.success) {
                    setActiveLoan(refreshed.active || null);
                    setPendingRequests(refreshed.pending || []);
                    // Again include active loan in history
                    let history = refreshed.history || [];
                    if (refreshed.active) {
                        const exists = history.some(item => item._id === refreshed.active._id);
                        if (!exists) {
                            history = [{ ...refreshed.active, _type: 'loan' }, ...history];
                        }
                    }
                    setLoanHistory(history);
                    if (refreshed.active?._id) {
                        fetchInstallments(refreshed.active._id);
                    }
                }
            } else {
                toast.error(data.message || 'Failed to submit installment');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitLoan = async (e) => {
        e.preventDefault();

        if (!loanForm.amount || !loanForm.tenure || !loanForm.reason) {
            toast.error('Please fill all required fields');
            return;
        }

        const memberId = user?._id || user?.id;
        if (!memberId) {
            toast.error('User not found');
            return;
        }

        setIsSubmitting(true);

        try {
            const data = await fetchAPI('/api/loans/request', {
                method: 'POST',
                body: JSON.stringify({
                    memberId,
                    amount: parseInt(loanForm.amount),
                    tenure: parseInt(loanForm.tenure),
                    reason: loanForm.reason,
                }),
            });

            if (data.success) {
                toast.success('Loan request submitted! Voting will start soon.');
                setLoanForm({ amount: '', tenure: '', reason: '' });
                setIsLoanModalOpen(false);

                const refreshed = await fetchAPI(`/api/loans/my?memberId=${memberId}`);
                if (refreshed.success) {
                    setActiveLoan(refreshed.active || null);
                    setPendingRequests(refreshed.pending || []);
                    let history = refreshed.history || [];
                    if (refreshed.active) {
                        const exists = history.some(item => item._id === refreshed.active._id);
                        if (!exists) {
                            history = [{ ...refreshed.active, _type: 'loan' }, ...history];
                        }
                    }
                    setLoanHistory(history);
                }
            } else {
                toast.error(data.message || 'Failed to submit loan request');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'voting': return { bg: 'bg-blue-100', text: 'text-blue-700', icon: Vote };
            case 'meeting': return { bg: 'bg-orange-100', text: 'text-orange-700', icon: Users };
            case 'pending': return { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock };
            default: return { bg: 'bg-gray-100', text: 'text-gray-700', icon: Clock };
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading loans...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Page Title */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Loans</h1>
                    <p className="text-gray-500 mt-1">Track your active and past loans</p>
                </div>
                <button
                    onClick={() => !hasActiveLoan && setIsLoanModalOpen(true)}
                    disabled={hasActiveLoan}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${hasActiveLoan
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                    title={hasActiveLoan ? 'You already have an active loan' : 'Apply for a new loan'}
                >
                    <HandCoins className="size-4" />
                    {hasActiveLoan ? 'Active Loan Exists' : 'Apply for Loan'}
                </button>
            </div>

            {/* PENDING REQUESTS */}
            {pendingRequests.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Clock className="size-5 text-yellow-600" />
                        Pending Requests ({pendingRequests.length})
                    </h2>
                    {pendingRequests.map((req, index) => {
                        const statusBadge = getStatusBadge(req.status);
                        const StatusIcon = statusBadge.icon;
                        const preview = calculateLoan(req.amount, req.tenure);

                        return (
                            <div key={req._id || index} className="bg-white rounded-xl border border-yellow-200 p-5">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${statusBadge.bg}`}>
                                            <StatusIcon className={`size-5 ${statusBadge.text}`} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize flex items-center gap-1 ${statusBadge.bg} ${statusBadge.text}`}>
                                                    <StatusIcon className="size-3" />
                                                    {req.status}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mt-2">
                                                <p className="text-gray-500">Amount: <strong className="text-gray-900">৳{req.amount.toLocaleString()}</strong></p>
                                                <p className="text-gray-500">Tenure: <strong className="text-gray-900">{req.tenure} months</strong></p>
                                                {preview && (
                                                    <>
                                                        <p className="text-gray-500">Installment: <strong className="text-gray-900">৳{preview.installmentAmount.toLocaleString()}</strong></p>
                                                        <p className="text-gray-500">Savings: <strong className="text-green-600">৳{preview.savingsAmount.toLocaleString()}</strong></p>
                                                    </>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mt-2">
                                                <span className="text-gray-500">Reason:</span> {req.reason}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Requested: {new Date(req.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                    {req.status === 'pending' && (
                                        <p className="text-xs text-gray-500">⏳ Waiting for manager to start voting</p>
                                    )}
                                    {req.status === 'voting' && (
                                        <p className="text-xs text-blue-600">🗳️ Voting in progress - members are casting their votes</p>
                                    )}
                                    {req.status === 'meeting' && (
                                        <p className="text-xs text-orange-600">📅 Meeting called - awaiting discussion and re-voting</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ============================================ */}
            {/* ACTIVE LOAN - with updated 6-item grid        */}
            {/* ============================================ */}
            {activeLoan && (
                <div className="bg-white rounded-xl border border-blue-200 shadow-sm">
                    <div className="p-5 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <HandCoins className="size-5 text-blue-600" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-lg font-semibold text-gray-900">
                                            {activeLoan._id?.toString().slice(-8) || activeLoan.id}
                                        </h2>
                                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Active</span>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        {activeLoan.start_month || activeLoan.startMonth} - {activeLoan.end_month || activeLoan.endMonth}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500">Total Loan Amount</p>
                                <p className="text-xl font-bold text-gray-900">
                                    ৳{(activeLoan.amount + (activeLoan.savings_amount || 0)).toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-400">
                                    (Principal: ৳{activeLoan.amount.toLocaleString()} + Savings: ৳{(activeLoan.savings_amount || 0).toLocaleString()})
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-5 border-b border-gray-100">
                        <div>
                            <p className="text-xs text-gray-500">Installment Done</p>
                            <p className="text-lg font-bold text-gray-900">
                                {activeLoan.paid_installments || activeLoan.paidInstallments || 0}
                                <span className="text-sm text-gray-400">/{activeLoan.total_installments || activeLoan.totalInstallments || 0}</span>
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">Total Paid</p>
                            <p className="text-lg font-bold text-green-600">
                                ৳{((activeLoan.paid_installments || 0) * (activeLoan.installment_amount || activeLoan.installmentAmount || 0)).toLocaleString()}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">Due Amount</p>
                            {(() => {
                                const totalInstallments = activeLoan.total_installments || 1;
                                const paid = activeLoan.paid_installments || 0;
                                const remainingInstallments = totalInstallments - paid;

                                const principalDue = activeLoan.due_amount || 0;
                                let savingsDue = 0;
                                if (remainingInstallments > 0) {
                                    savingsDue = activeLoan.savings_amount || 0;
                                }
                                const totalDue = principalDue + savingsDue;
                                return (
                                    <p className="text-lg font-bold text-red-600">
                                        ৳{totalDue.toLocaleString()}
                                    </p>
                                );
                            })()}
                            <p className="text-xs text-gray-400">
                                (Principal: ৳{(activeLoan.due_amount || 0).toLocaleString()} + Savings: ৳{(() => {
                                    const remaining = (activeLoan.total_installments || 1) - (activeLoan.paid_installments || 0);
                                    return remaining > 0 ? (activeLoan.savings_amount || 0).toLocaleString() : '0';
                                })()})
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">Per Installment</p>
                            <p className="text-lg font-bold text-gray-900">
                                ৳{(activeLoan.installment_amount || activeLoan.installmentAmount || 0).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-400">(Principal installment)</p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">Last Installment</p>
                            {(() => {
                                const confirmed = installmentHistory.filter(inst => inst.status === 'confirmed');
                                const last = confirmed.length > 0 ? confirmed[confirmed.length - 1] : null;
                                if (last) {
                                    return (
                                        <>
                                            <p className="text-lg font-bold text-gray-900">
                                                ৳{last.amount?.toLocaleString()}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {last.date ? new Date(last.date).toLocaleDateString() : '—'}
                                            </p>
                                        </>
                                    );
                                } else {
                                    return <p className="text-sm text-gray-400 italic">No paid yet</p>;
                                }
                            })()}
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">Next Installment</p>
                            <div className="flex items-center gap-1">
                                <Calendar className="size-4 text-blue-500" />
                                <p className="text-lg font-bold text-blue-600">
                                    {activeLoan.next_installment_date || activeLoan.nextInstallmentDate || '-'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="px-5 py-3 border-b border-gray-100">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-500">Progress</span>
                            <span className="font-medium">
                                {Math.round(((activeLoan.paid_installments || 0) / (activeLoan.total_installments || 1)) * 100)}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className="bg-blue-600 h-3 rounded-full"
                                style={{ width: `${((activeLoan.paid_installments || 0) / (activeLoan.total_installments || 1)) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="px-5 py-3 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <History className="size-4" />
                                Installment History
                            </h3>
                            {installmentHistory.length > 0 && (
                                <span className="text-xs text-gray-500">
                                    Total {installmentHistory.length} payments
                                </span>
                            )}
                        </div>

                        {loadingInstallments ? (
                            <div className="flex justify-center py-2">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                            </div>
                        ) : installmentHistory.length === 0 ? (
                            <p className="text-sm text-gray-400 italic">No installments paid yet.</p>
                        ) : (
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                {installmentHistory.slice(0, 5).map((inst, idx) => (
                                    <div key={inst._id || idx} className="flex items-center justify-between text-sm border-b border-gray-50 pb-2 last:border-0">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-800">৳{inst.amount?.toLocaleString()}</span>
                                            <span className="text-xs text-gray-400">
                                                {inst.date ? new Date(inst.date).toLocaleDateString() : '—'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-gray-500 capitalize">
                                                {inst.paidThrough || inst.method || '—'}
                                            </span>
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${inst.status === 'confirmed'
                                                ? 'bg-green-100 text-green-700'
                                                : inst.status === 'pending'
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : 'bg-red-100 text-red-700'
                                                }`}>
                                                {inst.status || 'pending'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {installmentHistory.length > 5 && (
                                    <p className="text-xs text-blue-500 text-center cursor-pointer hover:underline">
                                        + {installmentHistory.length - 5} more
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="px-5 py-3 bg-green-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="size-4 text-green-600" />
                            <span className="text-sm text-green-700">
                                Savings after completion: <strong>৳{(activeLoan.savings_amount || 0).toLocaleString()}</strong>
                            </span>
                        </div>
                        <button
                            onClick={handleOpenInstallmentModal}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                            <Wallet className="size-4" />
                            Make Installment
                        </button>
                    </div>
                </div>
            )}

            {/* No Loan State */}
            {!activeLoan && pendingRequests.length === 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                        <HandCoins className="size-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">No Loans</h3>
                    <p className="text-gray-500 mt-1">You don't have any active or pending loans.</p>
                    <button
                        onClick={() => setIsLoanModalOpen(true)}
                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                        Apply for a Loan
                    </button>
                </div>
            )}

            {/* ===== LOAN HISTORY WITH TABS ===== */}
            {loanHistory.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <History className="size-5 text-gray-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Loan History</h2>
                        </div>
                        <span className="text-sm text-gray-500">{loanHistory.length} entries</span>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-4 border-b border-gray-200 pb-2 flex-wrap">
                        {['all', 'active', 'completed', 'rejected'].map((tab) => {
                            const count = tab === 'all' ? loanHistory.length :
                                tab === 'active' ? loanHistory.filter(item => item._type === 'loan' && item.status === 'active').length :
                                    tab === 'completed' ? loanHistory.filter(item => item._type === 'loan' && ['completed', 'settled_early'].includes(item.status)).length :
                                        loanHistory.filter(item => item._type === 'request' && item.status === 'rejected').length;
                            return (
                                <button
                                    key={tab}
                                    onClick={() => setHistoryFilter(tab)}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${historyFilter === tab
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)} ({count})
                                </button>
                            );
                        })}
                    </div>

                    {/* Filtered List */}
                    <div className="space-y-3">
                        {loanHistory
                            .filter(item => {
                                if (historyFilter === 'all') return true;
                                if (historyFilter === 'active') return item._type === 'loan' && item.status === 'active';
                                if (historyFilter === 'completed') return item._type === 'loan' && ['completed', 'settled_early'].includes(item.status);
                                if (historyFilter === 'rejected') return item._type === 'request' && item.status === 'rejected';
                                return true;
                            })
                            .map((item, index) => {
                                const isLoan = item._type === 'loan';
                                const isRejected = item._type === 'request' && item.status === 'rejected';
                                const isCompleted = isLoan && ['completed', 'settled_early'].includes(item.status);
                                const isActive = isLoan && item.status === 'active';

                                return (
                                    <div key={item._id || index} className={`border rounded-xl p-4 ${isRejected ? 'border-red-200 bg-red-50' :
                                        isCompleted ? 'border-green-200 bg-green-50' :
                                            isActive ? 'border-blue-200 bg-blue-50' :
                                                'border-gray-200'
                                        }`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isRejected ? 'bg-red-100' :
                                                    isCompleted ? 'bg-green-100' :
                                                        isActive ? 'bg-blue-100' :
                                                            'bg-gray-100'
                                                    }`}>
                                                    {isRejected ? <XCircle className="size-5 text-red-600" /> :
                                                        isCompleted ? <CheckCircle2 className="size-5 text-green-600" /> :
                                                            isActive ? <HandCoins className="size-5 text-blue-600" /> :
                                                                <History className="size-5 text-gray-600" />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <p className="font-semibold text-gray-900">
                                                            {item._id?.toString().slice(-8) || item.id || 'N/A'}
                                                        </p>
                                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isRejected ? 'bg-red-100 text-red-700' :
                                                            isCompleted ? 'bg-green-100 text-green-700' :
                                                                isActive ? 'bg-blue-100 text-blue-700' :
                                                                    'bg-gray-100 text-gray-700'
                                                            }`}>
                                                            {isRejected ? 'Rejected' :
                                                                isCompleted ? (item.status === 'settled_early' ? 'Early Settlement' : 'Completed') :
                                                                    isActive ? 'Active' :
                                                                        item.status || 'Unknown'}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {isRejected ? `Rejected: ${item.updated_at ? new Date(item.updated_at).toLocaleDateString() : '-'}` :
                                                            isCompleted ? `Completed: ${item.completed_at ? new Date(item.completed_at).toLocaleDateString() : '-'}` :
                                                                isActive ? `Started: ${item.start_month || '-'}` :
                                                                    '-'}
                                                    </p>
                                                    {isRejected && item.rejection_reason && (
                                                        <p className="text-xs text-red-600 mt-1">Reason: {item.rejection_reason}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-gray-900">৳{item.amount?.toLocaleString()}</p>
                                                {isLoan && <p className="text-xs text-gray-500">{item.tenure} months</p>}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            )}

            {/* Loan Apply Modal */}
            {isLoanModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsLoanModalOpen(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <HandCoins className="size-5 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Apply for Loan</h2>
                                    <p className="text-xs text-gray-500">Fill the form to request a loan</p>
                                </div>
                            </div>
                            <button onClick={() => setIsLoanModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <X className="size-5 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitLoan} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Loan Amount <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">৳</span>
                                    <input
                                        type="number"
                                        value={loanForm.amount}
                                        onChange={(e) => setLoanForm(prev => ({ ...prev, amount: e.target.value }))}
                                        placeholder="Enter loan amount"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg"
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tenure <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setLoanForm(prev => ({ ...prev, tenure: '5' }))}
                                        className={`py-3 rounded-xl border-2 font-medium transition-all ${loanForm.tenure === '5' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                                    >
                                        5 Months
                                        <p className="text-xs font-normal mt-0.5 opacity-70">5+1 Installments</p>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setLoanForm(prev => ({ ...prev, tenure: '10' }))}
                                        className={`py-3 rounded-xl border-2 font-medium transition-all ${loanForm.tenure === '10' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                                    >
                                        10 Months
                                        <p className="text-xs font-normal mt-0.5 opacity-70">10+2 Installments</p>
                                    </button>
                                </div>
                            </div>

                            {loanPreview && (
                                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                                    <h4 className="text-sm font-semibold text-gray-700">Loan Preview</h4>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div><p className="text-gray-500">Principal Installments</p><p className="font-medium">{loanPreview.principalInstallments}</p></div>
                                        <div><p className="text-gray-500">Extra (Savings)</p><p className="font-medium text-green-600">{loanPreview.extraInstallments}</p></div>
                                        <div><p className="text-gray-500">Total Installments</p><p className="font-medium">{loanPreview.totalInstallments}</p></div>
                                        <div><p className="text-gray-500">Per Installment</p><p className="font-medium">৳{loanPreview.installmentAmount.toLocaleString()}</p></div>
                                        <div className="col-span-2">
                                            <p className="text-gray-500">Total Savings after completion</p>
                                            <p className="font-medium text-green-600">৳{loanPreview.savingsAmount.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reason for Loan <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-3 size-4 text-gray-400" />
                                    <textarea
                                        value={loanForm.reason}
                                        onChange={(e) => setLoanForm(prev => ({ ...prev, reason: e.target.value }))}
                                        placeholder="Explain why you need this loan..."
                                        rows={3}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-xs text-yellow-700">
                                    📌 After submission, voting will start. If 2+ members deny, a meeting will be called.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsLoanModalOpen(false)}
                                    className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="size-5" />
                                            Submit Request
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Installment Modal */}
            {isInstallmentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsInstallmentModalOpen(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                    <Wallet className="size-5 text-green-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Make Installment</h2>
                                    <p className="text-xs text-gray-500">Pay your loan installment</p>
                                </div>
                            </div>
                            <button onClick={() => setIsInstallmentModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <X className="size-5 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitInstallment} className="p-6 space-y-5">
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Loan Amount:</span>
                                    <span className="font-medium">৳{activeLoan?.amount?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm mt-1">
                                    <span className="text-gray-600">Installment:</span>
                                    <span className="font-medium">৳{activeLoan?.installment_amount?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm mt-1">
                                    <span className="text-gray-600">Progress:</span>
                                    <span className="font-medium">{activeLoan?.paid_installments || 0}/{activeLoan?.total_installments || 0}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                                    <input type="date" name="date" value={installmentForm.date}
                                        onChange={handleInstallmentChange}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl outline-none" required />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Paid Through <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                                    <select name="paidThrough" value={installmentForm.paidThrough}
                                        onChange={handleInstallmentChange}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl outline-none appearance-none bg-white" required>
                                        <option value="">Select Payment Method</option>
                                        {paymentMethods.map(method => (
                                            <option key={method.value} value={method.value}>{method.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {installmentForm.paidThrough && installmentForm.paidThrough !== 'hand-cash' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Transaction ID <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                                        <input type="text" name="transactionId" value={installmentForm.transactionId}
                                            onChange={handleInstallmentChange}
                                            placeholder="Enter Transaction ID"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl outline-none" required />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Amount <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                                    <input type="number" name="amount" value={installmentForm.amount}
                                        onChange={handleInstallmentChange}
                                        placeholder="Enter amount" min={1}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl outline-none text-lg" required />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Current installment: ৳{activeLoan?.installment_amount?.toLocaleString()}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Note <span className="text-gray-400">(Optional)</span></label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-3 size-4 text-gray-400" />
                                    <textarea name="note" value={installmentForm.note}
                                        onChange={handleInstallmentChange}
                                        placeholder="Any additional note..." rows={2}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl outline-none resize-none" />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setIsInstallmentModalOpen(false)}
                                    className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                                    disabled={isSubmitting}>Cancel</button>
                                <button type="submit" disabled={isSubmitting}
                                    className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
                                    {isSubmitting ? (
                                        <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>Submitting...</>
                                    ) : (
                                        <><Send className="size-5" />Submit Installment</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyLoansPageForMember;