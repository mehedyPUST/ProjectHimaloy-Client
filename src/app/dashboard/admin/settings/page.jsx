// client/src/app/dashboard/admin/settings/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import {
    Settings,
    Wallet,
    Calendar,
    Users,
    Clock,
    Save,
    AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const SettingsPageForAdmin = () => {
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [settings, setSettings] = useState({
        deposit: {
            minAmount: 200,
            dueDate: 10,
        },
        loan: {
            earlySettlementMonths: 3,
        },
        voting: {
            minDenyCount: 2,
        },
        manager: {
            rotationMonths: 6,
        },
    });

    // Fetch settings
    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const data = await fetchAPI('/api/admin/settings');
            if (data.success && data.settings) {
                setSettings({
                    deposit: data.settings.deposit || settings.deposit,
                    loan: data.settings.loan || settings.loan,
                    voting: data.settings.voting || settings.voting,
                    manager: data.settings.manager || settings.manager,
                });
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (section, field, value) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: parseInt(value) || value,
            }
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);

        try {
            const data = await fetchAPI('/api/admin/settings', {
                method: 'PUT',
                body: JSON.stringify({ settings }),
            });

            if (data.success) {
                toast.success('Settings saved successfully!');
            } else {
                toast.error(data.message || 'Failed to save settings');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
                <p className="text-gray-500 mt-1">Configure fund rules and parameters</p>
            </div>

            {/* Deposit Settings */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Wallet className="size-4 text-purple-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Deposit Settings</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Minimum Deposit Amount (৳)
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">৳</span>
                            <input type="number" value={settings.deposit.minAmount}
                                onChange={(e) => handleChange('deposit', 'minAmount', e.target.value)} min={50}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Minimum amount members must deposit per month</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Due Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                            <select value={settings.deposit.dueDate}
                                onChange={(e) => handleChange('deposit', 'dueDate', e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl outline-none bg-white appearance-none">
                                {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                                    <option key={day} value={day}>{day}th of each month</option>
                                ))}
                            </select>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">After this date, deposit will be marked as due</p>
                    </div>
                </div>
            </div>

            {/* Loan Settings */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Clock className="size-4 text-blue-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Loan Settings</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Early Settlement Window (Months)
                        </label>
                        <input type="number" value={settings.loan.earlySettlementMonths}
                            onChange={(e) => handleChange('loan', 'earlySettlementMonths', e.target.value)} min={1} max={5}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" />
                        <p className="text-xs text-gray-500 mt-1">If loan is fully paid within this period, savings installments are waived</p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <h4 className="text-sm font-semibold text-blue-800 mb-2">Loan Rules</h4>
                        <ul className="space-y-1 text-xs text-blue-700">
                            <li>• 5 months = 5 principal + 1 savings = 6 installments</li>
                            <li>• 10 months = 10 principal + 2 savings = 12 installments</li>
                            <li>• Early settlement saves all savings installments</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Voting Settings */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                        <Users className="size-4 text-green-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Voting Settings</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Minimum Deny Votes for Meeting
                        </label>
                        <input type="number" value={settings.voting.minDenyCount}
                            onChange={(e) => handleChange('voting', 'minDenyCount', e.target.value)} min={1}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" />
                        <p className="text-xs text-gray-500 mt-1">If this many members deny, a meeting will be required</p>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="size-4 text-yellow-600 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-yellow-800">Important</p>
                                <p className="text-xs text-yellow-700 mt-1">Changing voting rules will affect all future loan requests.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Manager Settings */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                        <Calendar className="size-4 text-orange-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Manager Settings</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rotation Period (Months)</label>
                        <input type="number" value={settings.manager.rotationMonths}
                            onChange={(e) => handleChange('manager', 'rotationMonths', e.target.value)} min={3} max={12}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" />
                        <p className="text-xs text-gray-500 mt-1">Manager will automatically rotate after this period</p>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button onClick={handleSave} disabled={isSaving}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center gap-2">
                    {isSaving ? (
                        <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>Saving...</>
                    ) : (
                        <><Save className="size-5" />Save Settings</>
                    )}
                </button>
            </div>
        </div>
    );
};

export default SettingsPageForAdmin;