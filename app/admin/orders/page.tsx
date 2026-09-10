'use client';

import {
    Suspense,
    useEffect,
    useState,
} from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import {
    collection,
    getDocs,
    orderBy,
    query,
    doc,
    updateDoc,
} from 'firebase/firestore';

import {
    Package,
    ArrowLeft,
    Search,
    MapPin,
    Phone,
    Mail,
    CreditCard,
    ChevronDown,
} from 'lucide-react';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AdminGuard from '@/components/admin/AdminGuard';

import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';


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

    cancellationRequested?: boolean;
    cancellationReason?: string;
    cancellationRequestedAt?: {
        seconds: number;
        nanoseconds?: number;
    };

    createdAt?: {
        seconds: number;
        nanoseconds: number;
    };
};


// ==========================================
// STATUSES
// ==========================================

const statuses = [
    'Processing',
    'Shipped',
    'Out for Delivery',
    'Delivered',
    'Cancelled',
];


// ==========================================
// PAGE
// ==========================================

function AdminOrdersContent() {

    const { user, loading: authLoading } =
        useAuth();

    const searchParams =
        useSearchParams();


    // ==========================================
    // STATE
    // ==========================================

    const [orders, setOrders] =
        useState<Order[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [search, setSearch] =
        useState('');

    const [selectedOrder, setSelectedOrder] =
        useState<Order | null>(null);

    const [updating, setUpdating] =
        useState(false);


    // ==========================================
    // LOAD ORDERS
    // ==========================================

    useEffect(() => {

        if (authLoading) {
            return;
        }

        if (!user) {
            return;
        }

        loadOrders();

    }, [
        authLoading,
        user,
    ]);


    async function loadOrders() {

        try {

            setLoading(true);


            const ordersRef =
                collection(
                    db,
                    'orders'
                );


            const ordersQuery =
                query(
                    ordersRef,
                    orderBy(
                        'createdAt',
                        'desc'
                    )
                );


            const snapshot =
                await getDocs(
                    ordersQuery
                );


            const data: Order[] =
                snapshot.docs.map(
                    (item) => ({
                        ...item.data(),
                        id: item.id,
                    })
                ) as Order[];


            setOrders(data);

        } catch (error) {

            console.error(
                'Failed to load admin orders:',
                error
            );

        } finally {

            setLoading(false);

        }

    }


    // ==========================================
    // OPEN ORDER FROM URL
    // ==========================================

    useEffect(() => {

        if (loading) {
            return;
        }


        if (orders.length === 0) {
            return;
        }


        const orderId =
            searchParams.get('order');


        if (!orderId) {
            return;
        }


        const order =
            orders.find(
                (item) =>
                    item.id === orderId
            );


        if (order) {

            setSelectedOrder(order);

        }

    }, [
        loading,
        orders,
        searchParams,
    ]);


    // ==========================================
    // UPDATE STATUS
    // ==========================================

    async function updateOrderStatus(
        orderId: string,
        status: string
    ) {

        try {

            setUpdating(true);


            await updateDoc(
                doc(
                    db,
                    'orders',
                    orderId
                ),
                {
                    status,
                }
            );


            setOrders(
                (current) =>
                    current.map(
                        (order) =>
                            order.id === orderId
                                ? {
                                    ...order,
                                    status,
                                }
                                : order
                    )
            );


            setSelectedOrder(
                (current) =>
                    current &&
                        current.id === orderId
                        ? {
                            ...current,
                            status,
                        }
                        : current
            );


        } catch (error) {

            console.error(
                'Failed to update order:',
                error
            );


            alert(
                'Unable to update order status.'
            );

        } finally {

            setUpdating(false);

        }

    }

    async function processRefund(
        orderId: string,
        paymentId: string
    ) {
        if (!user) {
            alert('You must be logged in.');
            return;
        }

        const confirmed = window.confirm(
            'Are you sure you want to process the refund for this order?'
        );

        if (!confirmed) {
            return;
        }

        try {
            setUpdating(true);

            const idToken =
                await user.getIdToken();

            const response =
                await fetch(
                    '/api/razorpay/refund',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type':
                                'application/json',
                            Authorization:
                                `Bearer ${idToken}`,
                        },
                        body: JSON.stringify({
                            orderId,
                            paymentId,
                        }),
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    'Unable to process refund.'
                );
            }

            setOrders((current) =>
                current.map((order) =>
                    order.id === orderId
                        ? {
                            ...order,
                            refundStatus:
                                data.status ===
                                    'processed'
                                    ? 'Refunded'
                                    : 'Refund Pending',
                            refundId:
                                data.refundId,
                        }
                        : order
                )
            );

            setSelectedOrder((current) =>
                current &&
                    current.id === orderId
                    ? {
                        ...current,
                        refundStatus:
                            data.status ===
                                'processed'
                                ? 'Refunded'
                                : 'Refund Pending',
                        refundId:
                            data.refundId,
                    }
                    : current
            );

            alert(
                'Refund processed successfully.'
            );

        } catch (error) {
            console.error(
                'Refund failed:',
                error
            );

            alert(
                error instanceof Error
                    ? error.message
                    : 'Unable to process refund.'
            );

        } finally {
            setUpdating(false);
        }
    }

    async function syncRefundStatus(
        orderId: string,
        paymentId: string,
        refundId: string
    ) {
        if (!user) {
            alert('You must be logged in.');
            return;
        }

        try {
            setUpdating(true);

            const idToken =
                await user.getIdToken();

            const response =
                await fetch(
                    '/api/razorpay/refund/status',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type':
                                'application/json',
                            Authorization:
                                `Bearer ${idToken}`,
                        },
                        body: JSON.stringify({
                            orderId,
                            paymentId,
                            refundId,
                        }),
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    'Unable to sync refund status.'
                );
            }

            const refundStatus =
                data.status === 'processed'
                    ? 'Refunded'
                    : data.status === 'failed'
                        ? 'Refund Failed'
                        : 'Refund Pending';

            setOrders((current) =>
                current.map((order) =>
                    order.id === orderId
                        ? {
                            ...order,
                            refundStatus,
                            refundId:
                                data.refundId,
                        }
                        : order
                )
            );

            setSelectedOrder((current) =>
                current &&
                    current.id === orderId
                    ? {
                        ...current,
                        refundStatus,
                        refundId:
                            data.refundId,
                    }
                    : current
            );

            if (data.status === 'processed') {
                alert('Refund is now marked as completed.');
            } else if (data.status === 'failed') {
                alert('Razorpay reports that the refund failed.');
            } else {
                alert('Refund is still pending.');
            }

        } catch (error) {
            console.error(
                'Refund status sync failed:',
                error
            );

            alert(
                error instanceof Error
                    ? error.message
                    : 'Unable to sync refund status.'
            );

        } finally {
            setUpdating(false);
        }
    }


    // ==========================================
    // FORMAT DATE
    // ==========================================

    function formatDate(
        timestamp?: {
            seconds: number;
            nanoseconds: number;
        }
    ) {

        if (!timestamp) {
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
    // STATUS CLASS
    // ==========================================

    function statusClass(
        status: string
    ) {

        switch (status) {

            case 'Delivered':
                return 'bg-green-50 text-green-700';

            case 'Shipped':
                return 'bg-blue-50 text-blue-700';

            case 'Out for Delivery':
                return 'bg-purple-50 text-purple-700';

            case 'Cancelled':
                return 'bg-red-50 text-red-700';

            default:
                return 'bg-amber-50 text-amber-700';

        }

    }


    // ==========================================
    // FILTER ORDERS
    // ==========================================

    const filteredOrders =
        orders.filter(
            (order) => {

                const term =
                    search
                        .toLowerCase()
                        .trim();


                if (!term) {
                    return true;
                }


                return (

                    order.id
                        .toLowerCase()
                        .includes(term) ||

                    order.customer.name
                        .toLowerCase()
                        .includes(term) ||

                    order.customer.email
                        .toLowerCase()
                        .includes(term) ||

                    order.customer.phone
                        .toLowerCase()
                        .includes(term)

                );

            }
        );


    // ==========================================
    // CLOSE MODAL
    // ==========================================

    function closeOrder() {

        setSelectedOrder(null);

        // Remove ?order= from URL
        // without reloading the page.

        window.history.replaceState(
            null,
            '',
            '/admin/orders'
        );

    }


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
                            href="/admin"
                            className="inline-flex items-center gap-2 text-sm text-stone-500 transition hover:text-stone-900"
                        >

                            <ArrowLeft
                                size={16}
                            />

                            Admin Dashboard

                        </Link>


                        <div className="mt-8">

                            <p className="text-xs uppercase tracking-[0.35em] text-stone-400">
                                Store Management
                            </p>


                            <h1
                                className="mt-3 text-5xl text-stone-900"
                                style={{
                                    fontFamily:
                                        'var(--font-playfair)',
                                }}
                            >
                                Orders
                            </h1>


                            <p className="mt-3 text-stone-500">
                                Manage Pearlvera customer orders.
                            </p>

                        </div>

                    </div>

                </section>


                {/* ==================================
                    CONTENT
                ================================== */}

                <section className="mx-auto max-w-7xl px-6 py-12">


                    {/* SEARCH */}

                    <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                        <div className="relative w-full max-w-md">

                            <Search
                                size={18}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                            />


                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                                placeholder="Search orders or customers..."
                                className="w-full rounded-full border border-stone-200 bg-white py-3.5 pl-11 pr-5 text-sm text-stone-900 outline-none transition focus:border-stone-900"
                            />

                        </div>


                        <p className="text-sm text-stone-500">

                            {filteredOrders.length}{' '}

                            {filteredOrders.length === 1
                                ? 'order'
                                : 'orders'}

                        </p>

                    </div>


                    {/* ==================================
                        LOADING
                    ================================== */}

                    {loading ? (

                        <div className="rounded-[32px] bg-white p-16 text-center shadow-sm">

                            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-stone-200 border-t-stone-900" />


                            <p className="mt-5 text-sm text-stone-500">
                                Loading orders...
                            </p>

                        </div>

                    ) : filteredOrders.length === 0 ? (

                        <div className="rounded-[32px] bg-white p-16 text-center shadow-sm">

                            <Package
                                size={38}
                                className="mx-auto text-stone-400"
                            />


                            <h2
                                className="mt-6 text-3xl text-stone-900"
                                style={{
                                    fontFamily:
                                        'var(--font-playfair)',
                                }}
                            >
                                No orders found
                            </h2>


                            <p className="mt-3 text-stone-500">
                                {search
                                    ? 'Try a different search.'
                                    : 'Customer orders will appear here.'}
                            </p>

                        </div>

                    ) : (

                        <div className="space-y-5">

                            {filteredOrders.map(
                                (order) => (

                                    <article
                                        key={order.id}
                                        className="rounded-[28px] border border-stone-200/70 bg-white shadow-sm transition hover:shadow-md"
                                    >

                                        {/* ORDER TOP */}

                                        <div className="flex flex-col gap-5 border-b border-stone-200 px-6 py-6 md:flex-row md:items-center md:justify-between md:px-8">

                                            <div>

                                                <p className="text-xs uppercase tracking-[0.2em] text-stone-400">
                                                    Order
                                                </p>


                                                <p className="mt-1 font-mono text-sm font-medium text-stone-900">
                                                    #{order.id}
                                                </p>


                                                <p className="mt-2 text-sm text-stone-500">
                                                    {formatDate(
                                                        order.createdAt
                                                    )}
                                                </p>

                                            </div>


                                            <div className="flex flex-wrap items-center gap-3">

                                                <span
                                                    className={`rounded-full px-4 py-2 text-xs font-medium ${statusClass(
                                                        order.status
                                                    )}`}
                                                >
                                                    {order.status}
                                                </span>

                                                {order.cancellationRequested &&
                                                    order.status !== 'Cancelled' && (
                                                        <span className="rounded-full bg-red-50 px-4 py-2 text-xs font-medium text-red-600">
                                                            Cancellation Requested
                                                        </span>
                                                    )}


                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedOrder(
                                                            order
                                                        )
                                                    }
                                                    className="rounded-full border border-stone-300 px-5 py-2 text-sm font-medium text-stone-800 transition hover:border-stone-900 hover:bg-stone-900 hover:text-white"
                                                >
                                                    View Order
                                                </button>

                                            </div>

                                        </div>


                                        {/* ORDER BODY */}

                                        <div className="grid gap-6 px-6 py-6 md:grid-cols-[1fr_auto] md:px-8">

                                            <div>

                                                <p className="text-xs uppercase tracking-[0.2em] text-stone-400">
                                                    Customer
                                                </p>


                                                <h3 className="mt-2 text-lg font-semibold text-stone-900">
                                                    {order.customer.name}
                                                </h3>


                                                <div className="mt-2 space-y-1 text-sm text-stone-500">

                                                    <p className="flex items-center gap-2">
                                                        <Mail
                                                            size={14}
                                                        />

                                                        {order.customer.email}
                                                    </p>


                                                    <p className="flex items-center gap-2">
                                                        <Phone
                                                            size={14}
                                                        />

                                                        {order.customer.phone}
                                                    </p>

                                                </div>

                                            </div>


                                            <div className="md:text-right">

                                                <p className="text-xs uppercase tracking-[0.2em] text-stone-400">
                                                    Order Total
                                                </p>


                                                <p className="mt-2 text-2xl font-semibold text-stone-900">

                                                    ₹{' '}

                                                    {order.total.toLocaleString(
                                                        'en-IN'
                                                    )}

                                                </p>


                                                <p className="mt-1 text-sm text-stone-500">

                                                    {order.items.length}{' '}

                                                    {order.items.length === 1
                                                        ? 'product'
                                                        : 'products'}

                                                    {' · '}

                                                    {order.paymentMethod ===
                                                        'cod'
                                                        ? 'Cash on Delivery'
                                                        : order.paymentMethod.toUpperCase()}

                                                </p>

                                            </div>

                                        </div>

                                    </article>

                                )
                            )}

                        </div>

                    )}

                </section>

            </main>


            <Footer />


            {/* ==================================
                ORDER DETAIL MODAL
            ================================== */}

            {selectedOrder && (

                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm">

                    <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[32px] bg-[#FCFBF9] shadow-2xl">


                        {/* MODAL HEADER */}

                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-200 bg-[#FCFBF9] px-6 py-5 md:px-8">

                            <div>

                                <p className="text-xs uppercase tracking-[0.25em] text-stone-400">
                                    Order Details
                                </p>


                                <h2
                                    className="mt-1 text-2xl text-stone-900"
                                    style={{
                                        fontFamily:
                                            'var(--font-playfair)',
                                    }}
                                >
                                    #{selectedOrder.id}
                                </h2>

                            </div>


                            <button
                                type="button"
                                onClick={closeOrder}
                                className="rounded-full px-4 py-2 text-sm text-stone-600 transition hover:bg-stone-100 hover:text-stone-900"
                            >
                                Close
                            </button>

                        </div>


                        <div className="space-y-8 p-6 md:p-8">


                            {/* ==================================
                                CUSTOMER
                            ================================== */}

                            <div>

                                <p className="text-xs uppercase tracking-[0.25em] text-stone-400">
                                    Customer
                                </p>


                                <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-5">

                                    <h3 className="font-semibold text-stone-900">
                                        {selectedOrder.customer.name}
                                    </h3>


                                    <p className="mt-2 flex items-center gap-2 text-sm text-stone-500">
                                        <Mail size={15} />
                                        {selectedOrder.customer.email}
                                    </p>


                                    <p className="mt-2 flex items-center gap-2 text-sm text-stone-500">
                                        <Phone size={15} />
                                        {selectedOrder.customer.phone}
                                    </p>

                                </div>

                            </div>


                            {/* ==================================
                                SHIPPING
                            ================================== */}

                            <div>

                                <p className="text-xs uppercase tracking-[0.25em] text-stone-400">
                                    Shipping Address
                                </p>


                                <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-5">

                                    <div className="flex gap-3">

                                        <MapPin
                                            size={18}
                                            className="mt-0.5 shrink-0 text-stone-600"
                                        />


                                        <div className="text-sm leading-6 text-stone-600">

                                            {selectedOrder.shippingAddress.label && (
                                                <p className="mb-1 font-semibold text-stone-900">
                                                    {selectedOrder.shippingAddress.label}
                                                </p>
                                            )}


                                            {selectedOrder.shippingAddress.fullName && (
                                                <p className="font-medium text-stone-900">
                                                    {selectedOrder.shippingAddress.fullName}
                                                </p>
                                            )}


                                            {selectedOrder.shippingAddress.phone && (
                                                <p className="text-stone-500">
                                                    {selectedOrder.shippingAddress.phone}
                                                </p>
                                            )}


                                            <p className="mt-2">
                                                {selectedOrder.shippingAddress.street}
                                            </p>


                                            <p>
                                                {selectedOrder.shippingAddress.city},{' '}
                                                {selectedOrder.shippingAddress.state}
                                            </p>


                                            <p>
                                                PIN:{' '}
                                                {selectedOrder.shippingAddress.pinCode}
                                            </p>

                                        </div>

                                    </div>

                                </div>

                            </div>


                            {/* ==================================
                                PRODUCTS
                            ================================== */}

                            <div>

                                <p className="text-xs uppercase tracking-[0.25em] text-stone-400">
                                    Products
                                </p>


                                <div className="mt-4 space-y-4">

                                    {selectedOrder.items.map(
                                        (item, index) => (

                                            <div
                                                key={`${selectedOrder.id}-${item.productId}-${index}`}
                                                className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4"
                                            >

                                                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#F7F3EE]">

                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="h-full w-full object-cover"
                                                    />

                                                </div>


                                                <div className="min-w-0 flex-1">

                                                    <h3 className="font-medium text-stone-900">
                                                        {item.name}
                                                    </h3>


                                                    <p className="mt-1 text-sm text-stone-500">

                                                        ₹{' '}

                                                        {item.price.toLocaleString(
                                                            'en-IN'
                                                        )}

                                                        {' × '}

                                                        {item.quantity}

                                                    </p>

                                                </div>


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
                                PAYMENT + TOTAL
                            ================================== */}

                            <div className="rounded-2xl border border-stone-200 bg-white p-5">

                                <div className="flex items-center justify-between">

                                    <div className="flex items-center gap-2 text-sm text-stone-600">

                                        <CreditCard
                                            size={17}
                                        />


                                        <span>

                                            {selectedOrder.paymentMethod ===
                                                'cod'
                                                ? 'Cash on Delivery'
                                                : selectedOrder.paymentMethod.toUpperCase()}

                                        </span>

                                    </div>


                                    <span className="text-xl font-semibold text-stone-900">

                                        ₹{' '}

                                        {selectedOrder.total.toLocaleString(
                                            'en-IN'
                                        )}

                                    </span>

                                </div>

                            </div>

                            {/* ==================================
                                    CANCELLATION REQUEST
                            ================================== */}

                            {selectedOrder.cancellationRequested &&
                                selectedOrder.status !== 'Cancelled' && (
                                    <div className="rounded-2xl border border-red-200 bg-red-50 p-5">

                                        <p className="text-xs uppercase tracking-[0.25em] text-red-500">
                                            Customer Request
                                        </p>

                                        <h3
                                            className="mt-2 text-2xl text-stone-900"
                                            style={{
                                                fontFamily:
                                                    'var(--font-playfair)',
                                            }}
                                        >
                                            Cancellation requested
                                        </h3>

                                        <p className="mt-2 text-sm leading-6 text-stone-600">
                                            The customer has requested cancellation
                                            of this order.
                                        </p>

                                        <div className="mt-5 flex flex-col gap-3 sm:flex-row">

                                            <button
                                                type="button"
                                                disabled={updating}
                                                onClick={() =>
                                                    updateOrderStatus(
                                                        selectedOrder.id,
                                                        'Cancelled'
                                                    )
                                                }
                                                className="rounded-full bg-red-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
                                            >
                                                Approve Cancellation
                                            </button>

                                        </div>

                                    </div>
                                )}


                            {/* ==================================
                                STATUS
                            ================================== */}

                            <div>

                                <p className="text-xs uppercase tracking-[0.25em] text-stone-400">
                                    Order Status
                                </p>


                                <div className="relative mt-4">

                                    <select
                                        value={
                                            selectedOrder.status
                                        }
                                        disabled={
                                            updating
                                        }
                                        onChange={(e) =>
                                            updateOrderStatus(
                                                selectedOrder.id,
                                                e.target.value
                                            )
                                        }
                                        className="w-full appearance-none rounded-2xl border border-stone-300 bg-white px-5 py-4 pr-12 text-sm font-medium text-stone-900 outline-none transition focus:border-stone-900 disabled:opacity-50"
                                    >

                                        {statuses.map(
                                            (status) => (

                                                <option
                                                    key={status}
                                                    value={status}
                                                >
                                                    {status}
                                                </option>

                                            )
                                        )}

                                    </select>


                                    <ChevronDown
                                        size={18}
                                        className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-stone-500"
                                    />

                                </div>


                                {updating && (

                                    <p className="mt-2 text-xs text-stone-400">
                                        Updating order status...
                                    </p>

                                )}

                            </div>

                            {/* ==================================
                                    REFUND
                            ================================== */}

                            {selectedOrder.status === 'Cancelled' &&
                                selectedOrder.paymentMethod === 'Razorpay' && (
                                    <div className="rounded-2xl border border-stone-200 bg-white p-5">

                                        <p className="text-xs uppercase tracking-[0.25em] text-stone-400">
                                            Payment Refund
                                        </p>

                                        <h3
                                            className="mt-2 text-2xl text-stone-900"
                                            style={{
                                                fontFamily:
                                                    'var(--font-playfair)',
                                            }}
                                        >
                                            Refund
                                        </h3>

                                        <div className="mt-4">

                                            {selectedOrder.refundStatus ===
                                                'Refunded' ? (

                                                <div>
                                                    <p className="text-sm font-medium text-green-700">
                                                        Refund completed
                                                    </p>

                                                    {selectedOrder.refundId && (
                                                        <p className="mt-2 break-all text-xs text-stone-500">
                                                            Refund ID: {selectedOrder.refundId}
                                                        </p>
                                                    )}
                                                </div>

                                            ) : selectedOrder.refundStatus ===
                                                'Refund Pending' ? (

                                                <div>
                                                    <p className="text-sm font-medium text-amber-700">
                                                        Refund is pending
                                                    </p>

                                                    {selectedOrder.refundId && (
                                                        <p className="mt-2 break-all text-xs text-stone-500">
                                                            Refund ID: {selectedOrder.refundId}
                                                        </p>
                                                    )}

                                                    {selectedOrder.paymentId &&
                                                        selectedOrder.refundId && (
                                                            <button
                                                                type="button"
                                                                disabled={updating}
                                                                onClick={() =>
                                                                    syncRefundStatus(
                                                                        selectedOrder.id,
                                                                        selectedOrder.paymentId!,
                                                                        selectedOrder.refundId!
                                                                    )
                                                                }
                                                                className="mt-4 rounded-full border border-stone-300 px-5 py-2 text-sm font-medium text-stone-800 transition hover:bg-stone-50 disabled:opacity-50"
                                                            >
                                                                {updating
                                                                    ? 'Checking...'
                                                                    : 'Sync Refund Status'}
                                                            </button>
                                                        )}
                                                </div>

                                            ) : (

                                                <div>
                                                    <p className="text-sm text-stone-600">
                                                        This Razorpay payment has not been refunded yet.
                                                    </p>

                                                    {selectedOrder.paymentId ? (
                                                        <button
                                                            type="button"
                                                            disabled={updating}
                                                            onClick={() => {
                                                                if (!selectedOrder.paymentId) {
                                                                    return;
                                                                }

                                                                processRefund(
                                                                    selectedOrder.id,
                                                                    selectedOrder.paymentId
                                                                );
                                                            }}
                                                            className="mt-5 rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-black disabled:opacity-50"
                                                        >
                                                            {updating
                                                                ? 'Processing Refund...'
                                                                : 'Process Refund'}
                                                        </button>
                                                    ) : (
                                                        <p className="mt-4 text-sm text-red-600">
                                                            Payment ID is missing. Refund cannot be processed.
                                                        </p>
                                                    )}
                                                </div>

                                            )}

                                        </div>

                                    </div>
                                )}

                        </div>

                    </div>

                </div>

            )}

        </AdminGuard>

    );

}


export default function AdminOrdersPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center text-stone-500">
                    Loading orders...
                </div>
            }
        >
            <AdminOrdersContent />
        </Suspense>
    );
}
