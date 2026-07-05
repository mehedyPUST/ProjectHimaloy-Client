// client/src/components/dashboard/DashboardSidebar.jsx
'use client';

import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, LogOut, Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Wallet,
    HandCoins,
    Vote,
    Clock,
    Users,
    Settings,
    User,
    Bell,
} from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";

export default function DashboardSidebar({ isOpen, setIsOpen, isMobile }) {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session } = useSession();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const user = session?.user;
    const userRole = user?.role?.toLowerCase() || 'member';
    const isManager = user?.isManager === true;

    const handleLogout = async () => {
        if (isLoggingOut) return;
        try {
            setIsLoggingOut(true);
            await signOut();
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    // Member Links
    const memberLinks = [
        { icon: LayoutDashboard, href: '/dashboard/member', label: "Dashboard" },
        { icon: Wallet, href: '/dashboard/member/deposits', label: "Deposits" },
        { icon: HandCoins, href: '/dashboard/member/my-loans', label: "My Loans" },
        { icon: Vote, href: '/dashboard/member/votings', label: "Voting" },
        { icon: Clock, href: '/dashboard/member/history', label: "History" },
        { icon: User, href: '/dashboard/member/profile', label: "Profile" },
    ];

    // Manager Links (with Personal section)
    const managerLinks = [
        { section: 'Manager' },
        { icon: LayoutDashboard, href: '/dashboard/manager', label: "Dashboard" },
        { icon: Wallet, href: '/dashboard/manager/deposits', label: "Deposits" },
        { icon: HandCoins, href: '/dashboard/manager/loans', label: "Loan Requests" },
        { icon: Vote, href: '/dashboard/manager/votings', label: "Voting" },
        { icon: Bell, href: '/dashboard/manager/meetings', label: "Meetings" },
        { section: 'Personal' },
        { icon: Wallet, href: '/dashboard/member/deposits', label: "My Deposits" },
        { icon: HandCoins, href: '/dashboard/member/my-loans', label: "My Loans" },
        { icon: Vote, href: '/dashboard/member/votings', label: "Vote" },
        { icon: Clock, href: '/dashboard/member/history', label: "My History" },
        { icon: User, href: '/dashboard/manager/profile', label: "Profile" },
    ];

    // Admin Links
    const adminLinks = [
        { icon: LayoutDashboard, href: '/dashboard/admin', label: "Dashboard" },
        { icon: Users, href: '/dashboard/admin/members', label: "Members" },
        { icon: Settings, href: '/dashboard/admin/managers', label: "Managers" },
        { icon: Clock, href: '/dashboard/admin/all-history', label: "All History" },
        { icon: Settings, href: '/dashboard/admin/settings', label: "Settings" },
    ];

    // ✅ Nav items based on role AND isManager
    const navItems = 
        userRole === 'admin' ? adminLinks :
        isManager ? managerLinks :  // ✅ Check isManager for manager
        memberLinks;

    // Sidebar Content
    const SidebarContent = () => (
        <>
            {/* Header */}
            <div className={`h-16 flex items-center px-4 border-b border-gray-200 ${isCollapsed ? 'justify-center' : ''}`}>
                <Link href="/" className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                    {!isCollapsed ? (
                        <>
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
                                <Home className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">
                                Project<span className="text-blue-600">Himaloy</span>
                            </span>
                        </>
                    ) : (
                        <span className="text-xl font-bold text-blue-600">PH</span>
                    )}
                </Link>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto p-3">
                <nav className="space-y-1">
                    {navItems.map((item, index) => {
                        // Section divider
                        if (item.section) {
                            if (isCollapsed) return null;
                            return (
                                <div key={`section-${index}`} className="pt-3 pb-1 first:pt-0">
                                    <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        {item.section}
                                    </p>
                                </div>
                            );
                        }

                        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                        return (
                            <Link
                                href={item.href}
                                key={item.label}
                                onClick={() => { if (isMobile) setIsOpen(false); }}
                                className={`
                                    flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200
                                    ${isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}
                                    ${isCollapsed ? 'justify-center px-2' : ''}
                                    group relative
                                `}
                            >
                                <item.icon className={`size-5 shrink-0 ${isActive ? 'text-blue-600' : ''}`} />
                                {!isCollapsed && <span className="truncate">{item.label}</span>}
                                {isCollapsed && (
                                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                        {item.label}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Collapse + Logout */}
            <div className="p-3 border-t border-gray-200 space-y-2">
                {!isMobile && (
                    <button onClick={() => setIsCollapsed(!isCollapsed)}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors text-sm">
                        {isCollapsed ? <ChevronRight className="size-4" /> : <><ChevronLeft className="size-4" /><span>Collapse</span></>}
                    </button>
                )}
                <button onClick={handleLogout} disabled={isLoggingOut}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isLoggingOut ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:bg-red-50'
                    } ${isCollapsed ? 'justify-center' : ''}`}>
                    {isLoggingOut ? (
                        <><div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent"></div>{!isCollapsed && <span>Logging out...</span>}</>
                    ) : (
                        <><LogOut className="size-4" />{!isCollapsed && <span>Logout</span>}</>
                    )}
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className={`hidden lg:flex flex-col h-screen sticky top-0 border-r border-gray-200 bg-white transition-all duration-300 shrink-0 ${isCollapsed ? 'w-16' : 'w-64'}`}>
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar */}
            {isMobile && isOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-0 left-0 h-full w-72 bg-white shadow-2xl">
                        <div className="flex flex-col h-full">
                            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
                                <Link href="/" className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                                        <Home className="w-4 h-4 text-white" /></div>
                                    <span className="text-xl font-bold text-gray-900">Project<span className="text-blue-600">Himaloy</span></span>
                                </Link>
                                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X className="size-5 text-gray-700" /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-3">
                                <nav className="space-y-1">
                                    {navItems.map((item, index) => {
                                        if (item.section) {
                                            return (
                                                <div key={`section-${index}`} className="pt-3 pb-1 first:pt-0">
                                                    <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{item.section}</p>
                                                </div>
                                            );
                                        }
                                        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                                        return (
                                            <Link href={item.href} key={item.label} onClick={() => setIsOpen(false)}
                                                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                                                    isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'
                                                }`}>
                                                <item.icon className={`size-5 shrink-0 ${isActive ? 'text-blue-600' : ''}`} />
                                                <span>{item.label}</span>
                                            </Link>
                                        );
                                    })}
                                </nav>
                            </div>
                            <div className="p-4 border-t border-gray-200">
                                <button onClick={handleLogout} disabled={isLoggingOut}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                                        isLoggingOut ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:bg-red-50'
                                    }`}>
                                    {isLoggingOut ? (
                                        <><div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent"></div><span>Logging out...</span></>
                                    ) : (
                                        <><LogOut className="size-5" /><span>Logout</span></>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
