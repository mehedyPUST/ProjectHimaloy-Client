// client/src/app/dashboard/page.jsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';

export default function DashboardRedirect() {
    const router = useRouter();
    const { data: session, isPending } = useSession();

    useEffect(() => {
        if (isPending) return;

        if (!session?.user) {
            router.push('/login');
            return;
        }

        const role = session.user.role?.toLowerCase() || 'member';

        // Role-based redirect
        if (role === 'admin') {
            router.push('/dashboard/admin');
        } else if (role === 'manager') {
            router.push('/dashboard/manager');
        } else {
            router.push('/dashboard/member');
        }
    }, [session, isPending, router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Redirecting to your dashboard...</p>
            </div>
        </div>
    );
}