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
  addToCart: (dish: Dish, quantity?: number) => void;
  removeFromCart: (dishId: string) => void;
  updateQuantity: (dishId: string, quantity: number) => void;
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
      return JSON.parse(stored);
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
      (sum, item) => sum + item.dish.price * item.quantity,
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

  const addToCart = useCallback((dish: Dish, quantity: number = 1) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.dish.id === dish.id);

      if (existingItem) {
        return prevItems.map((item) =>
          item.dish.id === dish.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }

      return [...prevItems, { dish, quantity }];
    });
  }, []);

  const removeFromCart = useCallback((dishId: string) => {
    setItems((prevItems) =>
      prevItems.filter((item) => item.dish.id !== dishId),
    );
  }, []);

  const updateQuantity = useCallback(
    (dishId: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(dishId);
        return;
      }

      setItems((prevItems) =>
        prevItems.map((item) =>
          item.dish.id === dishId ? { ...item, quantity } : item,
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
