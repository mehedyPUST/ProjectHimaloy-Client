// client/src/app/dashboard/member/profile/page.jsx
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
    Wallet,
    Clock,
    Shield,
} from 'lucide-react';
import toast from 'react-hot-toast';

const MembersProfilePage = () => {
    const { data: session } = useSession();
    const user = session?.user;
    const fileInputRef = useRef(null);

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [imagePreview, setImagePreview] = useState(user?.image || null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [profileData, setProfileData] = useState({
        totalDeposit: 0,
        savings: 0,
        joinedDate: '',
    });
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        dateOfBirth: user?.dateOfBirth || '',
    });

    // Fetch profile stats
    useEffect(() => {
        const fetchProfile = async () => {
            const memberId = user?._id || user?.id;
            if (!memberId) return;

            try {
                const data = await fetchAPI(`/api/dashboard/member?memberId=${memberId}`);
                if (data.success) {
                    setProfileData({
                        totalDeposit: data.dashboard.totalDeposit || 0,
                        savings: data.dashboard.savings || 0,
                        joinedDate: user?.created_at ? new Date(user.created_at).toLocaleDateString() : '-',
                    });
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            }
        };

        fetchProfile();
    }, [user]);

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

            // Upload image if changed
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

            // Update profile via API
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
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                <p className="text-gray-500 mt-1">Manage your personal information</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Profile Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                        {/* Avatar */}
                        <div className="relative inline-block">
                            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mx-auto overflow-hidden border-4 border-blue-100">
                                {imagePreview ? (
                                    <img
                                        src={imagePreview}
                                        alt={user?.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <User className="size-12 text-blue-600" />
                                )}
                            </div>
                            {isEditing && (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                                >
                                    <Camera className="size-4" />
                                </button>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </div>

                        <h2 className="text-lg font-semibold text-gray-900 mt-3">{user?.name}</h2>

                        <span className="inline-flex items-center gap-1 mt-1 text-xs font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                            <Shield className="size-3" />
                            {(user?.role || 'member').charAt(0).toUpperCase() + (user?.role || 'member').slice(1)}
                        </span>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3 mt-5 pt-5 border-t border-gray-100">
                            <div>
                                <p className="text-xs text-gray-500">Total Deposit</p>
                                <p className="text-lg font-bold text-gray-900">৳{profileData.totalDeposit.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Savings</p>
                                <p className="text-lg font-bold text-green-600">৳{profileData.savings.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-500">
                            <Clock className="size-3" />
                            <span>Joined: {profileData.joinedDate || '-'}</span>
                        </div>
                    </div>
                </div>

                {/* Profile Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    Edit Profile
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setImagePreview(user?.image || null);
                                            setSelectedImage(null);
                                            setFormData({
                                                name: user?.name || '',
                                                phone: user?.phone || '',
                                                dateOfBirth: user?.dateOfBirth || '',
                                            });
                                        }}
                                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                        disabled={isSaving}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    >
                                        {isSaving ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="size-4" />
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <User className="size-4 inline mr-1" />
                                    Full Name
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        disabled={isSaving}
                                    />
                                ) : (
                                    <p className="text-gray-900 py-2.5">{user?.name || '-'}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <Mail className="size-4 inline mr-1" />
                                    Email
                                </label>
                                <p className="text-gray-500 py-2.5">{user?.email || '-'}</p>
                                <p className="text-xs text-gray-400">Email cannot be changed</p>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <Phone className="size-4 inline mr-1" />
                                    Phone Number
                                </label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        disabled={isSaving}
                                    />
                                ) : (
                                    <p className="text-gray-900 py-2.5">{user?.phone || '-'}</p>
                                )}
                            </div>

                            {/* Date of Birth */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <Calendar className="size-4 inline mr-1" />
                                    Date of Birth
                                </label>
                                {isEditing ? (
                                    <input
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        disabled={isSaving}
                                    />
                                ) : (
                                    <p className="text-gray-900 py-2.5">{user?.dateOfBirth || '-'}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MembersProfilePage;