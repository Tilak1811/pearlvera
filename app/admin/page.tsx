'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import {
    collection,
    getDocs,
    onSnapshot,
} from 'firebase/firestore';

import {
    ShoppingBag,
    Package,
    Users,
    IndianRupee,
    ArrowRight,
    Clock3,
    Truck,
    CheckCircle2,
} from 'lucide-react';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AdminGuard from '@/components/admin/AdminGuard';

import { db } from '@/lib/firebase';
import { products } from '@/lib/products';


// ==========================================
// TYPES
// ==========================================

type AdminOrder = {
    id: string;

    customer?: {
        name?: string;
        email?: string;
        phone?: string;
    };

    total?: number;

    status?: string;

    paymentMethod?: string;

    createdAt?: {
        seconds?: number;
        nanoseconds?: number;
    };
};


// ==========================================
// PAGE
// ==========================================

export default function AdminPage() {

    const [orders, setOrders] =
        useState<AdminOrder[]>([]);

    const [customerCount, setCustomerCount] =
        useState(0);

    const [loading, setLoading] =
        useState(true);


    // ==========================================
    // LOAD DASHBOARD
    // ==========================================

    useEffect(() => {

        let unsubscribeOrders:
            (() => void) | null = null;


        async function loadCustomers() {

            try {

                const usersSnapshot =
                    await getDocs(
                        collection(db, 'users')
                    );

                setCustomerCount(
                    usersSnapshot.size
                );

            } catch (error) {

                console.error(
                    'Failed to load customers:',
                    error
                );

            }

        }


        function listenToOrders() {

            setLoading(true);


            unsubscribeOrders =
                onSnapshot(

                    collection(db, 'orders'),

                    (snapshot) => {

                        const loadedOrders:
                            AdminOrder[] =
                            snapshot.docs.map(
                                (document) => ({
                                    id: document.id,
                                    ...document.data(),
                                })
                            ) as AdminOrder[];


                        // Newest first

                        loadedOrders.sort(
                            (a, b) => {

                                const aTime =
                                    a.createdAt?.seconds ??
                                    0;

                                const bTime =
                                    b.createdAt?.seconds ??
                                    0;

                                return bTime - aTime;

                            }
                        );


                        setOrders(
                            loadedOrders
                        );

                        setLoading(false);

                    },

                    (error) => {

                        console.error(
                            'Failed to listen to orders:',
                            error
                        );

                        setLoading(false);

                    }
                );

        }


        loadCustomers();

        listenToOrders();


        return () => {

            if (unsubscribeOrders) {
                unsubscribeOrders();
            }

        };

    }, []);


    // ==========================================
    // STATISTICS
    // ==========================================

    const totalOrders =
        orders.length;


    const totalRevenue =
        orders.reduce(
            (total, order) => {

                if (
                    order.status
                        ?.toLowerCase()
                        .trim() === 'cancelled'
                ) {
                    return total;
                }

                return (
                    total +
                    (order.total ?? 0)
                );

            },
            0
        );


    const pendingOrders =
        orders.filter(
            (order) => {

                const status =
                    order.status
                        ?.toLowerCase()
                        .trim();

                return (
                    status === 'processing' ||
                    status === 'shipped' ||
                    status === 'out for delivery'
                );

            }
        ).length;


    const deliveredOrders =
        orders.filter(
            (order) =>
                order.status === 'Delivered'
        ).length;


    const totalProducts =
        products.length;


    const recentOrders =
        orders.slice(0, 5);


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

                        <p className="text-xs uppercase tracking-[0.35em] text-stone-400">
                            Pearlvera
                        </p>


                        <h1
                            className="mt-3 text-5xl text-stone-900"
                            style={{
                                fontFamily:
                                    'var(--font-playfair)',
                            }}
                        >
                            Admin Dashboard
                        </h1>


                        <p className="mt-4 text-stone-500">
                            Manage your Pearlvera store
                            from one place.
                        </p>

                    </div>

                </section>


                {/* ==================================
                    DASHBOARD
                ================================== */}

                <section className="mx-auto max-w-7xl px-6 py-12">


                    {/* ==================================
                        STATISTICS
                    ================================== */}

                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">


                        <StatCard
                            icon={
                                <ShoppingBag
                                    size={22}
                                />
                            }
                            title="Total Orders"
                            value={
                                loading
                                    ? '...'
                                    : totalOrders.toString()
                            }
                            description="All customer orders"
                        />


                        <StatCard
                            icon={
                                <IndianRupee
                                    size={22}
                                />
                            }
                            title="Revenue"
                            value={
                                loading
                                    ? '...'
                                    : `₹ ${totalRevenue.toLocaleString(
                                        'en-IN'
                                    )}`
                            }
                            description="Excluding cancelled"
                        />


                        <StatCard
                            icon={
                                <Users
                                    size={22}
                                />
                            }
                            title="Customers"
                            value={
                                loading
                                    ? '...'
                                    : customerCount.toString()
                            }
                            description="Registered customers"
                        />


                        <StatCard
                            icon={
                                <Package
                                    size={22}
                                />
                            }
                            title="Products"
                            value={
                                totalProducts.toString()
                            }
                            description="Current catalog"
                        />


                        <StatCard
                            icon={
                                <Truck
                                    size={22}
                                />
                            }
                            title="Pending Orders"
                            value={
                                loading
                                    ? '...'
                                    : pendingOrders.toString()
                            }
                            description="Orders in progress"
                        />

                    </div>


                    {/* ==================================
                        ORDER OVERVIEW
                    ================================== */}

                    <div className="mt-10 grid gap-5 sm:grid-cols-2">


                        <div className="rounded-[28px] border border-stone-200/70 bg-white p-6 shadow-sm">

                            <div className="flex items-center justify-between">

                                <div>

                                    <p className="text-sm text-stone-500">
                                        Delivered Orders
                                    </p>

                                    <p className="mt-2 text-3xl font-semibold text-stone-900">
                                        {loading
                                            ? '...'
                                            : deliveredOrders}
                                    </p>

                                </div>


                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-700">

                                    <CheckCircle2
                                        size={23}
                                    />

                                </div>

                            </div>

                        </div>


                        <div className="rounded-[28px] border border-stone-200/70 bg-white p-6 shadow-sm">

                            <div className="flex items-center justify-between">

                                <div>

                                    <p className="text-sm text-stone-500">
                                        Store Status
                                    </p>

                                    <p className="mt-2 text-xl font-semibold text-stone-900">
                                        Online
                                    </p>

                                </div>


                                <div className="flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-medium text-green-700">

                                    <span className="h-2 w-2 rounded-full bg-green-600" />

                                    Active

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* ==================================
                        STORE MANAGEMENT
                    ================================== */}

                    <div className="mt-14">

                        <p className="text-xs uppercase tracking-[0.3em] text-stone-400">
                            Store Management
                        </p>


                        <h2
                            className="mt-2 text-3xl text-stone-900"
                            style={{
                                fontFamily:
                                    'var(--font-playfair)',
                            }}
                        >
                            Manage Pearlvera
                        </h2>

                    </div>


                    <div className="mt-7 grid gap-6 md:grid-cols-3">


                        <AdminCard
                            href="/admin/orders"
                            icon={
                                <ShoppingBag
                                    size={24}
                                />
                            }
                            title="Orders"
                            description="View, manage and update customer orders."
                        />


                        <AdminCard
                            href="/admin/products"
                            icon={
                                <Package
                                    size={24}
                                />
                            }
                            title="Products"
                            description="Add, edit and manage your Pearlvera catalog."
                        />


                        <AdminCard
                            href="/admin/customers"
                            icon={
                                <Users
                                    size={24}
                                />
                            }
                            title="Customers"
                            description="View registered Pearlvera customers."
                        />

                    </div>


                    {/* ==================================
                        RECENT ORDERS
                    ================================== */}

                    <div className="mt-14">


                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                            <div>

                                <p className="text-xs uppercase tracking-[0.3em] text-stone-400">
                                    Latest Activity
                                </p>


                                <h2
                                    className="mt-2 text-3xl text-stone-900"
                                    style={{
                                        fontFamily:
                                            'var(--font-playfair)',
                                    }}
                                >
                                    Recent Orders
                                </h2>

                            </div>


                            <Link
                                href="/admin/orders"
                                className="inline-flex items-center gap-2 text-sm font-medium text-stone-700 transition hover:text-black"
                            >

                                View all orders

                                <ArrowRight
                                    size={16}
                                />

                            </Link>

                        </div>


                        <div className="mt-7 overflow-hidden rounded-[28px] border border-stone-200/70 bg-white shadow-sm">


                            {loading ? (

                                <div className="p-12 text-center">

                                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-stone-200 border-t-stone-900" />

                                    <p className="mt-4 text-sm text-stone-500">
                                        Loading dashboard...
                                    </p>

                                </div>

                            ) : recentOrders.length === 0 ? (

                                <div className="p-12 text-center">

                                    <Clock3
                                        size={32}
                                        className="mx-auto text-stone-400"
                                    />

                                    <h3 className="mt-4 text-lg font-semibold text-stone-900">
                                        No orders yet
                                    </h3>

                                    <p className="mt-2 text-sm text-stone-500">
                                        New customer orders will appear here.
                                    </p>

                                </div>

                            ) : (

                                <div className="divide-y divide-stone-100">

                                    {recentOrders.map(
                                        (order) => (

                                            <Link
                                                key={order.id}
                                                href="/admin/orders"
                                                className="flex flex-col gap-4 px-6 py-5 transition hover:bg-stone-50 md:flex-row md:items-center md:justify-between md:px-8"
                                            >

                                                {/* ORDER */}

                                                <div className="min-w-0">

                                                    <p className="font-mono text-xs text-stone-400">
                                                        #{order.id}
                                                    </p>


                                                    <h3 className="mt-1 truncate font-semibold text-stone-900">
                                                        {order.customer?.name ||
                                                            'Customer'}
                                                    </h3>


                                                    <p className="mt-1 text-sm text-stone-500">
                                                        {formatDate(
                                                            order.createdAt
                                                        )}
                                                    </p>

                                                </div>


                                                {/* STATUS + PRICE */}

                                                <div className="flex items-center gap-4">

                                                    <span
                                                        className={`rounded-full px-4 py-2 text-xs font-medium ${getStatusClass(
                                                            order.status
                                                        )}`}
                                                    >
                                                        {order.status ||
                                                            'Processing'}
                                                    </span>


                                                    <span className="text-lg font-semibold text-stone-900">

                                                        ₹{' '}

                                                        {(
                                                            order.total ??
                                                            0
                                                        ).toLocaleString(
                                                            'en-IN'
                                                        )}

                                                    </span>

                                                </div>

                                            </Link>

                                        )
                                    )}

                                </div>

                            )}

                        </div>

                    </div>


                </section>

            </main>


            <Footer />

        </AdminGuard>

    );

}


