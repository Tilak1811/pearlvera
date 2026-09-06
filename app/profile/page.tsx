'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
    User,
    Mail,
    Phone,
    MapPin,
    Check,
    ArrowLeft,
} from 'lucide-react';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

import { useAuth } from '@/context/AuthContext';

import {
    getUserProfile,
    saveUserProfile,
} from '@/lib/userProfile';


export default function ProfilePage() {

    const router = useRouter();

    const {
        user,
        loading,
        updateUserProfile,
    } = useAuth();


    // ==========================================
    // FORM STATE
    // ==========================================

    const [name, setName] =
        useState('');

    const [phone, setPhone] =
        useState('');

    const [address, setAddress] =
        useState('');

    const [city, setCity] =
        useState('');

    const [state, setState] =
        useState('');

    const [pinCode, setPinCode] =
        useState('');


    // ==========================================
    // PAGE STATE
    // ==========================================

    const [pageLoading, setPageLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [saved, setSaved] =
        useState(false);

    const [error, setError] =
        useState('');


    // ==========================================
    // AUTH CHECK
    // ==========================================

    useEffect(() => {

        if (
            !loading &&
            !user
        ) {

            router.replace('/login');

        }

    }, [
        user,
        loading,
        router,
    ]);


    // ==========================================
    // LOAD PROFILE
    // ==========================================

    useEffect(() => {

        async function loadProfile() {

            if (!user) {
                return;
            }


            setPageLoading(true);


            try {

                const profile =
                    await getUserProfile(
                        user.uid
                    );


                if (profile) {

                    setName(
                        profile.name || ''
                    );

                    setPhone(
                        profile.phone || ''
                    );

                    setAddress(
                        profile.address || ''
                    );

                    setCity(
                        profile.city || ''
                    );

                    setState(
                        profile.state || ''
                    );

                    setPinCode(
                        profile.pinCode || ''
                    );

                } else {

                    setName(
                        user.displayName || ''
                    );

                }


            } catch (error) {

                console.error(
                    'Failed to load profile:',
                    error
                );

                setError(
                    'Unable to load your profile.'
                );


            } finally {

                setPageLoading(false);

            }

        }


        if (user) {
            loadProfile();
        }

    }, [user]);


    // ==========================================
    // SAVE PROFILE
    // ==========================================

    async function handleSave(
        event: React.FormEvent<HTMLFormElement>
    ) {

        event.preventDefault();


        if (!user) {
            return;
        }


        if (!name.trim()) {

            setError(
                'Please enter your name.'
            );

            return;

        }


        if (
            pinCode &&
            pinCode.length !== 6
        ) {

            setError(
                'Please enter a valid 6-digit PIN code.'
            );

            return;

        }


        setError('');
        setSaved(false);
        setSaving(true);


        try {

            // ----------------------------------
            // UPDATE FIREBASE AUTH NAME
            // ----------------------------------

            await updateUserProfile(
                name.trim()
            );


            // ----------------------------------
            // SAVE PROFILE TO FIRESTORE
            // ----------------------------------

            await saveUserProfile({

                uid: user.uid,

                name: name.trim(),

                email: user.email || '',

                phone: phone.trim(),

                address: address.trim(),

                city: city.trim(),

                state: state.trim(),

                pinCode: pinCode.trim(),

            });


            setSaved(true);


            setTimeout(() => {

                setSaved(false);

            }, 2500);


        } catch (error) {

            console.error(
                'Failed to save profile:',
                error
            );

            setError(
                'Unable to save your profile. Please try again.'
            );


        } finally {

            setSaving(false);

        }

    }


    // ==========================================
    // LOADING
    // ==========================================

    if (
        loading ||
        pageLoading ||
        !user
    ) {

        return (

            <div className="flex min-h-screen items-center justify-center bg-[#FAF8F5]">

                <div className="text-center">

                    <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900" />

                    <p className="mt-4 text-sm text-stone-600">
                        Loading your profile...
                    </p>

                </div>

            </div>

        );

    }


    // ==========================================
    // PROFILE PAGE
    // ==========================================

    return (

        <>
            <Navbar />


            <main className="min-h-screen bg-[#FAF8F5]">


                {/* ==================================
                    HEADER
                ================================== */}

                <section className="border-b border-stone-200 bg-white">

                    <div className="mx-auto max-w-5xl px-6 py-12">


                        <button
                            type="button"
                            onClick={() =>
                                router.push('/account')
                            }
                            className="inline-flex items-center gap-2 text-sm text-stone-500 transition hover:text-stone-900"
                        >

                            <ArrowLeft size={16} />

                            Back to My Account

                        </button>


                        <p className="mt-8 text-xs font-medium uppercase tracking-[0.35em] text-stone-500">
                            My Pearlvera
                        </p>


                        <h1
                            className="mt-3 text-5xl text-stone-900"
                            style={{
                                fontFamily:
                                    'var(--font-playfair)',
                            }}
                        >
                            Profile
                        </h1>


                        <p className="mt-4 max-w-xl text-stone-500">
                            Manage your personal information
                            and delivery details.
                        </p>

                    </div>

                </section>


                {/* ==================================
                    PROFILE FORM
                ================================== */}

                <section className="mx-auto max-w-5xl px-6 py-14">

                    <div className="rounded-[32px] border border-stone-200 bg-white p-8 shadow-sm sm:p-10">


                        {/* Form Header */}

                        <div className="border-b border-stone-200 pb-7">

                            <h2
                                className="text-3xl text-stone-900"
                                style={{
                                    fontFamily:
                                        'var(--font-playfair)',
                                }}
                            >
                                Personal Information
                            </h2>


                            <p className="mt-2 text-sm leading-6 text-stone-600">
                                Keep your information updated
                                for a faster checkout.
                            </p>

                        </div>


                        <form
                            onSubmit={handleSave}
                            className="mt-8 space-y-6"
                        >


                            {/* ==================================
                                FULL NAME
                            ================================== */}

                            <div>

                                <label
                                    htmlFor="profile-name"
                                    className="mb-2 block text-sm font-medium text-stone-800"
                                >
                                    Full Name
                                </label>


                                <div className="relative">

                                    <User
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                                    />


                                    <input
                                        id="profile-name"
                                        type="text"
                                        value={name}
                                        onChange={(event) =>
                                            setName(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Your full name"
                                        className="w-full rounded-2xl border border-stone-300 bg-white py-4 pl-11 pr-4 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                                    />

                                </div>

                            </div>


                            {/* ==================================
                                EMAIL
                            ================================== */}

                            <div>

                                <label
                                    htmlFor="profile-email"
                                    className="mb-2 block text-sm font-medium text-stone-800"
                                >
                                    Email Address
                                </label>


                                <div className="relative">

                                    <Mail
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                                    />


                                    <input
                                        id="profile-email"
                                        type="email"
                                        value={
                                            user.email || ''
                                        }
                                        disabled
                                        className="w-full cursor-not-allowed rounded-2xl border border-stone-200 bg-stone-100 py-4 pl-11 pr-4 text-stone-600"
                                    />

                                </div>


                                <p className="mt-2 text-xs text-stone-400">
                                    Email address cannot be changed here.
                                </p>

                            </div>


                            {/* ==================================
                                PHONE
                            ================================== */}

                            <div>

                                <label
                                    htmlFor="profile-phone"
                                    className="mb-2 block text-sm font-medium text-stone-800"
                                >
                                    Phone Number
                                </label>


                                <div className="relative">

                                    <Phone
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                                    />


                                    <input
                                        id="profile-phone"
                                        type="tel"
                                        value={phone}
                                        onChange={(event) =>
                                            setPhone(
                                                event.target.value
                                            )
                                        }
                                        placeholder="+91 XXXXX XXXXX"
                                        className="w-full rounded-2xl border border-stone-300 bg-white py-4 pl-11 pr-4 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                                    />

                                </div>

                            </div>


                            {/* ==================================
                                ADDRESS
                            ================================== */}

                            <div>

                                <label
                                    htmlFor="profile-address"
                                    className="mb-2 block text-sm font-medium text-stone-800"
                                >
                                    Street Address
                                </label>


                                <div className="relative">

                                    <MapPin
                                        size={18}
                                        className="absolute left-4 top-4 text-stone-400"
                                    />


                                    <textarea
                                        id="profile-address"
                                        value={address}
                                        onChange={(event) =>
                                            setAddress(
                                                event.target.value
                                            )
                                        }
                                        placeholder="House number, street, area"
                                        rows={3}
                                        className="w-full resize-none rounded-2xl border border-stone-300 bg-white py-4 pl-11 pr-4 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                                    />

                                </div>

                            </div>


                            {/* ==================================
                                CITY + STATE
                            ================================== */}

                            <div className="grid gap-6 sm:grid-cols-2">


                                <div>

                                    <label
                                        htmlFor="profile-city"
                                        className="mb-2 block text-sm font-medium text-stone-800"
                                    >
                                        City
                                    </label>


                                    <input
                                        id="profile-city"
                                        type="text"
                                        value={city}
                                        onChange={(event) =>
                                            setCity(
                                                event.target.value
                                            )
                                        }
                                        placeholder="City"
                                        className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-4 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                                    />

                                </div>


                                <div>

                                    <label
                                        htmlFor="profile-state"
                                        className="mb-2 block text-sm font-medium text-stone-800"
                                    >
                                        State
                                    </label>


                                    <input
                                        id="profile-state"
                                        type="text"
                                        value={state}
                                        onChange={(event) =>
                                            setState(
                                                event.target.value
                                            )
                                        }
                                        placeholder="State"
                                        className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-4 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                                    />

                                </div>

                            </div>


                            {/* ==================================
                                PIN CODE
                            ================================== */}

                            <div>

                                <label
                                    htmlFor="profile-pin"
                                    className="mb-2 block text-sm font-medium text-stone-800"
                                >
                                    PIN Code
                                </label>


                                <input
                                    id="profile-pin"
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={pinCode}
                                    onChange={(event) =>
                                        setPinCode(
                                            event.target.value.replace(
                                                /\D/g,
                                                ''
                                            )
                                        )
                                    }
                                    placeholder="6-digit PIN code"
                                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-4 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                                />

                            </div>


                            {/* ==================================
                                ERROR
                            ================================== */}

                            {error && (

                                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {error}
                                </div>

                            )}


                            {/* ==================================
                                SUCCESS
                            ================================== */}

                            {saved && (

                                <div className="flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">

                                    <Check size={17} />

                                    Profile saved successfully.

                                </div>

                            )}


                            {/* ==================================
                                ACTIONS
                            ================================== */}

                            <div className="flex flex-col gap-3 pt-2 sm:flex-row">

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-full bg-stone-900 px-8 py-4 font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                                >

                                    {saving
                                        ? 'Saving...'
                                        : 'Save Changes'}

                                </button>


                                <button
                                    type="button"
                                    onClick={() =>
                                        router.push('/account')
                                    }
                                    className="rounded-full border border-stone-300 px-8 py-4 font-medium text-stone-800 transition hover:bg-stone-100"
                                >

                                    Cancel

                                </button>

                            </div>


                        </form>

                    </div>

                </section>

            </main>


            <Footer />

        </>

    );
}