import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/data/products";

export interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  decreaseItem: (id: string) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      addItem: (product) => {
        const { items } = get();
        const existingItem = items.find((item) => item.id === product.id);
        
        let newItems;
        if (existingItem) {
          newItems = items.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {
          newItems = [...items, { ...product, quantity: 1 }];
        }
        
        set({
          items: newItems,
          totalItems: newItems.reduce((acc, item) => acc + item.quantity, 0),
        });
      },
      decreaseItem: (id) => {
        const { items } = get();
        const existingItem = items.find((item) => item.id === id);
        if (!existingItem) return;

        let newItems;
        if (existingItem.quantity > 1) {
          newItems = items.map((item) => 
            item.id === id ? { ...item, quantity: item.quantity - 1 } : item
          );
        } else {
          newItems = items.filter((item) => item.id !== id);
        }

        set({
          items: newItems,
          totalItems: newItems.reduce((acc, item) => acc + item.quantity, 0),
        });
      },
      removeItem: (id) => {
        const { items } = get();
        const newItems = items.filter((item) => item.id !== id);
        set({
          items: newItems,
          totalItems: newItems.reduce((acc, item) => acc + item.quantity, 0),
        });
      },
      updateQuantity: (id, quantity) => {
        const { items } = get();
        if (quantity <= 0) {
          const newItems = items.filter((item) => item.id !== id);
          set({
            items: newItems,
            totalItems: newItems.reduce((acc, item) => acc + item.quantity, 0),
          });
          return;
        }
        
        const newItems = items.map((item) => 
          item.id === id ? { ...item, quantity } : item
        );
        set({
          items: newItems,
          totalItems: newItems.reduce((acc, item) => acc + item.quantity, 0),
        });
      },
      clearCart: () => set({ items: [], totalItems: 0 }),
    }),
    {
      name: "clothing-cart-storage",
    }
  )
);
