import { Star } from 'lucide-react';

const testimonials = [
    {
        name: 'Ananya Sharma',
        city: 'Mumbai',
        review:
            'The craftsmanship is exceptional. The purse looks even more beautiful in person and feels truly luxurious.',
    },
    {
        name: 'Priya Mehta',
        city: 'Delhi',
        review:
            'Elegant packaging, premium quality, and so many compliments every time I carry it.',
    },
    {
        name: 'Riya Kapoor',
        city: 'Bengaluru',
        review:
            'I was looking for something unique, and Pearlvera exceeded my expectations. Highly recommended!',
    },
];

export default function Testimonials() {
    return (
        <section className="bg-[#FAF8F5] py-24">
            <div className="mx-auto max-w-7xl px-6">

                <div className="mb-16 text-center">
                    <p className="uppercase tracking-[0.35em] text-stone-500">
                        Customer Love
                    </p>

                    <h2
                        className="mt-3 text-5xl text-stone-900"
                        style={{ fontFamily: 'var(--font-playfair)' }}
                    >
                        Loved by Our Customers
                    </h2>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">

                    {testimonials.map((item) => (
                        <div
                            key={item.name}
                            className="rounded-3xl bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"
                        >
                            <div className="mb-5 flex">
                                {[...Array(5)].map((_, index) => (
                                    <Star
                                        key={index}
                                        size={18}
                                        className="fill-yellow-400 text-yellow-400"
                                    />
                                ))}
                            </div>

                            <p className="leading-8 text-stone-600 italic">
                                "{item.review}"
                            </p>

                            <div className="mt-8">
                                <h3 className="text-lg font-semibold text-stone-900">
                                    {item.name}
                                </h3>

                                <p className="text-stone-500">
                                    {item.city}
                                </p>
                            </div>
                        </div>
                    ))}

                </div>
            </div>
        </section>
    );
}