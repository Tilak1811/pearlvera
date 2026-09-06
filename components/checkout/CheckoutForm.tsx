'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import { auth, db } from '@/lib/firebase';

export type CheckoutData = {
    fullName: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pinCode: string;
};

type Props = {
    value: CheckoutData;
    onChange: (data: CheckoutData) => void;
};

export default function CheckoutForm({
    value,
    onChange,
}: Props) {
    const [loadingProfile, setLoadingProfile] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(
            auth,
            async (user: User | null) => {
                if (!user) {
                    setLoadingProfile(false);
                    return;
                }

                try {
                    const userRef = doc(db, 'users', user.uid);
                    const userSnap = await getDoc(userRef);

                    if (userSnap.exists()) {
                        const profile = userSnap.data();

                        onChange({
                            fullName:
                                profile.name ||
                                profile.fullName ||
                                user.displayName ||
                                '',
                            email:
                                profile.email ||
                                user.email ||
                                '',
                            phone:
                                profile.phone ||
                                '',
                            street:
                                profile.street ||
                                profile.address ||
                                '',
                            city:
                                profile.city ||
                                '',
                            state:
                                profile.state ||
                                '',
                            pinCode:
                                profile.pinCode ||
                                profile.pincode ||
                                '',
                        });
                    } else {
                        onChange({
                            ...value,
                            fullName: user.displayName || value.fullName,
                            email: user.email || value.email,
                        });
                    }
                } catch (error) {
                    console.error(
                        'Failed to load profile:',
                        error
                    );
                } finally {
                    setLoadingProfile(false);
                }
            }
        );

        return () => unsubscribe();
    }, []);

    function updateField(
        field: keyof CheckoutData,
        fieldValue: string
    ) {
        onChange({
            ...value,
            [field]: fieldValue,
        });
    }

    return (
        <div className="rounded-3xl bg-white p-8 shadow-sm md:p-10">

            <div className="mb-8">
                <p className="text-xs uppercase tracking-[0.3em] text-stone-400">
                    Your Details
                </p>

                <h2
                    className="mt-2 text-3xl text-stone-900"
                    style={{
                        fontFamily: 'var(--font-playfair)',
                    }}
                >
                    Contact Information
                </h2>

                {loadingProfile && (
                    <p className="mt-2 text-sm text-stone-400">
                        Loading your profile...
                    </p>
                )}
            </div>

            <div className="space-y-5">

                <input
                    type="text"
                    value={value.fullName}
                    onChange={(e) =>
                        updateField('fullName', e.target.value)
                    }
                    placeholder="Full Name"
                    className="w-full rounded-2xl border border-stone-300 bg-white px-5 py-4 text-stone-900 placeholder:text-stone-400 outline-none transition focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                />

                <input
                    type="email"
                    value={value.email}
                    onChange={(e) =>
                        updateField('email', e.target.value)
                    }
                    placeholder="Email Address"
                    className="w-full rounded-2xl border border-stone-300 bg-white px-5 py-4 text-stone-900 placeholder:text-stone-400 outline-none transition focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                />

                <input
                    type="tel"
                    value={value.phone}
                    onChange={(e) =>
                        updateField('phone', e.target.value)
                    }
                    placeholder="Phone Number"
                    className="w-full rounded-2xl border border-stone-300 bg-white px-5 py-4 text-stone-900 placeholder:text-stone-400 outline-none transition focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                />

            </div>

            <div className="mb-8 mt-12">
                <p className="text-xs uppercase tracking-[0.3em] text-stone-400">
                    Delivery
                </p>

                <h2
                    className="mt-2 text-3xl text-stone-900"
                    style={{
                        fontFamily: 'var(--font-playfair)',
                    }}
                >
                    Shipping Address
                </h2>
            </div>

            <div className="space-y-5">

                <input
                    type="text"
                    value={value.street}
                    onChange={(e) =>
                        updateField('street', e.target.value)
                    }
                    placeholder="Street Address"
                    className="w-full rounded-2xl border border-stone-300 bg-white px-5 py-4 text-stone-900 placeholder:text-stone-400 outline-none transition focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                />

                <div className="grid gap-5 md:grid-cols-2">

                    <input
                        type="text"
                        value={value.city}
                        onChange={(e) =>
                            updateField('city', e.target.value)
                        }
                        placeholder="City"
                        className="rounded-2xl border border-stone-300 bg-white px-5 py-4 text-stone-900 placeholder:text-stone-400 outline-none transition focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                    />

                    <input
                        type="text"
                        value={value.state}
                        onChange={(e) =>
                            updateField('state', e.target.value)
                        }
                        placeholder="State"
                        className="rounded-2xl border border-stone-300 bg-white px-5 py-4 text-stone-900 placeholder:text-stone-400 outline-none transition focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                    />

                </div>

                <input
                    type="text"
                    value={value.pinCode}
                    onChange={(e) =>
                        updateField('pinCode', e.target.value)
                    }
                    placeholder="PIN Code"
                    className="w-full rounded-2xl border border-stone-300 bg-white px-5 py-4 text-stone-900 placeholder:text-stone-400 outline-none transition focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                />

            </div>

        </div>
    );
}