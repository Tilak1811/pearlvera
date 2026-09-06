'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

const collections = [
    {
        title: 'Bridal Collection',
        description:
            'Handcrafted bead purses for unforgettable wedding moments.',
        image: '/collections/bridal.jpg',
        href: '/shop?category=Bridal',
    },
    {
        title: 'Evening Collection',
        description:
            'Elegant silhouettes designed for sophisticated evenings.',
        image: '/collections/evening.jpg',
        href: '/shop?category=Evening',
    },
    {
        title: 'Luxury Collection',
        description:
            'Signature Pearlvera masterpieces crafted with precision.',
        image: '/collections/luxury.jpg',
        href: '/shop?category=Luxury',
    },
];

export default function FeaturedCollections() {
    return (
        <section className="bg-white py-28">
            <div className="mx-auto max-w-7xl px-6">

                <div className="mb-16 text-center">

                    <p className="uppercase tracking-[0.35em] text-stone-500">
                        Curated Collections
                    </p>

                    <h2
                        className="mt-4 text-5xl text-stone-900"
                        style={{ fontFamily: 'var(--font-playfair)' }}
                    >
                        Crafted for Every Occasion
                    </h2>

                </div>

                <div className="grid gap-10 lg:grid-cols-3">

                    {collections.map((collection, index) => (

                        <motion.div
                            key={collection.title}
                            initial={{ opacity: 0, y: 70 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{
                                duration: 0.7,
                                delay: index * 0.15,
                            }}
                        >

                            <Link
                                href={collection.href}
                                className="group block overflow-hidden rounded-[36px] bg-[#F7F3EE] shadow-md transition duration-500 hover:-translate-y-3 hover:shadow-2xl"
                            >

                                <div className="relative h-[420px] overflow-hidden">

                                    <Image
                                        src={collection.image}
                                        alt={collection.title}
                                        fill
                                        sizes="(max-width: 1024px) 100vw, 33vw"
                                        className="object-cover transition duration-700 group-hover:scale-110"
                                    />

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                                    <div className="absolute bottom-10 left-8 right-8 text-white">

                                        <h3
                                            className="text-3xl"
                                            style={{
                                                fontFamily:
                                                    'var(--font-playfair)',
                                            }}
                                        >
                                            {collection.title}
                                        </h3>

                                        <p className="mt-3 text-sm leading-7 text-stone-200">
                                            {collection.description}
                                        </p>

                                        <span className="mt-8 inline-flex items-center gap-2 text-sm uppercase tracking-[0.25em]">
                                            Explore →
                                        </span>

                                    </div>

                                </div>

                            </Link>

                        </motion.div>

                    ))}

                </div>

            </div>
        </section>
    );
}