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
  addToCart: (
    dish: Dish,
    variantId?: string,
    quantity?: number,
    selectedCustomizations?: CartItem["selectedCustomizations"],
    notes?: string,
  ) => void;
  removeFromCart: (
    dishId: string,
    variantId?: string,
    customizationsKey?: string,
  ) => void;
  updateQuantity: (
    dishId: string,
    quantity: number,
    variantId?: string,
    customizationsKey?: string,
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
    (
      dish: Dish,
      variantId?: string,
      quantity: number = 1,
      selectedCustomizations?: CartItem["selectedCustomizations"],
      notes?: string,
    ) => {
      setItems((prevItems) => {
        // Create a unique key for matching (dish + variant + customizations)
        const getCustomizationKey = (
          cust?: CartItem["selectedCustomizations"],
        ) =>
          cust
            ?.map((c) => `${c.optionId}`)
            .sort()
            .join(",") || "";

        const newCustKey = getCustomizationKey(selectedCustomizations);

        const existingItem = prevItems.find(
          (item) =>
            item.dish.id === dish.id &&
            item.variantId === variantId &&
            getCustomizationKey(item.selectedCustomizations) === newCustKey &&
            item.notes === notes,
        );

        if (existingItem) {
          return prevItems.map((item) =>
            item.dish.id === dish.id &&
            item.variantId === variantId &&
            getCustomizationKey(item.selectedCustomizations) === newCustKey &&
            item.notes === notes
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          );
        }

        const variant = variantId
          ? dish.variants?.find((v) => v.id === variantId)
          : undefined;

        const basePrice = variant ? variant.price : dish.price;
        const customizationsPrice =
          selectedCustomizations?.reduce((sum, c) => sum + c.price, 0) || 0;

        return [
          ...prevItems,
          {
            dish,
            quantity,
            variantId,
            variantName: variant?.name,
            selectedCustomizations,
            price: basePrice + customizationsPrice,
            notes,
          },
        ];
      });
    },
    [],
  );

  const removeFromCart = useCallback(
    (dishId: string, variantId?: string, customizationsKey?: string) => {
      setItems((prevItems) => {
        const getCustomizationKey = (
          cust?: CartItem["selectedCustomizations"],
        ) =>
          cust
            ?.map((c) => `${c.optionId}`)
            .sort()
            .join(",") || "";

        return prevItems.filter(
          (item) =>
            !(
              item.dish.id === dishId &&
              item.variantId === variantId &&
              (customizationsKey === undefined ||
                getCustomizationKey(item.selectedCustomizations) ===
                  customizationsKey)
            ),
        );
      });
    },
    [],
  );

  const updateQuantity = useCallback(
    (
      dishId: string,
      quantity: number,
      variantId?: string,
      customizationsKey?: string,
    ) => {
      if (quantity <= 0) {
        removeFromCart(dishId, variantId, customizationsKey);
        return;
      }

      setItems((prevItems) => {
        const getCustomizationKey = (
          cust?: CartItem["selectedCustomizations"],
        ) =>
          cust
            ?.map((c) => `${c.optionId}`)
            .sort()
            .join(",") || "";

        return prevItems.map((item) =>
          item.dish.id === dishId &&
          item.variantId === variantId &&
          (customizationsKey === undefined ||
            getCustomizationKey(item.selectedCustomizations) ===
              customizationsKey)
            ? { ...item, quantity }
            : item,
        );
      });
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
