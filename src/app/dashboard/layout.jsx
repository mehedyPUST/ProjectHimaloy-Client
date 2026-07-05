// client/src/app/dashboard/layout.jsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardNavbar from '@/components/dashboard/DashboardNavbar';


export default function DashboardLayout({ children }) {
    const { data: session, isPending } = useSession();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Redirect if not logged in
    useEffect(() => {
        if (!isPending && !session) {
            router.push('/login');
        }
    }, [isPending, session, router]);

    // Handle responsive sidebar
    useEffect(() => {
        const checkScreen = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (window.innerWidth >= 1024) {
                setSidebarOpen(true);
            } else {
                setSidebarOpen(false);
            }
        };
        checkScreen();
        window.addEventListener('resize', checkScreen);
        return () => window.removeEventListener('resize', checkScreen);
    }, []);

    // Loading state
    if (isPending) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    // Not authenticated
    if (!session) {
        return null;
    }

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <DashboardSidebar
                isOpen={sidebarOpen}
                setIsOpen={setSidebarOpen}
                isMobile={isMobile}
            />
            <div className="flex-1 flex flex-col min-w-0">
                <DashboardNavbar
                    onMenuClick={() => setSidebarOpen(!sidebarOpen)}
                    user={session?.user}
                    isMobile={isMobile}
                    isSidebarOpen={sidebarOpen}
                />
                <main className="flex-1 overflow-y-auto p-3 md:p-4">
                    {children}
                </main>
            </div>
        </div>
    );
}