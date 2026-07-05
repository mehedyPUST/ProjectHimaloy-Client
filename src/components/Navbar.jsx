// client/src/components/shared/Navbar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { data: session, isPending } = useSession();

    const user = session?.user;
    const isLoggedIn = !!user;
    const isManager = user?.isManager || user?.role === 'manager';
    const isAdmin = user?.role === 'admin';

    const publicLinks = [
        { href: "/", label: "Timeline" },
    ];

    const privateLinks = [
        { href: "/dashboard", label: "Dashboard" },
    ];

    const handleLogout = async () => {
        await signOut();
        router.push("/");
        setIsMenuOpen(false);
    };

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 shrink-0">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">PH</span>
                        </div>
                        <span className="font-bold text-xl text-blue-600 hidden sm:block">
                            ProjectHimaloy
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {/* Public Links */}
                        {publicLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    pathname === link.href
                                        ? "bg-blue-50 text-blue-600"
                                        : "text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}

                        {/* Private Links (Logged In) */}
                        {isLoggedIn && !isAdmin && privateLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    pathname === link.href
                                        ? "bg-blue-50 text-blue-600"
                                        : "text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}

                        {/* Admin Dashboard Link */}
                        {isLoggedIn && isAdmin && (
                            <Link
                                href="/dashboard/admin"
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    pathname?.startsWith('/dashboard/admin')
                                        ? "bg-red-50 text-red-600"
                                        : "text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                Dashboard
                            </Link>
                        )}

                        {/* Manager Dashboard Link - Only for isManager, NOT admin */}
                        {isLoggedIn && isManager && !isAdmin && (
                            <Link
                                href="/dashboard/manager"
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    pathname?.startsWith('/dashboard/manager')
                                        ? "bg-purple-50 text-purple-600"
                                        : "text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                Manager Dashboard
                            </Link>
                        )}
                    </div>

                    {/* Auth Buttons - Desktop */}
                    <div className="hidden md:flex items-center gap-2">
                        {isPending ? (
                            <
