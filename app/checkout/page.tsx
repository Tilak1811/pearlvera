'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import {
    addDoc,
} from 'firebase/firestore';

import { onAuthStateChanged } from 'firebase/auth';

import {
    MapPin,
    Plus,
    Home,
    Briefcase,
    MapPinned,
    Check,
} from 'lucide-react';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

import CheckoutForm, {
    CheckoutData,
} from '@/components/checkout/CheckoutForm';

import OrderSummary from '@/components/checkout/OrderSummary';

import { useCart } from '@/hooks/useCart';

import {
    getUserAddresses,
    type UserAddress,
} from '@/lib/userProfile';

import { auth, db } from '@/lib/firebase';


export default function CheckoutPage() {

    const router = useRouter();

    const {
        cart,
        clearCart,
    } = useCart();


    // ==========================================
    // AUTH
    // ==========================================

    const [userId, setUserId] =
        useState<string | null>(null);


    const [authLoading, setAuthLoading] =
        useState(true);


    // ==========================================
    // CHECKOUT
    // ==========================================

    const [loading, setLoading] =
        useState(false);


    const [payment] =
        useState('razorpay');


    const [checkoutData, setCheckoutData] =
        useState<CheckoutData>({
            fullName: '',
            email: '',
            phone: '',
            street: '',
            city: '',
            state: '',
            pinCode: '',
        });


    // ==========================================
    // SAVED ADDRESSES
    // ==========================================

    const [addresses, setAddresses] =
        useState<UserAddress[]>([]);


    const [selectedAddressId, setSelectedAddressId] =
        useState<string | null>(null);


    const [addressesLoading, setAddressesLoading] =
        useState(true);


    // ==========================================
    // LOAD AUTH
    // ==========================================

    useEffect(() => {

        const unsubscribe =
            onAuthStateChanged(
                auth,
                async (user) => {

                    setUserId(
                        user?.uid || null
                    );

                    setAuthLoading(false);


                    if (user) {

                        try {

                            const savedAddresses =
                                await getUserAddresses(
                                    user.uid
                                );


                            setAddresses(
                                savedAddresses
                            );


                            // Automatically select
                            // the first saved address.
                            if (
                                savedAddresses.length > 0
                            ) {

                                selectAddress(
                                    savedAddresses[0]
                                );

                            }

                        } catch (error) {

                            console.error(
                                'Failed to load addresses:',
                                error
                            );

                        } finally {

                            setAddressesLoading(
                                false
                            );

                        }

                    } else {

                        setAddressesLoading(
                            false
                        );

                    }

                }
            );


        return () =>
            unsubscribe();

    }, []);


    // ==========================================
    // SELECT ADDRESS
    // ==========================================

    function selectAddress(
        address: UserAddress
    ) {

        setSelectedAddressId(
            address.id
        );


        setCheckoutData({
            fullName:
                address.fullName,

            email:
                auth.currentUser?.email || '',

            phone:
                address.phone,

            street:
                address.street,

            city:
                address.city,

            state:
                address.state,

            pinCode:
                address.pinCode,
        });

    }


    // ==========================================
    // ADD NEW ADDRESS
    // ==========================================

    function handleAddNewAddress() {




        setCheckoutData({
            fullName:
                auth.currentUser?.displayName || '',

            email:
                auth.currentUser?.email || '',

            phone: '',
            street: '',
            city: '',
            state: '',
            pinCode: '',
        });


        router.push(
            '/account/address'
        );

    }


    // ==========================================
    // PLACE ORDER
    // ==========================================

    async function placeOrder() {

        let paymentCompleted = false;

        // --------------------------------------
        // LOGIN CHECK
        // --------------------------------------

        if (!userId) {
            alert('Please login before placing your order.');
            router.push('/login');
            return;
        }


        // --------------------------------------
        // CART CHECK
        // --------------------------------------

        if (cart.length === 0) {
            alert('Your cart is empty.');
            return;
        }


        // --------------------------------------
        // ADDRESS CHECK
        // --------------------------------------

        if (
            !checkoutData.fullName ||
            !checkoutData.phone ||
            !checkoutData.street ||
            !checkoutData.city ||
            !checkoutData.state ||
            !checkoutData.pinCode
        ) {
            alert(
                'Please select or complete a delivery address.'
            );
            return;
        }


        try {

            setLoading(true);


            // ==================================
            // CALCULATE TOTAL
            // ==================================

            const subtotal =
                cart.reduce(
                    (total, item) =>
                        total +
                        item.price * item.quantity,
                    0
                );

            const shipping = 0;

            const total =
                subtotal + shipping;



            // ==================================
            // CREATE RAZORPAY ORDER
            // ==================================

            const currentUser =
                auth.currentUser;

            if (!currentUser) {
                throw new Error(
                    'Your session has expired. Please login again.'
                );
            }

            const idToken =
                await currentUser.getIdToken();

            const response =
                await fetch(
                    '/api/razorpay/create-order',
                    {
                        method: 'POST',

                        headers: {
                            'Content-Type':
                                'application/json',

                            Authorization:
                                `Bearer ${idToken}`,
                        },

                        body: JSON.stringify({
                            items:
                                cart.map(
                                    (item) => ({
                                        productId:
                                            typeof item.id ===
                                                'string'
                                                ? item.id
                                                : item.slug,

                                        quantity:
                                            item.quantity,
                                    })
                                ),
                        }),
                    }
                );


            const razorpayOrder =
                await response.json();


            if (
                !response.ok ||
                !razorpayOrder.id
            ) {
                throw new Error(
                    razorpayOrder.error ||
                    'Unable to create payment order.'
                );
            }


            // ==================================
            // LOAD RAZORPAY CHECKOUT
            // ==================================

            if (
                !(window as any).Razorpay
            ) {

                await new Promise<void>(
                    (resolve, reject) => {

                        const script =
                            document.createElement(
                                'script'
                            );

                        script.src =
                            'https://checkout.razorpay.com/v1/checkout.js';

                        script.onload = () =>
                            resolve();

                        script.onerror = () =>
                            reject(
                                new Error(
                                    'Failed to load Razorpay Checkout.'
                                )
                            );

                        document.body.appendChild(
                            script
                        );
                    }
                );
            }


            // ==================================
            // OPEN RAZORPAY
            // ==================================

            await new Promise<void>(
                (resolve, reject) => {

                    const razorpay =
                        new (window as any).Razorpay({

                            key:
                                process.env
                                    .NEXT_PUBLIC_RAZORPAY_KEY_ID,

                            amount:
                                razorpayOrder.amount,

                            currency:
                                razorpayOrder.currency,

                            name:
                                'Pearlvera',

                            description:
                                'Pearlvera Order',

                            order_id:
                                razorpayOrder.id,

                            prefill: {

                                name:
                                    checkoutData.fullName,

                                email:
                                    checkoutData.email,

                                contact:
                                    checkoutData.phone,

                            },

                            theme: {
                                color: '#111111',
                            },


                            // ==================================
                            // PAYMENT SUCCESS
                            // ==================================

                            handler:
                                async function (
                                    paymentResponse: any
                                ) {

                                    try {

                                        // ----------------------------------
                                        // VERIFY PAYMENT
                                        // ----------------------------------

                                        const currentUser = auth.currentUser;

                                        if (!currentUser) {
                                            throw new Error(
                                                'Your session has expired. Please login again.'
                                            );
                                        }

                                        const idToken =
                                            await currentUser.getIdToken();

                                        const verifyResponse =
                                            await fetch(
                                                '/api/razorpay/verify-payment',
                                                {
                                                    method:
                                                        'POST',

                                                    headers: {
                                                        'Content-Type':
                                                            'application/json',

                                                        Authorization:
                                                            `Bearer ${idToken}`,
                                                    },

                                                    body:
                                                        JSON.stringify(
                                                            {
                                                                razorpay_order_id:
                                                                    paymentResponse.razorpay_order_id,

                                                                razorpay_payment_id:
                                                                    paymentResponse.razorpay_payment_id,

                                                                razorpay_signature:
                                                                    paymentResponse.razorpay_signature,

                                                                expectedAmount:
                                                                    total,
                                                            }
                                                        ),
                                                }
                                            );


                                        const verification =
                                            await verifyResponse.json();


                                        if (
                                            !verifyResponse.ok ||
                                            !verification.verified
                                        ) {
                                            throw new Error(
                                                'Payment verification failed.'
                                            );
                                        }

                                        paymentCompleted = true;


                                        // ==================================
                                        // CREATE ORDER SECURELY ON SERVER
                                        // ==================================


                                        const orderResponse =
                                            await fetch(
                                                '/api/orders/create',
                                                {
                                                    method: 'POST',

                                                    headers: {
                                                        'Content-Type':
                                                            'application/json',

                                                        Authorization:
                                                            `Bearer ${idToken}`,
                                                    },

                                                    body:
                                                        JSON.stringify({
                                                            razorpayPaymentId:
                                                                paymentResponse.razorpay_payment_id,

                                                            razorpayOrderId:
                                                                paymentResponse.razorpay_order_id,

                                                            razorpaySignature:
                                                                paymentResponse.razorpay_signature,

                                                            items:
                                                                cart.map(
                                                                    (item) => ({
                                                                        productId:
                                                                            typeof item.id ===
                                                                                'string'
                                                                                ? item.id
                                                                                : item.slug,

                                                                        name:
                                                                            item.name,

                                                                        image:
                                                                            item.image,

                                                                        price:
                                                                            item.price,

                                                                        quantity:
                                                                            item.quantity,
                                                                    })
                                                                ),

                                                            customer: {
                                                                name:
                                                                    checkoutData.fullName,

                                                                email:
                                                                    checkoutData.email,

                                                                phone:
                                                                    checkoutData.phone,
                                                            },

                                                            shippingAddress: {
                                                                addressId:
                                                                    selectedAddressId,

                                                                label:
                                                                    selectedAddressId
                                                                        ? addresses.find(
                                                                            address =>
                                                                                address.id ===
                                                                                selectedAddressId
                                                                        )?.label ||
                                                                        null
                                                                        : null,

                                                                fullName:
                                                                    checkoutData.fullName,

                                                                phone:
                                                                    checkoutData.phone,

                                                                street:
                                                                    checkoutData.street,

                                                                city:
                                                                    checkoutData.city,

                                                                state:
                                                                    checkoutData.state,

                                                                pinCode:
                                                                    checkoutData.pinCode,
                                                            },

                                                            subtotal,

                                                            shipping,

                                                            total,
                                                        }),
                                                }
                                            );

                                        const orderResult =
                                            await orderResponse.json();

                                        if (
                                            !orderResponse.ok ||
                                            !orderResult.success ||
                                            !orderResult.orderId
                                        ) {
                                            throw new Error(
                                                orderResult.error ||
                                                'Payment succeeded, but we could not create your order.'
                                            );
                                        }

                                        const orderId =
                                            orderResult.orderId;



                                        // ==================================
                                        // SUCCESS
                                        // ==================================

                                        clearCart();

                                        router.push(
                                            `/order-success?orderId=${orderId}`
                                        );


                                        resolve();

                                    } catch (error) {

                                        console.error(
                                            'Failed after payment:',
                                            error
                                        );

                                        reject(
                                            error instanceof Error
                                                ? error
                                                : new Error(
                                                    'Payment succeeded but order creation failed.'
                                                )
                                        );

                                    }

                                },


                            // ==================================
                            // PAYMENT FAILED / CLOSED
                            // ==================================

                            modal: {

                                ondismiss:
                                    function () {

                                        reject(
                                            new Error(
                                                'Payment was cancelled.'
                                            )
                                        );

                                    },

                            },

                        });


                    razorpay.open();

                }
            );


        } catch (error) {

            console.error(
                'Failed to place order:',
                error
            );

            if (paymentCompleted) {

                alert(
                    'Payment was received, but your order could not be completed. Please do not make another payment. Contact Pearlvera support.'
                );

            } else {

                const message =
                    error instanceof Error
                        ? error.message
                        : 'Something went wrong while placing your order.';

                alert(message);

            }

        } finally {

            setLoading(false);

        }

    }


    // ==========================================
    // AUTH LOADING
    // ==========================================

    if (authLoading) {

        return (

            <div className="flex min-h-screen items-center justify-center bg-[#FAF8F5]">

                <div className="text-center">

                    <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900" />

                    <p className="mt-4 text-sm text-stone-600">
                        Loading checkout...
                    </p>

                </div>

            </div>

        );

    }


    // ==========================================
    // UI
    // ==========================================

    return (

        <>
            <Navbar />


            <main className="min-h-screen bg-[#FAF8F5]">


                {/* ==================================
                    HEADER
                ================================== */}

                <section className="border-b border-stone-200 bg-white">

                    <div className="mx-auto max-w-7xl px-6 py-16 text-center">

                        <p className="uppercase tracking-[0.35em] text-stone-500">
                            Secure Checkout
                        </p>


                        <h1
                            className="mt-4 text-6xl text-stone-900"
                            style={{
                                fontFamily:
                                    'var(--font-playfair)',
                            }}
                        >
                            Checkout
                        </h1>


                        <p className="mx-auto mt-5 max-w-xl text-lg text-stone-600">
                            Complete your order securely with Pearlvera.
                        </p>

                    </div>

                </section>


                {/* ==================================
                    CHECKOUT
                ================================== */}

                <section className="mx-auto max-w-7xl px-6 py-16">

                    <div className="grid gap-12 lg:grid-cols-[1.25fr_0.75fr]">


                        <div>


                            {/* ==================================
                                SAVED ADDRESSES
                            ================================== */}

                            <section className="mb-10 rounded-[28px] border border-stone-200 bg-white p-7 shadow-sm">

                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                    <div>

                                        <div className="flex items-center gap-3">

                                            <MapPin
                                                size={22}
                                                className="text-stone-700"
                                            />


                                            <h2 className="text-2xl font-medium text-stone-900">
                                                Delivery Address
                                            </h2>

                                        </div>


                                        <p className="mt-2 text-sm text-stone-500">
                                            Select where you want your order delivered.
                                        </p>

                                    </div>


                                    <button
                                        type="button"
                                        onClick={
                                            handleAddNewAddress
                                        }
                                        className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-900 transition hover:bg-stone-900 hover:text-white"
                                    >

                                        <Plus size={17} />

                                        Add New Address

                                    </button>

                                </div>


                                {/* ADDRESS LIST */}

                                {addressesLoading ? (

                                    <div className="mt-7 rounded-2xl bg-stone-50 p-6 text-center text-sm text-stone-500">

                                        Loading saved addresses...

                                    </div>

                                ) : addresses.length > 0 ? (

                                    <div className="mt-7 grid gap-4">

                                        {addresses.map(
                                            (address) => {

                                                const selected =
                                                    selectedAddressId ===
                                                    address.id;


                                                return (

                                                    <button
                                                        key={
                                                            address.id
                                                        }
                                                        type="button"
                                                        onClick={() =>
                                                            selectAddress(
                                                                address
                                                            )
                                                        }
                                                        className={`w-full rounded-2xl border-2 p-5 text-left transition ${selected
                                                            ? 'border-stone-900 bg-stone-50'
                                                            : 'border-stone-200 bg-white hover:border-stone-400'
                                                            }`}
                                                    >

                                                        <div className="flex items-start gap-4">

                                                            {/* Radio */}

                                                            <div
                                                                className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${selected
                                                                    ? 'border-stone-900 bg-stone-900 text-white'
                                                                    : 'border-stone-300'
                                                                    }`}
                                                            >

                                                                {selected && (
                                                                    <Check
                                                                        size={
                                                                            12
                                                                        }
                                                                    />
                                                                )}

                                                            </div>


                                                            {/* Icon */}

                                                            <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-700 sm:flex">

                                                                {address.label ===
                                                                    'Home' ? (
                                                                    <Home
                                                                        size={
                                                                            18
                                                                        }
                                                                    />
                                                                ) : address.label ===
                                                                    'Office' ? (
                                                                    <Briefcase
                                                                        size={
                                                                            18
                                                                        }
                                                                    />
                                                                ) : (
                                                                    <MapPinned
                                                                        size={
                                                                            18
                                                                        }
                                                                    />
                                                                )}

                                                            </div>


                                                            {/* Details */}

                                                            <div className="min-w-0 flex-1">

                                                                <div className="flex items-center justify-between gap-3">

                                                                    <h3 className="font-semibold text-stone-900">
                                                                        {
                                                                            address.label
                                                                        }
                                                                    </h3>


                                                                    {selected && (

                                                                        <span className="text-xs font-semibold uppercase tracking-wider text-stone-900">
                                                                            Selected
                                                                        </span>

                                                                    )}

                                                                </div>


                                                                <p className="mt-2 font-medium text-stone-800">
                                                                    {
                                                                        address.fullName
                                                                    }
                                                                </p>


                                                                <p className="text-sm text-stone-500">
                                                                    {
                                                                        address.phone
                                                                    }
                                                                </p>


                                                                <p className="mt-2 text-sm leading-6 text-stone-600">

                                                                    {
                                                                        address.street
                                                                    }

                                                                    <br />

                                                                    {
                                                                        address.city
                                                                    }
                                                                    ,{' '}
                                                                    {
                                                                        address.state
                                                                    }{' '}
                                                                    -{' '}
                                                                    {
                                                                        address.pinCode
                                                                    }

                                                                </p>

                                                            </div>

                                                        </div>

                                                    </button>

                                                );

                                            }
                                        )}

                                    </div>

                                ) : (

                                    <div className="mt-7 rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-8 text-center">

                                        <MapPin
                                            size={32}
                                            className="mx-auto text-stone-400"
                                        />


                                        <h3 className="mt-4 font-medium text-stone-900">
                                            No saved addresses
                                        </h3>


                                        <p className="mt-2 text-sm text-stone-500">
                                            Add an address to make checkout faster.
                                        </p>


                                        <button
                                            type="button"
                                            onClick={
                                                handleAddNewAddress
                                            }
                                            className="mt-5 inline-flex items-center gap-2 rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white hover:bg-black"
                                        >

                                            <Plus size={17} />

                                            Add Address

                                        </button>

                                    </div>

                                )}

                            </section>


                            {/* ==================================
                                CHECKOUT FORM
                            ================================== */}

                            <CheckoutForm
                                value={checkoutData}
                                onChange={(data) => {
                                    setCheckoutData(data);
                                }}
                            />


                            {/* ==================================
                                PAYMENT
                            ================================== */}

                            <div className="mt-10 rounded-2xl border border-stone-200 bg-white p-10">

                                <p className="text-xs uppercase tracking-[0.35em] text-stone-500">
                                    PAYMENT
                                </p>

                                <h2
                                    className="mt-3 text-3xl font-normal text-stone-900"
                                    style={{
                                        fontFamily: 'var(--font-playfair)',
                                    }}
                                >
                                    Payment Method
                                </h2>

                                <div className="mt-8 flex items-center justify-between rounded-xl border-2 border-stone-900 bg-white px-5 py-5">

                                    <div>
                                        <p className="text-base font-normal text-stone-900">
                                            Razorpay
                                        </p>

                                        <p className="mt-1 text-sm text-stone-600">
                                            Cards, UPI, Net Banking & Wallets
                                        </p>
                                    </div>

                                    <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-stone-900">
                                        <div className="h-2.5 w-2.5 rounded-full bg-stone-900" />
                                    </div>

                                </div>

                            </div>

                        </div>

                        {/* ==================================
                                ORDER SUMMARY
                            ================================== */}

                        <div className="lg:sticky lg:top-24 h-fit">

                            <OrderSummary
                                onPlaceOrder={placeOrder}
                                loading={loading}
                            />

                        </div>

                    </div>

                </section>

            </main>


            <Footer />

        </>

    );

}