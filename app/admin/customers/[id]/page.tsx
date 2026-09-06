'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
} from 'firebase/firestore';

import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    MapPin,
    ShoppingBag,
    IndianRupee,
    Package,
    CalendarDays,
} from 'lucide-react';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AdminGuard from '@/components/admin/AdminGuard';

import { db } from '@/lib/firebase';


// ==========================================
// TYPES
// ==========================================

type Address = {
    id?: string;
    label?: string;
    fullName?: string;
    phone?: string;
    street?: string;
    city?: string;
    state?: string;
    pinCode?: string;
};


type Customer = {
    uid: string;
    name: string;
    email: string;
    phone: string;
    addresses: Address[];
};


type OrderItem = {
    productId: string;
    name: string;
    image?: string;
    price: number;
    quantity: number;
};


type CustomerOrder = {
    id: string;
    total: number;
    subtotal: number;
    shipping: number;
    status: string;
    paymentMethod: string;
    items: OrderItem[];
    createdAt?: {
        seconds?: number;
        nanoseconds?: number;
    };
};


// ==========================================
// PAGE
// ==========================================

export default function CustomerDetailsPage() {

    const router = useRouter();

    const params = useParams<{
        id: string;
    }>();

    const customerId =
        params.id;


    // ==========================================
    // STATE
    // ==========================================

    const [customer, setCustomer] =
        useState<Customer | null>(null);

    const [orders, setOrders] =
        useState<CustomerOrder[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState('');


    // ==========================================
    // LOAD CUSTOMER
    // ==========================================

    useEffect(() => {

        async function loadCustomer() {

            if (!customerId) {
                return;
            }


            try {

                setLoading(true);
                setError('');


                // ==================================
                // USER PROFILE
                // ==================================

                const userRef =
                    doc(
                        db,
                        'users',
                        customerId
                    );


                const userSnapshot =
                    await getDoc(userRef);


                if (!userSnapshot.exists()) {

                    setError(
                        'Customer not found.'
                    );

                    return;

                }


                const userData =
                    userSnapshot.data();


                // ==================================
                // ADDRESSES
                // ==================================

                let addresses:
                    Address[] = [];


                if (
                    Array.isArray(
                        userData.addresses
                    )
                ) {

                    addresses =
                        userData.addresses;

                }


                const loadedCustomer:
                    Customer = {

                    uid:
                        customerId,

                    name:
                        userData.name ||
                        'Pearlvera Customer',

                    email:
                        userData.email ||
                        '',

                    phone:
                        userData.phone ||
                        '',

                    addresses,

                };


                setCustomer(
                    loadedCustomer
                );


                // ==================================
                // ORDERS
                // ==================================

                const ordersQuery =
                    query(
                        collection(
                            db,
                            'orders'
                        ),
                        where(
                            'userId',
                            '==',
                            customerId
                        )
                    );


                const ordersSnapshot =
                    await getDocs(
                        ordersQuery
                    );


                const loadedOrders:
                    CustomerOrder[] =
                    ordersSnapshot.docs.map(
                        (document) => {

                            const data =
                                document.data();

                            return {

                                id:
                                    document.id,

                                total:
                                    Number(
                                        data.total || 0
                                    ),

                                subtotal:
                                    Number(
                                        data.subtotal || 0
                                    ),

                                shipping:
                                    Number(
                                        data.shipping || 0
                                    ),

                                status:
                                    data.status ||
                                    'Processing',

                                paymentMethod:
                                    data.paymentMethod ||
                                    'cod',

                                items:
                                    Array.isArray(
                                        data.items
                                    )
                                        ? data.items
                                        : [],

                                createdAt:
                                    data.createdAt ||
                                    undefined,

                            };

                        }
                    );


                // Newest first

                loadedOrders.sort(
                    (a, b) => {

                        const aTime =
                            a.createdAt?.seconds ||
                            0;

                        const bTime =
                            b.createdAt?.seconds ||
                            0;

                        return (
                            bTime -
                            aTime
                        );

                    }
                );


                setOrders(
                    loadedOrders
                );


            } catch (error) {

                console.error(
                    'Failed to load customer:',
                    error
                );

                setError(
                    'Unable to load customer information.'
                );

            } finally {

                setLoading(false);

            }

        }


        loadCustomer();

    }, [
        customerId,
    ]);


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <div className="flex min-h-screen items-center justify-center bg-[#FAF8F5]">

                <div className="text-center">

                    <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900" />

                    <p className="mt-4 text-sm text-stone-500">
                        Loading customer...
                    </p>

                </div>

            </div>

        );

    }


    // ==========================================
    // ERROR
    // ==========================================

    if (
        error ||
        !customer
    ) {

        return (

            <>

                <Navbar />

                <main className="flex min-h-[70vh] items-center justify-center bg-[#FAF8F5] px-6">

                    <div className="text-center">

                        <User
                            size={44}
                            className="mx-auto text-stone-300"
                        />


                        <h1 className="mt-5 text-2xl font-semibold text-stone-900">
                            {error ||
                                'Customer not found.'}
                        </h1>


                        <button
                            type="button"
                            onClick={() =>
                                router.push(
                                    '/admin/customers'
                                )
                            }
                            className="mt-6 rounded-full bg-stone-900 px-7 py-3 text-sm font-medium text-white hover:bg-black"
                        >
                            Back to Customers
                        </button>

                    </div>

                </main>

                <Footer />

            </>

        );

    }


    // ==========================================
    // STATISTICS
    // ==========================================

    const validOrders =
        orders.filter(
            (order) =>
                order.status
                    .toLowerCase()
                    .trim() !==
                'cancelled'
        );


    const totalSpent =
        validOrders.reduce(
            (total, order) =>
                total +
                order.total,
            0
        );


    const totalOrders =
        validOrders.length;


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

                    <div className="mx-auto max-w-7xl px-6 py-12">


                        <Link
                            href="/admin/customers"
                            className="inline-flex items-center gap-2 text-sm text-stone-500 transition hover:text-stone-900"
                        >

                            <ArrowLeft
                                size={16}
                            />

                            Back to Customers

                        </Link>


                        <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-center">

                            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-stone-900 text-2xl font-semibold text-white">

                                {getInitial(
                                    customer.name
                                )}

                            </div>


                            <div>

                                <p className="text-xs uppercase tracking-[0.35em] text-stone-400">
                                    Pearlvera Customer
                                </p>


                                <h1
                                    className="mt-2 text-4xl text-stone-900 md:text-5xl"
                                    style={{
                                        fontFamily:
                                            'var(--font-playfair)',
                                    }}
                                >
                                    {customer.name}
                                </h1>


                                <p className="mt-3 text-stone-500">
                                    {customer.email ||
                                        'No email address'}
                                </p>

                            </div>

                        </div>

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
                                <ShoppingBag
                                    size={22}
                                />
                            }
                            title="Orders"
                            value={
                                totalOrders.toString()
                            }
                        />


                        <CustomerStat
                            icon={
                                <IndianRupee
                                    size={22}
                                />
                            }
                            title="Total Spent"
                            value={`₹ ${totalSpent.toLocaleString(
                                'en-IN'
                            )}`}
                        />


                        <CustomerStat
                            icon={
                                <MapPin
                                    size={22}
                                />
                            }
                            title="Saved Addresses"
                            value={
                                customer.addresses.length.toString()
                            }
                        />

                    </div>


                    {/* ==================================
                        CUSTOMER INFORMATION
                    ================================== */}

                    <div className="mt-10 grid gap-6 md:grid-cols-2">


                        {/* CONTACT */}

                        <div className="rounded-[28px] border border-stone-200 bg-white p-7 shadow-sm">

                            <h2
                                className="text-2xl text-stone-900"
                                style={{
                                    fontFamily:
                                        'var(--font-playfair)',
                                }}
                            >
                                Contact Information
                            </h2>


                            <div className="mt-6 space-y-5">


                                <div className="flex items-start gap-4">

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-100">

                                        <Mail
                                            size={17}
                                        />

                                    </div>


                                    <div>

                                        <p className="text-xs uppercase tracking-[0.15em] text-stone-400">
                                            Email
                                        </p>


                                        <p className="mt-1 text-sm text-stone-700">
                                            {customer.email ||
                                                'Not provided'}
                                        </p>

                                    </div>

                                </div>


                                <div className="flex items-start gap-4">

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-100">

                                        <Phone
                                            size={17}
                                        />

                                    </div>


                                    <div>

                                        <p className="text-xs uppercase tracking-[0.15em] text-stone-400">
                                            Phone
                                        </p>


                                        <p className="mt-1 text-sm text-stone-700">
                                            {customer.phone ||
                                                'Not provided'}
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* ADDRESSES */}

                        <div className="rounded-[28px] border border-stone-200 bg-white p-7 shadow-sm">

                            <div className="flex items-center justify-between">

                                <h2
                                    className="text-2xl text-stone-900"
                                    style={{
                                        fontFamily:
                                            'var(--font-playfair)',
                                    }}
                                >
                                    Saved Addresses
                                </h2>


                                <MapPin
                                    size={21}
                                    className="text-stone-400"
                                />

                            </div>


                            {customer.addresses.length === 0 ? (

                                <p className="mt-6 text-sm text-stone-500">
                                    No saved addresses.
                                </p>

                            ) : (

                                <div className="mt-6 space-y-4">

                                    {customer.addresses.map(
                                        (address, index) => (

                                            <div
                                                key={
                                                    address.id ||
                                                    index
                                                }
                                                className="rounded-2xl border border-stone-200 bg-stone-50 p-5"
                                            >

                                                <div className="flex items-center justify-between">

                                                    <p className="font-semibold text-stone-900">
                                                        {address.label ||
                                                            'Address'}
                                                    </p>

                                                </div>


                                                {address.fullName && (

                                                    <p className="mt-3 text-sm font-medium text-stone-800">
                                                        {
                                                            address.fullName
                                                        }
                                                    </p>

                                                )}


                                                {address.phone && (

                                                    <p className="text-sm text-stone-500">
                                                        {
                                                            address.phone
                                                        }
                                                    </p>

                                                )}


                                                <p className="mt-2 text-sm leading-6 text-stone-600">

                                                    {
                                                        address.street
                                                    }

                                                    <br />

                                                    {
                                                        address.city
                                                    },{' '}
                                                    {
                                                        address.state
                                                    }

                                                    <br />

                                                    PIN:{' '}
                                                    {
                                                        address.pinCode
                                                    }

                                                </p>

                                            </div>

                                        )
                                    )}

                                </div>

                            )}

                        </div>

                    </div>


                    {/* ==================================
                        ORDERS
                    ================================== */}

                    <div className="mt-12">


                        <div className="flex items-end justify-between">

                            <div>

                                <p className="text-xs uppercase tracking-[0.3em] text-stone-400">
                                    Purchase History
                                </p>


                                <h2
                                    className="mt-2 text-3xl text-stone-900"
                                    style={{
                                        fontFamily:
                                            'var(--font-playfair)',
                                    }}
                                >
                                    Customer Orders
                                </h2>

                            </div>


                            <span className="text-sm text-stone-500">
                                {orders.length}{' '}
                                total
                            </span>

                        </div>


                        <div className="mt-7 overflow-hidden rounded-[30px] border border-stone-200 bg-white shadow-sm">


                            {orders.length === 0 ? (

                                <div className="p-14 text-center">

                                    <Package
                                        size={38}
                                        className="mx-auto text-stone-300"
                                    />


                                    <h3 className="mt-5 text-lg font-semibold text-stone-900">
                                        No orders yet
                                    </h3>


                                    <p className="mt-2 text-sm text-stone-500">
                                        This customer has not placed an order.
                                    </p>

                                </div>

                            ) : (

                                <div className="divide-y divide-stone-100">

                                    {orders.map(
                                        (order) => (

                                            <Link
                                                key={order.id}
                                                href={`/admin/orders?order=${order.id}`}
                                                className="block px-6 py-6 transition hover:bg-stone-50 lg:px-8"
                                            >

                                                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">


                                                    {/* ORDER INFO */}

                                                    <div className="flex min-w-0 items-start gap-4">

                                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-stone-100">

                                                            <Package
                                                                size={18}
                                                            />

                                                        </div>


                                                        <div className="min-w-0">

                                                            <p className="font-mono text-xs text-stone-400">
                                                                #{order.id}
                                                            </p>


                                                            <p className="mt-1 text-sm text-stone-500">
                                                                {formatDate(
                                                                    order.createdAt
                                                                )}
                                                            </p>


                                                            <p className="mt-2 text-sm text-stone-600">
                                                                {order.items.length}{' '}
                                                                {order.items.length === 1
                                                                    ? 'item'
                                                                    : 'items'}
                                                            </p>

                                                        </div>

                                                    </div>


                                                    {/* STATUS */}

                                                    <div className="flex items-center gap-6">

                                                        <span
                                                            className={`rounded-full px-4 py-2 text-xs font-medium ${getStatusClass(
                                                                order.status
                                                            )}`}
                                                        >
                                                            {
                                                                order.status
                                                            }
                                                        </span>


                                                        <p className="text-lg font-semibold text-stone-900">

                                                            ₹{' '}

                                                            {order.total.toLocaleString(
                                                                'en-IN'
                                                            )}

                                                        </p>

                                                    </div>

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
// STAT
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


// ==========================================
// DATE
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
// STATUS
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