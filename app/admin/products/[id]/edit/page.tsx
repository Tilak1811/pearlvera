'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import {
    doc,
    getDoc,
    updateDoc,
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

type ProductForm = {
    name: string;
    price: string;
    category: string;
    description: string;
    image: string;
    images: string;
    rating: string;
    reviews: string;
    stock: string;
    visible: boolean;
};

type Props = {
    params: Promise<{
        id: string;
    }>;
};

export default function EditProductPage({
    params,
}: Props) {

    const router = useRouter();

    const [productId, setProductId] =
        useState('');

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [form, setForm] =
        useState<ProductForm>({
            name: '',
            price: '',
            category: 'Luxury',
            description: '',
            image: '',
            images: '',
            rating: '5',
            reviews: '0',
            stock: '0',
            visible: true,
        });


    // ==========================================
    // LOAD PRODUCT
    // ==========================================

    useEffect(() => {

        async function loadProduct() {

            try {

                const { id } = await params;

                setProductId(id);

                const productRef =
                    doc(db, 'products', id);

                const snapshot =
                    await getDoc(productRef);

                if (!snapshot.exists()) {

                    alert('Product not found.');

                    router.push('/admin/products');

                    return;
                }

                const data =
                    snapshot.data();

                setForm({
                    name: data.name ?? '',
                    price:
                        data.price?.toString() ?? '',
                    category:
                        data.category ?? 'Luxury',
                    description:
                        data.description ?? '',
                    image:
                        data.image ?? '',
                    images:
                        Array.isArray(data.images)
                            ? data.images.join(', ')
                            : '',
                    rating:
                        data.rating?.toString() ?? '5',
                    reviews:
                        data.reviews?.toString() ?? '0',
                    stock:
                        data.stock?.toString() ?? '0',
                    visible:
                        data.visible !== false,
                });

            } catch (error) {

                console.error(
                    'Failed to load product:',
                    error
                );

                alert(
                    'Failed to load product.'
                );

                router.push('/admin/products');

            } finally {

                setLoading(false);

            }
        }

        loadProduct();

    }, [params, router]);


    // ==========================================
    // UPDATE FIELD
    // ==========================================

    function updateField(
        field: keyof ProductForm,
        value: string
    ) {

        setForm((current) => ({
            ...current,
            [field]: value,
        }));

    }


    // ==========================================
    // SAVE PRODUCT
    // ==========================================

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

            setSaving(true);

            const additionalImages =
                form.images
                    .split(',')
                    .map((image) =>
                        image.trim()
                    )
                    .filter(Boolean);

            const allImages = [
                form.image.trim(),
                ...additionalImages,
            ];

            const productRef =
                doc(
                    db,
                    'products',
                    productId
                );

            await updateDoc(
                productRef,
                {
                    name: form.name.trim(),

                    price:
                        Number(form.price),

                    category:
                        form.category,

                    description:
                        form.description.trim(),

                    image:
                        form.image.trim(),

                    images:
                        allImages,

                    rating:
                        Number(form.rating),

                    reviews:
                        Number(form.reviews),

                    stock:
                        Number(form.stock),

                    visible:
                        form.visible,

                    updatedAt:
                        new Date(),
                }
            );

            alert(
                'Product updated successfully!'
            );

            router.push(
                '/admin/products'
            );

        } catch (error) {

            console.error(
                'Failed to update product:',
                error
            );

            alert(
                'Failed to update product. Please try again.'
            );

        } finally {

            setSaving(false);

        }
    }


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (
            <AdminGuard>

                <Navbar />

                <main className="flex min-h-screen items-center justify-center bg-[#FAF8F5]">

                    <div className="text-center">

                        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-stone-200 border-t-stone-900" />

                        <p className="mt-4 text-sm text-stone-500">
                            Loading product...
                        </p>

                    </div>

                </main>

                <Footer />

            </AdminGuard>
        );
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
                                Edit Product
                            </h1>

                            <p className="mt-4 text-stone-500">
                                Update your Pearlvera product.
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

                        {/* Product Information */}

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
                                        Update the product details.
                                    </p>

                                </div>

                            </div>


                            <div className="mt-8 space-y-6">

                                {/* Name */}

                                <Field
                                    label="Product Name"
                                    required
                                >

                                    <input
                                        value={form.name}
                                        onChange={(event) =>
                                            updateField(
                                                'name',
                                                event.target.value
                                            )
                                        }
                                        className="input"
                                        required
                                    />

                                </Field>


                                {/* Price / Category / Stock */}

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
                                Update the image paths for this product.
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
                                        className="input"
                                        required
                                    />

                                    {form.image.trim() && (
                                        <div className="mt-5 overflow-hidden rounded-2xl border border-stone-200 bg-stone-50 p-4">
                                            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-stone-400">
                                                Image Preview
                                            </p>

                                            <img
                                                src={form.image}
                                                alt="Product preview"
                                                className="h-64 w-full rounded-xl object-contain"
                                                onError={(event) => {
                                                    event.currentTarget.style.display =
                                                        'none';
                                                }}
                                            />
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
                                        className="input"
                                    />

                                    <p className="mt-2 text-xs text-stone-400">
                                        Separate multiple image paths with commas.
                                    </p>

                                </Field>

                            </div>

                        </div>


                        {/* Rating */}

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

                        {/* ==========================================
                               PRODUCT VISIBILITY
                        ========================================== */}

                        <div className="rounded-[28px] bg-white p-8 shadow-sm">

                            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                                <div>

                                    <h2 className="text-2xl font-semibold text-stone-900">
                                        Product Visibility
                                    </h2>

                                    <p className="mt-1 text-sm text-stone-500">
                                        Control whether customers can see this product.
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    onClick={() =>
                                        setForm((current) => ({
                                            ...current,
                                            visible:
                                                !current.visible,
                                        }))
                                    }
                                    className={`inline-flex items-center gap-3 rounded-full border px-5 py-3 text-sm font-medium transition ${form.visible
                                        ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                                        : 'border-stone-200 bg-stone-100 text-stone-600 hover:bg-stone-200'
                                        }`}
                                >

                                    <span
                                        className={`h-2.5 w-2.5 rounded-full ${form.visible
                                            ? 'bg-green-500'
                                            : 'bg-stone-400'
                                            }`}
                                    />

                                    {form.visible
                                        ? 'Visible'
                                        : 'Hidden'}

                                </button>

                            </div>


                            <div className="mt-6 rounded-2xl bg-[#FAF8F5] p-5">

                                <p className="text-sm leading-6 text-stone-600">

                                    {form.visible ? (
                                        <>
                                            This product is currently visible
                                            in your store and can be viewed
                                            by customers.
                                        </>
                                    ) : (
                                        <>
                                            This product is hidden from your
                                            store. Customers will not see it
                                            on the Shop page.
                                        </>
                                    )}

                                </p>

                            </div>

                        </div>


                        {/* Buttons */}

                        <div className="flex flex-col gap-4 sm:flex-row sm:justify-end">

                            <Link
                                href="/admin/products"
                                className="rounded-full border border-stone-300 bg-white px-8 py-4 text-center font-medium text-stone-800 transition hover:bg-stone-100"
                            >
                                Cancel
                            </Link>

                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-stone-900 px-8 py-4 font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                            >

                                <Save size={18} />

                                {saving
                                    ? 'Saving Changes...'
                                    : 'Save Changes'}

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