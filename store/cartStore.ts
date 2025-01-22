// useCartStore.ts

import { ProductsList } from "@/app/unidade/page";
import create from "zustand";
import { persist } from "zustand/middleware";

type CartItem = ProductsList & { quantity: number };

type ProductCartStore = {
  cart: CartItem[];
  addProductIntoCart: (product: CartItem) => void;
  removeFromCart: (product: ProductsList) => void;
  decreaseQuantity: (product: ProductsList) => void;
  resetCart: () => void;
};

export const useCartStore = create<ProductCartStore>()(
  persist(
    (set) => ({
      cart: [],
      addProductIntoCart: (product: CartItem) =>
        set((state) => {
          const existingProduct = state.cart.find((item) => item.id === product.id);
          if (existingProduct) {
            // Se o produto já existe, soma a quantidade enviada pelo produto atual
            return {
              cart: state.cart.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + product.quantity }
                  : item
              ),
            };
          } else {
            // Caso contrário, adiciona o produto com a quantidade informada
            return { cart: [...state.cart, { ...product, quantity: product.quantity }] };
          }
        }),

      removeFromCart: (product) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== product.id),
        })),

      decreaseQuantity: (product) =>
        set((state) => {
          const existingProduct = state.cart.find((item) => item.id === product.id);
          if (existingProduct && existingProduct.quantity > 1) {
            return {
              cart: state.cart.map((item) =>
                item.id === product.id ? { ...item, quantity: item.quantity - 1 } : item
              ),
            };
          } else {
            return {
              cart: state.cart.filter((item) => item.id !== product.id),
            };
          }
        }),

      resetCart: () => set({ cart: [] }),
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({ cart: state.cart }),
    }
  )
);
