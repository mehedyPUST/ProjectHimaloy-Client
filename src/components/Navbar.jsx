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
    const isManager = user?.isManager === true;
    const isAdmin = user?.role === "admin";

    if (pathname?.startsWith("/dashboard")) {
        return null;
    }

    const publicLinks = [{ href: "/", label: "Timeline" }];

    const handleLogout = async () => {
        await signOut();
        router.push("/");
        setIsMenuOpen(false);
    };

    const linkClass = (path) =>
        `px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === path || pathname?.startsWith(path)
            ? "bg-emerald-50 text-emerald-600"
            : "text-gray-600 hover:bg-gray-100"
        }`;

    return (
        <nav className="bg-white border-b border-emerald-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <Link href="/" className="shrink-0">
                        <span className="font-bold text-xl text-emerald-600">
                            ProjectHimaloy
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-1">
                        {publicLinks.map((link) => (
                            <Link key={link.href} href={link.href} className={linkClass(link.href)}>
                                {link.label}
                            </Link>
                        ))}
                        {isLoggedIn && !isAdmin && (
                            <Link href="/dashboard" className={linkClass("/dashboard")}>
                                Dashboard
                            </Link>
                        )}
                        {isLoggedIn && isAdmin && (
                            <Link href="/dashboard/admin" className={linkClass("/dashboard/admin")}>
                                Admin Panel
                            </Link>
                        )}
                        {isLoggedIn && isManager && (
                            <Link href="/dashboard/manager" className={linkClass("/dashboard/manager")}>
                                Manager
                            </Link>
                        )}
                    </div>

                    <div className="hidden md:flex items-center gap-2">
                        {isPending ? (
                            <div className="w-20 h-8 rounded-md bg-gray-100 animate-pulse" />
                        ) : isLoggedIn ? (
                            <button
                                onClick={handleLogout}
                                className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            >
                                Logout
                            </button>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-4 py-1.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>

                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
                    >
                        {isMenuOpen ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                </div>

                {isMenuOpen && (
                    <div className="md:hidden border-t border-emerald-200 pb-3">
                        {publicLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsMenuOpen(false)}
                                className={`block px-3 py-2 rounded-md text-base font-medium ${linkClass(link.href)}`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        {isLoggedIn && !isAdmin && (
                            <Link
                                href="/dashboard"
                                onClick={() => setIsMenuOpen(false)}
                                className={`block px-3 py-2 rounded-md text-base font-medium ${linkClass("/dashboard")}`}
                            >
                                Dashboard
                            </Link>
                        )}
                        {isLoggedIn && isAdmin && (
                            <Link
                                href="/dashboard/admin"
                                onClick={() => setIsMenuOpen(false)}
                                className={`block px-3 py-2 rounded-md text-base font-medium ${linkClass("/dashboard/admin")}`}
                            >
                                Admin Panel
                            </Link>
                        )}
                        {isLoggedIn && isManager && (
                            <Link
                                href="/dashboard/manager"
                                onClick={() => setIsMenuOpen(false)}
                                className={`block px-3 py-2 rounded-md text-base font-medium ${linkClass("/dashboard/manager")}`}
                            >
                                Manager
                            </Link>
                        )}
                        <div className="border-t border-emerald-200 mt-2 pt-2">
                            {isLoggedIn ? (
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                                >
                                    Logout
                                </button>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-100"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/register"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="block px-3 py-2 rounded-md text-base font-medium text-emerald-600 hover:bg-emerald-50"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}