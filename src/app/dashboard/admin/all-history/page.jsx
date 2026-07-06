'use client';

import React, { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import {
    Search,
    Wallet,
    HandCoins,
    UserCheck,
    ArrowLeftRight,
    Calendar,
    CheckCircle2,
    Clock,
    XCircle,
    Users,
    Download,
    Hash,
    FileText,
} from 'lucide-react';

const AllHistoryViewForAdmin = () => {
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState('all');
    const [memberFilter, setMemberFilter] = useState('all'); // new
    const [members, setMembers] = useState([]); // for dropdown

    // Fetch transactions & members
    useEffect(() => {
        fetchTransactions();
        fetchMembers();
    }, []);

    const fetchTransactions = async () => {
        try {
            const data = await fetchAPI('/api/transactions');
            if (data.success) {
                setTransactions(data.transactions || []);
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMembers = async () => {
        try {
            const data = await fetchAPI('/api/users');
            if (data.success) {
                const membersList = data.users || [];
                setMembers(membersList.map(m => ({ _id: m._id, name: m.name })));
            }
        } catch (error) {
            console.error('Error fetching members:', error);
        }
    };

    const tabs = [
        { id: 'all', label: 'All' },
        { id: 'deposit', label: 'Deposits' },
        { id: 'loan_request', label: 'Loan Requests' },
        { id: 'loan_installment', label: 'Installments' },
        { id: 'loan_disbursement', label: 'Disbursed' },
        { id: 'manager_rotation', label: 'Manager Rotation' },
    ];

    const dateRanges = [
        { value: 'all', label: 'All Time' },
        { value: 'today', label: 'Today' },
        { value: 'week', label: 'This Week' },
        { value: 'month', label: 'This Month' },
        { value: 'year', label: 'This Year' },
    ];

    const getTypeIcon = (type) => {
        switch (type) {
            case 'deposit': return { icon: Wallet, bg: 'bg-purple-100', text: 'text-purple-600', label: 'Deposit' };
            case 'loan_request': return { icon: HandCoins, bg: 'bg-blue-100', text: 'text-blue-600', label: 'Loan Request' };
            case 'loan_installment': return { icon: CheckCircle2, bg: 'bg-green-100', text: 'text-green-600', label: 'Installment' };
            case 'loan_disbursement': return { icon: HandCoins, bg: 'bg-yellow-100', text: 'text-yellow-600', label: 'Disbursed' };
            case 'manager_rotation': return { icon: ArrowLeftRight, bg: 'bg-orange-100', text: 'text-orange-600', label: 'Rotation' };
            default: return { icon: Wallet, bg: 'bg-gray-100', text: 'text-gray-600', label: type || 'Unknown' };
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'confirmed':
            case 'completed':
                return { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2 };
            case 'pending':
                return { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock };
            case 'voting':
                return { bg: 'bg-blue-100', text: 'text-blue-700', icon: Users };
            case 'rejected':
                return { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle };
            default:
                return { bg: 'bg-gray-100', text: 'text-gray-700', icon: XCircle };
        }
    };

    // Filter by date range (using created_at)
    const filterByDate = (txn) => {
        if (dateRange === 'all') return true;
        const txnDate = new Date(txn.created_at || txn.date);
        const now = new Date();

        switch (dateRange) {
            case 'today': return txnDate.toDateString() === now.toDateString();
            case 'week': return (now - txnDate) <= 7 * 24 * 60 * 60 * 1000;
            case 'month': return txnDate.getMonth() === now.getMonth() && txnDate.getFullYear() === now.getFullYear();
            case 'year': return txnDate.getFullYear() === now.getFullYear();
            default: return true;
        }
    };

    const filteredTransactions = transactions.filter(txn => {
        const matchesTab = activeTab === 'all' || txn.type === activeTab;
        const matchesSearch =
            (txn.member_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (txn.month || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (txn.method || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (txn.txn_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (txn.loan_id || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDate = filterByDate(txn);
        const matchesMember = memberFilter === 'all' || txn.member_id === memberFilter;
        return matchesTab && matchesSearch && matchesDate && matchesMember;
    });

    // Summary
    const totalDeposits = transactions.filter(t => t.type === 'deposit' && t.status === 'confirmed')
        .reduce((s, t) => s + (t.amount || 0), 0);
    const totalLoans = transactions.filter(t => t.type === 'loan_disbursement')
        .reduce((s, t) => s + (t.amount || 0), 0);
    const totalInstallments = transactions.filter(t => t.type === 'loan_installment' && t.status === 'confirmed')
        .reduce((s, t) => s + (t.amount || 0), 0);

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
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">All Transactions</h1>
                    <p className="text-gray-500 mt-1">Complete history of all fund activities</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <Download className="size-4" />Export CSV
                </button>
            </div>

            {/* Summary Cards - added total count */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            <Wallet className="size-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Total Deposits</p>
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
                            <p className="text-xs text-gray-500">Total Loans Disbursed</p>
                            <p className="text-lg font-bold text-gray-900">৳{totalLoans.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <CheckCircle2 className="size-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Total Installments</p>
                            <p className="text-lg font-bold text-gray-900">৳{totalInstallments.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                            <FileText className="size-5 text-gray-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Total Transactions</p>
                            <p className="text-lg font-bold text-gray-900">{transactions.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                        <input type="text" placeholder="Search by user, detail, method, txn..." value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" />
                    </div>
                    <select value={memberFilter} onChange={(e) => setMemberFilter(e.target.value)}
                        className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none bg-white">
                        <option value="all">All Members</option>
                        {members.map(m => (
                            <option key={m._id} value={m._id}>{m.name}</option>
                        ))}
                    </select>
                    <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}
                        className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none bg-white">
                        {dateRanges.map(range => (
                            <option key={range.value} value={range.value}>{range.label}</option>
                        ))}
                    </select>
                </div>
                <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mt-3 overflow-x-auto">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Type</th>
                                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">User</th>
                                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 hidden md:table-cell">Detail</th>
                                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Amount</th>
                                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 hidden lg:table-cell">Date</th>
                                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 hidden lg:table-cell">Method</th>
                                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredTransactions.map((txn, index) => {
                                const typeData = getTypeIcon(txn.type);
                                const TypeIcon = typeData.icon;
                                const statusData = getStatusBadge(txn.status);
                                const StatusIcon = statusData.icon;
                                const txnDate = txn.date || (txn.created_at ? new Date(txn.created_at).toLocaleDateString() : '-');

                                // Build detail string
                                let detailParts = [];
                                if (txn.type === 'deposit' && txn.month) detailParts.push(txn.month);
                                if (txn.type === 'loan_installment') {
                                    if (txn.installment_no) detailParts.push(`#${txn.installment_no}`);
                                    if (txn.loan_id) detailParts.push(`Loan: ${txn.loan_id.slice(-8)}`);
                                }
                                if (txn.type === 'loan_disbursement') {
                                    if (txn.loan_id) detailParts.push(`Loan: ${txn.loan_id.slice(-8)}`);
                                }
                                if (txn.type === 'loan_request' && txn.loan_id) {
                                    detailParts.push(`Loan: ${txn.loan_id.slice(-8)}`);
                                }
                                const detail = detailParts.join(' • ') || (txn.type === 'deposit' ? 'Deposit' : '');

                                return (
                                    <tr key={txn._id || index} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${typeData.bg} ${typeData.text}`}>
                                                <TypeIcon className="size-3" />{typeData.label}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                                                    {(txn.member_name || '?').charAt(0)}
                                                </div>
                                                <span className="text-sm font-medium text-gray-900">{txn.member_name || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 hidden md:table-cell">
                                            <p className="text-sm text-gray-600">{detail}</p>
                                            {txn.txn_id && txn.txn_id !== '-' && (
                                                <p className="text-xs text-gray-400 flex items-center gap-1">
                                                    <Hash className="size-3" /> {txn.txn_id}
                                                </p>
                                            )}
                                            {txn.status === 'rejected' && txn.reject_reason && (
                                                <p className="text-xs text-red-500 mt-1">Reason: {txn.reject_reason}</p>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`text-sm font-medium ${txn.type === 'loan_disbursement' ? 'text-green-600' : 'text-gray-900'}`}>
                                                {(txn.amount || 0) > 0 ? `৳${txn.amount.toLocaleString()}` : '-'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 hidden lg:table-cell">
                                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                                <Calendar className="size-3" />{txnDate}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 hidden lg:table-cell">
                                            <span className="text-sm text-gray-500">{txn.method || txn.paid_through || '-'}</span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${statusData.bg} ${statusData.text}`}>
                                                <StatusIcon className="size-3" />{txn.status || 'Unknown'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {filteredTransactions.length === 0 && (
                    <div className="p-12 text-center">
                        <Search className="size-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900">No transactions found</h3>
                        <p className="text-gray-500 mt-1">Try adjusting your search or filters</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllHistoryViewForAdmin;