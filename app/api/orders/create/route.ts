import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import crypto from 'crypto';
import Razorpay from 'razorpay';

type OrderItemInput = {
    productId: string;
    quantity: number;
};

type ShippingAddress = {
    addressId?: string | null;
    label?: string | null;
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pinCode: string;
};

export async function POST(
    request: NextRequest
) {
    try {
        // ==========================================
        // AUTHENTICATION
        // ==========================================

        const authorization =
            request.headers.get('authorization');

        if (
            !authorization ||
            !authorization.startsWith('Bearer ')
        ) {
            return NextResponse.json(
                {
                    error:
                        'Authentication required.',
                },
                { status: 401 }
            );
        }

        const idToken =
            authorization.substring(7);

        let decodedToken;

        try {
            decodedToken =
                await adminAuth.verifyIdToken(
                    idToken
                );
        } catch (error) {
            console.error(
                'Firebase token verification failed:',
                error
            );

            return NextResponse.json(
                {
                    error:
                        'Invalid authentication token.',
                },
                { status: 401 }
            );
        }

        const userId =
            decodedToken.uid;

        // ==========================================
        // REQUEST DATA
        // ==========================================

        const body =
            await request.json();

        const {
            razorpayPaymentId,
            razorpayOrderId,
            items,
            shippingAddress,
            customer,
        } = body;

        // ==========================================
        // BASIC VALIDATION
        // ==========================================

        if (
            typeof razorpayPaymentId !== 'string' ||
            typeof razorpayOrderId !== 'string'
        ) {
            return NextResponse.json(
                {
                    error:
                        'Payment information is required.',
                },
                { status: 400 }
            );
        }

        if (
            !Array.isArray(items) ||
            items.length === 0
        ) {
            return NextResponse.json(
                {
                    error:
                        'Order must contain at least one item.',
                },
                { status: 400 }
            );
        }

        if (
            !customer ||
            !shippingAddress
        ) {
            return NextResponse.json(
                {
                    error:
                        'Customer and shipping information are required.',
                },
                { status: 400 }
            );
        }

        // ==========================================
        // VALIDATE ITEM INPUT
        // ==========================================

        const orderItems =
            items as OrderItemInput[];

        for (const item of orderItems) {
            if (
                typeof item.productId !== 'string' ||
                !item.productId
            ) {
                return NextResponse.json(
                    {
                        error:
                            'Invalid product ID.',
                    },
                    { status: 400 }
                );
            }

            if (
                !Number.isInteger(item.quantity) ||
                item.quantity <= 0
            ) {
                return NextResponse.json(
                    {
                        error:
                            'Invalid product quantity.',
                    },
                    { status: 400 }
                );
            }
        }

        // ==========================================
        // VERIFY RAZORPAY PAYMENT
        // ==========================================

        const razorpayKeyId =
            process.env.RAZORPAY_KEY_ID;

        const razorpayKeySecret =
            process.env.RAZORPAY_KEY_SECRET;

        if (
            !razorpayKeyId ||
            !razorpayKeySecret
        ) {
            throw new Error(
                'Razorpay server configuration is missing.'
            );
        }

        const razorpay =
            new Razorpay({
                key_id: razorpayKeyId,
                key_secret: razorpayKeySecret,
            });

        // ------------------------------------------
        // VERIFY PAYMENT SIGNATURE
        // ------------------------------------------

        const generatedSignature =
            crypto
                .createHmac(
                    'sha256',
                    razorpayKeySecret
                )
                .update(
                    `${razorpayOrderId}|${razorpayPaymentId}`
                )
                .digest('hex');

        const signatureValid =
            crypto.timingSafeEqual(
                Buffer.from(
                    generatedSignature,
                    'utf8'
                ),
                Buffer.from(
                    body.razorpaySignature || '',
                    'utf8'
                )
            );

        if (!signatureValid) {
            return NextResponse.json(
                {
                    error:
                        'Payment verification failed.',
                },
                { status: 400 }
            );
        }

        // ------------------------------------------
        // FETCH PAYMENT FROM RAZORPAY
        // ------------------------------------------

        const payment =
            await razorpay.payments.fetch(
                razorpayPaymentId
            );

        if (
            payment.order_id !==
            razorpayOrderId
        ) {
            return NextResponse.json(
                {
                    error:
                        'Payment does not belong to this order.',
                },
                { status: 400 }
            );
        }

        if (
            payment.status !== 'captured'
        ) {
            return NextResponse.json(
                {
                    error:
                        'Payment has not been captured.',
                },
                { status: 400 }
            );
        }

        // ==========================================
        // CREATE ORDER REFERENCE
        // ==========================================

        const orderRef =
            adminDb
                .collection('orders')
                .doc();

        let existingOrderId: string | null = null;

        // ==========================================
        // FIRESTORE TRANSACTION
        // ==========================================

        await adminDb.runTransaction(
            async (transaction) => {

                // ----------------------------------
                // PREVENT DUPLICATE PAYMENT ORDERS
                // ----------------------------------

                const existingOrders =
                    await transaction.get(
                        adminDb
                            .collection('orders')
                            .where(
                                'paymentId',
                                '==',
                                razorpayPaymentId
                            )
                            .limit(1)
                    );

                if (!existingOrders.empty) {
                    existingOrderId =
                        existingOrders.docs[0].id;

                    return;
                }

                // ----------------------------------
                // READ ALL PRODUCTS
                // ----------------------------------

                const productSnapshots: {
                    input: OrderItemInput;
                    ref: FirebaseFirestore.DocumentReference;
                    snapshot: FirebaseFirestore.DocumentSnapshot;
                }[] = [];

                for (
                    const item of orderItems
                ) {
                    const productRef =
                        adminDb
                            .collection(
                                'products'
                            )
                            .doc(
                                item.productId
                            );

                    const productSnapshot =
                        await transaction.get(
                            productRef
                        );

                    if (
                        !productSnapshot.exists
                    ) {
                        throw new Error(
                            `Product "${item.productId}" was not found.`
                        );
                    }

                    productSnapshots.push({
                        input: item,
                        ref: productRef,
                        snapshot:
                            productSnapshot,
                    });
                }

                // ----------------------------------
                // BUILD TRUSTED ORDER ITEMS
                // ----------------------------------

                const trustedItems: {
                    productId: string;
                    name: string;
                    image: string;
                    price: number;
                    quantity: number;
                }[] = [];

                let subtotal = 0;

                for (
                    const {
                        input,
                        snapshot,
                    } of productSnapshots
                ) {
                    const productData =
                        snapshot.data() as {
                            name?: unknown;
                            image?: unknown;
                            price?: unknown;
                            stock?: unknown;
                            visible?: unknown;
                        };

                    const name =
                        typeof productData.name ===
                            'string'
                            ? productData.name
                            : '';

                    const image =
                        typeof productData.image ===
                            'string'
                            ? productData.image
                            : '';

                    const price =
                        Number(
                            productData.price
                        );

                    const stock =
                        Number(
                            productData.stock ?? 0
                        );

                    if (!name) {
                        throw new Error(
                            `Product "${input.productId}" has an invalid name.`
                        );
                    }

                    if (
                        !Number.isFinite(price) ||
                        price < 0
                    ) {
                        throw new Error(
                            `Product "${name}" has an invalid price.`
                        );
                    }

                    if (
                        !Number.isInteger(stock) ||
                        stock < 0
                    ) {
                        throw new Error(
                            `Product "${name}" has invalid stock.`
                        );
                    }

                    if (
                        stock <
                        input.quantity
                    ) {
                        throw new Error(
                            `Not enough stock for "${name}". Only ${stock} available.`
                        );
                    }

                    subtotal +=
                        price *
                        input.quantity;

                    trustedItems.push({
                        productId:
                            input.productId,
                        name,
                        image,
                        price,
                        quantity:
                            input.quantity,
                    });
                }

                // ==================================
                // SHIPPING
                // ==================================

                // Pearlvera currently has free shipping.
                const shipping = 0;

                const total =
                    subtotal + shipping;

                // ==================================
                // VERIFY RAZORPAY AMOUNT
                // ==================================

                const expectedAmountPaise =
                    Math.round(
                        total * 100
                    );

                if (
                    Number(payment.amount) !==
                    expectedAmountPaise
                ) {
                    throw new Error(
                        'Payment amount does not match the order total.'
                    );
                }

                // ----------------------------------
                // REDUCE STOCK
                // ----------------------------------

                for (
                    const {
                        input,
                        ref,
                        snapshot,
                    } of productSnapshots
                ) {
                    const productData =
                        snapshot.data() as {
                            stock?: unknown;
                        };

                    const currentStock =
                        Number(
                            productData.stock ?? 0
                        );

                    transaction.update(
                        ref,
                        {
                            stock:
                                currentStock -
                                input.quantity,
                        }
                    );
                }

                // ----------------------------------
                // CREATE ORDER
                // ----------------------------------

                const order = {
                    userId,

                    customer: {
                        name:
                            typeof customer.name ===
                                'string'
                                ? customer.name
                                : '',

                        email:
                            decodedToken.email ||
                            '',

                        phone:
                            typeof customer.phone ===
                                'string'
                                ? customer.phone
                                : '',
                    },

                    shippingAddress:
                        shippingAddress as ShippingAddress,

                    items:
                        trustedItems,

                    subtotal,

                    shipping,

                    total,

                    paymentMethod:
                        'Razorpay',

                    paymentId:
                        razorpayPaymentId,

                    razorpayOrderId,

                    status:
                        'Processing',

                    createdAt:
                        FieldValue.serverTimestamp(),
                };

                transaction.set(
                    orderRef,
                    order
                );
            }
        );

        // ==========================================
        // SUCCESS
        // ==========================================

        return NextResponse.json({
            success: true,
            orderId:
                existingOrderId || orderRef.id,
        });

    } catch (error) {
        console.error(
            'Secure order creation failed:',
            error
        );

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : 'Unable to create order.',
            },
            { status: 500 }
        );
    }
}