'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signOut } from 'firebase/auth';

import {
    User,
    Package,
    Heart,
    MapPin,
    LogOut,
    ChevronRight,
} from 'lucide-react';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';


export default function AccountPage() {

    const router = useRouter();

    const {
        user,
        loading,
    } = useAuth();


    // ==========================================
    // PROTECT ACCOUNT PAGE
    // ==========================================

    useEffect(() => {

        if (!loading && !user) {
            router.replace('/login');
        }

    }, [user, loading, router]);


    // ==========================================
    // LOGOUT
    // ==========================================

    async function handleLogout() {

        try {

            await signOut(auth);

            router.replace('/');

        } catch (error) {

            console.error(
                'Logout failed:',
                error
            );

            alert(
                'Unable to logout. Please try again.'
            );

        }

    }


    // ==========================================
    // LOADING
    // ==========================================

    if (loading || !user) {

        return (

            <div className="flex min-h-screen items-center justify-center bg-[#FAF8F5]">

                <div className="text-center">

                    <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900" />

                    <p className="mt-4 text-sm text-stone-500">
                        Loading account...
                    </p>

                </div>

            </div>

        );

    }


    // ==========================================
    // DISPLAY NAME
    // ==========================================

    const customerName =
        user.displayName?.trim() ||
        'Pearlvera Customer';


    return (

        <>
            <Navbar />


            <main className="min-h-screen bg-[#FAF8F5]">


                {/* ==================================
                    HEADER
                ================================== */}

                <section className="border-b border-stone-200 bg-white">

                    <div className="mx-auto max-w-6xl px-6 py-14">

                        <p className="text-xs uppercase tracking-[0.35em] text-stone-500">
                            Pearlvera
                        </p>


                        <h1
                            className="mt-3 text-5xl text-stone-900"
                            style={{
                                fontFamily:
                                    'var(--font-playfair)',
                            }}
                        >
                            My Account
                        </h1>


                        <p className="mt-4 text-stone-500">

                            Welcome back,{' '}

                            <span className="font-medium text-stone-800">
                                {user.displayName ||
                                    user.email ||
                                    'Customer'}
                            </span>

                        </p>

                    </div>

                </section>


                {/* ==================================
                    ACCOUNT CONTENT
                ================================== */}

                <section className="mx-auto max-w-6xl px-6 py-14">


                    {/* ==================================
                        PROFILE CARD
                    ================================== */}

                    <div className="rounded-[32px] border border-stone-200 bg-white p-8 shadow-sm">

                        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">


                            {/* Avatar */}

                            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-stone-900 text-white">

                                <User size={32} />

                            </div>


                            {/* User Info */}

                            <div className="min-w-0 flex-1">

                                <p className="text-xs uppercase tracking-[0.25em] text-stone-400">
                                    Signed in as
                                </p>


                                <h2 className="mt-2 text-2xl font-medium text-stone-900">
                                    {customerName}
                                </h2>


                                <p className="mt-1 break-all text-stone-500">
                                    {user.email}
                                </p>

                            </div>


                            {/* Edit Profile */}

                            <Link
                                href="/profile"
                                className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-300 px-6 py-3 text-sm font-medium text-stone-900 transition hover:border-stone-900 hover:bg-stone-900 hover:text-white"
                            >

                                Edit Profile

                                <ChevronRight size={16} />

                            </Link>

                        </div>

                    </div>


                    {/* ==================================
                        ACCOUNT OPTIONS
                    ================================== */}

                    <div className="mt-8 grid gap-6 sm:grid-cols-2">


                        <AccountCard
                            href="/orders"
                            icon={
                                <Package size={23} />
                            }
                            title="My Orders"
                            description="View your orders and track deliveries."
                        />


                        <AccountCard
                            href="/wishlist"
                            icon={
                                <Heart size={23} />
                            }
                            title="Wishlist"
                            description="View the Pearlvera pieces you've saved."
                        />


                        <AccountCard
                            href="/account/address"
                            icon={
                                <MapPin size={23} />
                            }
                            title="Saved Address"
                            description="Manage your delivery address."
                        />


                        <AccountCard
                            href="/profile"
                            icon={
                                <User size={23} />
                            }
                            title="Profile"
                            description="Manage your personal information."
                        />


                    </div>


                    {/* ==================================
                        LOGOUT
                    ================================== */}

                    <div className="mt-8 rounded-[28px] border border-red-100 bg-white p-6">

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="inline-flex items-center gap-3 rounded-full border border-red-200 px-6 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
                        >

                            <LogOut size={18} />

                            Logout

                        </button>

                    </div>


                </section>

            </main>


            <Footer />

        </>

    );

}


// ==========================================
// ACCOUNT CARD
// ==========================================

function AccountCard({
    href,
    icon,
    title,
    description,
}: {
    href: string;
    icon: React.ReactNode;
    title: string;
    description: string;
}) {

    return (

        <Link
            href={href}
            className="group rounded-[28px] border border-stone-200 bg-white p-7 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-stone-300 hover:shadow-md"
        >

            <div className="flex items-start gap-5">


                {/* Icon */}

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-800 transition group-hover:bg-stone-900 group-hover:text-white">

                    {icon}

                </div>


                {/* Content */}

                <div className="min-w-0 flex-1">

                    <div className="flex items-center justify-between gap-4">

                        <h2 className="text-xl font-medium text-stone-900">
                            {title}
                        </h2>


                        <ChevronRight
                            size={18}
                            className="shrink-0 text-stone-400 transition group-hover:translate-x-1 group-hover:text-stone-900"
                        />

                    </div>


                    <p className="mt-2 text-sm leading-6 text-stone-500">
                        {description}
                    </p>

                </div>

            </div>

        </Link>

    );

}