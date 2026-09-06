'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import {
    collection,
    getDocs,
} from 'firebase/firestore';

import {
    Search,
    Users,
    Mail,
    Phone,
    ShoppingBag,
    ArrowLeft,
    ArrowRight,
} from 'lucide-react';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AdminGuard from '@/components/admin/AdminGuard';

import { db } from '@/lib/firebase';


// ==========================================
// TYPES
// ==========================================

type Customer = {
    uid: string;
    name: string;
    email: string;
    phone: string;
    orderCount: number;
    totalSpent: number;
};


// ==========================================
// PAGE
// ==========================================

export default function AdminCustomersPage() {

    const [customers, setCustomers] =
        useState<Customer[]>([]);

    const [search, setSearch] =
        useState('');

    const [loading, setLoading] =
        useState(true);


    // ==========================================
    // LOAD CUSTOMERS
    // ==========================================

    useEffect(() => {

        async function loadCustomers() {

            try {

                setLoading(true);


                // ==============================
                // USERS
                // ==============================

                const usersSnapshot =
                    await getDocs(
                        collection(db, 'users')
                    );


                const users = usersSnapshot.docs.map(
                    (document) => {

                        const data =
                            document.data();

                        return {
                            uid: document.id,

                            name:
                                data.name ||
                                'Pearlvera Customer',

                            email:
                                data.email ||
                                '',

                            phone:
                                data.phone ||
                                '',
                        };

                    }
                );


                // ==============================
                // ORDERS
                // ==============================

                const ordersSnapshot =
                    await getDocs(
                        collection(db, 'orders')
                    );


                const orderStats: Record<
                    string,
                    {
                        count: number;
                        spent: number;
                    }
                > = {};


                ordersSnapshot.docs.forEach(
                    (document) => {

                        const data =
                            document.data();

                        const userId =
                            data.userId;

                        if (!userId) {
                            return;
                        }


                        if (!orderStats[userId]) {

                            orderStats[userId] = {
                                count: 0,
                                spent: 0,
                            };

                        }


                        // Don't count cancelled orders

                        const isCancelled =
                            data.status
                                ?.toLowerCase()
                                .trim() ===
                            'cancelled';


                        if (!isCancelled) {

                            orderStats[userId].count += 1;

                            orderStats[userId].spent +=
                                Number(
                                    data.total || 0
                                );

                        }

                    }
                );


                // ==============================
                // COMBINE DATA
                // ==============================

                const loadedCustomers:
                    Customer[] =
                    users.map(
                        (user) => ({

                            uid:
                                user.uid,

                            name:
                                user.name,

                            email:
                                user.email,

                            phone:
                                user.phone,

                            orderCount:
                                orderStats[
                                    user.uid
                                ]?.count || 0,

                            totalSpent:
                                orderStats[
                                    user.uid
                                ]?.spent || 0,

                        })
                    );


                // Highest spending first

                loadedCustomers.sort(
                    (a, b) =>
                        b.totalSpent -
                        a.totalSpent
                );


                setCustomers(
                    loadedCustomers
                );

            } catch (error) {

                console.error(
                    'Failed to load customers:',
                    error
                );

            } finally {

                setLoading(false);

            }

        }


        loadCustomers();

    }, []);


    // ==========================================
    // FILTER
    // ==========================================

    const filteredCustomers =
        useMemo(() => {

            const query =
                search
                    .toLowerCase()
                    .trim();


            if (!query) {
                return customers;
            }


            return customers.filter(
                (customer) =>

                    customer.name
                        .toLowerCase()
                        .includes(query) ||

                    customer.email
                        .toLowerCase()
                        .includes(query) ||

                    customer.phone
                        .toLowerCase()
                        .includes(query)

            );

        }, [
            customers,
            search,
        ]);


    // ==========================================
    // TOTALS
    // ==========================================

    const totalCustomers =
        customers.length;


    const activeCustomers =
        customers.filter(
            (customer) =>
                customer.orderCount > 0
        ).length;


    const totalCustomerSpend =
        customers.reduce(
            (total, customer) =>
                total +
                customer.totalSpent,
            0
        );


    // ==========================================
    // RENDER
    // ==========================================

    return (

        <AdminGuard>

            <Navbar />


            <main className="min-h-screen bg-[#FAF8F5]">


                {/* ==================================
                    HEADER
                ================================== */}

                <section className="border-b border-stone-200 bg-white">

                    <div className="mx-auto max-w-7xl px-6 py-14">

                        <Link
                            href="/admin"
                            className="inline-flex items-center gap-2 text-sm text-stone-500 transition hover:text-stone-900"
                        >

                            <ArrowLeft
                                size={16}
                            />

                            Back to Dashboard

                        </Link>


                        <p className="mt-8 text-xs uppercase tracking-[0.35em] text-stone-400">
                            Pearlvera
                        </p>


                        <h1
                            className="mt-3 text-5xl text-stone-900"
                            style={{
                                fontFamily:
                                    'var(--font-playfair)',
                            }}
                        >
                            Customers
                        </h1>


                        <p className="mt-4 max-w-xl text-stone-500">
                            View and manage your Pearlvera customers.
                        </p>

                    </div>

                </section>


                {/* ==================================
                    CONTENT
                ================================== */}

                <section className="mx-auto max-w-7xl px-6 py-12">


                    {/* ==================================
                        STATS
                    ================================== */}

                    <div className="grid gap-5 md:grid-cols-3">


                        <CustomerStat
                            icon={
                                <Users
                                    size={22}
                                />
                            }
                            title="Total Customers"
                            value={
                                loading
                                    ? '...'
                                    : totalCustomers.toString()
                            }
                        />


                        <CustomerStat
                            icon={
                                <ShoppingBag
                                    size={22}
                                />
                            }
                            title="Customers With Orders"
                            value={
                                loading
                                    ? '...'
                                    : activeCustomers.toString()
                            }
                        />


                        <CustomerStat
                            icon={
                                <span className="text-xl font-semibold">
                                    ₹
                                </span>
                            }
                            title="Customer Spending"
                            value={
                                loading
                                    ? '...'
                                    : `₹ ${totalCustomerSpend.toLocaleString(
                                        'en-IN'
                                    )}`
                            }
                        />

                    </div>


                    {/* ==================================
                        SEARCH
                    ================================== */}

                    <div className="mt-10">

                        <div className="relative">

                            <Search
                                size={19}
                                className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400"
                            />


                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                                placeholder="Search customers by name, email or phone..."
                                className="w-full rounded-full border border-stone-200 bg-white py-4 pl-13 pr-5 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-400"
                            />

                        </div>

                    </div>


                    {/* ==================================
                        CUSTOMER LIST
                    ================================== */}

                    <div className="mt-7 overflow-hidden rounded-[30px] border border-stone-200 bg-white shadow-sm">


                        {loading ? (

                            <div className="p-16 text-center">

                                <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-stone-200 border-t-stone-900" />

                                <p className="mt-4 text-sm text-stone-500">
                                    Loading customers...
                                </p>

                            </div>

                        ) : filteredCustomers.length === 0 ? (

                            <div className="p-16 text-center">

                                <Users
                                    size={38}
                                    className="mx-auto text-stone-300"
                                />


                                <h2 className="mt-5 text-xl font-semibold text-stone-900">
                                    No customers found
                                </h2>


                                <p className="mt-2 text-sm text-stone-500">
                                    Try a different search.
                                </p>

                            </div>

                        ) : (

                            <div className="divide-y divide-stone-100">

                                {filteredCustomers.map(
                                    (customer) => (

                                        <div
                                            key={customer.uid}
                                            className="flex flex-col gap-6 px-6 py-6 transition hover:bg-stone-50 lg:flex-row lg:items-center lg:px-8"
                                        >

                                            {/* CUSTOMER */}

                                            <div className="flex min-w-0 flex-1 items-center gap-5">

                                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-stone-900 text-lg font-semibold text-white">

                                                    {getInitial(
                                                        customer.name
                                                    )}

                                                </div>


                                                <div className="min-w-0">

                                                    <h3 className="truncate text-lg font-semibold text-stone-900">
                                                        {customer.name}
                                                    </h3>


                                                    <div className="mt-2 flex flex-col gap-1 text-sm text-stone-500 sm:flex-row sm:gap-5">

                                                        <span className="flex items-center gap-2">
                                                            <Mail
                                                                size={14}
                                                            />

                                                            {customer.email ||
                                                                'No email'}
                                                        </span>


                                                        {customer.phone && (

                                                            <span className="flex items-center gap-2">

                                                                <Phone
                                                                    size={14}
                                                                />

                                                                {customer.phone}

                                                            </span>

                                                        )}

                                                    </div>

                                                </div>

                                            </div>


                                            {/* ORDERS */}

                                            <div className="flex items-center gap-10">

                                                <div>

                                                    <p className="text-xs uppercase tracking-[0.15em] text-stone-400">
                                                        Orders
                                                    </p>


                                                    <p className="mt-1 text-lg font-semibold text-stone-900">
                                                        {customer.orderCount}
                                                    </p>

                                                </div>


                                                <div>

                                                    <p className="text-xs uppercase tracking-[0.15em] text-stone-400">
                                                        Spent
                                                    </p>


                                                    <p className="mt-1 text-lg font-semibold text-stone-900">

                                                        ₹{' '}

                                                        {customer.totalSpent.toLocaleString(
                                                            'en-IN'
                                                        )}

                                                    </p>

                                                </div>


                                                <Link
                                                    href={`/admin/customers/${customer.uid}`}
                                                    className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 text-stone-500 transition hover:bg-stone-900 hover:text-white"
                                                    title="View customer"
                                                >

                                                    <ArrowRight
                                                        size={17}
                                                    />

                                                </Link>

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        )}

                    </div>

                </section>

            </main>


            <Footer />

        </AdminGuard>

    );

}


// ==========================================
// CUSTOMER STAT
// ==========================================

function CustomerStat({
    icon,
    title,
    value,
}: {
    icon: React.ReactNode;
    title: string;
    value: string;
}) {

    return (

        <div className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-100 text-stone-700">

                {icon}

            </div>


            <p className="mt-5 text-sm text-stone-500">
                {title}
            </p>


            <p className="mt-1 text-3xl font-semibold text-stone-900">
                {value}
            </p>

        </div>

    );

}


// ==========================================
// INITIAL
// ==========================================

function getInitial(
    name: string
) {

    return (
        name
            .trim()
            .charAt(0)
            .toUpperCase() ||
        'C'
    );

}