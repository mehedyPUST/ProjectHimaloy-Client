// client/src/app/dashboard/manager/loans/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { fetchAPI } from '@/lib/api';
import {
    HandCoins,
    Search,
    Clock,
    Eye,
    X,
    Calendar,
    Vote,
    TrendingUp,
} from 'lucide-react';
import toast from 'react-hot-toast';

const LoansPageForManager = () => {
    const { data: session } = useSession();
    const user = session?.user;

    const [loading, setLoading] = useState(true);
    const [loanRequests, setLoanRequests] = useState([]);
    const [activeLoans, setActiveLoans] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('pending');
    const [selectedLoan, setSelectedLoan] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // ✅ Voting loading state
    const [startingVoting, setStartingVoting] = useState(false);

    // Fetch data
    useEffect(() => {
        fetchLoanRequests();
        fetchActiveLoans();
    }, []);

    const fetchLoanRequests = async () => {
        try {
            const data = await fetchAPI('/api/loans/requests');
            if (data.success) {
                setLoanRequests(data.requests || []);
            }
        } catch (error) {
            console.error('Error fetching loan requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchActiveLoans = async () => {
        try {
            const data = await fetchAPI('/api/loans/active');
            if (data.success) {
                setActiveLoans(data.loans || []);
            }
        } catch (error) {
            console.error('Error fetching active loans:', error);
        }
    };

    const filteredRequests = loanRequests.filter(loan => {
        const matchesSearch =
            (loan.member_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (loan.reason || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const pendingCount = loanRequests.filter(l => l.status === 'pending').length;
    const votingCount = loanRequests.filter(l => l.status === 'voting').length;

    const calculateLoanPreview = (amount, tenure) => {
        const principalInstallments = tenure;
        const extraInstallments = tenure === 5 ? 1 : 2;
        const totalInstallments = principalInstallments + extraInstallments;
        const installmentAmount = Math.ceil(amount / principalInstallments);
        const savingsAmount = installmentAmount * extraInstallments;
        return { principalInstallments, extraInstallments, totalInstallments, installmentAmount, savingsAmount };
    };

    const openDetailModal = (loan) => {
        setSelectedLoan(loan);
        setIsDetailModalOpen(true);
    };

    const handleStartVoting = async (loanId) => {
        const managerId = user?._id || user?.id;

        // ✅ Set loading to true
        setStartingVoting(true);

        try {
            const data = await fetchAPI(`/api/loans/requests/${loanId}/voting/start`, {
                method: 'POST',
                body: JSON.stringify({ managerId }),
            });

            if (data.success) {
                toast.success('Voting started! Members will be notified.');
                fetchLoanRequests();
                if (isDetailModalOpen) setIsDetailModalOpen(false);
            } else {
                toast.error(data.message || 'Failed to start voting');
            }
        } catch (error) {
            toast.error('Failed to start voting');
        } finally {
            // ✅ Reset loading
            setStartingVoting(false);
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
        <div className="max-w-6xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Loan Management</h1>
                <p className="text-gray-500 mt-1">Review loan requests and manage active loans</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-xs text-gray-500">Pending Requests</p>
                    <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                </div>
                <div className="bg-white rounded-xl border border-blue-200 p-4">
                    <p className="text-xs text-gray-500">In Voting</p>
                    <p className="text-2xl font-bold text-blue-600">{votingCount}</p>
                </div>
                <div className="bg-white rounded-xl border border-green-200 p-4">
                    <p className="text-xs text-gray-500">Active Loans</p>
                    <p className="text-2xl font-bold text-green-600">{activeLoans.length}</p>
                </div>
                <div className="bg-white rounded-xl border border-purple-200 p-4">
                    <p className="text-xs text-gray-500">Total Disbursed</p>
                    <p className="text-2xl font-bold text-purple-600">
                        ৳{activeLoans.reduce((s, l) => s + (l.amount || 0), 0).toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit overflow-x-auto">
                {['pending', 'voting', 'approved', 'rejected', 'all'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setStatusFilter(tab)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all whitespace-nowrap ${statusFilter === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by name or reason..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                />
            </div>

            {/* Loan Requests */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Loan Requests</h2>

                {filteredRequests.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <HandCoins className="size-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No loan requests found</p>
                    </div>
                ) : (
                    filteredRequests.map((loan, index) => {
                        const preview = calculateLoanPreview(loan.amount, loan.tenure);

                        return (
                            <div key={loan._id || index} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                            {(loan.member_name || '?').charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-gray-900">{loan.member_name || 'Unknown'}</h3>
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${loan.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    loan.status === 'voting' ? 'bg-blue-100 text-blue-700' :
                                                        loan.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                            'bg-red-100 text-red-700'
                                                    }`}>
                                                    {loan.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-0.5">{loan.reason}</p>
                                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                <span>Amount: <strong className="text-gray-900">৳{loan.amount.toLocaleString()}</strong></span>
                                                <span>Tenure: {loan.tenure} months</span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="size-3" />
                                                    {new Date(loan.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => openDetailModal(loan)}
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                            title="View Details"
                                        >
                                            <Eye className="size-4 text-gray-500" />
                                        </button>
                                        {loan.status === 'pending' && (
                                            <button
                                                onClick={() => handleStartVoting(loan._id)}
                                                disabled={startingVoting}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors ${startingVoting
                                                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                                    }`}
                                            >
                                                {startingVoting ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                        Starting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Vote className="size-3" /> Start Voting
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Active Loans */}
            {activeLoans.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">Active Loans</h2>

                    {activeLoans.map((loan, index) => (
                        <div key={loan._id || index} className="bg-white rounded-xl border border-green-200 p-5">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                        <HandCoins className="size-5 text-green-600" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-gray-900">{loan.member_name || 'Unknown'}</h3>
                                            <span className="text-xs text-gray-500">{loan._id?.toString().slice(-8)}</span>
                                        </div>
                                        <p className="text-sm text-gray-500">Started: {loan.start_month || loan.start_date}</p>
                                    </div>
                                </div>
                                <p className="text-lg font-bold text-gray-900">৳{loan.amount.toLocaleString()}</p>
                            </div>

                            <div className="grid grid-cols-4 gap-4 text-sm">
                                <div>
                                    <p className="text-xs text-gray-500">Installments</p>
                                    <p className="font-medium">
                                        {loan.paid_installments || 0}/{loan.total_installments || 0}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Due Amount</p>
                                    <p className="font-medium text-red-600">৳{(loan.due_amount || 0).toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Next Payment</p>
                                    <p className="font-medium">{loan.next_installment_date || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Tenure</p>
                                    <p className="font-medium">{loan.tenure} months</p>
                                </div>
                            </div>

                            <div className="mt-3">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-green-600 h-2 rounded-full"
                                        style={{ width: `${((loan.paid_installments || 0) / (loan.total_installments || 1)) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Detail Modal */}
            {isDetailModalOpen && selectedLoan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setIsDetailModalOpen(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Loan Request Details</h3>
                            <button onClick={() => setIsDetailModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                                <X className="size-5 text-gray-500" />
                            </button>
                        </div>

                        {selectedLoan && (() => {
                            const preview = calculateLoanPreview(selectedLoan.amount, selectedLoan.tenure);
                            return (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-lg font-bold text-blue-600">
                                            {(selectedLoan.member_name || '?').charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{selectedLoan.member_name || 'Unknown'}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-xl">
                                        <div><p className="text-xs text-gray-500">Loan Amount</p><p className="font-bold text-lg">৳{selectedLoan.amount.toLocaleString()}</p></div>
                                        <div><p className="text-xs text-gray-500">Tenure</p><p className="font-bold text-lg">{selectedLoan.tenure} months</p></div>
                                        <div><p className="text-xs text-gray-500">Principal Installments</p><p className="font-medium">{preview.principalInstallments}</p></div>
                                        <div><p className="text-xs text-gray-500">Extra (Savings)</p><p className="font-medium text-green-600">{preview.extraInstallments}</p></div>
                                        <div><p className="text-xs text-gray-500">Total Installments</p><p className="font-medium">{preview.totalInstallments}</p></div>
                                        <div><p className="text-xs text-gray-500">Per Installment</p><p className="font-medium">৳{preview.installmentAmount.toLocaleString()}</p></div>
                                        <div className="col-span-2"><p className="text-xs text-gray-500">Savings After Completion</p><p className="font-medium text-green-600">৳{preview.savingsAmount.toLocaleString()}</p></div>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Reason</p>
                                        <p className="text-sm text-gray-600 mt-1">{selectedLoan.reason}</p>
                                    </div>

                                    {selectedLoan.status === 'pending' && (
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleStartVoting(selectedLoan._id)}
                                                disabled={startingVoting}
                                                className={`flex-1 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors ${startingVoting
                                                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                                    }`}
                                            >
                                                {startingVoting ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                        Starting Voting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Vote className="size-4" /> Start Voting
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoansPageForManager;