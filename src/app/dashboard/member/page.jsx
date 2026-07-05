// client/src/app/dashboard/member/page.jsx
'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { fetchAPI } from '@/lib/api';
import {
    Wallet,
    HandCoins,
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Calendar,
} from 'lucide-react';

const MemberDashboardHomePage = () => {
    const { data: session } = useSession();
    const user = session?.user;

    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        totalDeposit: 0,
        lastDeposit: null,
        currentMonth: null,
        activeLoan: null,
        recentTransactions: [],
    });

    useEffect(() => {
        const fetchDashboard = async () => {
            const memberId = user?._id || user?.id;
            if (!memberId) return;

            try {
                const data = await fetchAPI(`/api/dashboard/member?memberId=${memberId}`);

                if (data.success) {
                    setDashboardData({
                        totalDeposit: data.dashboard.totalDeposit || 0,
                        lastDeposit: data.dashboard.lastDeposit || null,
                        currentMonth: data.dashboard.currentMonth || {
                            month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
                            amount: 200,
                            status: 'due',
                            dueDate: '10th',
                        },
                        activeLoan: data.dashboard.activeLoan || null,
                        recentTransactions: data.dashboard.recentTransactions || [],
                    });
                }
            } catch (error) {
                console.error('Error fetching dashboard:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, [user]);

    // Loading state
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

    // Current month data
    const currentMonth = dashboardData.currentMonth || {
        month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
        amount: 200,
        status: 'due',
        dueDate: '10th',
    };

    const isCurrentMonthPaid = currentMonth.status === 'paid' || currentMonth.status === 'confirmed';

    // Alerts
    const pendingAlerts = [];
    if (!isCurrentMonthPaid) {
        pendingAlerts.push({
            type: 'Deposit',
            message: `${currentMonth.month} Deposit is due (Min: 200)`,
            date: currentMonth.dueDate || '10th',
        });
    }

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    Welcome back, {user?.name || 'Member'}!
                </h1>
                <p className="text-gray-500 mt-1">Here&apos;s your fund overview</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Total Deposit */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <TrendingUp className="size-5 text-green-600" />
                        </div>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                            Total Deposit
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        ৳{dashboardData.totalDeposit.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Lifetime deposits</p>
                </div>

                {/* Last Deposit */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            <Wallet className="size-5 text-purple-600" />
                        </div>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                            Last Deposit
                        </span>
                    </div>
                    {dashboardData.lastDeposit ? (
                        <>
                            <p className="text-2xl font-bold text-gray-900">
                                ৳{dashboardData.lastDeposit.amount.toLocaleString()}
                            </p>
                            <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                <Calendar className="size-3" />
                                <span>{dashboardData.lastDeposit.date}</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <p className="text-2xl font-bold text-gray-400">-</p>
                            <p className="text-xs text-gray-500 mt-1">No Deposits yet</p>
                        </>
                    )}
                </div>

                {/* Current Month */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isCurrentMonthPaid ? 'bg-green-100' : 'bg-yellow-100'
                            }`}>
                            {isCurrentMonthPaid ? (
                                <CheckCircle2 className="size-5 text-green-600" />
                            ) : (
                                <Clock className="size-5 text-yellow-600" />
                            )}
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isCurrentMonthPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                            {currentMonth.month}
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        ৳{(currentMonth.amount || 200).toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                        {isCurrentMonthPaid ? (
                            <span className="text-xs text-green-600 font-medium">✓ Done</span>
                        ) : (
                            <span className="text-xs text-red-500 font-medium">
                                Due: {currentMonth.dueDate || '10th'}
                            </span>
                        )}
                    </div>
                </div>

                {/* Active Loan */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <HandCoins className="size-5 text-blue-600" />
                        </div>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                            {dashboardData.activeLoan ? 'Active Loan' : 'No Loan'}
                        </span>
                    </div>
                    {dashboardData.activeLoan ? (
                        <>
                            <p className="text-2xl font-bold text-gray-900">
                                ৳{dashboardData.activeLoan.amount.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{dashboardData.activeLoan.id || dashboardData.activeLoan._id}</p>
                        </>
                    ) : (
                        <>
                            <p className="text-2xl font-bold text-gray-400">-</p>
                            <p className="text-xs text-gray-500 mt-1">No active loan</p>
                        </>
                    )}
                </div>
            </div>

            {/* Alerts */}
            {pendingAlerts.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="size-5 text-yellow-600 mt-0.5 shrink-0" />
                        <div>
                            <h3 className="font-semibold text-yellow-800">Pending Alerts</h3>
                            {pendingAlerts.map((alert, index) => (
                                <p key={index} className="text-sm text-yellow-700 mt-1">
                                    ⚠️ {alert.message} (Due: {alert.date})
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Loan Progress */}
            {dashboardData.activeLoan && (
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Loan Progress</h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                            <p className="text-xs text-gray-500">Installment Done</p>
                            <p className="font-bold text-lg">
                                {dashboardData.activeLoan.paidInstallments || dashboardData.activeLoan.paid_installments || 0}
                                <span className="text-gray-400 text-sm">
                                    /{dashboardData.activeLoan.totalInstallments || dashboardData.activeLoan.total_installments || 0}
                                </span>
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Per Installment</p>
                            <p className="font-bold text-lg">
                                ৳{(dashboardData.activeLoan.installmentAmount || dashboardData.activeLoan.installment_amount || 0).toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Due Amount</p>
                            <p className="font-bold text-lg text-red-600">
                                ৳{(dashboardData.activeLoan.dueAmount || dashboardData.activeLoan.due_amount || 0).toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Next Installment</p>
                            <div className="flex items-center gap-1">
                                <Clock className="size-4 text-blue-500" />
                                <p className="font-bold text-blue-600">
                                    {dashboardData.activeLoan.nextInstallmentDate || dashboardData.activeLoan.next_installment_date || '-'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                            className="bg-blue-600 h-3 rounded-full transition-all flex items-center justify-end pr-1"
                            style={{
                                width: `${((dashboardData.activeLoan.paidInstallments || dashboardData.activeLoan.paid_installments || 0) /
                                    (dashboardData.activeLoan.totalInstallments || dashboardData.activeLoan.total_installments || 1)) * 100}%`
                            }}
                        >
                            <span className="text-white text-xs font-medium">
                                {Math.round(((dashboardData.activeLoan.paidInstallments || dashboardData.activeLoan.paid_installments || 0) /
                                    (dashboardData.activeLoan.totalInstallments || dashboardData.activeLoan.total_installments || 1)) * 100)}%
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Recent Transactions */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>

                {dashboardData.recentTransactions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Wallet className="size-12 mx-auto mb-2 text-gray-300" />
                        <p>No transactions yet</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {dashboardData.recentTransactions.map((txn, index) => (
                            <div key={txn._id || txn.id || index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${txn.type === 'Deposit' ? 'bg-purple-100' : 'bg-blue-100'
                                        }`}>
                                        {txn.type === 'Deposit' ? (
                                            <Wallet className="size-4 text-purple-600" />
                                        ) : (
                                            <HandCoins className="size-4 text-blue-600" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">
                                            {txn.type === 'Deposit' ? 'Deposit' : 'Loan Installment'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {txn.date || new Date(txn.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">৳{txn.amount.toLocaleString()}</span>
                                    <CheckCircle2 className="size-4 text-green-500" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MemberDashboardHomePage;