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
                        'Only the Pearlvera admin can sync refunds.',
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
            refundId,
        } = body;

        if (
            !orderId ||
            !paymentId ||
            !refundId
        ) {
            return NextResponse.json(
                {
                    error:
                        'Order ID, payment ID and refund ID are required.',
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
        // VERIFY REFUND BELONGS TO ORDER
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
            order?.paymentId !==
            paymentId
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
            order?.refundId !==
            refundId
        ) {
            return NextResponse.json(
                {
                    error:
                        'Refund does not belong to this order.',
                },
                {
                    status: 400,
                }
            );
        }

        // ==========================================
        // FETCH REFUND FROM RAZORPAY
        // ==========================================

        const refund =
            await razorpay.refunds.fetch(
                refundId
            );

        // ==========================================
        // VERIFY PAYMENT MATCH
        // ==========================================

        if (
            refund.payment_id !==
            paymentId
        ) {
            return NextResponse.json(
                {
                    error:
                        'Razorpay refund does not belong to this payment.',
                },
                {
                    status: 400,
                }
            );
        }

        // ==========================================
        // UPDATE PEARLVERA STATUS
        // ==========================================

        if (
            refund.status ===
            'processed'
        ) {
            await orderRef.update({
                refundStatus:
                    'Refunded',

                refundId:
                    refund.id,

                refundedAt:
                    new Date(),
            });
        } else if (
            refund.status ===
            'failed'
        ) {
            await orderRef.update({
                refundStatus:
                    'Refund Failed',

                refundId:
                    refund.id,
            });
        } else {
            await orderRef.update({
                refundStatus:
                    'Refund Pending',

                refundId:
                    refund.id,
            });
        }

        return NextResponse.json({
            success: true,
            refundId:
                refund.id,
            status:
                refund.status,
        });

    } catch (error) {
        console.error(
            'Refund status sync failed:',
            error
        );

        return NextResponse.json(
            {
                error:
                    'Unable to sync refund status.',
            },
            {
                status: 500,
            }
        );
    }
}