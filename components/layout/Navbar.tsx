'use client';

import Link from 'next/link';
import { Heart, ShoppingBag, User } from 'lucide-react';
import { useState } from 'react';

import CartDrawer from '@/components/cart/CartDrawer';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';

export default function Navbar() {
    const [cartOpen, setCartOpen] = useState(false);

    const { cart } = useCart();
    const { wishlist } = useWishlist();

    const cartCount = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    return (
        <>
            <header className="sticky top-0 z-50 border-b border-stone-200/60 bg-white/80 backdrop-blur-xl">

                <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-8">

                    {/* Logo */}

                    <Link
                        href="/"
                        className="text-3xl tracking-[0.35em] text-stone-900"
                        style={{
                            fontFamily: 'var(--font-playfair)',
                        }}
                    >
                        PEARLVERA
                    </Link>

                    {/* Navigation */}

                    <div className="hidden items-center gap-10 md:flex">

                        {[
                            ['Home', '/'],
                            ['Shop', '/shop'],
                            ['Collections', '/collections'],
                            ['About', '/about'],
                        ].map(([name, href]) => (

                            <Link
                                key={name}
                                href={href}
                                className="group relative text-[15px] tracking-wide text-stone-700 transition"
                            >
                                {name}

                                <span className="absolute -bottom-1 left-0 h-[1px] w-0 bg-stone-900 transition-all duration-300 group-hover:w-full" />

                            </Link>

                        ))}

                    </div>

                    {/* Icons */}

                    <div className="flex items-center gap-6">

                        {/* Wishlist */}

                        <Link
                            href="/wishlist"
                            className="relative"
                        >

                            <Heart
                                size={22}
                                className="text-stone-700"
                            />

                            {wishlist.length > 0 && (

                                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-stone-900 text-[10px] font-semibold text-white">

                                    {wishlist.length}

                                </span>

                            )}

                        </Link>

                        {/* Cart */}

                        <button
                            type="button"
                            onClick={() => setCartOpen(true)}
                            className="relative"
                        >

                            <ShoppingBag
                                size={22}
                                className="text-stone-700"
                            />

                            {cartCount > 0 && (

                                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-stone-900 text-[10px] font-semibold text-white">

                                    {cartCount}

                                </span>

                            )}

                        </button>

                        {/* User */}

                        <Link
                            href="/account"
                            aria-label="My account"
                            className="text-stone-700 transition hover:text-stone-950"
                        >
                            <User size={22} />
                        </Link>

                    </div>

                </nav>

            </header>

            <CartDrawer
                open={cartOpen}
                onClose={() => setCartOpen(false)}
            />
        </>
    );
}