'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import {
    doc,
    setDoc,
    serverTimestamp,
} from 'firebase/firestore';

import {
    ArrowLeft,
    Save,
    Package,
} from 'lucide-react';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AdminGuard from '@/components/admin/AdminGuard';

import { db } from '@/lib/firebase';

export default function NewProductPage() {

    const router = useRouter();

    const [loading, setLoading] =
        useState(false);

    const [form, setForm] = useState({
        name: '',
        price: '',
        category: 'Luxury',
        description: '',
        image: '',
        images: '',
        rating: '5',
        reviews: '0',
        stock: '10',
    });

    function updateField(
        field: keyof typeof form,
        value: string
    ) {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
    }

    function createSlug(name: string) {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    async function handleSubmit(
        event: React.FormEvent
    ) {

        event.preventDefault();

        if (
            !form.name.trim() ||
            !form.price ||
            !form.description.trim() ||
            !form.image.trim()
        ) {
            alert(
                'Please complete all required fields.'
            );
            return;
        }

        try {

            setLoading(true);

            const slug =
                createSlug(form.name);

            const additionalImages =
                form.images
                    .split(',')
                    .map((image) => image.trim())
                    .filter(Boolean);

            const allImages = [
                form.image.trim(),
                ...additionalImages,
            ];

            await setDoc(
                doc(db, 'products', slug),
                {
                    slug,

                    name: form.name.trim(),

                    price: Number(form.price),

                    category: form.category,

                    description:
                        form.description.trim(),

                    image:
                        form.image.trim(),

                    images: allImages,

                    rating: Number(form.rating),

                    reviews: Number(form.reviews),

                    stock: Number(form.stock),

                    createdAt:
                        serverTimestamp(),
                }
            );

            alert(
                'Product created successfully!'
            );

            router.push('/admin/products');

        } catch (error) {

            console.error(
                'Failed to create product:',
                error
            );

            alert(
                'Failed to create product. Please try again.'
            );

        } finally {

            setLoading(false);

        }
    }

    return (
        <AdminGuard>

            <Navbar />

            <main className="min-h-screen bg-[#FAF8F5]">

                {/* Header */}

                <section className="border-b border-stone-200 bg-white">

                    <div className="mx-auto max-w-5xl px-6 py-12">

                        <Link
                            href="/admin/products"
                            className="inline-flex items-center gap-2 text-sm text-stone-500 transition hover:text-stone-900"
                        >
                            <ArrowLeft size={16} />
                            Back to Products
                        </Link>

                        <div className="mt-8">

                            <p className="text-xs uppercase tracking-[0.35em] text-stone-400">
                                Store Management
                            </p>

                            <h1
                                className="mt-3 text-5xl text-stone-900"
                                style={{
                                    fontFamily:
                                        'var(--font-playfair)',
                                }}
                            >
                                Add Product
                            </h1>

                            <p className="mt-4 text-stone-500">
                                Add a new handcrafted Pearlvera piece.
                            </p>

                        </div>

                    </div>

                </section>


                {/* Form */}

                <section className="mx-auto max-w-5xl px-6 py-12">

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-8"
                    >

                        {/* Basic Information */}

                        <div className="rounded-[28px] bg-white p-8 shadow-sm">

                            <div className="flex items-center gap-3">

                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-100">
                                    <Package
                                        size={21}
                                        className="text-stone-700"
                                    />
                                </div>

                                <div>

                                    <h2 className="text-2xl font-semibold text-stone-900">
                                        Product Information
                                    </h2>

                                    <p className="mt-1 text-sm text-stone-500">
                                        Basic details about your product.
                                    </p>

                                </div>

                            </div>


                            <div className="mt-8 space-y-6">
                                {/* Product Name */}

                                <div className="md:col-span-3">

                                    <label className="mb-2 block text-sm font-medium text-stone-800">
                                        Product Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(event) =>
                                            updateField(
                                                'name',
                                                event.target.value
                                            )
                                        }
                                        placeholder="e.g. Golden Pearl"
                                        className="w-full rounded-2xl border border-stone-300 bg-white px-5 py-4 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-900"
                                    />

                                </div>




                                {/* Price + Category + Stock */}

                                <div className="grid gap-6 md:grid-cols-3">

                                    <Field
                                        label="Price (₹)"
                                        required
                                    >

                                        <input
                                            type="number"
                                            min="0"
                                            value={form.price}
                                            onChange={(event) =>
                                                updateField(
                                                    'price',
                                                    event.target.value
                                                )
                                            }
                                            placeholder="4999"
                                            className="input"
                                            required
                                        />

                                    </Field>


                                    <Field
                                        label="Category"
                                        required
                                    >

                                        <select
                                            value={form.category}
                                            onChange={(event) =>
                                                updateField(
                                                    'category',
                                                    event.target.value
                                                )
                                            }
                                            className="input"
                                        >

                                            <option value="Luxury">
                                                Luxury
                                            </option>

                                            <option value="Bridal">
                                                Bridal
                                            </option>

                                            <option value="Evening">
                                                Evening
                                            </option>

                                        </select>

                                    </Field>


                                    <Field
                                        label="Stock Quantity"
                                        required
                                    >

                                        <input
                                            type="number"
                                            min="0"
                                            value={form.stock}
                                            onChange={(event) =>
                                                updateField(
                                                    'stock',
                                                    event.target.value
                                                )
                                            }
                                            placeholder="10"
                                            className="input"
                                            required
                                        />

                                    </Field>

                                </div>


                                {/* Description */}

                                <Field
                                    label="Description"
                                    required
                                >

                                    <textarea
                                        value={form.description}
                                        onChange={(event) =>
                                            updateField(
                                                'description',
                                                event.target.value
                                            )
                                        }
                                        placeholder="Describe the handcrafted purse..."
                                        rows={5}
                                        className="input resize-none"
                                        required
                                    />

                                </Field>

                            </div>

                        </div>


                        {/* Images */}

                        <div className="rounded-[28px] bg-white p-8 shadow-sm">

                            <h2 className="text-2xl font-semibold text-stone-900">
                                Product Images
                            </h2>

                            <p className="mt-1 text-sm text-stone-500">
                                Use paths from your public folder, for example /products/my-bag.jpg
                            </p>


                            <div className="mt-8 space-y-6">

                                <Field
                                    label="Main Image"
                                    required
                                >

                                    <input
                                        value={form.image}
                                        onChange={(event) =>
                                            updateField(
                                                'image',
                                                event.target.value
                                            )
                                        }
                                        placeholder="/products/golden-pearl.jpg"
                                        className="input"
                                        required
                                    />

                                    {form.image.trim() && (
                                        <div className="mt-5 rounded-2xl border border-stone-200 bg-stone-50 p-4">
                                            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-stone-400">
                                                Image Preview
                                            </p>

                                            <div className="flex h-64 items-center justify-center overflow-hidden rounded-xl bg-white">
                                                <img
                                                    src={form.image.trim()}
                                                    alt="Product preview"
                                                    className="h-full w-full object-contain"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </Field>


                                <Field
                                    label="Additional Images"
                                >

                                    <input
                                        value={form.images}
                                        onChange={(event) =>
                                            updateField(
                                                'images',
                                                event.target.value
                                            )
                                        }
                                        placeholder="/products/golden-pearl-2.jpg, /products/golden-pearl-3.jpg"
                                        className="input"
                                    />

                                    <p className="mt-2 text-xs text-stone-400">
                                        Separate multiple image paths with commas.
                                    </p>

                                </Field>

                            </div>

                        </div>


                        {/* Reviews */}

                        <div className="rounded-[28px] bg-white p-8 shadow-sm">

                            <h2 className="text-2xl font-semibold text-stone-900">
                                Product Rating
                            </h2>

                            <div className="mt-8 grid gap-6 md:grid-cols-2">

                                <Field label="Rating">

                                    <input
                                        type="number"
                                        min="0"
                                        max="5"
                                        step="0.1"
                                        value={form.rating}
                                        onChange={(event) =>
                                            updateField(
                                                'rating',
                                                event.target.value
                                            )
                                        }
                                        className="input"
                                    />

                                </Field>


                                <Field label="Reviews">

                                    <input
                                        type="number"
                                        min="0"
                                        value={form.reviews}
                                        onChange={(event) =>
                                            updateField(
                                                'reviews',
                                                event.target.value
                                            )
                                        }
                                        className="input"
                                    />

                                </Field>

                            </div>

                        </div>


                        {/* Submit */}

                        <div className="flex flex-col gap-4 sm:flex-row sm:justify-end">

                            <Link
                                href="/admin/products"
                                className="rounded-full border border-stone-300 bg-white px-8 py-4 text-center font-medium text-stone-800 transition hover:bg-stone-100"
                            >
                                Cancel
                            </Link>

                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-stone-900 px-8 py-4 font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                            >

                                <Save size={18} />

                                {loading
                                    ? 'Creating Product...'
                                    : 'Create Product'}

                            </button>

                        </div>

                    </form>

                </section>

            </main>

            <Footer />

        </AdminGuard>
    );
}


/* ================================= */
/* FIELD */
/* ================================= */

function Field({
    label,
    required,
    children,
}: {
    label: string;
    required?: boolean;
    children: React.ReactNode;
}) {

    return (

        <div>

            <label className="mb-2 block text-sm font-medium text-stone-800">

                {label}

                {required && (
                    <span className="ml-1 text-red-500">
                        *
                    </span>
                )}

            </label>

            {children}

        </div>

    );
}