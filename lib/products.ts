import { Product } from './types';

export const products: Product[] = [
    {
        id: 'pearl-bloom',
        slug: 'pearl-bloom',
        name: 'Pearl Bloom',
        price: 3499,
        image: '/products/pearl-bloom-1.jpg',
        category: 'Luxury',
        description:
            'A handcrafted luxury bead purse designed for timeless elegance.',
        rating: 4.9,
        reviews: 124,
        stock: 10,

        images: [
            '/products/pearl-bloom-1.jpg',
            '/products/pearl-bloom-2.jpg',
            '/products/pearl-bloom-3.jpg',
        ],
    },

    {
        id: 'royal-beads',
        slug: 'royal-beads',
        name: 'Royal Beads',
        price: 4299,
        image: '/products/royal-beads.jpg',
        category: 'Bridal',
        description:
            'Luxury handcrafted bridal bead purse with premium craftsmanship.',
        rating: 4.8,
        reviews: 98,
        stock: 10,

        images: [
            '/products/royal-beads-1.jpg',
            '/products/royal-beads-2.jpg',
            '/products/royal-beads-3.jpg',
        ],
    },

    {
        id: 'ivory-luxe',
        slug: 'ivory-luxe',
        name: 'Ivory Luxe',
        price: 5199,
        image: '/products/ivory-luxe.jpg',
        category: 'Evening',
        description:
            'Elegant ivory bead purse designed for evening occasions.',
        rating: 4.7,
        reviews: 85,
        stock: 10,

        images: [
            '/products/ivory-luxe-1.jpg',
            '/products/ivory-luxe-2.jpg',
            '/products/ivory-luxe-3.jpg',
        ],
    },

    {
        id: 'crystal-charm',
        slug: 'crystal-charm',
        name: 'Crystal Charm',
        price: 3899,
        image: '/products/crystal-charm.jpg',
        category: 'Luxury',
        description:
            'Modern handcrafted crystal bead purse with luxurious finish.',
        rating: 4.6,
        reviews: 72,
        stock: 10,

        images: [
            '/products/crystal-charm-1.jpg',
            '/products/crystal-charm-2.jpg',
            '/products/crystal-charm-3.jpg',
        ],
    },
];