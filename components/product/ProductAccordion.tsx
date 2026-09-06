'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const sections = [
    {
        title: 'Materials & Craftsmanship',
        content:
            'Each Pearlvera purse is handcrafted using premium-quality beads and carefully assembled to ensure exceptional durability and elegance.',
    },
    {
        title: 'Shipping & Delivery',
        content:
            'Free shipping across India. Orders are processed within 1–2 business days and delivered in 4–7 working days.',
    },
    {
        title: 'Returns & Exchanges',
        content:
            'Returns and exchanges are accepted within 7 days for unused products in their original packaging.',
    },
    {
        title: 'Care Instructions',
        content:
            'Store your purse in a dust bag, avoid prolonged exposure to water, and gently clean with a soft dry cloth.',
    },
];

export default function ProductAccordion() {
    const [open, setOpen] = useState<number | null>(0);

    return (
        <div className="mt-12 space-y-4">
            {sections.map((section, index) => (
                <div
                    key={section.title}
                    className="rounded-2xl border border-stone-200 bg-white"
                >
                    <button
                        onClick={() =>
                            setOpen(open === index ? null : index)
                        }
                        className="flex w-full items-center justify-between p-6 text-left"
                    >
                        <span className="text-lg font-semibold text-stone-900">
                            {section.title}
                        </span>

                        <ChevronDown
                            className={`transition-transform ${open === index ? 'rotate-180' : ''
                                }`}
                        />
                    </button>

                    {open === index && (
                        <div className="px-6 pb-6 text-stone-600 leading-7">
                            {section.content}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}