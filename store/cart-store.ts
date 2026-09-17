import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  productId: string;
  title: string;
  size: string;
  color?: string;
  price: number;
  quantity: number;
  image: string;
  slug: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  deliveryZone: "Inside Dhaka" | "Outside Dhaka";
  
  // Actions
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: string, size: string, color?: string) => void;
  updateQuantity: (
    productId: string,
    size: string,
    quantity: number,
    color?: string
  ) => void;
  clearCart: () => void;
  setIsOpen: (isOpen: boolean) => void;
  setDeliveryZone: (zone: "Inside Dhaka" | "Outside Dhaka") => void;

  // Computed getters
  totalItems: () => number;
  subtotal: () => number;
  deliveryCharge: () => number;
  grandTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      deliveryZone: "Inside Dhaka",

      addItem: (item) => {
        const currentItems = get().items;
        const existingIndex = currentItems.findIndex(
          (i) =>
            i.productId === item.productId &&
            i.size === item.size &&
            (item.color ? i.color === item.color : true)
        );

        if (existingIndex > -1) {
          const updated = [...currentItems];
          updated[existingIndex].quantity += item.quantity || 1;
          set({ items: updated, isOpen: true });
        } else {
          set({
            items: [
              ...currentItems,
              { ...item, quantity: item.quantity || 1 },
            ],
            isOpen: true,
          });
        }
      },

      removeItem: (productId, size, color) => {
        set({
          items: get().items.filter(
            (i) =>
              !(
                i.productId === productId &&
                i.size === size &&
                (color ? i.color === color : true)
              )
          ),
        });
      },

      updateQuantity: (productId, size, quantity, color) => {
        if (quantity <= 0) {
          get().removeItem(productId, size, color);
          return;
        }

        set({
          items: get().items.map((i) => {
            if (
              i.productId === productId &&
              i.size === size &&
              (color ? i.color === color : true)
            ) {
              return { ...i, quantity };
            }
            return i;
          }),
        });
      },

      clearCart: () => set({ items: [] }),
      setIsOpen: (isOpen) => set({ isOpen }),
      setDeliveryZone: (deliveryZone) => set({ deliveryZone }),

      totalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      subtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },

      deliveryCharge: () => {
        return get().deliveryZone === "Inside Dhaka" ? 70 : 130;
      },

      grandTotal: () => {
        const sub = get().subtotal();
        if (sub === 0) return 0;
        return sub + get().deliveryCharge();
      },
    }),
    {
      name: "clothing_brand_cart_v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        deliveryZone: state.deliveryZone,
      }),
    }
  )
);
