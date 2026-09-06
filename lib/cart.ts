import { Product } from "./types";

export type CartItem = Product & {
    quantity: number;
};