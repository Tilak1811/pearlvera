'use client';

import {
    createContext,
    useContext,
    useState,
    ReactNode,
    useEffect,
} from 'react';

import { Product } from '@/lib/types';
import { CartItem } from '@/lib/cart';

type CartContextType = {
    cart: CartItem[];

    addToCart: (
        product: Product
    ) => void;

    removeFromCart: (
        id: string
    ) => void;

    clearCart: () => void;

    increaseQuantity: (
        id: string
    ) => void;

    decreaseQuantity: (
        id: string
    ) => void;
};


const CartContext =
    createContext<CartContextType | undefined>(
        undefined
    );


export function CartProvider({
    children,
}: {
    children: ReactNode;
}) {

    const [cart, setCart] =
        useState<CartItem[]>([]);

    const [isLoaded, setIsLoaded] =
        useState(false);


    // ==========================================
    // LOAD CART
    // ==========================================

    useEffect(() => {

        try {

            const savedCart =
                localStorage.getItem(
                    'pearlvera-cart'
                );

            if (savedCart) {

                setCart(
                    JSON.parse(savedCart)
                );

            }

        } catch (error) {

            console.error(
                'Failed to load cart:',
                error
            );

            localStorage.removeItem(
                'pearlvera-cart'
            );

        }

        setIsLoaded(true);

    }, []);


    // ==========================================
    // SAVE CART
    // ==========================================

    useEffect(() => {

        if (!isLoaded) {
            return;
        }

        localStorage.setItem(
            'pearlvera-cart',
            JSON.stringify(cart)
        );

    }, [
        cart,
        isLoaded,
    ]);


    // ==========================================
    // ADD TO CART
    // ==========================================

    function addToCart(
        product: Product
    ) {

        const stock =
            product.stock ?? 0;

        // Don't allow out-of-stock products
        if (stock <= 0) {
            return;
        }


        setCart((current) => {

            const existing =
                current.find(
                    (item) =>
                        item.id === product.id
                );


            // Product already exists
            if (existing) {

                // Don't exceed available stock
                if (
                    existing.quantity >= stock
                ) {
                    return current;
                }


                return current.map(
                    (item) =>
                        item.id === product.id
                            ? {
                                ...item,
                                quantity:
                                    item.quantity + 1,
                            }
                            : item
                );

            }


            // Add new product
            return [
                ...current,
                {
                    ...product,
                    quantity: 1,
                },
            ];

        });

    }


    // ==========================================
    // INCREASE QUANTITY
    // ==========================================

    function increaseQuantity(
        id: string
    ) {

        setCart((current) =>
            current.map((item) => {

                if (item.id !== id) {
                    return item;
                }


                const stock =
                    item.stock ?? 0;


                // Don't exceed stock
                if (
                    item.quantity >= stock
                ) {
                    return item;
                }


                return {
                    ...item,
                    quantity:
                        item.quantity + 1,
                };

            })
        );

    }


    // ==========================================
    // DECREASE QUANTITY
    // ==========================================

    function decreaseQuantity(
        id: string
    ) {

        setCart((current) =>
            current
                .map((item) =>
                    item.id === id
                        ? {
                            ...item,
                            quantity:
                                item.quantity - 1,
                        }
                        : item
                )
                .filter(
                    (item) =>
                        item.quantity > 0
                )
        );

    }


    // ==========================================
    // REMOVE FROM CART
    // ==========================================

    function removeFromCart(
        id: string
    ) {

        setCart((current) =>
            current.filter(
                (item) =>
                    item.id !== id
            )
        );

    }


    // ==========================================
    // CLEAR CART
    // ==========================================

    function clearCart() {

        setCart([]);

    }


    return (

        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                clearCart,
                increaseQuantity,
                decreaseQuantity,
            }}
        >

            {children}

        </CartContext.Provider>

    );

}


export function useCartContext() {

    const context =
        useContext(CartContext);


    if (!context) {

        throw new Error(
            'useCartContext must be used inside CartProvider'
        );

    }


    return context;

}