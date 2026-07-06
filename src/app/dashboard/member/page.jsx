// client/src/app/dashboard/member/page.jsx
'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { fetchAPI } from '@/lib/api';
import {
    Wallet, HandCoins, TrendingUp, AlertTriangle, CheckCircle2, Clock, Calendar, Shield, Lock,
} from 'lucide-react';
import toast from 'react-hot-toast';

const MemberDashboardHomePage = () => {
    const { data: session } = useSession();
    const user = session?.user;

    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        totalDeposit: 0, lastDeposit: null, currentMonth: null, activeLoan: null, recentTransactions: [],
    });

    const isManager = user?.isManager === true;
    const [hasPin, setHasPin] = useState(false);
    const [showPinModal, setShowPinModal] = useState(false);
    const [pin, setPin] = useState('');
    const [pinMode, setPinMode] = useState('set');
    const [oldPin, setOldPin] = useState('');
    const [isPinSubmitting, setIsPinSubmitting] = useState(false);

    useEffect(() => {
        const checkPin = async () => {
            const memberId = user?._id || user?.id;
            if (!memberId || !isManager) return;
            try {
                const data = await fetchAPI(`/api/users/${memberId}`);
                if (data.success && data.user?.managerPin) setHasPin(true);
            } catch (error) { console.error('Error checking PIN:', error); }
        };
        checkPin();
    }, [user, isManager]);

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
                            amount: 200, status: 'due', dueDate: '10th',
                        },
                        activeLoan: data.dashboard.activeLoan || null,
                        recentTransactions: data.dashboard.recentTransactions || [],
                    });
                }
            } catch (error) { console.error('Error fetching dashboard:', error); }
            finally { setLoading(false); }
        };
        fetchDashboard();
    }, [user]);

    const handleSetPin = async () => {
        if (pin.length !== 6) { toast.error('PIN must be 6 digits'); return; }
        setIsPinSubmitting(true);
        try {
            const data = await fetchAPI('/api/manager/set-pin', {
                method: 'PATCH', body: JSON.stringify({ managerId: user?._id || user?.id, pin }),
            });
            if (data.success) {
                toast.success('Manager PIN set successfully!');
                setShowPinModal(false); setPin(''); setHasPin(true);
            } else { toast.error(data.message || 'Failed'); }
        } catch (error) { toast.error('Failed to set PIN'); }
        finally { setIsPinSubmitting(false); }
    };

    const handleChangePin = async () => {
        if (!oldPin || oldPin.length !== 6) { toast.error('Current PIN must be 6 digits'); return; }
        if (pin.length !== 6) { toast.error('New PIN must be 6 digits'); return; }
        setIsPinSubmitting(true);
        try {
            const data = await fetchAPI('/api/manager/change-pin', {
                method: 'PATCH',
                body: JSON.stringify({ managerId: user?._id || user?.id, oldPin, newPin: pin }),
            });
            if (data.success) {
                toast.success('PIN changed successfully!');
                setShowPinModal(false); setPin(''); setOldPin('');
            } else {
                toast.error(data.message === 'Wrong current PIN' ? 'Current PIN is incorrect' : data.message || 'Failed');
            }
        } catch (error) { toast.error('Current PIN is incorrect'); }
        finally { setIsPinSubmitting(false); }
    };

    const currentMonth = dashboardData.currentMonth || {
        month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
        amount: 200, status: 'due', dueDate: '10th',
    };
    const isCurrentMonthPaid = currentMonth.status === 'paid' || currentMonth.status === 'confirmed';
    const pendingAlerts = [];
    if (!isCurrentMonthPaid) {
        pendingAlerts.push({ type: 'Deposit', message: `${currentMonth.month} Deposit is due (Min: 200)`, date: currentMonth.dueDate || '10th' });
    }

    if (loading) return (
        <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div><p className="mt-4 text-gray-600">Loading dashboard...</p></div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div><h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name || 'Member'}!</h1><p className="text-gray-500 mt-1">Here&apos;s your fund overview</p></div>

            {isManager && !hasPin && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4"><Shield className="size-8 text-purple-600" /></div>
                    <h2 className="text-lg font-semibold text-purple-900 mb-2">🎉 You are now the Manager!</h2>
                    <p className="text-purple-700 mb-4">Set your 6-digit Manager Action PIN to approve deposits and loans.</p>
                    <button onClick={() => { setPinMode('set'); setPin(''); setShowPinModal(true); }} className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200">Set Manager PIN</button>
                </div>
            )}

            {isManager && hasPin && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center"><Shield className="size-5 text-green-600" /></div><div><p className="font-semibold text-green-900">Manager PIN Active</p><p className="text-sm text-green-700">Your action PIN is ready</p></div></div>
                    <button onClick={() => { setPinMode('change'); setPin(''); setOldPin(''); setShowPinModal(true); }} className="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors">Change PIN</button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-5"><div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center"><TrendingUp className="size-5 text-green-600" /></div><span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">Total Deposit</span></div><p className="text-2xl font-bold text-gray-900">৳{dashboardData.totalDeposit.toLocaleString()}</p><p className="text-xs text-gray-500 mt-1">Lifetime deposits</p></div>
                <div className="bg-white rounded-xl border border-gray-200 p-5"><div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center"><Wallet className="size-5 text-purple-600" /></div><span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">Last Deposit</span></div>{dashboardData.lastDeposit ? <><p className="text-2xl font-bold text-gray-900">৳{dashboardData.lastDeposit.amount.toLocaleString()}</p><div className="flex items-center gap-1 mt-1 text-xs text-gray-500"><Calendar className="size-3" /><span>{dashboardData.lastDeposit.date}</span></div></> : <><p className="text-2xl font-bold text-gray-400">-</p><p className="text-xs text-gray-500 mt-1">No deposits yet</p></>}</div>
                <div className="bg-white rounded-xl border border-gray-200 p-5"><div className="flex items-center gap-3 mb-2"><div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isCurrentMonthPaid ? 'bg-green-100' : 'bg-yellow-100'}`}>{isCurrentMonthPaid ? <CheckCircle2 className="size-5 text-green-600" /> : <Clock className="size-5 text-yellow-600" />}</div><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isCurrentMonthPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{currentMonth.month}</span></div><p className="text-2xl font-bold text-gray-900">৳{(currentMonth.amount || 200).toLocaleString()}</p><div className="flex items-center gap-1 mt-1">{isCurrentMonthPaid ? <span className="text-xs text-green-600 font-medium">✓ Done</span> : <span className="text-xs text-red-500 font-medium">Due: {currentMonth.dueDate || '10th'}</span>}</div></div>
                <div className="bg-white rounded-xl border border-gray-200 p-5"><div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"><HandCoins className="size-5 text-blue-600" /></div><span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{dashboardData.activeLoan ? 'Active Loan' : 'No Loan'}</span></div>{dashboardData.activeLoan ? <><p className="text-2xl font-bold text-gray-900">৳{dashboardData.activeLoan.amount.toLocaleString()}</p><p className="text-xs text-gray-500 mt-1">{dashboardData.activeLoan._id?.toString().slice(-8) || ''}</p></> : <><p className="text-2xl font-bold text-gray-400">-</p><p className="text-xs text-gray-500 mt-1">No active loan</p></>}</div>
            </div>

            {pendingAlerts.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4"><div className="flex items-start gap-3"><AlertTriangle className="size-5 text-yellow-600 mt-0.5 shrink-0" /><div><h3 className="font-semibold text-yellow-800">Pending Alerts</h3>{pendingAlerts.map((alert, index) => <p key={index} className="text-sm text-yellow-700 mt-1">⚠️ {alert.message} (Due: {alert.date})</p>)}</div></div></div>
            )}

            {dashboardData.activeLoan && (
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Loan Progress</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div><p className="text-xs text-gray-500">Installment Done</p><p className="font-bold text-lg">{dashboardData.activeLoan.paid_installments || 0}<span className="text-gray-400 text-sm">/{dashboardData.activeLoan.total_installments || 0}</span></p></div>
                        <div><p className="text-xs text-gray-500">Per Installment</p><p className="font-bold text-lg">৳{(dashboardData.activeLoan.installment_amount || 0).toLocaleString()}</p></div>
                        <div><p className="text-xs text-gray-500">Due Amount</p><p className="font-bold text-lg text-red-600">৳{(dashboardData.activeLoan.due_amount || 0).toLocaleString()}</p></div>
                        <div><p className="text-xs text-gray-500">Next Installment</p><div className="flex items-center gap-1"><Clock className="size-4 text-blue-500" /><p className="font-bold text-blue-600">{dashboardData.activeLoan.next_installment_date || '-'}</p></div></div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3"><div className="bg-blue-600 h-3 rounded-full" style={{ width: `${((dashboardData.activeLoan.paid_installments || 0) / (dashboardData.activeLoan.total_installments || 1)) * 100}%` }}></div></div>
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
                {dashboardData.recentTransactions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500"><Wallet className="size-12 mx-auto mb-2 text-gray-300" /><p>No transactions yet</p></div>
                ) : (
                    <div className="space-y-3">
                        {dashboardData.recentTransactions.map((txn, index) => (
                            <div key={txn._id || txn.id || index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${txn.type === 'deposit' ? 'bg-purple-100' : txn.type === 'loan_disbursement' ? 'bg-green-100' : 'bg-blue-100'}`}>
                                        {txn.type === 'deposit' ? <Wallet className="size-4 text-purple-600" /> : <HandCoins className={`size-4 ${txn.type === 'loan_disbursement' ? 'text-green-600' : 'text-blue-600'}`} />}
                                    </div>
                                    <div><p className="text-sm font-medium">{txn.type === 'deposit' ? 'Monthly Deposit' : txn.type === 'loan_installment' ? 'Loan Installment' : txn.type === 'loan_disbursement' ? 'Loan Received' : txn.type}</p><p className="text-xs text-gray-500">{txn.date || (txn.created_at ? new Date(txn.created_at).toLocaleDateString() : '')}</p></div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-sm font-medium ${txn.status === 'pending' ? 'text-yellow-600' : txn.type === 'deposit' || txn.type === 'loan_disbursement' ? 'text-green-600' : 'text-red-600'}`}>{txn.status === 'pending' ? '' : txn.type === 'deposit' || txn.type === 'loan_disbursement' ? '+ ' : '- '}৳{(txn.amount || 0).toLocaleString()}</span>
                                    {txn.status === 'confirmed' || txn.status === 'completed' ? <CheckCircle2 className="size-4 text-green-500" /> : txn.status === 'pending' ? <Clock className="size-4 text-yellow-500" /> : null}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ✅ PIN Modal */}
            {showPinModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={() => { setShowPinModal(false); setPin(''); setOldPin(''); }} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
                        <div className="text-center mb-6">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${pinMode === 'set' ? 'bg-purple-100' : 'bg-blue-100'}`}>
                                {pinMode === 'set' ? <Lock className="size-8 text-purple-600" /> : <Shield className="size-8 text-blue-600" />}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">{pinMode === 'set' ? 'Set Manager PIN' : 'Change Manager PIN'}</h3>
                            <p className="text-sm text-gray-500 mt-1">{pinMode === 'set' ? 'Create a 6-digit PIN for manager actions' : 'Enter your current PIN and new PIN'}</p>
                        </div>

                        {pinMode === 'change' && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Current PIN</label>
                                <input type="password" maxLength={6} placeholder="••••••" value={oldPin}
                                    onChange={(e) => setOldPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className={`w-full px-4 py-3 border rounded-xl text-center text-2xl tracking-[0.5em] outline-none focus:ring-2 ${oldPin && oldPin.length !== 6 ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`} />
                                {oldPin && oldPin.length !== 6 && <p className="text-xs text-red-500 mt-1">PIN must be 6 digits</p>}
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">{pinMode === 'set' ? 'Enter 6-digit PIN' : 'New PIN'}</label>
                            <input type="password" maxLength={6} placeholder="••••••" value={pin} autoFocus
                                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className={`w-full px-4 py-3 border rounded-xl text-center text-2xl tracking-[0.5em] outline-none focus:ring-2 ${pin && pin.length !== 6 ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'}`} />
                            <div className="flex justify-between items-center mt-1"><p className="text-xs text-gray-400">{pin.length}/6 digits</p>{pin && pin.length !== 6 && <p className="text-xs text-red-500">Must be 6 digits</p>}</div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                            <p className="text-xs text-blue-700">🔒 This PIN will be required for approving deposits, loans, and other manager actions.</p>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => { setShowPinModal(false); setPin(''); setOldPin(''); }} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">Cancel</button>
                            <button onClick={pinMode === 'set' ? handleSetPin : handleChangePin}
                                disabled={isPinSubmitting || pin.length !== 6 || (pinMode === 'change' && oldPin.length !== 6)}
                                className={`flex-1 py-2.5 text-white rounded-xl font-semibold transition-all disabled:bg-gray-300 disabled:cursor-not-allowed ${pinMode === 'set' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                                {isPinSubmitting ? <div className="flex items-center justify-center gap-2"><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>{pinMode === 'change' ? 'Verifying...' : 'Saving...'}</div> : pinMode === 'set' ? 'Set PIN' : 'Change PIN'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MemberDashboardHomePage;