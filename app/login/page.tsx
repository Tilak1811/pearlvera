'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
    const router = useRouter();

    const { login, loginWithGoogle } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [showPassword, setShowPassword] =
        useState(false);

    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] =
        useState(false);

    const [error, setError] = useState('');

    async function handleLogin(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError('');
        setLoading(true);

        try {
            await login(email.trim(), password);

            router.push('/');

        } catch (error: any) {

            console.error(error);

            switch (error.code) {
                case 'auth/invalid-credential':
                    setError(
                        'Incorrect email or password.'
                    );
                    break;

                case 'auth/user-not-found':
                    setError(
                        'No account found with this email.'
                    );
                    break;

                case 'auth/wrong-password':
                    setError(
                        'Incorrect password.'
                    );
                    break;

                case 'auth/invalid-email':
                    setError(
                        'Please enter a valid email address.'
                    );
                    break;

                case 'auth/too-many-requests':
                    setError(
                        'Too many attempts. Please try again later.'
                    );
                    break;

                default:
                    setError(
                        'Unable to sign in. Please try again.'
                    );
            }

        } finally {
            setLoading(false);
        }
    }

    async function handleGoogleLogin() {

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
                    'Google sign-in was cancelled.'
                );
            } else {
                setError(
                    'Unable to sign in with Google.'
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
                            Welcome Back
                        </p>

                        <h1
                            className="mt-4 text-5xl font-medium text-stone-900"
                            style={{
                                fontFamily:
                                    'var(--font-playfair)',
                            }}
                        >
                            Sign In
                        </h1>

                        <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-stone-600">
                            Sign in to your Pearlvera account
                            and continue your journey.
                        </p>

                    </div>

                    {/* Card */}

                    <div className="rounded-[32px] border border-stone-200 bg-white p-8 shadow-sm sm:p-10">

                        <form
                            onSubmit={handleLogin}
                            className="space-y-5"
                        >

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

                                <div className="mb-2 flex items-center justify-between">

                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-medium text-stone-800"
                                    >
                                        Password
                                    </label>

                                    <button
                                        type="button"
                                        className="text-xs text-stone-500 transition hover:text-stone-900"
                                    >
                                        Forgot password?
                                    </button>

                                </div>

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
                                        placeholder="Enter your password"
                                        required
                                        autoComplete="current-password"
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
                                        aria-label={
                                            showPassword
                                                ? 'Hide password'
                                                : 'Show password'
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

                            {/* Error */}

                            {error && (

                                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {error}
                                </div>

                            )}

                            {/* Login */}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-full bg-stone-900 py-4 font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading
                                    ? 'Signing In...'
                                    : 'Sign In'}
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
                            onClick={handleGoogleLogin}
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

                        {/* Signup */}

                        <p className="mt-8 text-center text-sm text-stone-600">

                            Don't have an account?{' '}

                            <Link
                                href="/signup"
                                className="font-medium text-stone-900 underline underline-offset-4 transition hover:text-stone-600"
                            >
                                Create one
                            </Link>

                        </p>

                    </div>

                    {/* Security note */}

                    <p className="mt-6 text-center text-xs text-stone-500">
                        Your account information is securely
                        protected.
                    </p>

                </div>

            </main>

            <Footer />

        </div>
    );
}