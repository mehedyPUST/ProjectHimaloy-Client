// client/src/app/dashboard/admin/members/page.jsx
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
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminsMemberManagementPage = () => {
    const [loading, setLoading] = useState(true);
    const [members, setMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const data = await fetchAPI('/api/users');
            if (data.success) {
                setMembers(data.users || []);
            }
        } catch (error) {
            console.error('Error fetching members:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleBlock = async (member) => {
        const newBlocked = !member.isBlocked;

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

        if (!confirm(`Make ${member.name} the manager? Current manager will lose access.`)) {
            return;
        }

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
                        <option value="admin">Admin</option>
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
                                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                                            member.isManager ? 'bg-purple-100 text-purple-700' :
                                            member.role === 'admin' ? 'bg-red-100 text-red-700' :
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                            <Shield className="size-3" />
                                            {member.isManager ? 'Manager' : member.role || 'member'}
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
                                            {/* Make Manager Button */}
                                            {member.role !== 'admin' && (
                                                <button
                                                    onClick={() => handleMakeManager(member)}
                                                    className={`p-1.5 rounded-lg transition-colors ${
                                                        member.isManager 
                                                            ? 'bg-purple-100 text-purple-600' 
                                                            : 'hover:bg-purple-50 text-gray-400 hover:text-purple-600'
                                                    }`}
                                                    title={member.isManager ? 'Current Manager' : 'Make Manager'}
                                                >
                                                    <Shield className="size-4" fill={member.isManager ? 'currentColor' : 'none'} />
                                                </button>
                                            )}
                                            {/* Block/Unblock Button */}
                                            <button
                                                onClick={() => handleToggleBlock(member)}
                                                className={`p-1.5 rounded-lg transition-colors ${
                                                    member.isBlocked 
                                                        ? 'hover:bg-green-50 text-green-500' 
                                                        : 'hover:bg-red-50 text-red-500'
                                                }`}
                                                title={member.isBlocked ? 'Unblock Member' : 'Block Member'}
                                            >
                                                {member.isBlocked ? (
                                                    <UserCheck className="size-4" />
                                                ) : (
                                                    <UserX className="size-4" />
                                                )}
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
        </div>
    );
};

export default AdminsMemberManagementPage;
