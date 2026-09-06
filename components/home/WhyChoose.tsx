import {
    Gem,
    ShieldCheck,
    Truck,
    Sparkles,
} from 'lucide-react';

const features = [
    {
        icon: Gem,
        title: 'Premium Beads',
        description:
            'Every purse is handcrafted using carefully selected premium-quality beads.',
    },
    {
        icon: Sparkles,
        title: 'Handmade Luxury',
        description:
            'Each design is individually crafted with exceptional attention to detail.',
    },
    {
        icon: Truck,
        title: 'Free Shipping',
        description:
            'Complimentary shipping across India with secure premium packaging.',
    },
    {
        icon: ShieldCheck,
        title: 'Quality Assured',
        description:
            'Every Pearlvera bag passes a quality inspection before delivery.',
    },
];

export default function WhyChoose() {
    return (
        <section className="bg-white py-24">
            <div className="mx-auto max-w-7xl px-6">

                <div className="mb-16 text-center">

                    <p className="uppercase tracking-[0.35em] text-stone-500">
                        Why Pearlvera
                    </p>

                    <h2
                        className="mt-3 text-5xl text-stone-900"
                        style={{
                            fontFamily: 'var(--font-playfair)',
                        }}
                    >
                        Crafted for Timeless Elegance
                    </h2>

                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">

                    {features.map((feature) => {

                        const Icon = feature.icon;

                        return (
                            <div
                                key={feature.title}
                                className="rounded-3xl border border-stone-200 bg-[#FAF8F5] p-8 transition hover:-translate-y-2 hover:shadow-xl"
                            >

                                <Icon
                                    size={36}
                                    className="text-stone-900"
                                />

                                <h3 className="mt-6 text-2xl font-semibold text-stone-900">
                                    {feature.title}
                                </h3>

                                <p className="mt-4 leading-7 text-stone-600">
                                    {feature.description}
                                </p>

                            </div>
                        );
                    })}

                </div>

            </div>
        </section>
    );
}