'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import {
    collection,
    getDocs,
    deleteDoc,
    doc,
    updateDoc,
} from 'firebase/firestore';

import {
    Package,
    Plus,
    ArrowLeft,
    Search,
    Trash2,
    Eye,
    EyeOff,
} from 'lucide-react';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AdminGuard from '@/components/admin/AdminGuard';

import { db } from '@/lib/firebase';


type Product = {
    id: string;
    name: string;
    price: number;
    category: string;
    image: string;
    description?: string;
    rating?: number;
    reviews?: number;
    slug?: string;
    stock?: number;
    visible?: boolean;
};


export default function AdminProductsPage() {

    const [products, setProducts] =
        useState<Product[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [search, setSearch] =
        useState('');

    const [categoryFilter, setCategoryFilter] =
        useState('All');

    const [deletingId, setDeletingId] =
        useState<string | null>(null);


    // ==========================================
    // LOAD PRODUCTS
    // ==========================================

    useEffect(() => {
        loadProducts();
    }, []);


    async function loadProducts() {

        try {

            setLoading(true);

            const snapshot =
                await getDocs(
                    collection(
                        db,
                        'products'
                    )
                );


            const data: Product[] =
                snapshot.docs.map(
                    (document) => ({

                        ...document.data(),

                        // Always use the real
                        // Firestore document ID.
                        id: document.id,

                    })
                ) as Product[];


            setProducts(data);

        } catch (error) {

            console.error(
                'Failed to load products:',
                error
            );

        } finally {

            setLoading(false);

        }
    }


    // ==========================================
    // DELETE PRODUCT
    // ==========================================

    async function deleteProduct(
        productId: string,
        productName: string
    ) {

        const confirmed =
            window.confirm(
                `Are you sure you want to delete "${productName}"?`
            );


        if (!confirmed) {
            return;
        }


        try {

            setDeletingId(productId);


            await deleteDoc(
                doc(
                    db,
                    'products',
                    productId
                )
            );


            setProducts(
                (current) =>
                    current.filter(
                        (product) =>
                            product.id !==
                            productId
                    )
            );

        } catch (error) {

            console.error(
                'Failed to delete product:',
                error
            );


            alert(
                'Failed to delete product. Please try again.'
            );

        } finally {

            setDeletingId(null);

        }
    }

    // ==========================================
    // TOGGLE PRODUCT VISIBILITY
    // ==========================================

    async function toggleVisibility(
        productId: string,
        currentVisibility: boolean
    ) {

        const newVisibility =
            !currentVisibility;


        try {

            await updateDoc(
                doc(
                    db,
                    'products',
                    productId
                ),
                {
                    visible: newVisibility,
                }
            );


            setProducts(
                (current) =>
                    current.map(
                        (product) =>
                            product.id ===
                                productId
                                ? {
                                    ...product,
                                    visible:
                                        newVisibility,
                                }
                                : product
                    )
            );

        } catch (error) {

            console.error(
                'Failed to update product visibility:',
                error
            );


            alert(
                'Failed to update product visibility. Please try again.'
            );

        }

    }


    // ==========================================
    // SEARCH
    // ==========================================

    const categories = Array.from(
        new Set(
            products
                .map(
                    (product) =>
                        product.category
                )
                .filter(Boolean)
        )
    ).sort();


    const filteredProducts =
        products.filter(
            (product) => {

                const searchText =
                    search
                        .trim()
                        .toLowerCase();


                const matchesSearch =
                    !searchText ||
                    product.name
                        ?.toLowerCase()
                        .includes(searchText) ||
                    product.category
                        ?.toLowerCase()
                        .includes(searchText) ||
                    product.slug
                        ?.toLowerCase()
                        .includes(searchText);


                const matchesCategory =
                    categoryFilter === 'All' ||
                    product.category ===
                    categoryFilter;


                return (
                    matchesSearch &&
                    matchesCategory
                );

            }
        );


    return (

        <AdminGuard>

            <Navbar />


            <main className="min-h-screen bg-[#FAF8F5]">


                {/* ==================================
                    HEADER
                ================================== */}

                <section className="border-b border-stone-200 bg-white">

                    <div className="mx-auto max-w-7xl px-6 py-12">

                        <Link
                            href="/admin"
                            className="inline-flex items-center gap-2 text-sm text-stone-500 transition hover:text-stone-900"
                        >
                            <ArrowLeft
                                size={16}
                            />

                            Back to Dashboard

                        </Link>


                        <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">

                            <div>

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
                                    Products
                                </h1>


                                <p className="mt-4 text-stone-500">
                                    Manage your Pearlvera product catalog.
                                </p>

                            </div>


                            <Link
                                href="/admin/products/new"
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-stone-900 px-7 py-4 font-medium text-white transition hover:bg-black"
                            >

                                <Plus
                                    size={18}
                                />

                                Add Product

                            </Link>

                        </div>

                    </div>

                </section>


                {/* ==================================
                    PRODUCTS
                ================================== */}

                <section className="mx-auto max-w-7xl px-6 py-12">


                    {/* Search */}

                    <div className="flex flex-col gap-4 md:flex-row md:items-center">

                        {/* Search */}

                        <div className="relative w-full max-w-xl">

                            <Search
                                size={19}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                            />

                            <input
                                type="text"
                                placeholder="Search products..."
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                                className="w-full rounded-full border border-stone-200 bg-white py-4 pl-12 pr-5 outline-none transition focus:border-stone-900"
                            />

                        </div>


                        {/* Category Filter */}

                        <select
                            value={categoryFilter}
                            onChange={(event) =>
                                setCategoryFilter(
                                    event.target.value
                                )
                            }
                            className="rounded-full border border-stone-200 bg-white px-5 py-4 text-sm text-stone-700 outline-none transition focus:border-stone-900"
                        >

                            <option value="All">
                                All Categories
                            </option>

                            {categories.map(
                                (category) => (

                                    <option
                                        key={category}
                                        value={category}
                                    >
                                        {category}
                                    </option>

                                )
                            )}

                        </select>

                    </div>


                    {/* Loading */}

                    {loading ? (

                        <div className="py-24 text-center">

                            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-stone-200 border-t-stone-900" />

                            <p className="mt-4 text-sm text-stone-500">
                                Loading products...
                            </p>

                        </div>


                    ) : filteredProducts.length === 0 ? (

                        <div className="mt-10 rounded-[28px] bg-white p-16 text-center shadow-sm">

                            <Package
                                size={40}
                                className="mx-auto text-stone-400"
                            />


                            <h2 className="mt-5 text-2xl font-semibold text-stone-900">
                                No products found
                            </h2>


                            <p className="mt-2 text-stone-500">
                                Your Firebase product catalog is currently empty.
                            </p>

                        </div>


                    ) : (

                        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">


                            {filteredProducts.map(
                                (product) => {

                                    const stock =
                                        Number(
                                            product.stock ??
                                            0
                                        );


                                    const isOutOfStock =
                                        stock <= 0;


                                    const isLowStock =
                                        stock > 0 &&
                                        stock <= 5;

                                    const isVisible =
                                        product.visible !== false;


                                    return (

                                        <div
                                            key={product.id}
                                            className="overflow-hidden rounded-[28px] border border-stone-200/70 bg-white shadow-sm"
                                        >


                                            {/* Image */}

                                            <div className="relative aspect-square bg-[#F7F3EE]">

                                                {product.image ? (

                                                    <img
                                                        src={product.image}
                                                        alt={product.name}
                                                        className="h-full w-full object-contain p-6"
                                                    />

                                                ) : (

                                                    <div className="flex h-full items-center justify-center">

                                                        <Package
                                                            size={40}
                                                            className="text-stone-300"
                                                        />

                                                    </div>

                                                )}

                                            </div>


                                            {/* Information */}

                                            <div className="p-6">


                                                <p className="text-xs uppercase tracking-[0.2em] text-stone-400">
                                                    {product.category}
                                                </p>


                                                <h2
                                                    className="mt-2 text-2xl text-stone-900"
                                                    style={{
                                                        fontFamily:
                                                            'var(--font-playfair)',
                                                    }}
                                                >
                                                    {product.name}
                                                </h2>


                                                <p className="mt-3 text-lg font-semibold text-stone-900">
                                                    ₹{' '}
                                                    {product.price?.toLocaleString()}
                                                </p>


                                                {/* STOCK */}

                                                <div className="mt-4">

                                                    {isOutOfStock ? (

                                                        <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">

                                                            <span className="h-2 w-2 rounded-full bg-red-600" />

                                                            Out of Stock

                                                        </span>

                                                    ) : isLowStock ? (

                                                        <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">

                                                            <span className="h-2 w-2 rounded-full bg-amber-500" />

                                                            Only {stock} left

                                                        </span>

                                                    ) : (

                                                        <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">

                                                            <span className="h-2 w-2 rounded-full bg-green-600" />

                                                            {stock} in stock

                                                        </span>

                                                    )}

                                                </div>


                                                {/* Rating */}

                                                {product.rating && (

                                                    <p className="mt-3 text-sm text-stone-500">

                                                        ★{' '}
                                                        {product.rating}

                                                        {' · '}

                                                        {product.reviews ??
                                                            0}

                                                        {' reviews'}

                                                    </p>

                                                )}

                                                {/* ==========================================
    ACTIONS
========================================== */}

                                                <div className="mt-5 grid grid-cols-3 gap-2">

                                                    {/* EDIT */}

                                                    <Link
                                                        href={`/admin/products/${product.id}/edit`}
                                                        className="flex min-w-0 items-center justify-center rounded-full bg-stone-900 px-2 py-2.5 text-xs font-medium text-white transition hover:bg-black"
                                                    >
                                                        Edit
                                                    </Link>


                                                    {/* VISIBILITY */}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            toggleVisibility(
                                                                product.id,
                                                                isVisible
                                                            )
                                                        }
                                                        title={
                                                            isVisible
                                                                ? 'Hide product'
                                                                : 'Show product'
                                                        }
                                                        className={`flex min-w-0 items-center justify-center gap-1 rounded-full border px-2 py-2.5 text-xs font-medium transition ${isVisible
                                                            ? 'border-stone-200 text-stone-600 hover:bg-stone-100'
                                                            : 'border-green-200 text-green-700 hover:bg-green-50'
                                                            }`}
                                                    >

                                                        {isVisible ? (
                                                            <EyeOff
                                                                size={14}
                                                                strokeWidth={1.8}
                                                            />
                                                        ) : (
                                                            <Eye
                                                                size={14}
                                                                strokeWidth={1.8}
                                                            />
                                                        )}

                                                        <span>
                                                            {isVisible
                                                                ? 'Hide'
                                                                : 'Show'}
                                                        </span>

                                                    </button>


                                                    {/* DELETE */}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            deleteProduct(
                                                                product.id,
                                                                product.name
                                                            )
                                                        }
                                                        className="flex min-w-0 items-center justify-center gap-1 rounded-full border border-red-200 px-2 py-2.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                                                    >

                                                        <Trash2
                                                            size={14}
                                                            strokeWidth={1.8}
                                                        />

                                                        <span>
                                                            Delete
                                                        </span>

                                                    </button>

                                                </div>

                                            </div>

                                        </div>

                                    );

                                }
                            )}

                        </div>

                    )}

                </section>

            </main>


            <Footer />

        </AdminGuard>

    );
}