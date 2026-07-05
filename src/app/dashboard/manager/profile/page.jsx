// client/src/app/dashboard/manager/profile/page.jsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { fetchAPI } from '@/lib/api';
import {
    User,
    Mail,
    Phone,
    Calendar,
    Camera,
    Save,
    Shield,
    Clock,
    Wallet,
    TrendingUp,
    HandCoins,
    CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';

const ManagersProfilePage = () => {
    const { data: session } = useSession();
    const user = session?.user;
    const fileInputRef = useRef(null);

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [imagePreview, setImagePreview] = useState(user?.image || null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        dateOfBirth: user?.dateOfBirth || '',
    });
    const [managerStats, setManagerStats] = useState({
        cycleNumber: '-',
        startDate: '-',
        endDate: '-',
        monthsRemaining: 0,
        totalCollection: 0,
        totalLoansDisbursed: 0,
        totalSavingsGenerated: 0,
        membersCount: 0,
    });

    // Fetch manager stats
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [cycleData, dashData] = await Promise.all([
                    fetchAPI('/api/manager-cycles/current'),
                    fetchAPI('/api/dashboard/manager'),
                ]);

                if (cycleData.success && cycleData.cycle) {
                    const cycle = cycleData.cycle;
                    const startDate = new Date(cycle.start_date);
                    const endDate = new Date(cycle.end_date);
                    const now = new Date();
                    const monthsRemaining = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24 * 30)));

                    setManagerStats({
                        cycleNumber: cycle.cycle_number,
                        startDate: cycle.start_date,
                        endDate: cycle.end_date,
                        monthsRemaining,
                        totalCollection: cycle.total_collection || 0,
                        totalLoansDisbursed: cycle.total_loans_disbursed || 0,
                        totalSavingsGenerated: cycle.total_savings_generated || 0,
                        membersCount: dashData.dashboard?.totalMembers || 0,
                    });
                }
            } catch (error) {
                console.error('Error fetching manager stats:', error);
            }
        };

        fetchStats();
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB');
            return;
        }

        const preview = URL.createObjectURL(file);
        setImagePreview(preview);
        setSelectedImage(file);
    };

    const handleSave = async () => {
        setIsSaving(true);

        try {
            let finalImageUrl = user?.image || '';

            if (selectedImage) {
                const API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
                const imgFormData = new FormData();
                imgFormData.append('image', selectedImage);

                const response = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY}`, {
                    method: 'POST',
                    body: imgFormData,
                });

                const data = await response.json();
                if (data.success) {
                    finalImageUrl = data.data.url;
                }
            }

            const memberId = user?._id || user?.id;
            const data = await fetchAPI(`/api/users/${memberId}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    name: formData.name,
                    phone: formData.phone,
                    dateOfBirth: formData.dateOfBirth,
                    image: finalImageUrl,
                }),
            });

            if (data.success) {
                toast.success('Profile updated successfully!');
                setIsEditing(false);
                setSelectedImage(null);
            } else {
                toast.error(data.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                <p className="text-gray-500 mt-1">Manage your personal information</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column - Profile Card + Stats */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                        <div className="relative inline-block">
                            <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center mx-auto overflow-hidden border-4 border-purple-100">
                                {imagePreview ? (
                                    <img src={imagePreview} alt={user?.name} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="size-12 text-purple-600" />
                                )}
                            </div>
                            {isEditing && (
                                <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors">
                                    <Camera className="size-4" />
                                </button>
                            )}
                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                        </div>

                        <h2 className="text-lg font-semibold text-gray-900 mt-3">{user?.name}</h2>
                        <span className="inline-flex items-center gap-1 mt-1 text-xs font-medium px-3 py-1 rounded-full bg-purple-100 text-purple-700">
                            <Shield className="size-3" />Manager
                        </span>

                        <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                            <div className="flex items-center gap-2 text-sm text-purple-700">
                                <Clock className="size-4" />
                                <span>{managerStats.monthsRemaining} months remaining</span>
                            </div>
                        </div>
                    </div>

                    {/* Manager Stats */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h3 className="font-semibold text-gray-900 mb-3">Current Cycle Stats</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
                                    <Wallet className="size-4 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Total Collection</p>
                                    <p className="font-bold text-gray-900">৳{managerStats.totalCollection.toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <HandCoins className="size-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Loans Disbursed</p>
                                    <p className="font-bold text-gray-900">৳{managerStats.totalLoansDisbursed.toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-yellow-100 flex items-center justify-center">
                                    <TrendingUp className="size-4 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Savings Generated</p>
                                    <p className="font-bold text-gray-900">৳{managerStats.totalSavingsGenerated.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Members</span>
                                <span className="font-medium">{managerStats.membersCount}</span>
                            </div>
                            <div className="flex justify-between text-sm mt-1">
                                <span className="text-gray-500">Cycle</span>
                                <span className="font-medium">#{managerStats.cycleNumber}</span>
                            </div>
                            <div className="flex justify-between text-sm mt-1">
                                <span className="text-gray-500">Period</span>
                                <span className="font-medium text-xs">{managerStats.startDate} - {managerStats.endDate}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Edit Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                            {!isEditing ? (
                                <button onClick={() => setIsEditing(true)} className="px-4 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                                    Edit Profile
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button onClick={() => { setIsEditing(false); setImagePreview(user?.image || null); setSelectedImage(null); setFormData({ name: user?.name || '', phone: user?.phone || '', dateOfBirth: user?.dateOfBirth || '' }); }} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" disabled={isSaving}>Cancel</button>
                                    <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed">
                                        {isSaving ? (<><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>Saving...</>) : (<><Save className="size-4" />Save Changes</>)}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1"><User className="size-4 inline mr-1" />Full Name</label>
                                {isEditing ? (
                                    <input type="text" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none" disabled={isSaving} />
                                ) : (
                                    <p className="text-gray-900 py-2.5">{user?.name || '-'}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1"><Mail className="size-4 inline mr-1" />Email</label>
                                <p className="text-gray-500 py-2.5">{user?.email || '-'}</p>
                                <p className="text-xs text-gray-400">Email cannot be changed</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1"><Phone className="size-4 inline mr-1" />Phone Number</label>
                                {isEditing ? (
                                    <input type="tel" value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none" disabled={isSaving} />
                                ) : (
                                    <p className="text-gray-900 py-2.5">{user?.phone || '-'}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1"><Calendar className="size-4 inline mr-1" />Date of Birth</label>
                                {isEditing ? (
                                    <input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none" disabled={isSaving} />
                                ) : (
                                    <p className="text-gray-900 py-2.5">{user?.dateOfBirth || '-'}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1"><Shield className="size-4 inline mr-1" />Role</label>
                                <span className="inline-flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-full bg-purple-100 text-purple-700">
                                    <CheckCircle2 className="size-4" />Manager (Cycle #{managerStats.cycleNumber})
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagersProfilePage;