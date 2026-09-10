import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { adminAuth } from '@/lib/firebaseAdmin';

const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

if (!razorpayKeyId || !razorpayKeySecret) {
    throw new Error(
        'Razorpay environment variables are missing.'
    );
}

const razorpay = new Razorpay({
    key_id: razorpayKeyId!,
    key_secret: razorpayKeySecret!,
});

export async function POST(
    request: NextRequest
) {
    try {

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
                    verified: false,
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
                    verified: false,
                    error:
                        'Invalid authentication token.',
                },
                {
                    status: 401,
                }
            );
        }

        const body = await request.json();

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            expectedAmount,
        } = body;


        // ==================================
        // CHECK REQUIRED DATA
        // ==================================

        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return NextResponse.json(
                {
                    verified: false,
                    error:
                        'Missing payment verification data.',
                },
                {
                    status: 400,
                }
            );
        }


        // ==================================
        // VERIFY SIGNATURE
        // ==================================

        const generatedSignature =
            crypto
                .createHmac(
                    'sha256',
                    razorpayKeySecret!
                )
                .update(
                    `${razorpay_order_id}|${razorpay_payment_id}`
                )
                .digest('hex');


        if (
            generatedSignature.length !==
            razorpay_signature.length
        ) {
            return NextResponse.json(
                {
                    verified: false,
                    error:
                        'Invalid payment signature.',
                },
                {
                    status: 400,
                }
            );
        }


        const isValid =
            crypto.timingSafeEqual(
                Buffer.from(
                    generatedSignature
                ),
                Buffer.from(
                    razorpay_signature
                )
            );


        if (!isValid) {
            return NextResponse.json(
                {
                    verified: false,
                    error:
                        'Invalid payment signature.',
                },
                {
                    status: 400,
                }
            );
        }


        // ==================================
        // FETCH PAYMENT FROM RAZORPAY
        // ==================================

        const payment =
            await razorpay.payments.fetch(
                razorpay_payment_id
            );


        // ==================================
        // CHECK PAYMENT ORDER
        // ==================================

        if (
            payment.order_id !==
            razorpay_order_id
        ) {
            return NextResponse.json(
                {
                    verified: false,
                    error:
                        'Payment does not belong to this order.',
                },
                {
                    status: 400,
                }
            );
        }


        // ==================================
        // CHECK PAYMENT STATUS
        // ==================================

        if (
            payment.status !==
            'captured'
        ) {
            return NextResponse.json(
                {
                    verified: false,
                    status: payment.status,
                    error:
                        `Payment is not captured. Current status: ${payment.status}`,
                },
                {
                    status: 400,
                }
            );
        }


        // ==================================
        // CHECK PAYMENT AMOUNT
        // ==================================

        if (
            expectedAmount !== undefined
        ) {

            const expectedAmountInPaise =
                Math.round(
                    Number(expectedAmount) *
                    100
                );


            if (
                payment.amount !==
                expectedAmountInPaise
            ) {
                return NextResponse.json(
                    {
                        verified: false,
                        error:
                            'Payment amount does not match the order amount.',
                    },
                    {
                        status: 400,
                    }
                );
            }

        }


        // ==================================
        // PAYMENT VERIFIED
        // ==================================

        return NextResponse.json({
            verified: true,
            status: payment.status,
            paymentId:
                payment.id,
            orderId:
                payment.order_id,
            amount:
                payment.amount,
            currency:
                payment.currency,
        });


    } catch (error) {

        console.error(
            'Payment verification failed:',
            error
        );


        return NextResponse.json(
            {
                verified: false,
                error:
                    'Payment verification failed.',
            },
            {
                status: 500,
            }
        );

    }
}