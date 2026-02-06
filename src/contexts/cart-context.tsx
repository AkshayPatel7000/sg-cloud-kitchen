"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import type { Dish, CartItem, Cart, Restaurant } from "@/lib/types";
import { getRestaurant } from "@/lib/data-client";

type CartContextType = {
  cart: Cart;
  addToCart: (dish: Dish, variantId?: string, quantity?: number) => void;
  removeFromCart: (dishId: string, variantId?: string) => void;
  updateQuantity: (
    dishId: string,
    quantity: number,
    variantId?: string,
  ) => void;
  clearCart: () => void;
  itemCount: number;
  isHydrated: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "kitchen-cart";
const TAX_RATE = 0.05;

// Load cart from localStorage
function loadCartFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as CartItem[];
      // Migrate old cart items that don't have price field
      return parsed.map((item) => ({
        ...item,
        price: item.price ?? item.dish.price,
      }));
    }
  } catch (error) {
    console.error("Error loading cart from localStorage:", error);
  }
  return [];
}

// Save cart to localStorage
function saveCartToStorage(items: CartItem[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Error saving cart to localStorage:", error);
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  // Load cart and restaurant from storage/server on mount
  useEffect(() => {
    const loadedItems = loadCartFromStorage();
    setItems(loadedItems);

    // Fetch restaurant details
    getRestaurant().then(setRestaurant).catch(console.error);

    setIsHydrated(true);
  }, []);

  // Save cart to localStorage whenever items change (but only after hydration)
  useEffect(() => {
    if (isHydrated) {
      saveCartToStorage(items);
    }
  }, [items, isHydrated]);

  const cart = useMemo(() => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // Calculate tax only if GST is enabled and GST number is provided
    let tax = 0;
    if (restaurant?.isGstEnabled && restaurant?.gstNumber) {
      tax = subtotal * 0.05; // Using 5% rate
    }

    const total = subtotal + tax;

    return {
      items,
      subtotal,
      tax,
      total,
    };
  }, [items, restaurant]);

  const itemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const addToCart = useCallback(
    (dish: Dish, variantId?: string, quantity: number = 1) => {
      setItems((prevItems) => {
        const existingItem = prevItems.find(
          (item) => item.dish.id === dish.id && item.variantId === variantId,
        );

        if (existingItem) {
          return prevItems.map((item) =>
            item.dish.id === dish.id && item.variantId === variantId
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          );
        }

        const variant = variantId
          ? dish.variants?.find((v) => v.id === variantId)
          : undefined;

        return [
          ...prevItems,
          {
            dish,
            quantity,
            variantId,
            variantName: variant?.name,
            price: variant ? variant.price : dish.price,
          },
        ];
      });
    },
    [],
  );

  const removeFromCart = useCallback((dishId: string, variantId?: string) => {
    setItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.dish.id === dishId && item.variantId === variantId),
      ),
    );
  }, []);

  const updateQuantity = useCallback(
    (dishId: string, quantity: number, variantId?: string) => {
      if (quantity <= 0) {
        removeFromCart(dishId, variantId);
        return;
      }

      setItems((prevItems) =>
        prevItems.map((item) =>
          item.dish.id === dishId && item.variantId === variantId
            ? { ...item, quantity }
            : item,
        ),
      );
    },
    [removeFromCart],
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        isHydrated,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
