// client/src/app/dashboard/member/history/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { fetchAPI } from '@/lib/api';
import {
    Wallet,
    HandCoins,
    Search,
    CheckCircle2,
    Clock,
    XCircle,
    Calendar,
} from 'lucide-react';

const MembersHistoryPage = () => {
    const { data: session } = useSession();
    const user = session?.user;

    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch transactions
    useEffect(() => {
        const fetchTransactions = async () => {
            const memberId = user?._id || user?.id;
            if (!memberId) return;

            try {
                const data = await fetchAPI(`/api/transactions/my?memberId=${memberId}`);
                if (data.success) {
                    setTransactions(data.transactions || []);
                }
            } catch (error) {
                console.error('Error fetching transactions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [user]);

    const tabs = [
        { id: 'all', label: 'All' },
        { id: 'deposit', label: 'Deposits' },
        { id: 'loan_installment', label: 'Installments' },
        { id: 'loan_disbursement', label: 'Loan Disbursed' },
    ];

    const filteredTransactions = transactions.filter(txn => {
        const matchesTab = activeTab === 'all' || txn.type === activeTab;
        const matchesSearch =
            (txn.month || '')?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (txn.loan_id || '')?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (txn.method || '')?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (txn.txn_id || '')?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
    });

    // Summary calculations - only confirmed deposits
    const totalDeposits = transactions
        .filter(t => t.type === 'deposit' && t.status === 'confirmed')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

    const totalInstallments = transactions
        .filter(t => t.type === 'loan_installment')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

    const totalLoanReceived = transactions
        .filter(t => t.type === 'loan_disbursement')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

    const getTypeBadge = (type) => {
        switch (type) {
            case 'deposit':
                return { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Deposit', icon: Wallet };
            case 'loan_installment':
                return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Installment', icon: HandCoins };
            case 'loan_disbursement':
                return { bg: 'bg-green-100', text: 'text-green-700', label: 'Loan Received', icon: HandCoins };
            default:
                return { bg: 'bg-gray-100', text: 'text-gray-700', label: type || 'Unknown', icon: Wallet };
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'confirmed':
            case 'completed':
                return { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2, label: status };
            case 'pending':
                return { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock, label: 'Pending' };
            case 'rejected':
                return { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Rejected' };
            default:
                return { bg: 'bg-gray-100', text: 'text-gray-700', icon: XCircle, label: status || 'Unknown' };
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading transactions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
                <p className="text-gray-500 mt-1">View all your deposits and loan transactions</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            <Wallet className="size-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Total Deposits (Confirmed)</p>
                            <p className="text-lg font-bold text-gray-900">৳{totalDeposits.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <HandCoins className="size-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Installments Paid</p>
                            <p className="text-lg font-bold text-gray-900">৳{totalInstallments.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <HandCoins className="size-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Loan Received</p>
                            <p className="text-lg font-bold text-gray-900">৳{totalLoanReceived.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by month, loan ID, method..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                        />
                    </div>

                    <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Transactions List */}
            <div className="bg-white rounded-xl border border-gray-200">
                {filteredTransactions.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                            <Search className="size-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">No transactions found</h3>
                        <p className="text-gray-500 mt-1">Try adjusting your search or filter</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredTransactions.map((txn, index) => {
                            const TypeBadge = getTypeBadge(txn.type);
                            const StatusBadge = getStatusBadge(txn.status);
                            const IconComponent = TypeBadge.icon;
                            const StatusIcon = StatusBadge.icon;
                            const txnDate = txn.date || (txn.created_at ? new Date(txn.created_at).toLocaleDateString() : '-');

                            return (
                                <div key={txn._id || index} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        {/* Left - Type & Details */}
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${TypeBadge.bg}`}>
                                                <IconComponent className={`size-5 ${TypeBadge.text}`} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TypeBadge.bg} ${TypeBadge.text}`}>
                                                        {TypeBadge.label}
                                                    </span>
                                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${StatusBadge.bg} ${StatusBadge.text} flex items-center gap-1`}>
                                                        <StatusIcon className="size-3" />
                                                        {StatusBadge.label}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-900 mt-1">
                                                    {txn.type === 'deposit' && `${txn.month || ''} Deposit`}
                                                    {txn.type === 'loan_installment' && `${txn.loan_id || 'Loan'} - Installment #${txn.installment_no || '?'}`}
                                                    {txn.type === 'loan_disbursement' && `${txn.loan_id || 'Loan'} - Received`}
                                                </p>

                                                {/* Pending Indicator */}
                                                {txn.status === 'pending' && txn.type === 'deposit' && (
                                                    <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                                                        <Clock className="size-3" />
                                                        Awaiting manager confirmation - not added to balance yet
                                                    </p>
                                                )}
                                                {txn.status === 'rejected' && (
                                                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                                        <XCircle className="size-3" />
                                                        This transaction was rejected
                                                    </p>
                                                )}

                                                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="size-3" />
                                                        {txnDate}
                                                    </span>
                                                    {txn.method && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{txn.method}</span>
                                                        </>
                                                    )}
                                                    {txn.txn_id && txn.txn_id !== '-' && (
                                                        <>
                                                            <span>•</span>
                                                            <span>Txn: {txn.txn_id}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right - Amount */}
                                        <div className="text-right">
                                            <p className={`text-lg font-bold ${txn.status === 'pending' ? 'text-yellow-600' :
                                                    txn.status === 'rejected' ? 'text-red-400 line-through' :
                                                        txn.type === 'loan_disbursement' ? 'text-green-600' :
                                                            'text-gray-900'
                                                }`}>
                                                {txn.type === 'loan_disbursement' ? '+' : '-'}৳{(txn.amount || 0).toLocaleString()}
                                            </p>
                                            {txn.status === 'pending' && (
                                                <p className="text-xs text-yellow-500 mt-0.5">Not confirmed</p>
                                            )}
                                            {txn.status === 'rejected' && (
                                                <p className="text-xs text-red-400 mt-0.5">Rejected</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MembersHistoryPage;