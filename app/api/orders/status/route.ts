import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

const ADMIN_UID =
    'Gv0dgh6nH9gsyiDdZDTuXilUzPm2';

const VALID_STATUSES = [
    'Processing',
    'Shipped',
    'Out for Delivery',
    'Delivered',
] as const;

type OrderStatus =
    (typeof VALID_STATUSES)[number];

type RequestBody = {
    orderId?: unknown;
    status?: unknown;
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

        // ==========================================
        // ADMIN AUTHORIZATION
        // ==========================================

        if (
            decodedToken.uid !== ADMIN_UID
        ) {
            return NextResponse.json(
                {
                    error:
                        'Admin authorization required.',
                },
                { status: 403 }
            );
        }

        // ==========================================
        // REQUEST DATA
        // ==========================================

        let body: RequestBody;

        try {
            body =
                (await request.json()) as RequestBody;
        } catch {
            return NextResponse.json(
                {
                    error:
                        'Invalid JSON request body.',
                },
                { status: 400 }
            );
        }

        const {
            orderId,
            status,
        } = body;

        if (
            typeof orderId !== 'string' ||
            !orderId.trim()
        ) {
            return NextResponse.json(
                {
                    error:
                        'Invalid order ID.',
                },
                { status: 400 }
            );
        }

        if (
            typeof status !== 'string' ||
            !VALID_STATUSES.includes(
                status as OrderStatus
            )
        ) {
            return NextResponse.json(
                {
                    error:
                        'Invalid order status.',
                },
                { status: 400 }
            );
        }

        // ==========================================
        // UPDATE ORDER
        // ==========================================

        const orderRef =
            adminDb
                .collection('orders')
                .doc(orderId);

        const result =
            await adminDb.runTransaction(
                async (transaction) => {
                    const orderSnapshot =
                        await transaction.get(
                            orderRef
                        );

                    if (
                        !orderSnapshot.exists
                    ) {
                        throw new Error(
                            'ORDER_NOT_FOUND'
                        );
                    }

                    const order =
                        orderSnapshot.data();

                    if (!order) {
                        throw new Error(
                            'ORDER_DATA_INVALID'
                        );
                    }

                    const currentStatus =
                        order.status;

                    // ==================================
                    // VALIDATE CURRENT STATUS
                    // ==================================

                    if (
                        typeof currentStatus !==
                        'string'
                    ) {
                        throw new Error(
                            'ORDER_STATUS_INVALID'
                        );
                    }

                    // ==================================
                    // IDEMPOTENT SAME-STATUS REQUEST
                    // ==================================

                    if (
                        currentStatus === status
                    ) {
                        return {
                            alreadySet: true,
                        };
                    }

                    // ==================================
                    // NEVER CHANGE CANCELLED ORDERS
                    // ==================================

                    if (
                        currentStatus ===
                        'Cancelled'
                    ) {
                        throw new Error(
                            'ORDER_ALREADY_CANCELLED'
                        );
                    }

                    // ==================================
                    // VALIDATE STATUS TRANSITION
                    // ==================================

                    const allowedNextStatus:
                        Record<
                            string,
                            string
                        > = {
                        Processing:
                            'Shipped',
                        Shipped:
                            'Out for Delivery',
                        'Out for Delivery':
                            'Delivered',
                    };

                    if (
                        allowedNextStatus[
                        currentStatus
                        ] !== status
                    ) {
                        throw new Error(
                            'INVALID_STATUS_TRANSITION'
                        );
                    }

                    // ==================================
                    // CANCELLATION REQUEST PROTECTION
                    // ==================================

                    if (
                        order.cancellationRequested ===
                        true &&
                        currentStatus ===
                        'Processing'
                    ) {
                        throw new Error(
                            'CANCELLATION_REQUEST_PENDING'
                        );
                    }

                    // ==================================
                    // UPDATE
                    // ==================================

                    transaction.update(
                        orderRef,
                        {
                            status,
                            updatedAt:
                                FieldValue.serverTimestamp(),
                        }
                    );

                    return {
                        alreadySet: false,
                    };
                }
            );

        // ==========================================
        // SUCCESS
        // ==========================================

        return NextResponse.json({
            success: true,
            alreadySet:
                result.alreadySet,
            status,
        });

    } catch (error) {
        console.error(
            'Order status update failed:',
            error
        );

        if (
            error instanceof Error
        ) {
            switch (error.message) {
                case 'ORDER_NOT_FOUND':
                    return NextResponse.json(
                        {
                            error:
                                'Order not found.',
                        },
                        { status: 404 }
                    );

                case 'ORDER_DATA_INVALID':
                    return NextResponse.json(
                        {
                            error:
                                'Order data is invalid.',
                        },
                        { status: 500 }
                    );

                case 'ORDER_STATUS_INVALID':
                    return NextResponse.json(
                        {
                            error:
                                'Order status is invalid.',
                        },
                        { status: 500 }
                    );

                case 'ORDER_ALREADY_CANCELLED':
                    return NextResponse.json(
                        {
                            error:
                                'Cancelled orders cannot be changed.',
                        },
                        { status: 409 }
                    );

                case 'INVALID_STATUS_TRANSITION':
                    return NextResponse.json(
                        {
                            error:
                                'Invalid order status transition.',
                        },
                        { status: 409 }
                    );

                case 'CANCELLATION_REQUEST_PENDING':
                    return NextResponse.json(
                        {
                            error:
                                'This order has a pending cancellation request. Approve or resolve the cancellation before shipping.',
                        },
                        { status: 409 }
                    );
            }
        }

        return NextResponse.json(
            {
                error:
                    'Unable to update order status.',
            },
            { status: 500 }
        );
    }
}