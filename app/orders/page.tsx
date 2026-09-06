'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
    collection,
    getDocs,
    query,
    where,
    orderBy,
} from 'firebase/firestore';

import {
    Package,
    ArrowLeft,
    CalendarDays,
    CreditCard,
} from 'lucide-react';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';

type OrderItem = {
    productId: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
};

type Order = {
    id: string;
    userId: string;

    customer: {
        name: string;
        email: string;
        phone: string;
    };

    shippingAddress: {
        addressId?: string | null;
        label?: string | null;
        fullName?: string;
        phone?: string;
        street: string;
        city: string;
        state: string;
        pinCode: string;
    };

    items: OrderItem[];

    subtotal: number;
    shipping: number;
    total: number;

    paymentMethod: string;
    paymentId?: string;

    status: string;

    refundStatus?: string;
    refundId?: string;
    refundedAt?: {
        seconds: number;
        nanoseconds?: number;
    };

    createdAt: {
        seconds: number;
    } | null;
};

export default function OrdersPage() {

    const router = useRouter();

    const { user, loading: authLoading } =
        useAuth();

    const [orders, setOrders] =
        useState<Order[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState('');


    useEffect(() => {

        if (authLoading) {
            return;
        }

        if (!user) {
            router.replace('/login');
            return;
        }

        async function loadOrders() {

            if (!user) {
                return;
            }

            try {

                setLoading(true);
                setError('');

                const ordersQuery = query(
                    collection(db, 'orders'),
                    where(
                        'userId',
                        '==',
                        user.uid
                    ),
                    orderBy(
                        'createdAt',
                        'desc'
                    )
                );

                const snapshot =
                    await getDocs(
                        ordersQuery
                    );

                const customerOrders =
                    snapshot.docs.map(
                        (doc) => {

                            const data =
                                doc.data();

                            return {
                                id: doc.id,
                                ...data,
                            } as Order;
                        }
                    );

                setOrders(
                    customerOrders
                );

            } catch (error) {

                console.error(
                    'Failed to load orders:',
                    error
                );

                setError(
                    'Unable to load your orders.'
                );

            } finally {

                setLoading(false);

            }
        }

        loadOrders();

    }, [
        user,
        authLoading,
        router,
    ]);


    if (
        authLoading ||
        loading
    ) {

        return (
            <div className="flex min-h-screen items-center justify-center bg-[#FAF8F5]">

                <div className="text-center">

                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900" />

                    <p className="mt-4 text-sm text-stone-600">
                        Loading your orders...
                    </p>

                </div>

            </div>
        );
    }


    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-[#FAF8F5]">

                {/* Header */}

                <section className="border-b border-stone-200 bg-white">

                    <div className="mx-auto max-w-7xl px-6 py-14">

                        <button
                            type="button"
                            onClick={() => router.push('/account')}
                            className="inline-flex items-center gap-2 text-sm text-stone-500 transition hover:text-stone-900"
                        >
                            <ArrowLeft size={16} />
                            Back to My Account
                        </button>

                        <p className="mt-8 text-xs font-medium uppercase tracking-[0.35em] text-stone-500">
                            My Pearlvera
                        </p>

                        <h1
                            className="mt-3 text-5xl text-stone-900"
                            style={{
                                fontFamily: 'var(--font-playfair)',
                            }}
                        >
                            My Orders
                        </h1>

                        <p className="mt-4 max-w-xl text-stone-500">
                            View your Pearlvera order history and track your purchases.
                        </p>

                    </div>

                </section>


                {/* Orders */}

                <section className="mx-auto max-w-5xl px-6 py-14">

                    {error && (

                        <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                            {error}
                        </div>

                    )}


                    {orders.length === 0 ? (

                        <div className="rounded-[32px] border border-stone-200 bg-white p-14 text-center shadow-sm">

                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-stone-100">

                                <Package
                                    size={34}
                                    className="text-stone-600"
                                />

                            </div>

                            <h2
                                className="mt-7 text-3xl text-stone-900"
                                style={{
                                    fontFamily:
                                        'var(--font-playfair)',
                                }}
                            >
                                No Orders Yet
                            </h2>

                            <p className="mx-auto mt-3 max-w-md text-stone-500">
                                You haven't placed an order
                                with Pearlvera yet.
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    router.push(
                                        '/shop'
                                    )
                                }
                                className="mt-8 rounded-full bg-stone-900 px-8 py-4 font-medium text-white transition hover:bg-black"
                            >
                                Explore Collection
                            </button>

                        </div>

                    ) : (

                        <div className="space-y-8">

                            {orders.map(
                                (order) => (

                                    <article
                                        key={order.id}
                                        className="overflow-hidden rounded-[32px] border border-stone-200 bg-white shadow-sm"
                                    >

                                        {/* Order Header */}

                                        <div className="flex flex-col gap-5 border-b border-stone-200 p-7 sm:flex-row sm:items-center sm:justify-between">

                                            <div>

                                                <p className="text-xs uppercase tracking-[0.25em] text-stone-400">
                                                    Order
                                                </p>

                                                <h2 className="mt-2 break-all text-lg font-semibold text-stone-900">
                                                    #{order.id}
                                                </h2>

                                            </div>


                                            <div className="flex flex-wrap items-center gap-3">

                                                <span className="inline-flex items-center gap-2 rounded-full bg-stone-100 px-4 py-2 text-sm text-stone-700">

                                                    <CalendarDays
                                                        size={15}
                                                    />

                                                    {order.createdAt
                                                        ? new Date(
                                                            order.createdAt.seconds *
                                                            1000
                                                        ).toLocaleDateString(
                                                            'en-IN',
                                                            {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric',
                                                            }
                                                        )
                                                        : 'Date unavailable'}

                                                </span>


                                                <span className="rounded-full bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
                                                    {order.status}
                                                </span>

                                            </div>

                                        </div>


                                        {/* Items */}

                                        <div className="p-7">

                                            <div className="space-y-5">

                                                {order.items.map(
                                                    (
                                                        item
                                                    ) => (

                                                        <div
                                                            key={
                                                                item.productId
                                                            }
                                                            className="flex gap-4 border-b border-stone-100 pb-5"
                                                        >

                                                            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-stone-100">

                                                                {item.image ? (

                                                                    <img
                                                                        src={
                                                                            item.image
                                                                        }
                                                                        alt={
                                                                            item.name
                                                                        }
                                                                        className="h-full w-full object-contain"
                                                                    />

                                                                ) : (

                                                                    <Package
                                                                        size={
                                                                            24
                                                                        }
                                                                        className="text-stone-400"
                                                                    />

                                                                )}

                                                            </div>


                                                            <div className="min-w-0 flex-1">

                                                                <h3 className="font-medium text-stone-900">
                                                                    {
                                                                        item.name
                                                                    }
                                                                </h3>

                                                                <p className="mt-1 text-sm text-stone-500">
                                                                    Qty{' '}
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                </p>

                                                            </div>


                                                            <p className="font-medium text-stone-900">

                                                                ₹{' '}
                                                                {(
                                                                    item.price *
                                                                    item.quantity
                                                                ).toLocaleString()}

                                                            </p>

                                                        </div>

                                                    )
                                                )}

                                            </div>


                                            {/* Order Details */}

                                            <div className="mt-7 grid gap-6 md:grid-cols-2">

                                                <div className="rounded-2xl bg-stone-50 p-5">

                                                    <div className="flex items-center gap-2">

                                                        <CreditCard
                                                            size={
                                                                17
                                                            }
                                                            className="text-stone-500"
                                                        />

                                                        <p className="text-sm font-medium text-stone-800">
                                                            Payment
                                                        </p>

                                                    </div>

                                                    <p className="mt-2 text-sm capitalize text-stone-500">
                                                        {order.paymentMethod ===
                                                            'cod'
                                                            ? 'Cash on Delivery'
                                                            : order.paymentMethod}
                                                    </p>

                                                </div>


                                                <div className="rounded-2xl bg-stone-50 p-5">

                                                    <p className="text-sm font-medium text-stone-800">
                                                        Delivery Address
                                                    </p>

                                                    <p className="mt-2 text-sm leading-6 text-stone-500">

                                                        {
                                                            order
                                                                .shippingAddress
                                                                .street
                                                        }

                                                        <br />

                                                        {
                                                            order
                                                                .shippingAddress
                                                                .city
                                                        }
                                                        ,{' '}

                                                        {
                                                            order
                                                                .shippingAddress
                                                                .state
                                                        }

                                                        <br />

                                                        PIN:{' '}

                                                        {
                                                            order
                                                                .shippingAddress
                                                                .pinCode
                                                        }

                                                    </p>

                                                </div>

                                            </div>


                                            {/* Total */}

                                            <div className="mt-7 border-t border-stone-200 pt-6">

                                                <div className="flex items-center justify-between">

                                                    <span className="text-lg font-medium text-stone-700">
                                                        Total
                                                    </span>

                                                    <span className="text-2xl font-bold text-stone-900">
                                                        ₹ {order.total.toLocaleString()}
                                                    </span>

                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        router.push(`/orders/${order.id}`)
                                                    }
                                                    className="mt-6 w-full rounded-full border border-stone-900 py-3.5 font-medium text-stone-900 transition hover:bg-stone-900 hover:text-white"
                                                >
                                                    View Order
                                                </button>

                                            </div>

                                        </div>

                                    </article>

                                )
                            )}

                        </div>

                    )}

                </section>

            </main >

            <Footer />

        </>
    );
}