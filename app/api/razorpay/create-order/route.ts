import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

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

export async function POST(
    request: NextRequest
) {
    try {
        const body = await request.json();

        const amount = Number(body.amount);

        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {
            return NextResponse.json(
                {
                    error: 'Invalid payment amount.',
                },
                {
                    status: 400,
                }
            );
        }

        const amountInPaise =
            Math.round(amount * 100);

        const order =
            await razorpay.orders.create({
                amount: amountInPaise,
                currency: 'INR',
                receipt:
                    `pv_${Date.now()}`,
            });

        return NextResponse.json({
            id: order.id,
            amount: order.amount,
            currency: order.currency,
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