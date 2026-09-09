import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';

console.log("PEARLVERA NODE VERSION:", process.version);

type OrderItemInput = {
    productId: string;
    quantity: number;
};

const razorpayKeyId =
    process.env.RAZORPAY_KEY_ID;

const razorpayKeySecret =
    process.env.RAZORPAY_KEY_SECRET;

if (
    !razorpayKeyId ||
    !razorpayKeySecret
) {
    throw new Error(
        'Razorpay environment variables are missing.'
    );
}

const razorpay =
    new Razorpay({
        key_id: razorpayKeyId,
        key_secret: razorpayKeySecret,
    });

export async function POST(
    request: NextRequest
) {
    try {
        // ==========================================
        // AUTHENTICATION
        // ==========================================

        const authorization =
            request.headers.get(
                'authorization'
            );

        if (
            !authorization ||
            !authorization.startsWith(
                'Bearer '
            )
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

        try {
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

        // ==========================================
        // REQUEST DATA
        // ==========================================

        const body =
            await request.json();

        const items =
            body.items;

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

        // ==========================================
        // VALIDATE ITEMS
        // ==========================================

        const orderItems =
            items as OrderItemInput[];

        for (
            const item of orderItems
        ) {
            if (
                typeof item.productId !==
                'string' ||
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
                !Number.isInteger(
                    item.quantity
                ) ||
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
        // GET TRUSTED PRODUCT PRICES
        // ==========================================

        let subtotal = 0;

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
                await productRef.get();

            if (
                !productSnapshot.exists
            ) {
                return NextResponse.json(
                    {
                        error:
                            'One of the products is no longer available.',
                    },
                    { status: 400 }
                );
            }

            const productData =
                productSnapshot.data() as {
                    price?: unknown;
                    stock?: unknown;
                };

            const price =
                Number(
                    productData.price
                );

            const stock =
                Number(
                    productData.stock ??
                    0
                );

            if (
                !Number.isFinite(price) ||
                price < 0
            ) {
                return NextResponse.json(
                    {
                        error:
                            'A product has an invalid price.',
                    },
                    { status: 400 }
                );
            }

            if (
                !Number.isInteger(stock) ||
                stock < 0
            ) {
                return NextResponse.json(
                    {
                        error:
                            'A product has invalid stock.',
                    },
                    { status: 400 }
                );
            }

            if (
                stock <
                item.quantity
            ) {
                return NextResponse.json(
                    {
                        error:
                            'One or more products are out of stock.',
                    },
                    { status: 400 }
                );
            }

            subtotal +=
                price *
                item.quantity;
        }

        // ==========================================
        // SHIPPING
        // ==========================================

        // Pearlvera currently has free shipping.
        const shipping = 0;

        const total =
            subtotal + shipping;

        if (
            !Number.isFinite(total) ||
            total <= 0
        ) {
            return NextResponse.json(
                {
                    error:
                        'Invalid order total.',
                },
                { status: 400 }
            );
        }

        // ==========================================
        // CREATE RAZORPAY ORDER
        // ==========================================

        const amountInPaise =
            Math.round(
                total * 100
            );

        const order =
            await razorpay.orders.create({
                amount:
                    amountInPaise,

                currency:
                    'INR',

                receipt:
                    `pv_${Date.now()}`,
            });

        // ==========================================
        // RESPONSE
        // ==========================================

        return NextResponse.json({
            id: order.id,
            amount:
                order.amount,
            currency:
                order.currency,
        });

    } catch (error) {

        console.error(
            'Razorpay order creation failed:',
            error
        );

        return NextResponse.json(
            {
                error:
                    'Unable to create Razorpay order.',
            },
            {
                status: 500,
            }
        );
    }
}