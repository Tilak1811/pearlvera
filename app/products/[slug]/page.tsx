import { notFound } from 'next/navigation';

import {
  doc,
  getDoc,
} from 'firebase/firestore';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

import ProductGallery from '@/components/product/ProductGallery';
import ProductInfo from '@/components/product/ProductInfo';
import RelatedProducts from '@/components/product/RelatedProducts';

import { db } from '@/lib/firebase';

import type { Product } from '@/lib/types';

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductPage({
  params,
}: Props) {

  const { slug } = await params;

  // ==========================================
  // GET PRODUCT FROM FIRESTORE
  // ==========================================

  const productRef = doc(
    db,
    'products',
    slug
  );

  const productSnapshot =
    await getDoc(productRef);

  if (!productSnapshot.exists()) {
    notFound();
  }

  const data = productSnapshot.data();

  // ==========================================
  // CONVERT FIRESTORE DATA TO PRODUCT
  // ==========================================

  const product: Product = {
    id: productSnapshot.id,

    slug: data.slug ?? slug,

    name: data.name ?? '',

    price: Number(data.price ?? 0),

    category: data.category ?? 'Luxury',

    image: data.image ?? '',

    images: Array.isArray(data.images)
      ? data.images
      : data.image
        ? [data.image]
        : [],

    description: data.description ?? '',

    rating: Number(data.rating ?? 0),

    reviews: Number(data.reviews ?? 0),

    stock: Number(data.stock ?? 0),

    createdAt: data.createdAt
      ? data.createdAt.toMillis()
      : null,

    updatedAt: data.updatedAt
      ? data.updatedAt.toMillis()
      : null,
  };


  // ==========================================
  // PAGE
  // ==========================================

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#FAF8F5]">

        <div className="mx-auto max-w-7xl px-6 py-16">

          <div className="grid items-start gap-16 lg:grid-cols-[1.05fr_0.95fr]">

            {/* Product Gallery */}

            <ProductGallery
              images={product.images}
              name={product.name}
            />


            {/* Product Information */}

            <ProductInfo
              product={product}
            />

          </div>


          {/* Related Products */}

          <RelatedProducts
            currentProduct={product}
          />

        </div>

      </main>

      <Footer />
    </>
  );
}