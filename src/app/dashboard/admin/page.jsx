// client/src/app/dashboard/admin/page.jsx
'use client';

import React from 'react';
import {
    Users,
    UserCheck,
    Wallet,
    HandCoins,
    TrendingUp,
    Clock,
    AlertTriangle,
    CheckCircle2,
    ArrowUpRight,
    Calendar,
} from 'lucide-react';
import Link from 'next/link';

const AdminDashBoardHomePage = () => {

    // TODO: Replace with API data
    const stats = {
        totalMembers: 12,
        totalDeposits: 85000,
        activeLoans: 3,
        totalFundBalance: 45000,
        pendingRequests: 2,
        currentManager: {
            name: 'Karim Uddin',
            startDate: '2026-05-01',
            endDate: '2026-10-31',
            monthsRemaining: 4,
        },
        monthlyOverview: {
            totalCollection: 6000,
            collectionRate: '83%',
            dueMembers: 2,
        },
        recentActivities: [
            { id: 1, type: 'Deposit', user: 'Rafiq', detail: 'July Deposit - ৳500', date: '2026-07-05', status: 'confirmed' },
            { id: 2, type: 'loan_request', user: 'Sakib', detail: 'Loan request - ৳30,000 (10 months)', date: '2026-07-04', status: 'pending' },
            { id: 3, type: 'installment', user: 'Rafiq', detail: 'Loan #001 installment #3 - ৳5,000', date: '2026-07-03', status: 'confirmed' },
            { id: 4, type: 'Deposit', user: 'Rahim', detail: 'July Deposit - ৳200', date: '2026-07-02', status: 'confirmed' },
            { id: 5, type: 'meeting', user: 'Manager', detail: 'Meeting called for Loan #004', date: '2026-07-01', status: 'scheduled' },
        ],
    };

    const activityIcons = {
        Deposit: { icon: Wallet, bg: 'bg-purple-100', text: 'text-purple-600' },
        loan_request: { icon: HandCoins, bg: 'bg-blue-100', text: 'text-blue-600' },
        installment: { icon: CheckCircle2, bg: 'bg-green-100', text: 'text-green-600' },
        meeting: { icon: Calendar, bg: 'bg-orange-100', text: 'text-orange-600' },
    };

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-500 mt-1">Overview of the entire fund system</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Members */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Users className="size-5 text-blue-600" />
                        </div>
                        <ArrowUpRight className="size-4 text-gray-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-3">{stats.totalMembers}</p>
                    <p className="text-sm text-gray-500">Total Members</p>
                </div>

                {/* Total Deposits */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            <Wallet className="size-5 text-purple-600" />
                        </div>
                        <ArrowUpRight className="size-4 text-gray-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-3">৳{stats.totalDeposits.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Total Deposits</p>
                </div>

                {/* Active Loans */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <HandCoins className="size-5 text-green-600" />
                        </div>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                            Active
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-3">{stats.activeLoans}</p>
                    <p className="text-sm text-gray-500">Active Loans</p>
                </div>

                {/* Fund Balance */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                            <TrendingUp className="size-5 text-yellow-600" />
                        </div>
                        <ArrowUpRight className="size-4 text-gray-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-3">৳{stats.totalFundBalance.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Available Fund</p>
                </div>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Current Manager */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <UserCheck className="size-5 text-blue-600" />
                        <h2 className="font-semibold text-gray-900">Current Manager</h2>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs text-gray-500">Name</p>
                            <p className="font-medium text-gray-900">{stats.currentManager.name}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Period</p>
                            <p className="font-medium text-gray-900">{stats.currentManager.startDate} - {stats.currentManager.endDate}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Remaining</p>
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-blue-600">{stats.currentManager.monthsRemaining} months</span>
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full"
                                        style={{ width: `${(stats.currentManager.monthsRemaining / 6) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                        <Link
                            href="/dashboard/admin/managers"
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-block mt-2"
                        >
                            Manage Rotation →
                        </Link>
                    </div>
                </div>

                {/* Monthly Overview */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar className="size-5 text-purple-600" />
                        <h2 className="font-semibold text-gray-900">This Month</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500">Collection</p>
                                <p className="text-xl font-bold text-gray-900">৳{stats.monthlyOverview.totalCollection.toLocaleString()}</p>
                            </div>
                            <span className="text-sm font-medium text-green-600">{stats.monthlyOverview.collectionRate}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className="bg-purple-600 h-2.5 rounded-full"
                                style={{ width: stats.monthlyOverview.collectionRate }}
                            ></div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <AlertTriangle className="size-4 text-yellow-600" />
                            <span className="text-gray-600">{stats.monthlyOverview.dueMembers} members due</span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="space-y-2">
                        <Link
                            href="/dashboard/admin/members"
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Users className="size-4 text-blue-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">Manage Members</span>
                        </Link>
                        <Link
                            href="/dashboard/admin/managers"
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                                <UserCheck className="size-4 text-purple-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">Manage Managers</span>
                        </Link>
                        <Link
                            href="/dashboard/admin/settings"
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                <Clock className="size-4 text-gray-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">System Settings</span>
                        </Link>
                        <Link
                            href="/dashboard/admin/history"
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                                <CheckCircle2 className="size-4 text-green-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">All Transactions</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="font-semibold text-gray-900 mb-4">Recent Activities</h2>
                <div className="space-y-3">
                    {stats.recentActivities.map(activity => {
                        const iconData = activityIcons[activity.type] || activityIcons.Deposit;
                        const Icon = iconData.icon;

                        return (
                            <div key={activity.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${iconData.bg}`}>
                                        <Icon className={`size-4 ${iconData.text}`} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            <span className="font-semibold">{activity.user}</span>
                                            {' '}-{' '}{activity.detail}
                                        </p>
                                        <p className="text-xs text-gray-500">{activity.date}</p>
                                    </div>
                                </div>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${activity.status === 'confirmed'
                                    ? 'bg-green-100 text-green-700'
                                    : activity.status === 'pending'
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : 'bg-blue-100 text-blue-700'
                                    }`}>
                                    {activity.status}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default AdminDashBoardHomePage;