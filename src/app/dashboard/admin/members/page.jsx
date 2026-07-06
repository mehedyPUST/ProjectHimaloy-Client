'use client';

import React, { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import {
    Users,
    Search,
    Mail,
    Phone,
    Calendar,
    Shield,
    CheckCircle2,
    XCircle,
    UserX,
    UserCheck,
    Eye,
    X,
    Wallet,
    HandCoins,
    RotateCcw,
    Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminsMemberManagementPage = () => {
    const [loading, setLoading] = useState(true);
    const [members, setMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    // Modal state
    const [selectedMember, setSelectedMember] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [memberDetails, setMemberDetails] = useState({
        deposits: [],
        loans: [],
        activeLoan: null,
        pendingRequests: [],
    });

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const data = await fetchAPI('/api/users');
            if (data.success) {
                const fixedMembers = (data.users || [])
                    .filter(member => member.role !== 'admin')
                    .map(member => ({
                        ...member,
                        isManager: member.isManager === true || member.isManager === "true",
                        isBlocked: member.isBlocked === true || member.isBlocked === "true",
                    }));
                setMembers(fixedMembers);
            }
        } catch (error) {
            console.error('Error fetching members:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleBlock = async (member) => {
        const newBlocked = !member.isBlocked;
        const action = newBlocked ? 'block' : 'unblock';
        if (!confirm(`Are you sure you want to ${action} ${member.name}?`)) return;

        try {
            const data = await fetchAPI(`/api/users/${member._id}`, {
                method: 'PATCH',
                body: JSON.stringify({ isBlocked: newBlocked }),
            });

            if (data.success) {
                toast.success(`Member ${newBlocked ? 'blocked' : 'unblocked'}!`);
                fetchMembers();
            } else {
                toast.error(data.message || 'Failed');
            }
        } catch (error) {
            toast.error('Failed to update member');
        }
    };

    const handleMakeManager = async (member) => {
        if (member.isManager) {
            toast.error('This member is already the manager');
            return;
        }

        if (!confirm(`Make ${member.name} the manager? Current manager will lose access.`)) return;

        try {
            const data = await fetchAPI(`/api/admin/make-manager/${member._id}`, {
                method: 'PATCH',
            });

            if (data.success) {
                toast.success(`${member.name} is now the manager!`);
                fetchMembers();
            } else {
                toast.error(data.message || 'Failed');
            }
        } catch (error) {
            toast.error('Failed to update manager');
        }
    };

    const handleRemoveManager = async (member) => {
        if (!confirm(`Remove ${member.name} from manager role?`)) return;

        try {
            const data = await fetchAPI(`/api/admin/remove-manager/${member._id}`, {
                method: 'PATCH',
            });

            if (data.success) {
                toast.success(`${member.name} is no longer the manager`);
                fetchMembers();
            } else {
                toast.error(data.message || 'Failed');
            }
        } catch (error) {
            toast.error('Failed to remove manager');
        }
    };

    // Open member detail modal
    const handleViewMember = async (member) => {
        setSelectedMember(member);
        setIsModalOpen(true);
        setModalLoading(true);
        setMemberDetails({ deposits: [], loans: [], activeLoan: null, pendingRequests: [] });

        try {
            // Fetch deposits, loans
            const [depositsRes, loansRes] = await Promise.all([
                fetchAPI(`/api/deposits/my?memberId=${member._id}`),
                fetchAPI(`/api/loans/my?memberId=${member._id}`),
            ]);

            const deposits = depositsRes.success ? depositsRes.deposits || [] : [];
            const loansData = loansRes.success ? loansRes : { active: null, pending: [], history: [] };

            setMemberDetails({
                deposits: deposits,
                activeLoan: loansData.active || null,
                pendingRequests: loansData.pending || [],
                // We can also include history if needed
            });
        } catch (error) {
            console.error('Error fetching member details:', error);
            toast.error('Failed to load member details');
        } finally {
            setModalLoading(false);
        }
    };

    const filteredMembers = members.filter(member => {
        const matchesSearch =
            (member.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (member.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (member.phone || '').includes(searchTerm);
        const matchesRole = roleFilter === 'all' || member.role === roleFilter;
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'active' && !member.isBlocked) ||
            (statusFilter === 'blocked' && member.isBlocked);
        return matchesSearch && matchesRole && matchesStatus;
    });

    const activeCount = members.filter(m => !m.isBlocked).length;
    const blockedCount = members.filter(m => m.isBlocked).length;
    const managerCount = members.filter(m => m.isManager).length;

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading members...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Member Management</h1>
                    <p className="text-gray-500 mt-1">Manage all members and their roles</p>
                </div>
                <button
                    onClick={fetchMembers}
                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors flex items-center gap-2"
                >
                    <RotateCcw className="size-4" /> Refresh
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-xs text-gray-500">Total Members</p>
                    <p className="text-2xl font-bold text-gray-900">{members.length}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-xs text-gray-500">Active</p>
                    <p className="text-2xl font-bold text-green-600">{activeCount}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-xs text-gray-500">Blocked</p>
                    <p className="text-2xl font-bold text-red-600">{blockedCount}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-xs text-gray-500">Managers</p>
                    <p className="text-2xl font-bold text-blue-600">{managerCount}</p>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                        <input type="text" placeholder="Search by name, email, phone..." value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" />
                    </div>
                    <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none bg-white">
                        <option value="all">All Roles</option>
                        <option value="member">Member</option>
                        <option value="manager">Manager</option>
                    </select>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none bg-white">
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="blocked">Blocked</option>
                    </select>
                </div>
            </div>

            {/* Members Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Member</th>
                                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 hidden md:table-cell">Contact</th>
                                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 hidden lg:table-cell">Role</th>
                                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Status</th>
                                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredMembers.map((member, index) => (
                                <tr key={member._id || index} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                                                {(member.name || '?').charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{member.name || 'Unknown'}</p>
                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Calendar className="size-3" />
                                                    {member.created_at ? new Date(member.created_at).toLocaleDateString() : '-'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 hidden md:table-cell">
                                        <div className="space-y-0.5">
                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <Mail className="size-3" />{member.email || '-'}
                                            </p>
                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <Phone className="size-3" />{member.phone || '-'}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 hidden lg:table-cell">
                                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${member.isManager ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            <Shield className="size-3" />
                                            {member.isManager ? 'Manager' : 'Member'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        {!member.isBlocked ? (
                                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                                                <CheckCircle2 className="size-3" />Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                                                <XCircle className="size-3" />Blocked
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => handleViewMember(member)}
                                                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-blue-600"
                                                title="View Member Details">
                                                <Eye className="size-4" />
                                            </button>
                                            <button onClick={member.isManager ? () => handleRemoveManager(member) : () => handleMakeManager(member)}
                                                className={`p-1.5 rounded-lg transition-colors ${member.isManager
                                                    ? 'bg-purple-100 text-purple-600 hover:bg-red-50 hover:text-red-500'
                                                    : 'hover:bg-purple-50 text-gray-400 hover:text-purple-600'
                                                    }`}
                                                title={member.isManager ? 'Remove Manager' : 'Make Manager'}>
                                                <Shield className="size-4" fill={member.isManager ? 'currentColor' : 'none'} />
                                            </button>
                                            <button onClick={() => handleToggleBlock(member)}
                                                className={`p-1.5 rounded-lg transition-colors ${member.isBlocked
                                                    ? 'hover:bg-green-50 text-green-500'
                                                    : 'hover:bg-red-50 text-red-500'
                                                    }`}
                                                title={member.isBlocked ? 'Unblock Member' : 'Block Member'}>
                                                {member.isBlocked ? <UserCheck className="size-4" /> : <UserX className="size-4" />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredMembers.length === 0 && (
                    <div className="p-12 text-center">
                        <Users className="size-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900">No members found</h3>
                        <p className="text-gray-500 mt-1">Try adjusting your filters</p>
                    </div>
                )}
            </div>

            {/* ==================== MEMBER DETAIL MODAL ==================== */}
            {isModalOpen && selectedMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                    {(selectedMember.name || '?').charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">{selectedMember.name}</h2>
                                    <p className="text-xs text-gray-500">
                                        {selectedMember.isManager ? 'Manager' : 'Member'} • Joined {selectedMember.created_at ? new Date(selectedMember.created_at).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                                <X className="size-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {modalLoading ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : (
                                <>
                                    {/* Basic Info */}
                                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                                        <div><p className="text-xs text-gray-500">Email</p><p className="font-medium">{selectedMember.email || '-'}</p></div>
                                        <div><p className="text-xs text-gray-500">Phone</p><p className="font-medium">{selectedMember.phone || '-'}</p></div>
                                        <div><p className="text-xs text-gray-500">Role</p><p className="font-medium">{selectedMember.isManager ? 'Manager' : 'Member'}</p></div>
                                        <div><p className="text-xs text-gray-500">Status</p>
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${selectedMember.isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                {selectedMember.isBlocked ? 'Blocked' : 'Active'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Total Deposits */}
                                    <div className="border-t border-gray-200 pt-4">
                                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <Wallet className="size-4 text-purple-600" />
                                            Deposits
                                        </h3>
                                        <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 flex justify-between items-center">
                                            <span className="text-sm text-gray-700">Total Confirmed</span>
                                            <span className="text-lg font-bold text-purple-700">
                                                ৳{memberDetails.deposits.filter(d => d.status === 'confirmed').reduce((s, d) => s + (d.amount || 0), 0).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="mt-2 text-xs text-gray-500">
                                            {memberDetails.deposits.length} deposit(s) total
                                        </div>
                                    </div>

                                    {/* Active Loan */}
                                    <div className="border-t border-gray-200 pt-4">
                                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <HandCoins className="size-4 text-blue-600" />
                                            Active Loan
                                        </h3>
                                        {memberDetails.activeLoan ? (
                                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Amount</span>
                                                    <span className="font-bold">৳{memberDetails.activeLoan.amount.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Installments</span>
                                                    <span>{memberDetails.activeLoan.paid_installments || 0}/{memberDetails.activeLoan.total_installments || 0}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Due</span>
                                                    <span className="font-medium text-red-600">৳{(memberDetails.activeLoan.due_amount || 0).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-400">No active loan</p>
                                        )}
                                    </div>

                                    {/* Pending Requests */}
                                    <div className="border-t border-gray-200 pt-4">
                                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <Clock className="size-4 text-yellow-600" />
                                            Pending Loan Requests
                                        </h3>
                                        {memberDetails.pendingRequests.length > 0 ? (
                                            <div className="space-y-2">
                                                {memberDetails.pendingRequests.map((req, i) => (
                                                    <div key={i} className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex justify-between items-center">
                                                        <div>
                                                            <p className="text-sm font-medium">৳{req.amount.toLocaleString()}</p>
                                                            <p className="text-xs text-gray-500">{req.status} • {req.tenure} months</p>
                                                        </div>
                                                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">{req.status}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-400">No pending requests</p>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminsMemberManagementPage;