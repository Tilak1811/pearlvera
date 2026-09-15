import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

const ADMIN_UID =
    'Gv0dgh6nH9gsyiDdZDTuXilUzPm2';

type OrderItem = {
    productId?: unknown;
    quantity?: unknown;
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

        const body =
            await request.json();

        const orderId =
            body?.orderId;

        if (
            typeof orderId !== 'string' ||
            !orderId
        ) {
            return NextResponse.json(
                {
                    error:
                        'Order ID is required.',
                },
                { status: 400 }
            );
        }

        // ==========================================
        // FIRESTORE TRANSACTION
        // ==========================================

        let alreadyCancelled = false;

        await adminDb.runTransaction(
            async (transaction) => {
                const orderRef =
                    adminDb
                        .collection('orders')
                        .doc(orderId);

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
                    orderSnapshot.data() as {
                        status?: unknown;
                        cancellationRequested?: unknown;
                        stockRestored?: unknown;
                        items?: unknown;
                    };

                // ----------------------------------
                // IDEMPOTENCY / ALREADY CANCELLED
                // ----------------------------------

                if (
                    order.status ===
                    'Cancelled' &&
                    order.stockRestored === true
                ) {
                    alreadyCancelled = true;
                    return;
                }

                // ----------------------------------
                // VALID STATE
                // ----------------------------------

                if (
                    order.status !==
                    'Processing'
                ) {
                    throw new Error(
                        'ORDER_NOT_PROCESSING'
                    );
                }

                if (
                    order.cancellationRequested !==
                    true
                ) {
                    throw new Error(
                        'CANCELLATION_NOT_REQUESTED'
                    );
                }

                // ----------------------------------
                // VALIDATE ORDER ITEMS
                // ----------------------------------

                if (
                    !Array.isArray(
                        order.items
                    ) ||
                    order.items.length === 0
                ) {
                    throw new Error(
                        'INVALID_ORDER_ITEMS'
                    );
                }

                const normalizedItems =
                    new Map<string, number>();

                for (
                    const item of
                    order.items as OrderItem[]
                ) {
                    if (
                        typeof item.productId !==
                        'string' ||
                        !item.productId
                    ) {
                        throw new Error(
                            'INVALID_ORDER_ITEMS'
                        );
                    }

                    if (
                        !Number.isInteger(
                            item.quantity
                        ) ||
                        Number(item.quantity) <=
                        0
                    ) {
                        throw new Error(
                            'INVALID_ORDER_ITEMS'
                        );
                    }

                    const currentQuantity =
                        normalizedItems.get(
                            item.productId
                        ) ?? 0;

                    const combinedQuantity =
                        currentQuantity +
                        Number(item.quantity);

                    if (
                        !Number.isSafeInteger(
                            combinedQuantity
                        )
                    ) {
                        throw new Error(
                            'INVALID_ORDER_ITEMS'
                        );
                    }

                    normalizedItems.set(
                        item.productId,
                        combinedQuantity
                    );
                }

                // ----------------------------------
                // READ PRODUCTS
                // ----------------------------------

                const productSnapshots: {
                    productId: string;
                    quantity: number;
                    ref: FirebaseFirestore.DocumentReference;
                    snapshot: FirebaseFirestore.DocumentSnapshot;
                }[] = [];

                for (
                    const [
                        productId,
                        quantity,
                    ] of normalizedItems
                ) {
                    const productRef =
                        adminDb
                            .collection(
                                'products'
                            )
                            .doc(productId);

                    const productSnapshot =
                        await transaction.get(
                            productRef
                        );

                    if (
                        !productSnapshot.exists
                    ) {
                        throw new Error(
                            `PRODUCT_NOT_FOUND:${productId}`
                        );
                    }

                    productSnapshots.push({
                        productId,
                        quantity,
                        ref: productRef,
                        snapshot:
                            productSnapshot,
                    });
                }

                // ----------------------------------
                // RESTORE STOCK
                // ----------------------------------

                for (
                    const {
                        quantity,
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
                            productData.stock ??
                            0
                        );

                    if (
                        !Number.isInteger(
                            currentStock
                        ) ||
                        currentStock < 0
                    ) {
                        throw new Error(
                            'INVALID_PRODUCT_STOCK'
                        );
                    }

                    const restoredStock =
                        currentStock +
                        quantity;

                    if (
                        !Number.isSafeInteger(
                            restoredStock
                        )
                    ) {
                        throw new Error(
                            'INVALID_PRODUCT_STOCK'
                        );
                    }

                    transaction.update(
                        ref,
                        {
                            stock:
                                restoredStock,
                        }
                    );
                }

                // ----------------------------------
                // CANCEL ORDER
                // ----------------------------------

                transaction.update(
                    orderRef,
                    {
                        status: 'Cancelled',
                        stockRestored: true,
                        stockRestoredAt:
                            FieldValue.serverTimestamp(),
                        cancellationApprovedAt:
                            FieldValue.serverTimestamp(),
                    }
                );
            }
        );

        if (alreadyCancelled) {
            return NextResponse.json({
                success: true,
                alreadyCancelled: true,
                message:
                    'Order was already cancelled and stock was already restored.',
            });
        }

        return NextResponse.json({
            success: true,
            message:
                'Order cancelled and stock restored successfully.',
        });
    } catch (error) {
        console.error(
            'Failed to cancel order:',
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

                case 'ORDER_NOT_PROCESSING':
                    return NextResponse.json(
                        {
                            error:
                                'Only Processing orders can be cancelled.',
                        },
                        { status: 409 }
                    );

                case 'CANCELLATION_NOT_REQUESTED':
                    return NextResponse.json(
                        {
                            error:
                                'This order does not have a cancellation request.',
                        },
                        { status: 409 }
                    );

                case 'INVALID_ORDER_ITEMS':
                    return NextResponse.json(
                        {
                            error:
                                'Order contains invalid items.',
                        },
                        { status: 500 }
                    );

                case 'INVALID_PRODUCT_STOCK':
                    return NextResponse.json(
                        {
                            error:
                                'A product has invalid stock data.',
                        },
                        { status: 500 }
                    );
            }

            if (
                error.message.startsWith(
                    'PRODUCT_NOT_FOUND:'
                )
            ) {
                return NextResponse.json(
                    {
                        error:
                            'A product from this order no longer exists.',
                    },
                    { status: 500 }
                );
            }
        }

        return NextResponse.json(
            {
                error:
                    'Unable to cancel order.',
            },
            { status: 500 }
        );
    }
}