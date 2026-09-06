import Image from 'next/image';

const images = [
    '/gallery/gallery-1.jpg',
    '/gallery/gallery-2.jpg',
    '/gallery/gallery-3.jpg',
    '/gallery/gallery-4.jpg',
    '/gallery/gallery-5.jpg',
    '/gallery/gallery-6.jpg',
];

export default function InstagramGallery() {
    return (
        <section className="bg-white py-24">
            <div className="mx-auto max-w-7xl px-6">

                <div className="mb-16 text-center">

                    <p className="uppercase tracking-[0.35em] text-stone-500">
                        Follow Our Journey
                    </p>

                    <h2
                        className="mt-3 text-5xl text-stone-900"
                        style={{ fontFamily: 'var(--font-playfair)' }}
                    >
                        @Pearlvera
                    </h2>

                    <p className="mx-auto mt-5 max-w-2xl text-lg text-stone-600">
                        Discover how our handcrafted luxury bead purses become part of everyday elegance.
                    </p>

                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

                    {images.map((image) => (

                        <div
                            key={image}
                            className="group relative aspect-square overflow-hidden rounded-3xl"
                        >

                            <Image
                                src={image}
                                alt="Pearlvera"
                                fill
                                sizes="33vw"
                                className="object-cover transition duration-500 group-hover:scale-110"
                            />

                            <div className="absolute inset-0 bg-black/0 transition duration-500 group-hover:bg-black/20" />

                        </div>

                    ))}

                </div>

            </div>
        </section>
    );
}