'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Hero() {
    return (
        <section className="relative overflow-hidden bg-[#FAF8F5]">

            {/* Background Decoration */}

            <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-stone-200/40 blur-3xl" />
            <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-[#F4ECE3] blur-3xl" />

            <div className="mx-auto flex min-h-[90vh] max-w-7xl flex-col items-center gap-12 px-6 py-16 lg:flex-row">

                {/* Left */}

                <motion.div
                    className="w-full lg:w-1/2"
                    initial={{ opacity: 0, x: -60 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                        duration: 0.8,
                        ease: "easeOut",
                    }}
                >

                    <p className="mb-6 inline-block rounded-full border border-stone-300 bg-white/70 px-5 py-2 text-xs uppercase tracking-[0.35em] text-stone-600 backdrop-blur">
                        Luxury Handcrafted Collection
                    </p>

                    <h1
                        className="text-5xl font-semibold leading-tight text-stone-900 lg:text-7xl"
                        style={{ fontFamily: 'var(--font-playfair)' }}
                    >
                        Carry
                        <br />
                        Luxury.
                        <br />
                        Wear Art.
                    </h1>

                    <p className="mt-8 max-w-xl text-lg leading-8 text-stone-600">
                        Every Pearlvera purse is handcrafted with premium beads,
                        timeless elegance, and exceptional craftsmanship,
                        designed to become part of your story.
                    </p>

                    <motion.div
                        className="mt-10 flex flex-wrap gap-5"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            delay: 0.6,
                            duration: 0.7,
                        }}
                    >

                        <Link
                            href="/shop"
                            className="rounded-full bg-stone-900 px-8 py-4 text-white transition hover:scale-105 hover:bg-stone-800"
                        >
                            Shop Collection
                        </Link>

                        <Link
                            href="/collections"
                            className="rounded-full border border-stone-300 bg-white px-8 py-4 text-stone-800 transition hover:bg-stone-100"
                        >
                            Explore Collections
                        </Link>

                    </motion.div>

                    {/* Stats */}

                    <motion.div
                        className="mt-14 flex gap-12"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                            delay: 0.9,
                            duration: 0.8,
                        }}
                    >

                        <div>
                            <h3 className="text-3xl font-bold text-stone-900">
                                5K+
                            </h3>

                            <p className="mt-2 text-sm uppercase tracking-widest text-stone-500">
                                Happy Customers
                            </p>
                        </div>

                        <div>
                            <h3 className="text-3xl font-bold text-stone-900">
                                100%
                            </h3>

                            <p className="mt-2 text-sm uppercase tracking-widest text-stone-500">
                                Handmade
                            </p>
                        </div>

                        <div>
                            <h3 className="text-3xl font-bold text-stone-900">
                                4.9★
                            </h3>

                            <p className="mt-2 text-sm uppercase tracking-widest text-stone-500">
                                Customer Rating
                            </p>
                        </div>

                    </motion.div>

                </motion.div>



                {/* Right */}

                <motion.div
                    className="flex w-full items-center justify-center lg:w-1/2"
                    initial={{ opacity: 0, x: 80 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, delay: 0.3 }}
                >
                    <motion.div
                        className="relative h-[650px] w-[500px]"
                        animate={{ y: [0, -10, 0] }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    >
                        <Image
                            src="/hero/hero-bag.jpg"
                            alt="Luxury Pearlvera Bag"
                            fill
                            priority
                            sizes="50vw"
                            className="object-contain"
                        />
                    </motion.div>
                </motion.div>

            </div>

        </section >

    );
}