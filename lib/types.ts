export type Product = {
    id: string;
    slug: string;
    name: string;
    price: number;
    image: string;
    category: string;
    description: string;
    rating: number;
    reviews: number;

    stock: number;

    visible?: boolean;

    createdAt?: number | null;
    updatedAt?: number | null;

    images: string[];


};