// client/src/components/dashboard/DashboardNavbar.jsx
'use client';

import { useState } from 'react';
import { Menu, Home, LogOut, ChevronDown, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import toast from 'react-hot-toast';

export default function DashboardNavbar({ onMenuClick, user, isMobile, isSidebarOpen }) {
    const router = useRouter();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        if (isLoggingOut) return;

        setIsLoggingOut(true);
        try {
            await authClient.signOut();
            toast.success('Logged out successfully');
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Failed to logout');
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 h-16 flex-shrink-0">
            <div className="flex items-center justify-between px-4 md:px-6 h-full">

                {/* Left - Menu Button */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={onMenuClick}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
                        aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
                    >
                        {isSidebarOpen ? (
                            <X className="size-5 text-gray-700" />
                        ) : (
                            <Menu className="size-5 text-gray-700" />
                        )}
                    </button>

                    <h2 className="text-lg font-semibold text-gray-800 hidden md:block">
                        Dashboard
                    </h2>
                </div>

                {/* Right - Home + User Profile */}
                <div className="flex items-center gap-2 md:gap-4">
                    {/* Home Button */}
                    <Link
                        href="/"
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative group"
                        title="Go to Home"
                    >
                        <Home className="size-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                    </Link>

                    {/* User Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                            disabled={isLoggingOut}
                        >
                            {user?.image ? (
                                <img
                                    src={user.image}
                                    alt={user.name || 'User'}
                                    className="w-8 h-8 rounded-full object-cover border-2 border-blue-500"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.style.display = 'none';
                                        e.target.parentElement.innerHTML = `
                                            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold text-sm">
                                                ${user?.name?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                        `;
                                    }}
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold text-sm">
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                            )}

                            <span className="hidden md:block text-sm font-medium text-gray-700">
                                {user?.name || 'User'}
                            </span>
                            <ChevronDown className="hidden md:block size-4 text-gray-500" />
                        </button>

                        {/* Dropdown */}
                        {isDropdownOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setIsDropdownOpen(false)}
                                />
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-50 py-1">
                                    {/* User Info */}
                                    <div className="px-4 py-3 border-b border-gray-200">
                                        <div className="flex items-center gap-3">
                                            {user?.image ? (
                                                <img
                                                    src={user.image}
                                                    alt={user.name || 'User'}
                                                    className="w-8 h-8 rounded-full object-cover border-2 border-blue-500"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.style.display = 'none';
                                                        e.target.parentElement.innerHTML = `
                                                            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold text-sm">
                                                                ${user?.name?.charAt(0).toUpperCase() || 'U'}
                                                            </div>
                                                        `;
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold text-sm">
                                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {user?.name}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {user?.email}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Logout */}
                                    <button
                                        onClick={() => {
                                            setIsDropdownOpen(false);
                                            handleLogout();
                                        }}
                                        disabled={isLoggingOut}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoggingOut ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent"></div>
                                                Logging out...
                                            </>
                                        ) : (
                                            <>
                                                <LogOut className="size-4" />
                                                Logout
                                            </>
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}