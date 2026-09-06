import Image from 'next/image';
import Link from 'next/link';

type CollectionCardProps = {
    title: string;
    image: string;
    href: string;
};

export default function CollectionCard({
    title,
    image,
    href,
}: CollectionCardProps) {
    return (
        <Link
            href={href}
            className="group overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"
        >
            <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                    src={image}
                    alt={title}
                    fill
                    sizes="(max-width:768px) 100vw, 33vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                />
            </div>

            <div className="p-6">
                <h3
                    className="text-2xl text-stone-900"
                    style={{ fontFamily: 'var(--font-playfair)' }}
                >
                    {title}
                </h3>

                <p className="mt-2 text-stone-500">
                    Shop Now →
                </p>
            </div>
        </Link>
    );
}