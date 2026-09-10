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

        const eventId =
            request.headers.get(
                'x-razorpay-event-id'
            );

        if (!eventId) {
            return NextResponse.json(
                {
                    error:
                        'Missing webhook event ID.',
                },
                {
                    status: 400,
                }
            );
        }

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

        const receivedSignatureBuffer =
            Buffer.from(
                signature,
                'utf8'
            );

        const expectedSignatureBuffer =
            Buffer.from(
                expectedSignature,
                'utf8'
            );

        if (
            receivedSignatureBuffer.length !==
            expectedSignatureBuffer.length ||
            !crypto.timingSafeEqual(
                receivedSignatureBuffer,
                expectedSignatureBuffer
            )
        ) {
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

        let event;

        try {
            event =
                JSON.parse(rawBody);
        } catch (error) {
            console.error(
                'Invalid Razorpay webhook JSON:',
                error
            );

            return NextResponse.json(
                {
                    error:
                        'Invalid webhook payload.',
                },
                {
                    status: 400,
                }
            );
        }

        console.log(
            'Razorpay webhook received:',
            event.event,
            eventId
        );

        const webhookEventRef =
            adminDb
                .collection('webhookEvents')
                .doc(eventId);

        /*
         * Atomically claim this webhook event.
         *
         * Only an event marked "processed" is considered
         * permanently handled. If processing fails, Razorpay
         * can retry and the event will be processed again.
         */
        try {
            await adminDb.runTransaction(
                async (transaction) => {
                    const snapshot =
                        await transaction.get(
                            webhookEventRef
                        );

                    if (
                        snapshot.exists &&
                        snapshot.data()
                            ?.status ===
                        'processed'
                    ) {
                        return;
                    }

                    transaction.set(
                        webhookEventRef,
                        {
                            eventId,
                            event:
                                event.event ||
                                'unknown',
                            status:
                                'processing',
                            receivedAt:
                                snapshot.exists
                                    ? snapshot
                                        .data()
                                        ?.receivedAt ||
                                    new Date()
                                    : new Date(),
                            updatedAt:
                                new Date(),
                        },
                        {
                            merge: true,
                        }
                    );
                }
            );
        } catch (error) {
            console.error(
                'Failed to claim Razorpay webhook event:',
                error
            );

            return NextResponse.json(
                {
                    error:
                        'Unable to process webhook event.',
                },
                {
                    status: 500,
                }
            );
        }

        /*
         * Check whether this event was already successfully
         * processed.
         */
        const webhookEventSnapshot =
            await webhookEventRef.get();

        if (
            webhookEventSnapshot.exists &&
            webhookEventSnapshot.data()
                ?.status === 'processed'
        ) {
            console.log(
                'Duplicate Razorpay webhook ignored:',
                eventId
            );

            return NextResponse.json({
                received: true,
                duplicate: true,
            });
        }

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

            if (
                !refundId ||
                !paymentId
            ) {
                console.error(
                    'Refund processed webhook is missing refund ID or payment ID.'
                );

                await webhookEventRef.update({
                    status:
                        'failed',
                    error:
                        'Missing refund ID or payment ID.',
                    updatedAt:
                        new Date(),
                });

                return NextResponse.json(
                    {
                        error:
                            'Invalid refund webhook payload.',
                    },
                    {
                        status: 400,
                    }
                );
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

                await webhookEventRef.update({
                    status:
                        'failed',
                    error:
                        'Order not found for payment.',
                    updatedAt:
                        new Date(),
                });

                /*
                 * Return 500 so Razorpay can retry the
                 * webhook instead of permanently losing it.
                 */
                return NextResponse.json(
                    {
                        error:
                            'Order not found.',
                    },
                    {
                        status: 500,
                    }
                );
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

            if (
                !refundId ||
                !paymentId
            ) {
                console.error(
                    'Refund failed webhook is missing refund ID or payment ID.'
                );

                await webhookEventRef.update({
                    status:
                        'failed',
                    error:
                        'Missing refund ID or payment ID.',
                    updatedAt:
                        new Date(),
                });

                return NextResponse.json(
                    {
                        error:
                            'Invalid refund webhook payload.',
                    },
                    {
                        status: 400,
                    }
                );
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

                await webhookEventRef.update({
                    status:
                        'failed',
                    error:
                        'Order not found for payment.',
                    updatedAt:
                        new Date(),
                });

                return NextResponse.json(
                    {
                        error:
                            'Order not found.',
                    },
                    {
                        status: 500,
                    }
                );
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

        /*
         * Only mark the webhook as processed AFTER
         * the business operation has succeeded.
         */
        await webhookEventRef.update({
            status:
                'processed',
            processedAt:
                new Date(),
            updatedAt:
                new Date(),
        });

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