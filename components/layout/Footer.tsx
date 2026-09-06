import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-stone-950 text-stone-200">
            <div className="mx-auto max-w-7xl px-6 py-16">
                <div className="grid gap-12 md:grid-cols-4">
                    <div>
                        <h2
                            className="text-3xl"
                            style={{ fontFamily: 'var(--font-playfair)' }}
                        >
                            Pearlvera
                        </h2>

                        <p className="mt-4 text-stone-400">
                            Luxury handcrafted bead purses designed with timeless elegance.
                        </p>
                    </div>

                    <div>
                        <h3 className="mb-4 font-semibold">Shop</h3>

                        <ul className="space-y-2 text-stone-400">
                            <li><Link href="/shop">All Products</Link></li>
                            <li><Link href="/collections">Collections</Link></li>
                            <li><Link href="/new-arrivals">New Arrivals</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-4 font-semibold">Company</h3>

                        <ul className="space-y-2 text-stone-400">
                            <li><Link href="/about">About Us</Link></li>
                            <li><Link href="/contact">Contact</Link></li>
                            <li><Link href="/faq">FAQ</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-4 font-semibold">
                            Stay Connected
                        </h3>

                        <p className="mb-4 text-stone-400">
                            Subscribe to receive exclusive collections and offers.
                        </p>

                        <input
                            type="email"
                            placeholder="Email Address"
                            className="w-full rounded-full border border-stone-700 bg-transparent px-4 py-3 outline-none"
                        />

                        <button className="mt-4 w-full rounded-full bg-white py-3 text-black transition hover:bg-stone-300">
                            Subscribe
                        </button>
                    </div>
                </div>

                <div className="mt-12 border-t border-stone-800 pt-8 text-center text-sm text-stone-500">
                    © 2026 Pearlvera. All Rights Reserved.
                </div>
            </div>
        </footer>
    );
}