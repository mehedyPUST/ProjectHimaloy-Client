// client/src/app/dashboard/manager/votings/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { fetchAPI } from '@/lib/api';
import {
    Vote,
    CheckCircle2,
    XCircle,
    Clock,
    Eye,
    Calendar,
    X,
    Ban,
    Plus,
    FileText,
    Send,
} from 'lucide-react';
import toast from 'react-hot-toast';

const ManagersPageForVoting = () => {
    const { data: session } = useSession();
    const user = session?.user;

    const [loading, setLoading] = useState(true);
    const [activeVotings, setActiveVotings] = useState([]);
    const [completedVotings, setCompletedVotings] = useState([]);
    const [selectedVoting, setSelectedVoting] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [votingForm, setVotingForm] = useState({
        title: '',
        description: '',
        type: 'general',
        loanRequestId: '',
    });

    // Fetch votings
    useEffect(() => {
        fetchVotings();
    }, []);

    const fetchVotings = async () => {
        try {
            const data = await fetchAPI('/api/votings');
            if (data.success) {
                const votings = data.votings || [];
                setActiveVotings(votings.filter(v => v.status === 'open'));
                setCompletedVotings(votings.filter(v => v.status === 'closed'));
            }
        } catch (error) {
            console.error('Error fetching votings:', error);
        } finally {
            setLoading(false);
        }
    };

    const openDetailModal = (voting) => {
        setSelectedVoting(voting);
        setIsDetailModalOpen(true);
    };

    const handleCallMeeting = async (votingId) => {
        toast.success('Redirecting to schedule meeting...');
    };

    const handleCloseVoting = async (votingId) => {
        try {
            const data = await fetchAPI(`/api/votings/${votingId}/close`, { method: 'PATCH' });
            if (data.success) {
                toast.success('Voting closed!');
                fetchVotings();
            } else {
                toast.error(data.message || 'Failed to close voting');
            }
        } catch (error) {
            toast.error('Failed to close voting');
        }
    };

    const handleCreateVoting = async (e) => {
        e.preventDefault();
        const managerId = user?._id || user?.id;

        if (!votingForm.title || !votingForm.description) {
            toast.error('Please fill all required fields');
            return;
        }

        setIsSubmitting(true);

        try {
            const data = await fetchAPI('/api/votings/create', {
                method: 'POST',
                body: JSON.stringify({
                    managerId,
                    ...votingForm,
                }),
            });

            if (data.success) {
                toast.success('Voting created! Members will be notified.');
                setIsCreateModalOpen(false);
                setVotingForm({ title: '', description: '', type: 'general', loanRequestId: '' });
                fetchVotings();
            } else {
                toast.error(data.message || 'Failed to create voting');
            }
        } catch (error) {
            toast.error('Failed to create voting');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getVotingTypeBadge = (type) => {
        switch (type) {
            case 'loan_request': return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Loan Request' };
            case 'general': return { bg: 'bg-purple-100', text: 'text-purple-700', label: 'General' };
            case 'meeting': return { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Meeting' };
            default: return { bg: 'bg-gray-100', text: 'text-gray-700', label: type || 'General' };
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading votings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Voting Management</h1>
                    <p className="text-gray-500 mt-1">Manage all voting sessions</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    <Plus className="size-4" />
                    Create Voting
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-blue-200 p-4">
                    <div className="flex items-center gap-2">
                        <Vote className="size-4 text-blue-600" />
                        <p className="text-xs text-gray-500">Active Votings</p>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{activeVotings.length}</p>
                </div>
                <div className="bg-white rounded-xl border border-green-200 p-4">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-green-600" />
                        <p className="text-xs text-gray-500">Approved</p>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                        {completedVotings.filter(v => v.deny_count < 2).length}
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-red-200 p-4">
                    <div className="flex items-center gap-2">
                        <XCircle className="size-4 text-red-600" />
                        <p className="text-xs text-gray-500">Rejected</p>
                    </div>
                    <p className="text-2xl font-bold text-red-600">
                        {completedVotings.filter(v => v.deny_count >= 2).length}
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-xs text-gray-500">Total Completed</p>
                    <p className="text-2xl font-bold text-gray-900">{completedVotings.length}</p>
                </div>
            </div>

            {/* Active Votings */}
            {activeVotings.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">Active Votings</h2>

                    {activeVotings.map((voting, index) => {
                        const needsMeeting = voting.deny_count >= 2;
                        const totalVoted = voting.approve_count + voting.deny_count;
                        const notVoted = voting.total_members - totalVoted;
                        const typeBadge = getVotingTypeBadge(voting.type);

                        return (
                            <div key={voting._id || index} className={`bg-white rounded-xl border-2 p-5 ${needsMeeting ? 'border-yellow-400' : 'border-blue-200'}`}>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">V</div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-gray-900">{voting.title || 'Voting'}</h3>
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeBadge.bg} ${typeBadge.text}`}>
                                                    {typeBadge.label}
                                                </span>
                                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
                                                    <Clock className="size-3" /> In Progress
                                                </span>
                                            </div>
                                            {voting.description && (
                                                <p className="text-sm text-gray-500 mt-1">{voting.description}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Voting Stats */}
                                <div className="grid grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-xl">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-green-600">{voting.approve_count}</p>
                                        <p className="text-xs text-gray-500">Approve ✓</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-red-600">{voting.deny_count}</p>
                                        <p className="text-xs text-gray-500">Deny ✗</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-gray-400">{notVoted}</p>
                                        <p className="text-xs text-gray-500">Not Voted</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-gray-900">{voting.total_members}</p>
                                        <p className="text-xs text-gray-500">Total Members</p>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                        <span>Voting Progress</span>
                                        <span>{totalVoted}/{voting.total_members} voted</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(totalVoted / voting.total_members) * 100}%` }}></div>
                                    </div>
                                </div>

                                {needsMeeting && (
                                    <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                                        <Ban className="size-4 text-yellow-600" />
                                        <div>
                                            <p className="text-sm font-medium text-yellow-800">Meeting Required</p>
                                            <p className="text-xs text-yellow-700">{voting.deny_count} members denied. A meeting is needed.</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-2">
                                    <button onClick={() => openDetailModal(voting)} className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1">
                                        <Eye className="size-3" /> View Details
                                    </button>
                                    {needsMeeting && (
                                        <button onClick={() => handleCallMeeting(voting._id)} className="px-3 py-1.5 text-sm font-medium text-yellow-700 bg-yellow-100 hover:bg-yellow-200 rounded-lg transition-colors flex items-center gap-1">
                                            <Calendar className="size-3" /> Call Meeting
                                        </button>
                                    )}
                                    <button onClick={() => handleCloseVoting(voting._id)} className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1 ml-auto">
                                        <CheckCircle2 className="size-3" /> Close Voting
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {activeVotings.length === 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <Vote className="size-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900">No Active Votings</h3>
                    <p className="text-gray-500 mt-1">Create a new voting or check completed ones</p>
                    <button onClick={() => setIsCreateModalOpen(true)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
                        Create Voting
                    </button>
                </div>
            )}

            {/* Completed Votings */}
            {completedVotings.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">Completed Votings</h2>
                    <div className="space-y-3">
                        {completedVotings.map((voting, index) => {
                            const isApproved = voting.deny_count < 2;
                            const typeBadge = getVotingTypeBadge(voting.type);
                            return (
                                <div key={voting._id || index} className="bg-white rounded-xl border border-gray-200 p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold">V</div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-gray-900">{voting.title || 'Voting'}</h3>
                                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeBadge.bg} ${typeBadge.text}`}>{typeBadge.label}</span>
                                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isApproved ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {isApproved ? 'Approved' : 'Rejected'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <span className="text-green-600 font-medium">{voting.approve_count} ✓</span>
                                            <span className="text-red-500 font-medium">{voting.deny_count} ✗</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Create Voting Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setIsCreateModalOpen(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <Vote className="size-5 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Create Voting</h2>
                                    <p className="text-xs text-gray-500">Start a new voting session</p>
                                </div>
                            </div>
                            <button onClick={() => setIsCreateModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                                <X className="size-5 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateVoting} className="space-y-4">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Voting Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={votingForm.title}
                                    onChange={(e) => setVotingForm(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="e.g., Should we increase monthly deposit?"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FileText className="size-4 inline mr-1" />
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={votingForm.description}
                                    onChange={(e) => setVotingForm(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Describe what members are voting on..."
                                    rows={4}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none resize-none"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>Creating...</>
                                    ) : (
                                        <><Send className="size-4" />Create Voting</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Detail Modal - unchanged */}
            {isDetailModalOpen && selectedVoting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setIsDetailModalOpen(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Voting Details</h3>
                            <button onClick={() => setIsDetailModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="size-5 text-gray-500" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">Votes ({selectedVoting.votes?.length || 0})</h4>
                                <div className="space-y-2">
                                    {selectedVoting.votes?.map((vote, i) => (
                                        <div key={vote.member_id || i} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                                    {(vote.member_name || '?').charAt(0)}
                                                </div>
                                                <span className="text-sm text-gray-900">{vote.member_name || 'Unknown'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {vote.vote === 'approve' ? (
                                                    <span className="text-xs font-medium text-green-600 flex items-center gap-1"><CheckCircle2 className="size-3" /> Approve</span>
                                                ) : (
                                                    <span className="text-xs font-medium text-red-500 flex items-center gap-1"><XCircle className="size-3" /> Deny</span>
                                                )}
                                                {vote.reason && <span className="text-xs text-gray-400">- {vote.reason}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagersPageForVoting;