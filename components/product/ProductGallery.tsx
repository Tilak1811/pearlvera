'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';

type Props = {
    images: string[];
    name: string;
};

export default function ProductGallery({
    images,
    name,
}: Props) {
    const [selectedImage, setSelectedImage] = useState(images[0]);

    return (
        <div className="flex gap-6">

            {/* Thumbnails */}

            <div className="flex flex-col gap-4">

                {images.map((image) => (

                    <button
                        key={image}
                        onClick={() => setSelectedImage(image)}
                        className={`relative h-24 w-24 overflow-hidden rounded-2xl border-2 transition-all duration-300 ${selectedImage === image
                                ? 'border-stone-900 shadow-lg'
                                : 'border-stone-200 hover:border-stone-400'
                            }`}
                    >

                        <Image
                            src={image}
                            alt={name}
                            fill
                            sizes="96px"
                            className="object-cover"
                        />

                    </button>

                ))}

            </div>

            {/* Main Image */}

            <div className="group relative aspect-square flex-1 overflow-hidden rounded-[32px] bg-white shadow-lg">

                <AnimatePresence mode="wait">

                    <motion.div
                        key={selectedImage}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="absolute inset-0"
                    >

                        <Image
                            src={selectedImage}
                            alt={name}
                            fill
                            sizes="50vw"
                            className="object-contain p-8 transition-transform duration-300 group-hover:scale-105"
                        />

                    </motion.div>

                </AnimatePresence>

            </div>

        </div>
    );
}