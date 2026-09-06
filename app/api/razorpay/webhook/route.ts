import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb } from '@/lib/firebaseAdmin';

const webhookSecret =
    process.env.RAZORPAY_WEBHOOK_SECRET;

export async function POST(
    request: NextRequest
) {
    try {
        if (!webhookSecret) {
            console.error(
                'RAZORPAY_WEBHOOK_SECRET is missing.'
            );

            return NextResponse.json(
                {
                    error:
                        'Webhook configuration error.',
                },
                {
                    status: 500,
                }
            );
        }

        const rawBody =
            await request.text();

        const signature =
            request.headers.get(
                'x-razorpay-signature'
            );

        if (!signature) {
            return NextResponse.json(
                {
                    error:
                        'Missing webhook signature.',
                },
                {
                    status: 400,
                }
            );
        }

        const expectedSignature =
            crypto
                .createHmac(
                    'sha256',
                    webhookSecret
                )
                .update(rawBody)
                .digest('hex');

        const signaturesMatch =
            crypto.timingSafeEqual(
                Buffer.from(signature),
                Buffer.from(expectedSignature)
            );

        if (!signaturesMatch) {
            console.error(
                'Invalid Razorpay webhook signature.'
            );

            return NextResponse.json(
                {
                    error:
                        'Invalid webhook signature.',
                },
                {
                    status: 400,
                }
            );
        }

        const event =
            JSON.parse(rawBody);

        console.log(
            'Razorpay webhook received:',
            event.event
        );

        if (
            event.event ===
            'refund.processed'
        ) {
            const refund =
                event.payload?.refund?.entity;

            const refundId =
                refund?.id;

            const paymentId =
                refund?.payment_id;

            if (!refundId || !paymentId) {
                console.error(
                    'Refund webhook is missing refund ID or payment ID.'
                );

                return NextResponse.json({
                    received: true,
                });
            }

            const ordersSnapshot =
                await adminDb
                    .collection('orders')
                    .where(
                        'paymentId',
                        '==',
                        paymentId
                    )
                    .limit(1)
                    .get();

            if (
                ordersSnapshot.empty
            ) {
                console.error(
                    'No order found for payment:',
                    paymentId
                );

                return NextResponse.json({
                    received: true,
                });
            }

            const orderDoc =
                ordersSnapshot.docs[0];

            await orderDoc.ref.update({
                refundStatus:
                    'Refunded',

                refundId:
                    refundId,

                refundedAt:
                    new Date(),
            });

            console.log(
                'Refund marked as Refunded:',
                refundId
            );
        }

        if (
            event.event ===
            'refund.failed'
        ) {
            const refund =
                event.payload?.refund?.entity;

            const refundId =
                refund?.id;

            const paymentId =
                refund?.payment_id;

            if (!refundId || !paymentId) {
                return NextResponse.json({
                    received: true,
                });
            }

            const ordersSnapshot =
                await adminDb
                    .collection('orders')
                    .where(
                        'paymentId',
                        '==',
                        paymentId
                    )
                    .limit(1)
                    .get();

            if (
                ordersSnapshot.empty
            ) {
                console.error(
                    'No order found for failed refund:',
                    paymentId
                );

                return NextResponse.json({
                    received: true,
                });
            }

            const orderDoc =
                ordersSnapshot.docs[0];

            await orderDoc.ref.update({
                refundStatus:
                    'Refund Failed',

                refundId:
                    refundId,
            });

            console.log(
                'Refund marked as failed:',
                refundId
            );
        }

        return NextResponse.json({
            received: true,
        });

    } catch (error) {
        console.error(
            'Razorpay webhook error:',
            error
        );

        return NextResponse.json(
            {
                error:
                    'Webhook processing failed.',
            },
            {
                status: 500,
            }
        );
    }
}