'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';

export default function SignupPage() {
    const router = useRouter();

    const { signUp, loginWithGoogle } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const [error, setError] = useState('');

    async function handleSignup(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError('');

        if (password.length < 6) {
            setError(
                'Password must contain at least 6 characters.'
            );
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);

        try {
            await signUp(
                email.trim(),
                password,
                name.trim()
            );

            router.push('/');

        } catch (error: any) {
            console.error(error);

            switch (error.code) {
                case 'auth/email-already-in-use':
                    setError(
                        'An account already exists with this email.'
                    );
                    break;

                case 'auth/invalid-email':
                    setError(
                        'Please enter a valid email address.'
                    );
                    break;

                case 'auth/weak-password':
                    setError(
                        'Please choose a stronger password.'
                    );
                    break;

                default:
                    setError(
                        'Unable to create your account. Please try again.'
                    );
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleGoogleSignup() {
        setError('');
        setGoogleLoading(true);

        try {
            await loginWithGoogle();

            router.push('/');

        } catch (error: any) {
            console.error(error);

            if (
                error.code ===
                'auth/popup-closed-by-user'
            ) {
                setError(
                    'Google sign-up was cancelled.'
                );
            } else {
                setError(
                    'Unable to continue with Google.'
                );
            }
        } finally {
            setGoogleLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#FAF8F5]">

            <Navbar />

            <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-6 py-16">

                <div className="w-full max-w-md">

                    {/* Header */}

                    <div className="mb-10 text-center">

                        <p className="text-xs font-medium uppercase tracking-[0.35em] text-stone-500">
                            Join Pearlvera
                        </p>

                        <h1
                            className="mt-4 text-5xl font-medium text-stone-900"
                            style={{
                                fontFamily:
                                    'var(--font-playfair)',
                            }}
                        >
                            Create Account
                        </h1>

                        <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-stone-600">
                            Create your Pearlvera account and
                            discover handcrafted luxury.
                        </p>

                    </div>

                    {/* Card */}

                    <div className="rounded-[32px] border border-stone-200 bg-white p-8 shadow-sm sm:p-10">

                        <form
                            onSubmit={handleSignup}
                            className="space-y-5"
                        >

                            {/* Name */}

                            <div>

                                <label
                                    htmlFor="name"
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
                                        id="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) =>
                                            setName(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Your name"
                                        required
                                        autoComplete="name"
                                        className="w-full rounded-2xl border border-stone-300 bg-white py-4 pl-11 pr-4 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                                    />

                                </div>

                            </div>

                            {/* Email */}

                            <div>

                                <label
                                    htmlFor="email"
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
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(
                                                e.target.value
                                            )
                                        }
                                        placeholder="you@example.com"
                                        required
                                        autoComplete="email"
                                        className="w-full rounded-2xl border border-stone-300 bg-white py-4 pl-11 pr-4 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                                    />

                                </div>

                            </div>

                            {/* Password */}

                            <div>

                                <label
                                    htmlFor="password"
                                    className="mb-2 block text-sm font-medium text-stone-800"
                                >
                                    Password
                                </label>

                                <div className="relative">

                                    <Lock
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                                    />

                                    <input
                                        id="password"
                                        type={
                                            showPassword
                                                ? 'text'
                                                : 'password'
                                        }
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Minimum 6 characters"
                                        required
                                        minLength={6}
                                        autoComplete="new-password"
                                        className="w-full rounded-2xl border border-stone-300 bg-white py-4 pl-11 pr-12 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                (value) =>
                                                    !value
                                            )
                                        }
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 transition hover:text-stone-900"
                                    >
                                        {showPassword ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>

                                </div>

                            </div>

                            {/* Confirm Password */}

                            <div>

                                <label
                                    htmlFor="confirmPassword"
                                    className="mb-2 block text-sm font-medium text-stone-800"
                                >
                                    Confirm Password
                                </label>

                                <div className="relative">

                                    <Lock
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                                    />

                                    <input
                                        id="confirmPassword"
                                        type={
                                            showConfirmPassword
                                                ? 'text'
                                                : 'password'
                                        }
                                        value={confirmPassword}
                                        onChange={(e) =>
                                            setConfirmPassword(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Repeat your password"
                                        required
                                        minLength={6}
                                        autoComplete="new-password"
                                        className="w-full rounded-2xl border border-stone-300 bg-white py-4 pl-11 pr-12 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                (value) =>
                                                    !value
                                            )
                                        }
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 transition hover:text-stone-900"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>

                                </div>

                            </div>

                            {/* Error */}

                            {error && (
                                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {error}
                                </div>
                            )}

                            {/* Create Account */}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-full bg-stone-900 py-4 font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading
                                    ? 'Creating Account...'
                                    : 'Create Account'}
                            </button>

                        </form>

                        {/* Divider */}

                        <div className="my-7 flex items-center gap-4">

                            <div className="h-px flex-1 bg-stone-200" />

                            <span className="text-xs uppercase tracking-[0.2em] text-stone-400">
                                Or
                            </span>

                            <div className="h-px flex-1 bg-stone-200" />

                        </div>

                        {/* Google */}

                        <button
                            type="button"
                            onClick={handleGoogleSignup}
                            disabled={googleLoading}
                            className="flex w-full items-center justify-center gap-3 rounded-full border border-stone-300 bg-white py-4 font-medium text-stone-800 transition hover:border-stone-900 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >

                            <span className="flex h-5 w-5 items-center justify-center text-sm font-bold">
                                G
                            </span>

                            {googleLoading
                                ? 'Connecting...'
                                : 'Continue with Google'}

                        </button>

                        {/* Login */}

                        <p className="mt-8 text-center text-sm text-stone-600">

                            Already have an account?{' '}

                            <Link
                                href="/login"
                                className="font-medium text-stone-900 underline underline-offset-4 transition hover:text-stone-600"
                            >
                                Sign in
                            </Link>

                        </p>

                    </div>

                    <p className="mt-6 text-center text-xs text-stone-500">
                        By creating an account, you agree to
                        our terms and privacy policy.
                    </p>

                </div>

            </main>

            <Footer />

        </div>
    );
}