// client/src/components/Footer.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Wallet, Mail, Heart } from 'lucide-react';

const quickLinks = [
    { href: "/", label: "Home" },
    { href: "/login", label: "Sign In" },
    { href: "/register", label: "Join Now" },
];

const supportLinks = [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/contact", label: "Contact" },
];

const Footer = () => {
    const [currentYear, setCurrentYear] = useState(null);
    const pathname = usePathname();

    useEffect(() => {
        setCurrentYear(new Date().getFullYear());
    }, []);

    // ✅ Hide footer on ALL dashboard pages and auth pages
    if (pathname?.includes("dashboard") || pathname?.includes("login") || pathname?.includes("register")) {
        return null;
    }

    return (
        <footer className="bg-white border-t border-gray-200 mt-auto">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Brand */}
                    <div className="space-y-4">
                        <Link href="/" className="inline-flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                                <Wallet className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-xl text-gray-900">
                                Project<span className="text-blue-600">Himaloy</span>
                            </span>
                        </Link>
                        <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                            A democratic, interest-free cooperative fund management system for groups and communities.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            {quickLinks.map(({ href, label }) => (
                                <li key={href}>
                                    <Link href={href} className="text-sm text-gray-600 hover:text-blue-600 transition-colors">{label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Support</h3>
                        <ul className="space-y-2">
                            {supportLinks.map(({ href, label }) => (
                                <li key={href}>
                                    <Link href={href} className="text-sm text-gray-600 hover:text-blue-600 transition-colors">{label}</Link>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-4 space-y-2">
                            <a href="mailto:admin.project.himaloy@gmail.com" className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors">
                                <Mail className="size-3.5" />
                                admin.project.himaloy@gmail.com
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-100 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
                    <p className="text-sm text-gray-400">
                        &copy; {currentYear || '2026'} ProjectHimaloy. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                        <Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-blue-600 transition-colors">Terms</Link>
                        <span className="flex items-center gap-1">
                            Made with <Heart className="size-3 text-red-500 fill-red-500" /> by Team Himaloy
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;