'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import {
    doc,
    onSnapshot,
    updateDoc,
    serverTimestamp,
} from 'firebase/firestore';

import {
    ArrowLeft,
    Package,
    Check,
    CreditCard,
    MapPin,
    CalendarDays,
} from 'lucide-react';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';


// ==========================================
// TYPES
// ==========================================

type OrderItem = {
    productId: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
};


type ShippingAddress = {
    addressId?: string | null;
    label?: string | null;
    fullName?: string;
    phone?: string;
    street: string;
    city: string;
    state: string;
    pinCode: string;
};


type Order = {
    id: string;
    userId: string;

    customer: {
        name: string;
        email: string;
        phone: string;
    };

    shippingAddress: ShippingAddress;

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

    cancellationRequested?: boolean;
    cancellationReason?: string;
    cancellationRequestedAt?: {
        seconds: number;
        nanoseconds?: number;
    } | null;

    createdAt: {
        seconds: number;
        nanoseconds?: number;
    } | null;
};


// ==========================================
// ORDER STEPS
// ==========================================

const ORDER_STEPS = [
    'Order Placed',
    'Processing',
    'Shipped',
    'Out for Delivery',
    'Delivered',
];


// ==========================================
// PAGE
// ==========================================

export default function OrderDetailsPage() {

    console.log('🔥 ORDER DETAILS PAGE LOADED');

    const router = useRouter();

    const params = useParams<{
        id?: string;
        orderId?: string;
    }>();


    const {
        user,
        loading: authLoading,
    } = useAuth();


    const [order, setOrder] =
        useState<Order | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState('');


    // ==========================================
    // LOAD ORDER
    // ==========================================

    useEffect(() => {

        console.log('🔥 ORDER LISTENER STARTING');
        if (authLoading) {
            return;
        }

        if (!user) {
            router.replace('/login');
            return;
        }

        const orderId = params.id;

        console.log('🔥 ORDER ID:', orderId);
        console.log('🔥 USER ID:', user.uid);


        if (!orderId) {
            setError('Order ID is missing from the URL.');
            setLoading(false);
            return;
        }

        const orderRef = doc(
            db,
            'orders',
            orderId
        );

        setLoading(true);
        setError('');

        const unsubscribe = onSnapshot(
            orderRef,
            (snapshot) => {

                console.log('🔥 SNAPSHOT RECEIVED');

                console.log(
                    '🔥 STATUS:',
                    snapshot.data()?.status
                );


                if (!snapshot.exists()) {
                    setOrder(null);
                    setError('Order not found.');
                    setLoading(false);
                    return;
                }

                const data = snapshot.data();

                console.log(
                    '🔥 LIVE ORDER UPDATE:',
                    {
                        orderId: snapshot.id,
                        status: data.status,
                        updatedAt: new Date().toISOString(),
                    }
                );

                // Make sure this order belongs
                // to the currently logged-in user.
                if (data.userId !== user.uid) {
                    setOrder(null);
                    setError(
                        'You do not have permission to view this order.'
                    );
                    setLoading(false);
                    return;
                }

                const updatedOrder: Order = {
                    id: snapshot.id,
                    userId: data.userId,

                    customer: data.customer,

                    shippingAddress:
                        data.shippingAddress,

                    items:
                        data.items || [],

                    subtotal:
                        Number(data.subtotal || 0),

                    shipping:
                        Number(data.shipping || 0),

                    total:
                        Number(data.total || 0),

                    paymentMethod:
                        data.paymentMethod || 'cod',

                    paymentId:
                        data.paymentId || '',

                    status:
                        data.status || 'Processing',

                    refundStatus:
                        data.refundStatus || '',

                    refundId:
                        data.refundId || '',

                    refundedAt:
                        data.refundedAt || null,

                    cancellationRequested:
                        data.cancellationRequested || false,

                    cancellationReason:
                        data.cancellationReason || '',

                    cancellationRequestedAt:
                        data.cancellationRequestedAt || null,

                    createdAt:
                        data.createdAt || null,
                };

                // THIS updates the screen immediately
                // whenever Firestore changes.
                setOrder(updatedOrder);

                setLoading(false);
            },

            (firebaseError) => {

                console.error(
                    'Order listener error:',
                    firebaseError
                );

                setError(
                    'Unable to listen for order updates.'
                );

                setLoading(false);
            }
        );

        return () => {
            unsubscribe();
        };

    }, [
        user,
        authLoading,
        params.id,
        router,
    ]);

    // ==========================================
    // CANCEL ORDER
    // ==========================================

    const handleCancelOrder = async () => {
        if (!order || !user) {
            return;
        }

        if (order.status.toLowerCase() !== 'processing') {
            return;
        }

        const confirmed = window.confirm(
            'Are you sure you want to cancel this order?'
        );

        if (!confirmed) {
            return;
        }

        try {
            const orderRef = doc(
                db,
                'orders',
                order.id
            );

            await updateDoc(orderRef, {
                cancellationRequested: true,
                cancellationRequestedAt:
                    serverTimestamp(),
            });

            alert(
                'Your cancellation request has been submitted.'
            );

        } catch (error) {
            console.error(
                'Cancellation request failed:',
                error
            );

            alert(
                'Unable to submit cancellation request. Please try again.'
            );
        }
    };


    // ==========================================
    // LOADING
    // ==========================================

    if (
        authLoading ||
        loading
    ) {

        return (

            <div className="flex min-h-screen items-center justify-center bg-[#FAF8F5]">

                <div className="text-center">

                    <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900" />

                    <p className="mt-4 text-sm text-stone-500">
                        Loading order...
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
        !order
    ) {

        return (

            <>
                <Navbar />

                <main className="flex min-h-[70vh] items-center justify-center bg-[#FAF8F5] px-6">

                    <div className="text-center">

                        <Package
                            size={44}
                            className="mx-auto text-stone-400"
                        />


                        <h1 className="mt-5 text-3xl font-semibold text-stone-900">
                            {error || 'Order not found.'}
                        </h1>


                        <button
                            type="button"
                            onClick={() =>
                                router.push('/orders')
                            }
                            className="mt-7 rounded-full bg-stone-900 px-7 py-3 text-white transition hover:bg-black"
                        >
                            Back to Orders
                        </button>

                    </div>

                </main>

                <Footer />
            </>

        );

    }


    // ==========================================
    // STATUS
    // ==========================================

    const currentStep =
        getCurrentStep(order.status);


    const isCancelled =
        order.status
            .toLowerCase()
            .trim() === 'cancelled';


    // ==========================================
    // PAGE
    // ==========================================

    return (

        <>
            <Navbar />


            <main className="min-h-screen bg-[#FAF8F5]">


                {/* ==================================
                    HEADER
                ================================== */}

                <section className="border-b border-stone-200 bg-white">

                    <div className="mx-auto max-w-6xl px-6 py-14">


                        <button
                            type="button"
                            onClick={() =>
                                router.push('/orders')
                            }
                            className="inline-flex items-center gap-2 text-sm text-stone-500 transition hover:text-stone-900"
                        >

                            <ArrowLeft size={16} />

                            Back to My Orders

                        </button>


                        <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">

                            <div>

                                <p className="text-xs uppercase tracking-[0.35em] text-stone-500">
                                    Pearlvera Order
                                </p>


                                <h1
                                    className="mt-3 text-4xl text-stone-900 md:text-5xl"
                                    style={{
                                        fontFamily:
                                            'var(--font-playfair)',
                                    }}
                                >
                                    Order Details
                                </h1>


                                <p className="mt-4 break-all text-sm text-stone-500">
                                    Order #{order.id}
                                </p>

                            </div>


                            <span
                                className={`w-fit rounded-full px-5 py-2 text-sm font-medium ${isCancelled
                                    ? 'bg-red-50 text-red-600'
                                    : 'bg-amber-50 text-amber-700'
                                    }`}
                            >
                                {order.status}
                            </span>

                        </div>

                    </div>

                </section>


                {/* ==================================
                    MAIN
                ================================== */}

                <section className="mx-auto max-w-6xl space-y-8 px-6 py-14">


                    {/* ==================================
                        TRACKING
                    ================================== */}

                    <div className="rounded-[32px] border border-stone-200 bg-white p-8 shadow-sm">

                        {isCancelled ? (

                            <div className="py-8 text-center">

                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">

                                    <span className="text-3xl text-red-600">
                                        ×
                                    </span>

                                </div>


                                <p className="mt-6 text-xs uppercase tracking-[0.3em] text-red-500">
                                    Order Cancelled
                                </p>


                                <h2
                                    className="mt-2 text-3xl text-stone-900"
                                    style={{
                                        fontFamily:
                                            'var(--font-playfair)',
                                    }}
                                >
                                    This order has been cancelled
                                </h2>


                                <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-stone-500">
                                    Your order is no longer being processed.
                                    If you believe this was cancelled by mistake,
                                    please contact Pearlvera support.
                                </p>

                            </div>

                        ) : (

                            <>

                                <p className="text-xs uppercase tracking-[0.3em] text-stone-400">
                                    Order Progress
                                </p>


                                <h2
                                    className="mt-2 text-3xl text-stone-900"
                                    style={{
                                        fontFamily:
                                            'var(--font-playfair)',
                                    }}
                                >
                                    Track Your Order
                                </h2>


                                <div className="mt-10 grid gap-8 md:grid-cols-5">

                                    {ORDER_STEPS.map(
                                        (step, index) => {

                                            const completed =
                                                index <=
                                                currentStep;


                                            return (

                                                <div
                                                    key={step}
                                                    className="relative"
                                                >

                                                    <div
                                                        className={`flex h-11 w-11 items-center justify-center rounded-full border-2 ${completed
                                                            ? 'border-stone-900 bg-stone-900 text-white'
                                                            : 'border-stone-200 bg-white text-stone-400'
                                                            }`}
                                                    >

                                                        {completed ? (

                                                            <Check
                                                                size={18}
                                                            />

                                                        ) : (

                                                            <span className="text-sm">
                                                                {index + 1}
                                                            </span>

                                                        )}

                                                    </div>


                                                    <p
                                                        className={`mt-3 text-sm font-medium ${completed
                                                            ? 'text-stone-900'
                                                            : 'text-stone-400'
                                                            }`}
                                                    >
                                                        {step}
                                                    </p>


                                                    {/* Connecting line */}

                                                    {index <
                                                        ORDER_STEPS.length -
                                                        1 && (

                                                            <div
                                                                className={`absolute left-11 top-[21px] hidden h-[2px] w-[calc(100%-20px)] md:block ${index <
                                                                    currentStep
                                                                    ? 'bg-stone-900'
                                                                    : 'bg-stone-200'
                                                                    }`}
                                                            />

                                                        )}

                                                </div>

                                            );

                                        }
                                    )}

                                </div>

                            </>

                        )}

                    </div>

                    {/* ==================================
    CANCEL ORDER
================================== */}

                    {order.status.toLowerCase() === 'processing' &&
                        !order.cancellationRequested && (
                            <div className="rounded-[32px] border border-stone-200 bg-white p-8 shadow-sm">
                                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                                    <div>
                                        <p className="text-xs uppercase tracking-[0.3em] text-stone-400">
                                            Need to make a change?
                                        </p>

                                        <h2
                                            className="mt-2 text-2xl text-stone-900"
                                            style={{
                                                fontFamily:
                                                    'var(--font-playfair)',
                                            }}
                                        >
                                            Cancel this order
                                        </h2>

                                        <p className="mt-2 text-sm leading-6 text-stone-500">
                                            You can request cancellation while your order
                                            is still being processed.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleCancelOrder}
                                        className="shrink-0 rounded-full border border-red-200 px-6 py-3 text-sm font-medium text-red-600 transition hover:border-red-300 hover:bg-red-50"
                                    >
                                        Cancel Order
                                    </button>

                                </div>
                            </div>
                        )}

                    {/* ==================================
                            CANCEL ORDER
                    ================================== */}

                    {order.cancellationRequested && (
                        <div className="rounded-[32px] border border-amber-200 bg-amber-50/50 p-8">
                            <p className="text-xs uppercase tracking-[0.3em] text-amber-600">
                                Cancellation Request
                            </p>

                            <h2
                                className="mt-2 text-2xl text-stone-900"
                                style={{
                                    fontFamily:
                                        'var(--font-playfair)',
                                }}
                            >
                                Cancellation requested
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-stone-600">
                                Your cancellation request has been submitted.
                                Pearlvera will review the request and process the
                                cancellation and refund if applicable.
                            </p>
                        </div>
                    )}


                    {/* ==================================
                        ORDER INFO
                    ================================== */}

                    <div className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">


                        {/* ==================================
                            ITEMS
                        ================================== */}

                        <div className="rounded-[32px] border border-stone-200 bg-white p-8 shadow-sm">

                            <h2
                                className="text-3xl text-stone-900"
                                style={{
                                    fontFamily:
                                        'var(--font-playfair)',
                                }}
                            >
                                Your Items
                            </h2>


                            <div className="mt-8 space-y-6">

                                {order.items.map(
                                    (item, index) => (

                                        <div
                                            key={`${item.productId}-${index}`}
                                            className="flex gap-5 border-b border-stone-100 pb-6 last:border-b-0"
                                        >

                                            {/* IMAGE */}

                                            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-stone-100">

                                                {item.image ? (

                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="h-full w-full object-contain"
                                                    />

                                                ) : (

                                                    <Package
                                                        size={26}
                                                        className="text-stone-400"
                                                    />

                                                )}

                                            </div>


                                            {/* DETAILS */}

                                            <div className="min-w-0 flex-1">

                                                <h3 className="text-lg font-medium text-stone-900">
                                                    {item.name}
                                                </h3>


                                                <p className="mt-2 text-sm text-stone-500">
                                                    Quantity: {item.quantity}
                                                </p>


                                                <p className="mt-1 text-sm text-stone-500">
                                                    ₹{' '}
                                                    {item.price.toLocaleString(
                                                        'en-IN'
                                                    )}{' '}
                                                    each
                                                </p>

                                            </div>


                                            {/* TOTAL */}

                                            <p className="font-semibold text-stone-900">

                                                ₹{' '}
                                                {(
                                                    item.price *
                                                    item.quantity
                                                ).toLocaleString(
                                                    'en-IN'
                                                )}

                                            </p>

                                        </div>

                                    )
                                )}

                            </div>

                        </div>


                        {/* ==================================
                            SUMMARY
                        ================================== */}

                        <div className="h-fit rounded-[32px] border border-stone-200 bg-white p-8 shadow-sm">

                            <h2
                                className="text-3xl text-stone-900"
                                style={{
                                    fontFamily:
                                        'var(--font-playfair)',
                                }}
                            >
                                Summary
                            </h2>


                            <div className="mt-7 space-y-4 text-sm">


                                <div className="flex justify-between text-stone-600">

                                    <span>
                                        Subtotal
                                    </span>

                                    <span>
                                        ₹{' '}
                                        {order.subtotal.toLocaleString(
                                            'en-IN'
                                        )}
                                    </span>

                                </div>


                                <div className="flex justify-between text-stone-600">

                                    <span>
                                        Shipping
                                    </span>

                                    <span>
                                        {order.shipping === 0
                                            ? 'Free'
                                            : `₹ ${order.shipping.toLocaleString(
                                                'en-IN'
                                            )}`}
                                    </span>

                                </div>


                                <div className="border-t border-stone-200 pt-5">

                                    <div className="flex justify-between text-xl font-semibold text-stone-900">

                                        <span>
                                            Total
                                        </span>

                                        <span>
                                            ₹{' '}
                                            {order.total.toLocaleString(
                                                'en-IN'
                                            )}
                                        </span>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* ==================================
                        CUSTOMER INFORMATION
                    ================================== */}

                    <div className="grid gap-6 md:grid-cols-3">


                        {/* ORDER DATE */}

                        <InfoCard
                            icon={
                                <CalendarDays size={19} />
                            }
                            title="Order Date"
                        >

                            {order.createdAt
                                ? new Date(
                                    order.createdAt.seconds *
                                    1000
                                ).toLocaleDateString(
                                    'en-IN',
                                    {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    }
                                )
                                : 'Unavailable'}

                        </InfoCard>


                        {/* PAYMENT */}

                        <InfoCard
                            icon={
                                <CreditCard size={19} />
                            }
                            title="Payment Method"
                        >

                            {order.paymentMethod === 'cod'
                                ? 'Cash on Delivery'
                                : order.paymentMethod
                                    .toUpperCase()}

                        </InfoCard>


                        {/* DELIVERY ADDRESS */}

                        <InfoCard
                            icon={
                                <MapPin size={19} />
                            }
                            title="Delivery Address"
                        >

                            {order.shippingAddress.label && (

                                <p className="mb-2 font-semibold text-stone-900">
                                    {order.shippingAddress.label}
                                </p>

                            )}


                            {order.shippingAddress.fullName && (

                                <p className="font-medium text-stone-900">
                                    {order.shippingAddress.fullName}
                                </p>

                            )}


                            {order.shippingAddress.phone && (

                                <p className="text-stone-500">
                                    {order.shippingAddress.phone}
                                </p>

                            )}


                            <p className="mt-2">
                                {order.shippingAddress.street}
                            </p>


                            <p>
                                {order.shippingAddress.city},{' '}
                                {order.shippingAddress.state}
                            </p>


                            <p>
                                PIN: {order.shippingAddress.pinCode}
                            </p>

                        </InfoCard>

                    </div>


                </section>

            </main>


            <Footer />

        </>

    );

}


// ==========================================
// GET TRACKING STEP
// ==========================================

function getCurrentStep(
    status: string
) {

    const normalized =
        status
            .toLowerCase()
            .trim();


    if (
        normalized === 'delivered'
    ) {

        return 4;

    }


    if (
        normalized === 'out for delivery'
    ) {

        return 3;

    }


    if (
        normalized === 'shipped'
    ) {

        return 2;

    }


    if (
        normalized === 'processing'
    ) {

        return 1;

    }


    return 0;

}


// ==========================================
// INFO CARD
// ==========================================

function InfoCard({
    icon,
    title,
    children,
}: {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
}) {

    return (

        <div className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">

            <div className="flex items-center gap-2 text-stone-500">

                {icon}

                <p className="text-xs uppercase tracking-[0.2em]">
                    {title}
                </p>

            </div>


            <div className="mt-4 text-sm leading-7 text-stone-700">

                {children}

            </div>

        </div>

    );

}