// client/src/app/dashboard/member/collections/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { fetchAPI } from '@/lib/api';
import {
    Wallet,
    Send,
    CheckCircle2,
    Calendar,
    Banknote,
    Smartphone,
    Hash,
    FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';

const MemberDepositActionPage = () => {
    const { data: session } = useSession();
    const user = session?.user;

    const [formData, setFormData] = useState({
        month: '',
        year: new Date().getFullYear().toString(),
        date: new Date().toISOString().split('T')[0],
        paidThrough: '',
        transactionId: '',
        amount: '',
        note: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [DepositHistory, setDepositHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    const minDeposit = 200;

    const months = [
        { value: '01', label: 'January' },
        { value: '02', label: 'February' },
        { value: '03', label: 'March' },
        { value: '04', label: 'April' },
        { value: '05', label: 'May' },
        { value: '06', label: 'June' },
        { value: '07', label: 'July' },
        { value: '08', label: 'August' },
        { value: '09', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' },
    ];

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

    const paymentMethods = [
        { value: 'bkash', label: 'bKash' },
        { value: 'nagad', label: 'Nagad' },
        { value: 'cellfin', label: 'Cell-Fin' },
        { value: 'rocket', label: 'Rocket' },
        { value: 'others', label: 'Others' },
        { value: 'hand-cash', label: 'Hand Cash (No Transaction)' },
    ];

    // Fetch Deposit history
    useEffect(() => {
        const fetchHistory = async () => {
            const memberId = user?._id || user?.id;
            if (!memberId) return;

            try {
                const data = await fetchAPI(`/api/deposits/my?memberId=${memberId}`);
                if (data.success) {
                    setDepositHistory(data.deposits || []);
                }
            } catch (error) {
                console.error('Error fetching Deposit history:', error);
            } finally {
                setLoadingHistory(false);
            }
        };

        fetchHistory();
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'paidThrough' && value === 'hand-cash' ? { transactionId: '' } : {})
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.month || !formData.year || !formData.paidThrough || !formData.amount) {
            toast.error('Please fill all required fields');
            return;
        }

        if (parseInt(formData.amount) < minDeposit) {
            toast.error(`Minimum Deposit is ৳${minDeposit}`);
            return;
        }

        if (formData.paidThrough !== 'hand-cash' && !formData.transactionId) {
            toast.error('Please enter Transaction ID');
            return;
        }

        const memberId = user?._id || user?.id;
        if (!memberId) {
            toast.error('User not found');
            return;
        }

        setIsSubmitting(true);

        try {
            const data = await fetchAPI('/api/deposits/pay', {
                method: 'POST',
                body: JSON.stringify({
                    memberId,
                    month: formData.month,
                    year: formData.year,
                    date: formData.date,
                    paidThrough: formData.paidThrough,
                    transactionId: formData.paidThrough === 'hand-cash' ? '-' : formData.transactionId,
                    amount: parseInt(formData.amount),
                    note: formData.note,
                }),
            });

            if (data.success) {
                toast.success('Deposit request submitted!');

                // Reset form
                setFormData({
                    month: '',
                    year: new Date().getFullYear().toString(),
                    date: new Date().toISOString().split('T')[0],
                    paidThrough: '',
                    transactionId: '',
                    amount: '',
                    note: '',
                });

                // Refresh history
                const historyData = await fetchAPI(`/api/deposits/my?memberId=${memberId}`);
                if (historyData.success) {
                    setDepositHistory(historyData.deposits || []);
                }
            } else {
                toast.error(data.message || 'Failed to submit Deposit');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'confirmed':
                return { bg: 'bg-green-100', text: 'text-green-700', label: 'Confirmed' };
            case 'pending':
                return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' };
            case 'rejected':
                return { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' };
            default:
                return { bg: 'bg-gray-100', text: 'text-gray-700', label: status };
        }
    };

    const getMonthName = (monthStr) => {
        if (!monthStr) return '';
        const [year, month] = monthStr.split('-');
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        return `${monthNames[parseInt(month) - 1]} ${year}`;
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Make Deposit</h1>
                <p className="text-gray-500 mt-1">Submit your monthly Deposit request</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <form onSubmit={handleSubmit} className="space-y-5">

                            {/* Month & Year Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Month <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                                        <select
                                            name="month"
                                            value={formData.month}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white"
                                            required
                                        >
                                            <option value="">Select Month</option>
                                            {months.map(m => (
                                                <option key={m.value} value={m.value}>{m.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Year <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="year"
                                        value={formData.year}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white"
                                        required
                                    >
                                        {years.map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Paid Through */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Paid Through <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                                    <select
                                        name="paidThrough"
                                        value={formData.paidThrough}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white"
                                        required
                                    >
                                        <option value="">Select Payment Method</option>
                                        {paymentMethods.map(method => (
                                            <option key={method.value} value={method.value}>
                                                {method.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Transaction ID */}
                            {formData.paidThrough && formData.paidThrough !== 'hand-cash' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Transaction ID <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                                        <input
                                            type="text"
                                            name="transactionId"
                                            value={formData.transactionId}
                                            onChange={handleChange}
                                            placeholder="Enter Transaction ID"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Amount */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Amount <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                                    <input
                                        type="number"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleChange}
                                        placeholder="Enter amount (Min: 200)"
                                        min={minDeposit}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg"
                                        required
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Minimum: ৳{minDeposit}</p>
                            </div>

                            {/* Quick Amounts */}
                            <div className="flex flex-wrap gap-2">
                                {[200, 300, 500, 1000, 2000].map(quickAmount => (
                                    <button
                                        key={quickAmount}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, amount: quickAmount.toString() }))}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${formData.amount === quickAmount.toString()
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        ৳{quickAmount}
                                    </button>
                                ))}
                            </div>

                            {/* Note */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Note <span className="text-gray-400">(Optional)</span>
                                </label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-3 size-4 text-gray-400" />
                                    <textarea
                                        name="note"
                                        value={formData.note}
                                        onChange={handleChange}
                                        placeholder="Any additional note..."
                                        rows={3}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                                    />
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send className="size-5" />
                                        Submit Deposit Request
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h3 className="font-semibold text-gray-900 mb-3">Deposit Rules</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-0.5">•</span>
                                Minimum ৳200 per month
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-0.5">•</span>
                                Can donate more than minimum
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-0.5">•</span>
                                Due by 10th of each month
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-0.5">•</span>
                                Hand Cash = No Transaction ID
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* History */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Deposit History</h2>

                {loadingHistory ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-sm text-gray-500">Loading...</p>
                    </div>
                ) : DepositHistory.length === 0 ? (
                    <div className="text-center py-8">
                        <Wallet className="size-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-gray-500">No Deposits yet</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 text-xs font-medium text-gray-500">Month</th>
                                    <th className="text-left py-3 text-xs font-medium text-gray-500">Date</th>
                                    <th className="text-left py-3 text-xs font-medium text-gray-500">Amount</th>
                                    <th className="text-left py-3 text-xs font-medium text-gray-500 hidden md:table-cell">Method</th>
                                    <th className="text-left py-3 text-xs font-medium text-gray-500 hidden md:table-cell">Txn ID</th>
                                    <th className="text-left py-3 text-xs font-medium text-gray-500">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {DepositHistory.map((Deposit, index) => {
                                    const statusBadge = getStatusBadge(Deposit.status);
                                    return (
                                        <tr key={Deposit._id || index} className="border-b border-gray-100">
                                            <td className="py-3 text-sm text-gray-900">
                                                {getMonthName(Deposit.month)}
                                            </td>
                                            <td className="py-3 text-sm text-gray-500">
                                                {Deposit.date || new Date(Deposit.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 text-sm font-medium text-gray-900">
                                                ৳{Deposit.amount.toLocaleString()}
                                            </td>
                                            <td className="py-3 text-sm text-gray-500 hidden md:table-cell">
                                                {Deposit.paid_through || Deposit.method || '-'}
                                            </td>
                                            <td className="py-3 text-sm text-gray-500 hidden md:table-cell">
                                                {Deposit.transaction_id || Deposit.txn_id || '-'}
                                            </td>
                                            <td className="py-3">
                                                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge.bg} ${statusBadge.text}`}>
                                                    <CheckCircle2 className="size-3" />
                                                    {statusBadge.label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MemberDepositActionPage;