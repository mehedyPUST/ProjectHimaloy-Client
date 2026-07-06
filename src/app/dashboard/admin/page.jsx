'use client';

import React, { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
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
    Shield,
} from 'lucide-react';
import Link from 'next/link';

const AdminDashBoardHomePage = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalMembers: 0,
        totalDeposits: 0,
        activeLoans: 0,
        availableFund: 0,
        currentManager: null,
        monthlyOverview: {
            totalCollection: 0,
            collectionRatePercent: 0,      // ← numeric value for bar
            collectionRateDisplay: '0%',   // ← display string
            dueMembers: 0,
        },
        recentActivities: [],
    });

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const [adminRes, fundRes, managerRes, dueRes, depositsRes] = await Promise.all([
                fetchAPI('/api/dashboard/admin'),
                fetchAPI('/api/fund/available'),
                fetchAPI('/api/manager-cycles/current'),
                fetchAPI('/api/deposits/due'),
                fetchAPI('/api/deposits'),
            ]);

            const admin = adminRes.success ? adminRes.dashboard : {};
            const totalMembers = admin.totalMembers || 0;
            const activeLoans = admin.activeLoans || 0;
            const totalDeposits = admin.totalFundBalance || 0;

            const availableFund = fundRes.success ? fundRes.availableFund : 0;

            // Current manager
            let currentManager = null;
            if (managerRes.success && managerRes.cycle) {
                const cycle = managerRes.cycle;
                let managerEmail = '';
                let managerName = cycle.manager_name || 'Manager';
                try {
                    const userRes = await fetchAPI(`/api/users/${cycle.manager_id}`);
                    if (userRes.success && userRes.user) {
                        managerEmail = userRes.user.email || '';
                        managerName = userRes.user.name || managerName;
                    }
                } catch (e) { /* ignore */ }
                const startDate = cycle.start_date || '';
                const endDate = cycle.end_date || '';
                const now = new Date();
                const end = new Date(endDate);
                const monthsRemaining = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24 * 30)));
                currentManager = {
                    name: managerName,
                    email: managerEmail,
                    startDate,
                    endDate,
                    cycleNumber: cycle.cycle_number || 1,
                    monthsRemaining,
                };
            }

            // Due members
            let dueMembers = 0;
            if (dueRes.success) {
                dueMembers = dueRes.dueMembers?.length || 0;
            }

            // This month's collection
            let totalCollectionThisMonth = 0;
            const currentMonth = new Date().toISOString().slice(0, 7);
            if (depositsRes.success) {
                const deposits = depositsRes.deposits || [];
                const thisMonthDeposits = deposits.filter(d => d.month === currentMonth && d.status === 'confirmed');
                totalCollectionThisMonth = thisMonthDeposits.reduce((sum, d) => sum + (d.amount || 0), 0);
            }

            // Calculate collection rate
            const expectedCollection = totalMembers * 200;
            let collectionRatePercent = 0;
            if (expectedCollection > 0) {
                collectionRatePercent = Math.round((totalCollectionThisMonth / expectedCollection) * 100);
                if (collectionRatePercent > 100) collectionRatePercent = 100;
            }
            const collectionRateDisplay = `${collectionRatePercent}%`;

            // Recent activities
            const recentActivities = admin.recentActivities || [];

            setStats({
                totalMembers,
                totalDeposits,
                activeLoans,
                availableFund,
                currentManager,
                monthlyOverview: {
                    totalCollection: totalCollectionThisMonth,
                    collectionRatePercent,
                    collectionRateDisplay,
                    dueMembers,
                },
                recentActivities,
            });
        } catch (error) {
            console.error('Error fetching admin dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case 'deposit': return { icon: Wallet, bg: 'bg-purple-100', text: 'text-purple-600' };
            case 'loan_request': return { icon: HandCoins, bg: 'bg-blue-100', text: 'text-blue-600' };
            case 'loan_installment': return { icon: CheckCircle2, bg: 'bg-green-100', text: 'text-green-600' };
            case 'loan_disbursement': return { icon: TrendingUp, bg: 'bg-yellow-100', text: 'text-yellow-600' };
            case 'meeting': return { icon: Calendar, bg: 'bg-orange-100', text: 'text-orange-600' };
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
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-500 mt-1">Overview of the entire fund system</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <HandCoins className="size-5 text-green-600" />
                        </div>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">Active</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-3">{stats.activeLoans}</p>
                    <p className="text-sm text-gray-500">Active Loans</p>
                </div>

                <div className="bg-white rounded-xl border border-green-200 p-5">
                    <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <TrendingUp className="size-5 text-emerald-600" />
                        </div>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Available</span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-700 mt-3">৳{stats.availableFund.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Available Fund</p>
                </div>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Current Manager */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Shield className="size-5 text-blue-600" />
                        <h2 className="font-semibold text-gray-900">Current Manager</h2>
                    </div>
                    {stats.currentManager ? (
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-gray-500">Name</p>
                                <p className="font-medium text-gray-900">{stats.currentManager.name}</p>
                                {stats.currentManager.email && (
                                    <p className="text-xs text-gray-500">{stats.currentManager.email}</p>
                                )}
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Cycle</p>
                                <p className="font-medium text-gray-900">#{stats.currentManager.cycleNumber}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Period</p>
                                <p className="font-medium text-gray-900">
                                    {stats.currentManager.startDate} – {stats.currentManager.endDate}
                                </p>
                                <p className="text-xs text-blue-600 mt-1">
                                    {stats.currentManager.monthsRemaining} months remaining
                                </p>
                            </div>
                            <Link href="/dashboard/admin/managers" className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-block mt-2">
                                Manage Rotation →
                            </Link>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400">No manager assigned</p>
                    )}
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
                            <span className="text-sm font-medium text-green-600">{stats.monthlyOverview.collectionRateDisplay}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <AlertTriangle className="size-4 text-yellow-600" />
                            <span className="text-gray-600">{stats.monthlyOverview.dueMembers} members due</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className="bg-purple-600 h-2.5 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(stats.monthlyOverview.collectionRatePercent, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="space-y-2">
                        <Link href="/dashboard/admin/members" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center"><Users className="size-4 text-blue-600" /></div>
                            <span className="text-sm font-medium text-gray-700">Manage Members</span>
                        </Link>
                        <Link href="/dashboard/admin/managers" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center"><UserCheck className="size-4 text-purple-600" /></div>
                            <span className="text-sm font-medium text-gray-700">Manager Overview</span>
                        </Link>
                        <Link href="/dashboard/admin/all-history" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center"><CheckCircle2 className="size-4 text-green-600" /></div>
                            <span className="text-sm font-medium text-gray-700">All Transactions</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="font-semibold text-gray-900 mb-4">Recent Activities</h2>
                {stats.recentActivities.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">No recent activities</p>
                ) : (
                    <div className="space-y-3">
                        {stats.recentActivities.map((activity, index) => {
                            const iconData = getActivityIcon(activity.type);
                            const Icon = iconData.icon;
                            return (
                                <div key={activity._id || index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${iconData.bg}`}>
                                            <Icon className={`size-4 ${iconData.text}`} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                <span className="font-semibold">{activity.member_name || 'Member'}</span>
                                                {' '}-{' '}
                                                {activity.type === 'deposit' && `Deposit - ৳${activity.amount?.toLocaleString() || 0}`}
                                                {activity.type === 'loan_installment' && `Installment - ৳${activity.amount?.toLocaleString() || 0}`}
                                                {activity.type === 'loan_disbursement' && `Loan Received - ৳${activity.amount?.toLocaleString() || 0}`}
                                                {activity.type === 'loan_request' && `Loan Request - ৳${activity.amount?.toLocaleString() || 0}`}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {activity.created_at ? new Date(activity.created_at).toLocaleDateString() : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${activity.status === 'confirmed' || activity.status === 'completed'
                                        ? 'bg-green-100 text-green-700'
                                        : activity.status === 'pending' || activity.status === 'pending_confirmation'
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {activity.status || 'pending'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashBoardHomePage;