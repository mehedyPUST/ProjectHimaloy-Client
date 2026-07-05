// client/src/app/dashboard/manager/meetings/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { fetchAPI } from '@/lib/api';
import {
    Calendar,
    Clock,
    MapPin,
    Users,
    FileText,
    Plus,
    X,
    CheckCircle2,
    Vote,
    Eye,
    HandCoins,
    RefreshCw,
    Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';

const MeetingsPageForManager = () => {
    const { data: session } = useSession();
    const user = session?.user;

    const [loading, setLoading] = useState(true);
    const [upcomingMeetings, setUpcomingMeetings] = useState([]);
    const [pastMeetings, setPastMeetings] = useState([]);
    const [pendingLoanRequests, setPendingLoanRequests] = useState([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState(null);
    const [meetingForm, setMeetingForm] = useState({
        type: 'quick',
        loanRequestId: '',
        title: '',
        date: '',
        time: '',
        location: '',
        agenda: '',
    });

    const meetingTypes = [
        { value: 'quick', label: 'Quick Meeting', icon: Zap, color: 'text-orange-600', bg: 'bg-orange-100' },
        { value: 'monthly', label: 'Monthly Meeting', icon: RefreshCw, color: 'text-purple-600', bg: 'bg-purple-100' },
        { value: 'loan_request', label: 'Loan Request Meeting', icon: HandCoins, color: 'text-blue-600', bg: 'bg-blue-100' },
    ];

    const getTypeData = (type) => {
        return meetingTypes.find(t => t.value === type) || meetingTypes[0];
    };

    // Fetch data
    useEffect(() => {
        fetchMeetings();
        fetchPendingRequests();
    }, []);

    const fetchMeetings = async () => {
        try {
            const data = await fetchAPI('/api/meetings');
            if (data.success) {
                const meetings = data.meetings || [];
                setUpcomingMeetings(meetings.filter(m => m.status === 'scheduled'));
                setPastMeetings(meetings.filter(m => m.status === 'completed'));
            }
        } catch (error) {
            console.error('Error fetching meetings:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingRequests = async () => {
        try {
            const data = await fetchAPI('/api/loans/requests?status=pending');
            if (data.success) {
                // Show only requests needing meeting (with deny count >= 2)
                setPendingLoanRequests(data.requests?.filter(r => r.deny_count >= 2) || []);
            }
        } catch (error) {
            console.error('Error fetching pending requests:', error);
        }
    };

    const handleCreateMeeting = async (e) => {
        e.preventDefault();
        const managerId = user?._id || user?.id;

        if (meetingForm.type === 'loan_request' && !meetingForm.loanRequestId) {
            toast.error('Please select a loan request');
            return;
        }

        try {
            const data = await fetchAPI('/api/meetings', {
                method: 'POST',
                body: JSON.stringify({
                    managerId,
                    ...meetingForm,
                }),
            });

            if (data.success) {
                toast.success('Meeting scheduled! Members will be notified.');
                setIsCreateModalOpen(false);
                setMeetingForm({ type: 'quick', loanRequestId: '', title: '', date: '', time: '', location: '', agenda: '' });
                fetchMeetings();
            } else {
                toast.error(data.message || 'Failed to schedule meeting');
            }
        } catch (error) {
            toast.error('Failed to schedule meeting');
        }
    };

    const openDetailModal = (meeting) => {
        setSelectedMeeting(meeting);
        setIsDetailModalOpen(true);
    };

    const handleStartReVoting = async (meeting) => {
        if (meeting.loan_request_id) {
            const managerId = user?._id || user?.id;
            try {
                const data = await fetchAPI(`/api/loans/requests/${meeting.loan_request_id}/voting/start`, {
                    method: 'POST',
                    body: JSON.stringify({ managerId, phase: 'after_meeting' }),
                });

                if (data.success) {
                    toast.success('Re-voting started!');
                    handleCompleteMeeting(meeting._id);
                } else {
                    toast.error(data.message || 'Failed to start re-voting');
                }
            } catch (error) {
                toast.error('Failed to start re-voting');
            }
        }
    };

    const handleCompleteMeeting = async (meetingId) => {
        try {
            const data = await fetchAPI(`/api/meetings/${meetingId}`, {
                method: 'PATCH',
                body: JSON.stringify({ status: 'completed' }),
            });

            if (data.success) {
                toast.success('Meeting marked as completed!');
                fetchMeetings();
            }
        } catch (error) {
            toast.error('Failed to complete meeting');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading meetings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Meetings</h1>
                    <p className="text-gray-500 mt-1">Schedule and manage all group meetings</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    <Plus className="size-4" />
                    Schedule Meeting
                </button>
            </div>

            {/* Pending Loan Requests Alert */}
            {pendingLoanRequests.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Vote className="size-5 text-yellow-600" />
                        <h2 className="font-semibold text-yellow-800">Loan Requests Needing Meeting</h2>
                    </div>
                    <div className="space-y-2">
                        {pendingLoanRequests.map(request => (
                            <div key={request._id} className="flex items-center justify-between p-3 bg-white border border-yellow-200 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-sm font-bold text-yellow-600">
                                        {(request.member_name || '?').charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{request.member_name}</p>
                                        <p className="text-xs text-gray-500">Loan: ৳{request.amount.toLocaleString()}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setMeetingForm({
                                            type: 'loan_request',
                                            loanRequestId: request._id,
                                            title: `Loan Request Discussion - ${request.member_name}`,
                                            date: '',
                                            time: '',
                                            location: '',
                                            agenda: `Discuss loan request`,
                                        });
                                        setIsCreateModalOpen(true);
                                    }}
                                    className="px-3 py-1.5 text-sm font-medium text-yellow-700 bg-yellow-100 hover:bg-yellow-200 rounded-lg transition-colors flex items-center gap-1"
                                >
                                    <Calendar className="size-3" /> Schedule Meeting
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Upcoming Meetings */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">
                    Upcoming Meetings ({upcomingMeetings.length})
                </h2>

                {upcomingMeetings.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <Calendar className="size-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900">No Upcoming Meetings</h3>
                        <p className="text-gray-500 mt-1">Schedule a meeting when needed</p>
                    </div>
                ) : (
                    upcomingMeetings.map(meeting => {
                        const typeData = getTypeData(meeting.type);
                        const TypeIcon = typeData.icon;

                        return (
                            <div key={meeting._id} className="bg-white rounded-xl border border-blue-200 p-5 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="w-16 h-16 rounded-xl bg-blue-600 text-white flex flex-col items-center justify-center shrink-0">
                                            <span className="text-xs font-medium">
                                                {new Date(meeting.date).toLocaleString('default', { month: 'short' })}
                                            </span>
                                            <span className="text-2xl font-bold">
                                                {new Date(meeting.date).getDate()}
                                            </span>
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${typeData.bg} ${typeData.color}`}>
                                                    <TypeIcon className="size-3" />
                                                    {typeData.label}
                                                </span>
                                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{meeting.status}</span>
                                            </div>
                                            <h3 className="font-semibold text-gray-900 mt-1">{meeting.title}</h3>
                                            <div className="space-y-1 mt-2">
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <Clock className="size-4" />
                                                    <span>{meeting.date} at {meeting.time}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <MapPin className="size-4" />
                                                    <span>{meeting.location}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button onClick={() => openDetailModal(meeting)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                            <Eye className="size-4 text-gray-500" />
                                        </button>
                                        {meeting.type === 'loan_request' && (
                                            <button onClick={() => handleStartReVoting(meeting)} className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1">
                                                <Vote className="size-3" /> Re-Voting
                                            </button>
                                        )}
                                        <button onClick={() => handleCompleteMeeting(meeting._id)} className="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors flex items-center gap-1">
                                            <CheckCircle2 className="size-3" /> Complete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Past Meetings */}
            {pastMeetings.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">Past Meetings ({pastMeetings.length})</h2>

                    {pastMeetings.map(meeting => {
                        const typeData = getTypeData(meeting.type);
                        const TypeIcon = typeData.icon;

                        return (
                            <div key={meeting._id} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="w-16 h-16 rounded-xl bg-green-600 text-white flex flex-col items-center justify-center shrink-0">
                                            <span className="text-xs font-medium">{new Date(meeting.date).toLocaleString('default', { month: 'short' })}</span>
                                            <span className="text-2xl font-bold">{new Date(meeting.date).getDate()}</span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${typeData.bg} ${typeData.color}`}>
                                                    <TypeIcon className="size-3" />{typeData.label}
                                                </span>
                                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                                                    <CheckCircle2 className="size-3" /> completed
                                                </span>
                                            </div>
                                            <h3 className="font-semibold text-gray-900 mt-1">{meeting.title}</h3>
                                            <p className="text-sm text-gray-500 mt-1">{meeting.date} at {meeting.time} • {meeting.location}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => openDetailModal(meeting)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                        <Eye className="size-4 text-gray-500" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create Meeting Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setIsCreateModalOpen(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <Calendar className="size-5 text-blue-600" />
                                </div>
                                <div><h2 className="text-lg font-semibold text-gray-900">Schedule Meeting</h2></div>
                            </div>
                            <button onClick={() => setIsCreateModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                                <X className="size-5 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateMeeting} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Type <span className="text-red-500">*</span></label>
                                <div className="grid grid-cols-3 gap-2">
                                    {meetingTypes.map(type => {
                                        const Icon = type.icon;
                                        return (
                                            <button key={type.value} type="button" onClick={() => setMeetingForm(prev => ({ ...prev, type: type.value, loanRequestId: type.value !== 'loan_request' ? '' : prev.loanRequestId }))}
                                                className={`p-3 rounded-xl border-2 text-center transition-all ${meetingForm.type === type.value ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                                <Icon className={`size-5 mx-auto mb-1 ${type.color}`} />
                                                <span className="text-xs font-medium">{type.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {meetingForm.type === 'loan_request' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Loan Request</label>
                                    <select value={meetingForm.loanRequestId} onChange={(e) => setMeetingForm(prev => ({ ...prev, loanRequestId: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none bg-white">
                                        <option value="">Select loan request</option>
                                        {pendingLoanRequests.map(req => (
                                            <option key={req._id} value={req._id}>{req.member_name} (৳{req.amount.toLocaleString()})</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Title <span className="text-red-500">*</span></label>
                                <input type="text" value={meetingForm.title} onChange={(e) => setMeetingForm(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="e.g., Monthly Fund Review" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" required />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Date <span className="text-red-500">*</span></label>
                                    <input type="date" value={meetingForm.date} onChange={(e) => setMeetingForm(prev => ({ ...prev, date: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Time <span className="text-red-500">*</span></label>
                                    <input type="time" value={meetingForm.time} onChange={(e) => setMeetingForm(prev => ({ ...prev, time: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" required />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2"><MapPin className="size-4 inline mr-1" />Location <span className="text-red-500">*</span></label>
                                <input type="text" value={meetingForm.location} onChange={(e) => setMeetingForm(prev => ({ ...prev, location: e.target.value }))}
                                    placeholder="e.g., Community Center, Online" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" required />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2"><FileText className="size-4 inline mr-1" />Agenda <span className="text-red-500">*</span></label>
                                <textarea value={meetingForm.agenda} onChange={(e) => setMeetingForm(prev => ({ ...prev, agenda: e.target.value }))}
                                    placeholder="Describe the meeting agenda..." rows={4} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none resize-none" required />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                                    <Calendar className="size-4" />Schedule Meeting</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {isDetailModalOpen && selectedMeeting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setIsDetailModalOpen(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Meeting Details</h3>
                            <button onClick={() => setIsDetailModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="size-5 text-gray-500" /></button>
                        </div>
                        {selectedMeeting && (() => {
                            const typeData = getTypeData(selectedMeeting.type);
                            const TypeIcon = typeData.icon;
                            return (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                        <div className="w-16 h-16 rounded-xl bg-blue-600 text-white flex flex-col items-center justify-center">
                                            <span className="text-xs">{new Date(selectedMeeting.date).toLocaleString('default', { month: 'short' })}</span>
                                            <span className="text-2xl font-bold">{new Date(selectedMeeting.date).getDate()}</span>
                                        </div>
                                        <div>
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 w-fit ${typeData.bg} ${typeData.color}`}>
                                                <TypeIcon className="size-3" />{typeData.label}</span>
                                            <p className="font-semibold mt-1">{selectedMeeting.title}</p>
                                            <p className="text-xs text-gray-400">{selectedMeeting.date} at {selectedMeeting.time}</p>
                                        </div>
                                    </div>
                                    <div><p className="text-xs text-gray-500">Location</p><p className="font-medium">{selectedMeeting.location}</p></div>
                                    <div><p className="text-xs text-gray-500">Agenda</p><p className="text-sm text-gray-700">{selectedMeeting.agenda}</p></div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MeetingsPageForManager;