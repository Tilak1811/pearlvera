'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/context/AuthContext';
import { isAdminEmail } from '@/lib/admin';

export default function AdminGuard({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();

    const {
        user,
        loading,
    } = useAuth();

    useEffect(() => {
        if (loading) return;

        if (!user) {
            router.replace('/login');
            return;
        }

        if (!isAdminEmail(user.email)) {
            router.replace('/');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#FAF8F5]">

                <div className="text-center">

                    <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900" />

                    <p className="mt-4 text-sm text-stone-500">
                        Verifying administrator access...
                    </p>

                </div>

            </div>
        );
    }

    if (!isAdminEmail(user.email)) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#FAF8F5] px-6">

                <div className="max-w-md rounded-[32px] border border-stone-200 bg-white p-10 text-center shadow-sm">

                    <div className="text-4xl">
                        🔒
                    </div>

                    <h1
                        className="mt-5 text-3xl text-stone-900"
                        style={{
                            fontFamily:
                                'var(--font-playfair)',
                        }}
                    >
                        Access Restricted
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-stone-500">
                        This area is available only to
                        Pearlvera administrators.
                    </p>

                </div>

            </div>
        );
    }

    return <>{children}</>;
}