export default function ContactPage() {
    return (
        <main className="min-h-screen bg-[#faf9f6] text-[#1f1f1f]">
            <section className="mx-auto max-w-6xl px-6 py-20 md:px-10">
                <div className="mx-auto max-w-3xl text-center">
                    <p className="mb-4 text-sm uppercase tracking-[0.3em] text-gray-500">
                        Pearlvera
                    </p>

                    <h1 className="font-serif text-4xl md:text-5xl">
                        Contact Us
                    </h1>

                    <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-gray-600">
                        We&apos;d love to hear from you. Whether you
                        have a question about an order, a product, or
                        anything else, our team is here to help.
                    </p>
                </div>

                <div className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-3">
                    <div className="border border-gray-200 bg-white p-8 text-center">
                        <h2 className="font-serif text-xl">
                            Customer Care
                        </h2>

                        <p className="mt-4 text-sm leading-6 text-gray-600">
                            Have a question about your order or
                            product? Get in touch with us.
                        </p>

                        <a
                            href="mailto:hello@pearlvera.com"
                            className="mt-5 inline-block text-sm underline underline-offset-4"
                        >
                            hello@pearlvera.com
                        </a>
                    </div>

                    <div className="border border-gray-200 bg-white p-8 text-center">
                        <h2 className="font-serif text-xl">
                            Orders & Shipping
                        </h2>

                        <p className="mt-4 text-sm leading-6 text-gray-600">
                            For questions about delivery, returns,
                            cancellations, or existing orders.
                        </p>

                        <a
                            href="mailto:orders@pearlvera.com"
                            className="mt-5 inline-block text-sm underline underline-offset-4"
                        >
                            orders@pearlvera.com
                        </a>
                    </div>

                    <div className="border border-gray-200 bg-white p-8 text-center">
                        <h2 className="font-serif text-xl">
                            Follow Pearlvera
                        </h2>

                        <p className="mt-4 text-sm leading-6 text-gray-600">
                            Stay connected with Pearlvera and discover
                            our latest collections.
                        </p>

                        <p className="mt-5 text-sm text-gray-500">
                            Instagram coming soon
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}