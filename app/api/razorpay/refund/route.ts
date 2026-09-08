import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { adminDb, adminAuth } from '@/lib/firebaseAdmin';

const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

if (!razorpayKeyId || !razorpayKeySecret) {
    throw new Error(
        'Razorpay environment variables are missing.'
    );
}

const razorpay = new Razorpay({
    key_id: razorpayKeyId,
    key_secret: razorpayKeySecret,
});

const ADMIN_UID =
    'Gv0dgh6nH9gsyiDdZDTuXilUzPm2';

export async function POST(
    request: NextRequest
) {
    try {
        // ==========================================
        // VERIFY FIREBASE LOGIN
        // ==========================================

        const authorization =
            request.headers.get(
                'authorization'
            );

        if (
            !authorization ||
            !authorization.startsWith('Bearer ')
        ) {
            return NextResponse.json(
                {
                    error:
                        'Authentication required.',
                },
                {
                    status: 401,
                }
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
                {
                    status: 401,
                }
            );
        }

        // ==========================================
        // VERIFY ADMIN
        // ==========================================

        if (
            decodedToken.uid !==
            ADMIN_UID
        ) {
            return NextResponse.json(
                {
                    error:
                        'Only the Pearlvera admin can process refunds.',
                },
                {
                    status: 403,
                }
            );
        }

        // ==========================================
        // READ REQUEST
        // ==========================================

        const body =
            await request.json();

        const {
            orderId,
            paymentId,
        } = body;

        if (!orderId || !paymentId) {
            return NextResponse.json(
                {
                    error:
                        'Order ID and payment ID are required.',
                },
                {
                    status: 400,
                }
            );
        }

        // ==========================================
        // GET ORDER
        // ==========================================

        const orderRef =
            adminDb
                .collection('orders')
                .doc(orderId);

        const orderSnapshot =
            await orderRef.get();

        if (!orderSnapshot.exists) {
            return NextResponse.json(
                {
                    error:
                        'Order not found.',
                },
                {
                    status: 404,
                }
            );
        }

        const order =
            orderSnapshot.data();

        // ==========================================
        // VERIFY ORDER
        // ==========================================

        if (
            order?.paymentMethod !==
            'Razorpay'
        ) {
            return NextResponse.json(
                {
                    error:
                        'This order was not paid using Razorpay.',
                },
                {
                    status: 400,
                }
            );
        }

        if (
            typeof order?.paymentId !== 'string' ||
            order.paymentId !== paymentId
        ) {
            return NextResponse.json(
                {
                    error:
                        'Payment does not belong to this order.',
                },
                {
                    status: 400,
                }
            );
        }

        if (
            order?.status !==
            'Cancelled'
        ) {
            return NextResponse.json(
                {
                    error:
                        'Order must be cancelled before refund.',
                },
                {
                    status: 400,
                }
            );
        }

        if (
            order?.refundStatus === 'Refunded' ||
            order?.refundStatus === 'Refund Pending'
        ) {
            return NextResponse.json(
                {
                    error:
                        'A refund has already been processed or is currently pending for this order.',
                },
                {
                    status: 400,
                }
            );
        }

        // ==========================================
        // VALIDATE REFUND AMOUNT
        // ==========================================

        const orderTotal =
            Number(order.total);

        if (
            !Number.isFinite(orderTotal) ||
            orderTotal <= 0
        ) {
            return NextResponse.json(
                {
                    error:
                        'Order has an invalid refund amount.',
                },
                {
                    status: 400,
                }
            );
        }

        // ==========================================
        // VERIFY PAYMENT WITH RAZORPAY
        // ==========================================

        const payment =
            await razorpay.payments.fetch(
                paymentId
            );

        if (
            payment.order_id !==
            order.razorpayOrderId
        ) {
            return NextResponse.json(
                {
                    error:
                        'Razorpay payment does not belong to this order.',
                },
                {
                    status: 400,
                }
            );
        }

        if (
            payment.status !==
            'captured'
        ) {
            return NextResponse.json(
                {
                    error:
                        'Payment is not captured and cannot be refunded.',
                },
                {
                    status: 400,
                }
            );
        }

        const refundAmount =
            Math.round(
                orderTotal * 100
            );

        if (
            payment.amount !==
            refundAmount
        ) {
            return NextResponse.json(
                {
                    error:
                        'Payment amount does not match the order total.',
                },
                {
                    status: 400,
                }
            );
        }

        // ==========================================
        // CREATE RAZORPAY REFUND
        // ==========================================

        const refund =
            await razorpay.payments.refund(
                paymentId,
                {
                    amount:
                        refundAmount,
                    speed: 'normal',
                }
            );

        // ==========================================
        // SAVE REFUND INFORMATION
        // ==========================================

        await orderRef.update({
            refundStatus:
                refund.status ===
                    'processed'
                    ? 'Refunded'
                    : 'Refund Pending',

            refundId:
                refund.id,

            refundedAt:
                new Date(),
        });

        return NextResponse.json({
            success: true,
            refundId:
                refund.id,
            status:
                refund.status,
        });

    } catch (error) {
        console.error(
            'Razorpay refund failed:',
            error
        );

        return NextResponse.json(
            {
                error:
                    'Unable to process refund.',
            },
            {
                status: 500,
            }
        );
    }
}