// ==========================================
// STAT CARD
// ==========================================

function StatCard({
    icon,
    title,
    value,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    value: string;
    description: string;
}) {

    return (

        <div className="rounded-[28px] border border-stone-200/70 bg-white p-6 shadow-sm">

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-100 text-stone-700">
                {icon}
            </div>


            <p className="mt-5 text-sm text-stone-500">
                {title}
            </p>


            <p className="mt-1 text-3xl font-semibold text-stone-900">
                {value}
            </p>


            <p className="mt-2 text-xs text-stone-400">
                {description}
            </p>

        </div>

    );

}


// ==========================================
// ADMIN CARD
// ==========================================

function AdminCard({
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
            className="group rounded-[28px] border border-stone-200/70 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
        >

            <div className="flex items-center justify-between">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-700 transition group-hover:bg-stone-900 group-hover:text-white">

                    {icon}

                </div>


                <ArrowRight
                    size={19}
                    className="text-stone-400 transition group-hover:translate-x-1 group-hover:text-stone-900"
                />

            </div>


            <h3 className="mt-7 text-xl font-semibold text-stone-900">
                {title}
            </h3>


            <p className="mt-2 text-sm leading-6 text-stone-500">
                {description}
            </p>

        </Link>

    );

}


// ==========================================
// DATE FORMAT
// ==========================================

function formatDate(
    timestamp?: {
        seconds?: number;
        nanoseconds?: number;
    }
) {

    if (!timestamp?.seconds) {
        return 'Recently';
    }


    return new Date(
        timestamp.seconds * 1000
    ).toLocaleDateString(
        'en-IN',
        {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        }
    );

}


// ==========================================
// STATUS COLOR
// ==========================================

function getStatusClass(
    status?: string
) {

    switch (
    status
        ?.toLowerCase()
        .trim()
    ) {

        case 'delivered':
            return 'bg-green-50 text-green-700';

        case 'shipped':
            return 'bg-blue-50 text-blue-700';

        case 'out for delivery':
            return 'bg-purple-50 text-purple-700';

        case 'cancelled':
            return 'bg-red-50 text-red-700';

        default:
            return 'bg-amber-50 text-amber-700';

    }

}