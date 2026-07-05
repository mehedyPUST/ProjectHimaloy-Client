// client/src/app/dashboard/manager/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import {
    Users,
    Wallet,
    HandCoins,
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Calendar,
    Vote,
    ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';

const ManagerDashBoardHomePage = () => {
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        currentMonth: '',
        totalMembers: 0,
        totalCollectionThisMonth: 0,
        expectedCollection: 0,
        collectionRate: 0,
        dueMembers: 0,
        activeLoans: 0,
        pendingLoanRequests: 0,
        pendingConfirmations: 0,
        activeVotings: 0,
        fundBalance: 0,
        recentActivities: [],
        dueList: [],
    });

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const data = await fetchAPI('/api/dashboard/manager');
            if (data.success) {
                const d = data.dashboard;
                const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

                setDashboardData({
                    currentMonth,
                    totalMembers: d.totalMembers || 0,
                    totalCollectionThisMonth: d.totalCollectionThisMonth || 0,
                    expectedCollection: d.expectedCollection || (d.totalMembers * 200),
                    collectionRate: d.collectionRate || 0,
                    dueMembers: d.dueMembers || 0,
                    activeLoans: d.activeLoans || 0,
                    pendingLoanRequests: d.pendingLoanRequests || 0,
                    pendingConfirmations: d.pendingConfirmations || 0,
                    activeVotings: d.activeVotings || 0,
                    fundBalance: d.fundBalance || d.totalCollectionThisMonth || 0,
                    recentActivities: d.recentActivities || [],
                    dueList: d.dueList || [],
                });
            }
        } catch (error) {
            console.error('Error fetching manager dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case 'deposit': return { icon: Wallet, bg: 'bg-purple-100', text: 'text-purple-600' };
            case 'loan_request': return { icon: HandCoins, bg: 'bg-blue-100', text: 'text-blue-600' };
            case 'loan_installment': return { icon: CheckCircle2, bg: 'bg-green-100', text: 'text-green-600' };
            default: return { icon: Clock, bg: 'bg-gray-100', text: 'text-gray-600' };
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
                    <p className="text-gray-500 mt-1">{dashboardData.currentMonth} overview</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="size-4" />
                    <span>{dashboardData.currentMonth}</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            <Wallet className="size-5 text-purple-600" />
                        </div>
                        <span className="text-xs font-medium text-green-600">{dashboardData.collectionRate}%</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-3">৳{dashboardData.totalCollectionThisMonth.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">of ৳{dashboardData.expectedCollection.toLocaleString()} collected</p>
                </div>

                <Link href="/dashboard/manager/deposits" className="bg-white rounded-xl border border-yellow-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center"><Clock className="size-5 text-yellow-600" /></div>
                        <ArrowUpRight className="size-4 text-gray-400" />
                    </div>
                    <p className="text-2xl font-bold text-yellow-600 mt-3">{dashboardData.pendingConfirmations}</p>
                    <p className="text-sm text-gray-500">Pending Confirmations</p>
                </Link>

                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"><HandCoins className="size-5 text-blue-600" /></div>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Active</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-3">{dashboardData.activeLoans}</p>
                    <p className="text-sm text-gray-500">Active Loans</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center"><TrendingUp className="size-5 text-green-600" /></div>
                        <ArrowUpRight className="size-4 text-gray-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-3">৳{dashboardData.fundBalance.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Available Fund</p>
                </div>
            </div>

            {/* Quick Actions & Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="space-y-2">
                        <Link href="/dashboard/manager/deposits" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center"><Wallet className="size-4 text-purple-600" /></div>
                                <div><p className="text-sm font-medium text-gray-700">Confirm Deposits</p><p className="text-xs text-gray-500">{dashboardData.pendingConfirmations} pending</p></div>
                            </div>
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">{dashboardData.pendingConfirmations}</span>
                        </Link>
                        <Link href="/dashboard/manager/loans" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center"><HandCoins className="size-4 text-blue-600" /></div>
                                <div><p className="text-sm font-medium text-gray-700">Loan Requests</p><p className="text-xs text-gray-500">{dashboardData.pendingLoanRequests} pending</p></div>
                            </div>
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{dashboardData.pendingLoanRequests}</span>
                        </Link>
                        <Link href="/dashboard/manager/votings" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center"><Vote className="size-4 text-green-600" /></div>
                                <div><p className="text-sm font-medium text-gray-700">Active Votings</p><p className="text-xs text-gray-500">{dashboardData.activeVotings} ongoing</p></div>
                            </div>
                        </Link>
                        <Link href="/dashboard/manager/meetings" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center"><Calendar className="size-4 text-orange-600" /></div>
                                <span className="text-sm font-medium text-gray-700">Call Meeting</span>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Due List */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2"><AlertTriangle className="size-5 text-red-500" /><h2 className="font-semibold text-gray-900">Due Deposits</h2></div>
                        <span className="text-sm text-red-500 font-medium">{dashboardData.dueMembers} members</span>
                    </div>
                    <div className="space-y-3">
                        {dashboardData.dueList.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-4">No due deposits</p>
                        ) : (
                            dashboardData.dueList.map((member, i) => (
                                <div key={member._id || i} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center text-xs font-bold text-red-600">{(member.name || '?').charAt(0)}</div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{member.name}</p>
                                            <p className="text-xs text-gray-500">{member.month}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-red-600">৳{member.amount || 200}</p>
                                        <p className="text-xs text-gray-400">Due: {member.dueDate || '10th'}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Activities */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h2 className="font-semibold text-gray-900 mb-4">Recent Activities</h2>
                    <div className="space-y-3">
                        {dashboardData.recentActivities.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-4">No recent activities</p>
                        ) : (
                            dashboardData.recentActivities.map((activity, i) => {
                                const iconData = getActivityIcon(activity.type);
                                const Icon = iconData.icon;
                                return (
                                    <div key={activity._id || i} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${iconData.bg}`}><Icon className={`size-4 ${iconData.text}`} /></div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-gray-900 truncate">{activity.member_name || 'Unknown'}</p>
                                                <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ml-2 shrink-0 ${activity.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                        activity.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                                    }`}>{activity.status || 'pending'}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {activity.type === 'deposit' && 'Deposit'}
                                                {activity.type === 'loan_installment' && 'Installment'}
                                                {activity.type === 'loan_request' && 'Loan Request'}
                                                {' - '}৳{activity.amount?.toLocaleString() || 0}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5">{new Date(activity.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerDashBoardHomePage;