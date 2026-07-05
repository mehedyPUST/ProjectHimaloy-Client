// client/src/app/dashboard/manager/page.jsx
'use client';

import { useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

// ... imports

const ManagerDashBoardHomePage = () => {
    const { data: session } = useSession();
    const router = useRouter();
    const user = session?.user;
    const isManager = user?.isManager || user?.role === 'manager';

    useEffect(() => {
        if (user && !isManager) {
            router.push('/dashboard/member');
        }
    }, [user, isManager, router]);

    if (!isManager) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900">You are not currently the Manager</h2>
                    <p className="text-gray-500 mt-2">Go to your member dashboard</p>
                    <button onClick={() => router.push('/dashboard/member')}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl">
                        Go to Member Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // ... rest of manager dashboard
};
