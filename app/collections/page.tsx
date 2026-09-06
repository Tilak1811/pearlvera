import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function CollectionsPage() {
    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
                <div className="text-center">
                    <h1
                        className="text-6xl text-stone-900"
                        style={{ fontFamily: 'var(--font-playfair)' }}
                    >
                        Collections
                    </h1>

                    <p className="mt-4 text-stone-600">
                        Coming Soon...
                    </p>
                </div>
            </main>

            <Footer />
        </>
    );
}