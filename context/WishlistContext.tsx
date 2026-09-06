'use client';

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from 'react';

import { Product } from '@/lib/types';

type WishlistContextType = {
    wishlist: Product[];

    toggleWishlist: (
        product: Product
    ) => void;

    isWishlisted: (
        id: string
    ) => boolean;
};

const WishlistContext =
    createContext<
        WishlistContextType | undefined
    >(undefined);


export function WishlistProvider({
    children,
}: {
    children: ReactNode;
}) {

    const [wishlist, setWishlist] =
        useState<Product[]>([]);

    const [isLoaded, setIsLoaded] =
        useState(false);


    // ==========================================
    // LOAD WISHLIST
    // ==========================================

    useEffect(() => {

        try {

            const saved =
                localStorage.getItem(
                    'pearlvera-wishlist'
                );

            if (saved) {

                setWishlist(
                    JSON.parse(saved)
                );

            }

        } catch (error) {

            console.error(
                'Failed to load wishlist:',
                error
            );

        }

        setIsLoaded(true);

    }, []);


    // ==========================================
    // SAVE WISHLIST
    // ==========================================

    useEffect(() => {

        if (!isLoaded) {
            return;
        }

        localStorage.setItem(
            'pearlvera-wishlist',
            JSON.stringify(wishlist)
        );

    }, [
        wishlist,
        isLoaded,
    ]);


    // ==========================================
    // TOGGLE WISHLIST
    // ==========================================

    function toggleWishlist(
        product: Product
    ) {

        setWishlist((current) => {

            const exists =
                current.some(
                    (item) =>
                        item.id === product.id
                );


            if (exists) {

                return current.filter(
                    (item) =>
                        item.id !== product.id
                );

            }


            return [
                ...current,
                product,
            ];

        });

    }


    // ==========================================
    // CHECK WISHLIST
    // ==========================================

    function isWishlisted(
        id: string
    ) {

        return wishlist.some(
            (item) =>
                item.id === id
        );

    }


    return (

        <WishlistContext.Provider
            value={{
                wishlist,
                toggleWishlist,
                isWishlisted,
            }}
        >

            {children}

        </WishlistContext.Provider>

    );

}


export function useWishlistContext() {

    const context =
        useContext(
            WishlistContext
        );


    if (!context) {

        throw new Error(
            'useWishlistContext must be used inside WishlistProvider'
        );

    }


    return context;

}