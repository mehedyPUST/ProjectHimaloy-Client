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

    const publicLinks = [
        { href: "/", label: "Timeline" },
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
                        {publicLinks.map((link) => (
                            <Link key={link.href} href={link.href}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    pathname === link.href ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100"
                                }`}>
                                {link.label}
                            </Link>
                        ))}

                        {isLoggedIn && (
                            <Link href="/dashboard"
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    pathname?.startsWith('/dashboard') ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100"
                                }`}>
                                Dashboard
                            </Link>
                        )}
                    </div>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center gap-2">
                        {isPending ? (
                            <div className="w-20 h-8 rounded-md bg-gray-100 animate-pulse" />
                        ) : isLoggedIn ? (
                            <button onClick={handleLogout}
                                className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors">
                                Logout
                            </button>
                        ) : (
                            <>
                                <Link href="/login"
                                    className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors">Login</Link>
                                <Link href="/register"
                                    className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">Register</Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100">
                        {isMenuOpen ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        )}
                    </button>
                </div>

                {/* Mobile Nav */}
                {isMenuOpen && (
                    <div className="md:hidden border-t border-gray-200 pb-3">
                        {publicLinks.map((link) => (
                            <Link key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)}
                                className={`block px-3 py-2 rounded-md text-base font-medium ${
                                    pathname === link.href ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100"
                                }`}>{link.label}</Link>
                        ))}
                        {isLoggedIn && (
                            <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}
                                className={`block px-3 py-2 rounded-md text-base font-medium ${
                                    pathname?.startsWith('/dashboard') ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100"
                                }`}>Dashboard</Link>
                        )}
                        <div className="border-t border-gray-200 mt-2 pt-2">
                            {isLoggedIn ? (
                                <button onClick={handleLogout}
                                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50">Logout</button>
                            ) : (
                                <>
                                    <Link href="/login" onClick={() => setIsMenuOpen(false)}
                                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-100">Login</Link>
                                    <Link href="/register" onClick={() => setIsMenuOpen(false)}
                                        className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:bg-blue-50">Register</Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
