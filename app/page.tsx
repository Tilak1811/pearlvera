import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/home/Hero';
import FeaturedCollections from '@/components/home/FeaturedCollections';
import BestSellers from '@/components/home/BestSellers';
import Footer from '@/components/layout/Footer';
import WhyChoose from '@/components/home/WhyChoose';
import Testimonials from '@/components/home/Testimonials';
import InstagramGallery from '@/components/home/InstagramGallery';

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <FeaturedCollections />
      <BestSellers />
      <WhyChoose />
      <Testimonials />
      <InstagramGallery />
      <Footer />
    </>
  );
}