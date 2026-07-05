// client/src/app/dashboard/member/votings/page.jsx
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
    X,
    Send,
    FileText,
    Check,
    Ban,
} from 'lucide-react';
import toast from 'react-hot-toast';

const MemberVotingPage = () => {
    const { data: session } = useSession();
    const user = session?.user;

    const [loading, setLoading] = useState(true);
    const [activeVotings, setActiveVotings] = useState([]);
    const [completedVotings, setCompletedVotings] = useState([]);
    const [selectedVoting, setSelectedVoting] = useState(null);
    const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [voteForm, setVoteForm] = useState({ vote: '', reason: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const openVoteModal = (voting) => {
        setSelectedVoting(voting);
        setVoteForm({ vote: '', reason: '' });
        setIsVoteModalOpen(true);
    };

    const openDetailModal = (voting) => {
        setSelectedVoting(voting);
        setIsDetailModalOpen(true);
    };

    const handleCastVote = async (e) => {
        e.preventDefault();
        const memberId = user?._id || user?.id;

        if (!voteForm.vote) {
            toast.error('Please select Approve or Deny');
            return;
        }

        setIsSubmitting(true);

        try {
            // Use loan_request_id if available, otherwise use voting._id
            const votingId = selectedVoting.loan_request_id || selectedVoting._id;

            const data = await fetchAPI(`/api/loans/requests/${votingId}/vote`, {
                method: 'POST',
                body: JSON.stringify({
                    memberId,
                    vote: voteForm.vote,
                    reason: voteForm.reason || null,
                }),
            });

            if (data.success) {
                toast.success('Vote cast successfully!');
                setIsVoteModalOpen(false);
                fetchVotings();
            } else {
                toast.error(data.message || 'Failed to cast vote');
            }
        } catch (error) {
            toast.error('Failed to cast vote');
        } finally {
            setIsSubmitting(false);
        }
    };

    const hasVoted = (voting) => {
        const memberId = user?._id || user?.id;
        return voting.votes?.some(v => v.member_id === memberId);
    };

    const getMyVote = (voting) => {
        const memberId = user?._id || user?.id;
        return voting.votes?.find(v => v.member_id === memberId);
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
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Voting</h1>
                <p className="text-gray-500 mt-1">Cast your vote on active proposals</p>
            </div>

            {/* Active Votings */}
            {activeVotings.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Clock className="size-5 text-blue-600" />
                        Active Votings ({activeVotings.length})
                    </h2>

                    {activeVotings.map((voting, index) => {
                        const alreadyVoted = hasVoted(voting);
                        const myVote = getMyVote(voting);
                        const totalVoted = voting.approve_count + voting.deny_count;
                        const needsMeeting = voting.deny_count >= 2;
                        const typeBadge = getVotingTypeBadge(voting.type);

                        return (
                            <div key={voting._id || index} className={`bg-white rounded-xl border-2 p-5 ${alreadyVoted ? 'border-green-200' : needsMeeting ? 'border-yellow-400' : 'border-blue-200'
                                }`}>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${alreadyVoted ? 'bg-green-100' : 'bg-blue-100'
                                            }`}>
                                            <Vote className={`size-5 ${alreadyVoted ? 'text-green-600' : 'text-blue-600'}`} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-semibold text-gray-900">{voting.title || 'Voting'}</h3>
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeBadge.bg} ${typeBadge.text}`}>
                                                    {typeBadge.label}
                                                </span>
                                            </div>
                                            {voting.description && (
                                                <p className="text-sm text-gray-500 mt-1">{voting.description}</p>
                                            )}
                                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                                <span>{totalVoted}/{voting.total_members} voted</span>
                                                <span>•</span>
                                                <span className="text-green-600">{voting.approve_count} ✓</span>
                                                <span className="text-red-500">{voting.deny_count} ✗</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        {alreadyVoted ? (
                                            <div className="text-right">
                                                <span className={`inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full ${myVote?.vote === 'approve' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {myVote?.vote === 'approve' ? (
                                                        <><CheckCircle2 className="size-3" /> You Approved</>
                                                    ) : (
                                                        <><XCircle className="size-3" /> You Denied</>
                                                    )}
                                                </span>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => openVoteModal(voting)}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                                            >
                                                <Vote className="size-4" />
                                                Cast Vote
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mt-4">
                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                        <span>Progress</span>
                                        <span>{Math.round((totalVoted / voting.total_members) * 100)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(totalVoted / voting.total_members) * 100}%` }}></div>
                                    </div>
                                </div>

                                {/* Meeting Alert */}
                                {needsMeeting && (
                                    <div className="mt-3 flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <Ban className="size-4 text-yellow-600" />
                                        <p className="text-xs text-yellow-700">{voting.deny_count} members denied. Meeting may be required.</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* No Active Votings */}
            {activeVotings.length === 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <Vote className="size-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900">No Active Votings</h3>
                    <p className="text-gray-500 mt-1">There are no voting sessions right now</p>
                </div>
            )}

            {/* Completed Votings */}
            {completedVotings.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">Completed Votings</h2>
                    <div className="space-y-3">
                        {completedVotings.map((voting, index) => {
                            const isApproved = voting.deny_count < 2;
                            const myVote = getMyVote(voting);
                            const typeBadge = getVotingTypeBadge(voting.type);

                            return (
                                <div key={voting._id || index} className="bg-white rounded-xl border border-gray-200 p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isApproved ? 'bg-green-100' : 'bg-red-100'
                                                }`}>
                                                {isApproved ? (
                                                    <CheckCircle2 className="size-5 text-green-600" />
                                                ) : (
                                                    <XCircle className="size-5 text-red-600" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="font-semibold text-gray-900">{voting.title || 'Voting'}</h3>
                                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeBadge.bg} ${typeBadge.text}`}>
                                                        {typeBadge.label}
                                                    </span>
                                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isApproved ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {isApproved ? 'Approved' : 'Rejected'}
                                                    </span>
                                                </div>
                                                {myVote && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Your vote: {myVote.vote === 'approve' ? '✓ Approved' : '✗ Denied'}
                                                    </p>
                                                )}
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

            {/* Vote Modal */}
            {isVoteModalOpen && selectedVoting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setIsVoteModalOpen(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Cast Your Vote</h3>
                            <button onClick={() => setIsVoteModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                                <X className="size-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <p className="font-medium text-gray-900">{selectedVoting.title}</p>
                            {selectedVoting.description && (
                                <p className="text-sm text-gray-500 mt-1">{selectedVoting.description}</p>
                            )}
                        </div>

                        <form onSubmit={handleCastVote} className="space-y-4">
                            {/* Vote Options */}
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setVoteForm(prev => ({ ...prev, vote: 'approve' }))}
                                    className={`p-4 rounded-xl border-2 text-center transition-all ${voteForm.vote === 'approve'
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-200 hover:border-green-300'
                                        }`}
                                >
                                    <CheckCircle2 className={`size-8 mx-auto mb-1 ${voteForm.vote === 'approve' ? 'text-green-600' : 'text-gray-400'}`} />
                                    <span className={`font-medium ${voteForm.vote === 'approve' ? 'text-green-600' : 'text-gray-600'}`}>Approve</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setVoteForm(prev => ({ ...prev, vote: 'deny' }))}
                                    className={`p-4 rounded-xl border-2 text-center transition-all ${voteForm.vote === 'deny'
                                            ? 'border-red-500 bg-red-50'
                                            : 'border-gray-200 hover:border-red-300'
                                        }`}
                                >
                                    <XCircle className={`size-8 mx-auto mb-1 ${voteForm.vote === 'deny' ? 'text-red-600' : 'text-gray-400'}`} />
                                    <span className={`font-medium ${voteForm.vote === 'deny' ? 'text-red-600' : 'text-gray-600'}`}>Deny</span>
                                </button>
                            </div>

                            {/* Reason */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reason <span className="text-gray-400">(Optional)</span>
                                </label>
                                <textarea
                                    value={voteForm.reason}
                                    onChange={(e) => setVoteForm(prev => ({ ...prev, reason: e.target.value }))}
                                    placeholder="Why are you voting this way?"
                                    rows={2}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none resize-none"
                                    disabled={isSubmitting}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || !voteForm.vote}
                                className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>Submitting...</>
                                ) : (
                                    <><Send className="size-5" />Submit Vote</>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {isDetailModalOpen && selectedVoting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setIsDetailModalOpen(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Voting Details</h3>
                            <button onClick={() => setIsDetailModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                                <X className="size-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="font-medium text-gray-900">{selectedVoting.title}</p>
                                {selectedVoting.description && (
                                    <p className="text-sm text-gray-500 mt-1">{selectedVoting.description}</p>
                                )}
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">Votes ({selectedVoting.votes?.length || 0})</h4>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
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
                                                    <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                                                        <CheckCircle2 className="size-3" /> Approve
                                                    </span>
                                                ) : (
                                                    <span className="text-xs font-medium text-red-500 flex items-center gap-1">
                                                        <XCircle className="size-3" /> Deny
                                                    </span>
                                                )}
                                                {vote.reason && <span className="text-xs text-gray-400">- {vote.reason}</span>}
                                            </div>
                                        </div>
                                    ))}
                                    {(!selectedVoting.votes || selectedVoting.votes.length === 0) && (
                                        <p className="text-sm text-gray-400 text-center py-4">No votes yet</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MemberVotingPage;